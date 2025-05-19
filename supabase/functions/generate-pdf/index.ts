import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as PDFLib from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Definizione dei tipi
interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  notes?: string;
  video_link?: string;
  order?: number;
  completed?: boolean;
  training_plan_id?: string;
}

interface TrainingPlan {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  exercises?: Exercise[];
}

const handler = async (req: Request): Promise<Response> => {
  // Gestione CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { training_plan_id } = await req.json();

    // Crea client Supabase
    const supabaseClient = createClient(
      // @ts-ignore - Deno è disponibile nell'ambiente Supabase Edge Functions
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore - Deno è disponibile nell'ambiente Supabase Edge Functions
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Ottiene i dati del piano di allenamento
    const { data: planData, error: planError } = await supabaseClient
      .from("training_plans")
      .select("*, exercises(*)")
      .eq("id", training_plan_id)
      .single();

    if (planError) {
      throw new Error(`Errore nel recupero del piano: ${planError.message}`);
    }

    // Genera il PDF usando PDFLib
    const pdfBytes = await generatePDF(planData as TrainingPlan);

    // Carica il PDF generato su Supabase Storage
    const fileName = `training_plans/${training_plan_id}_${Date.now()}.pdf`;
    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .from("client_media")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (storageError) {
      throw new Error(`Errore nel caricamento del PDF: ${storageError.message}`);
    }

    // Genera URL pubblico per il download
    const { data: urlData } = await supabaseClient
      .storage
      .from("client_media")
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ url: urlData.publicUrl }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Errore nella generazione del PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Funzione per generare il PDF
async function generatePDF(planData: TrainingPlan) {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;
  
  // Crea un nuovo documento
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  // Carica i font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Configura le dimensioni e posizioni
  const margin = 50;
  let yPosition = height - margin;
  const lineHeight = 20;
  
  // Aggiungi titolo
  page.drawText("PIANO DI ALLENAMENTO", {
    x: margin,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= lineHeight * 2;
  
  // Dati del piano
  page.drawText(`Nome: ${planData.name}`, {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaFont,
  });
  
  yPosition -= lineHeight;
  
  if (planData.description) {
    page.drawText(`Descrizione: ${planData.description}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaFont,
    });
    yPosition -= lineHeight * 1.5;
  }
  
  // Elenco degli esercizi
  page.drawText("ESERCIZI", {
    x: margin,
    y: yPosition,
    size: 16,
    font: helveticaBold,
  });
  
  yPosition -= lineHeight * 1.5;
  
  if (planData.exercises && planData.exercises.length > 0) {
    for (const exercise of planData.exercises) {
      // Nome esercizio
      page.drawText(`${exercise.name}`, {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBold,
      });
      
      yPosition -= lineHeight;
      
      // Dettagli esercizio
      page.drawText(`Serie: ${exercise.sets} | Ripetizioni: ${exercise.reps}`, {
        x: margin + 20,
        y: yPosition,
        size: 12,
        font: helveticaFont,
      });
      
      yPosition -= lineHeight;
      
      if (exercise.notes) {
        page.drawText(`Note: ${exercise.notes}`, {
          x: margin + 20,
          y: yPosition,
          size: 12,
          font: helveticaFont,
        });
        
        yPosition -= lineHeight;
      }
      
      if (exercise.video_link) {
        // Aggiungi icona e testo più descrittivo per il video
        page.drawText(`Video: `, {
          x: margin + 20,
          y: yPosition,
          size: 12,
          font: helveticaFont,
        });
        
        // Testo del link
        const linkText = `Guarda il video dell'esercizio`;
        
        // Disegna il testo del link in blu
        page.drawText(linkText, {
          x: margin + 60,
          y: yPosition,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0.8)  // Colore blu per indicare che è un link
        });
        
        // Aggiungi l'URL sotto il link (per permettere la copia manuale)
        const shortUrl = exercise.video_link.replace(/^https?:\/\//, '').substring(0, 40) + '...';
        page.drawText(shortUrl, {
          x: margin + 60,
          y: yPosition - 12,
          size: 8,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4)  // Grigio
        });
        
        // Aggiungi nota esplicativa
        const videoUrlNote = "Copia e incolla l'URL nel tuo browser per vedere il video";
        page.drawText(videoUrlNote, {
          x: margin + 60,
          y: yPosition - lineHeight/2 - 12,
          size: 9,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5)  // Colore grigio per testo meno importante
        });
        
        yPosition -= lineHeight * 2;
      }
      
      yPosition -= lineHeight / 2;
      
      // Aggiungi una nuova pagina se necessario
      if (yPosition < margin) {
        page = pdfDoc.addPage();
        yPosition = height - margin;
      }
    }
  } else {
    page.drawText("Nessun esercizio presente in questo piano.", {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaFont,
    });
  }
  
  // Informazioni aggiuntive a piè di pagina
  const footerText = "Per accedere ai video degli esercizi, utilizza la versione digitale di questo piano.";
  page.drawText(footerText, {
    x: margin,
    y: margin / 2,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5)
  });
  
  // Salva il documento
  return await pdfDoc.save();
}

serve(handler); 