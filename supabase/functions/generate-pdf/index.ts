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
  group_id?: string;
}

interface ExerciseGroup {
  id?: string;
  training_plan_id: string;
  title: string;
  order: number;
  exercises?: Exercise[];
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
  exercise_groups?: ExerciseGroup[];
}

const handler = async (req: Request): Promise<Response> => {
  // Gestione delle OPTIONS request per CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Estrai i parametri dalla richiesta
    const body = await req.json();
    const { training_plan_id } = body;

    if (!training_plan_id) {
      throw new Error("training_plan_id è richiesto");
    }

    // Ottieni il piano di allenamento
    const { data: planData, error: planError } = await supabaseClient
      .from("training_plans")
      .select("*")
      .eq("id", training_plan_id)
      .single();

    if (planError || !planData) {
      throw new Error(`Piano di allenamento non trovato: ${planError?.message}`);
    }

    // Ottieni i gruppi del piano
    const { data: groups, error: groupsError } = await supabaseClient
      .from("exercise_groups")
      .select("*")
      .eq("training_plan_id", training_plan_id)
      .order("order");

    if (groupsError) {
      throw new Error(`Errore nel recupero dei gruppi: ${groupsError.message}`);
    }

    let completePlan: TrainingPlan = { ...planData };

    // Se ci sono gruppi, per ciascuno ottieni gli esercizi
    if (groups && groups.length > 0) {
      const groupsWithExercises = await Promise.all(
        groups.map(async (group) => {
          const { data: exercises, error: exercisesError } = await supabaseClient
            .from("exercises")
            .select("*")
            .eq("training_plan_id", training_plan_id)
            .eq("group_id", group.id)
            .order("order");

          if (exercisesError) {
            throw new Error(`Errore nel recupero degli esercizi: ${exercisesError.message}`);
          }

          return {
            ...group,
            exercises: exercises || [],
          };
        })
      );

      completePlan.exercise_groups = groupsWithExercises;
      console.log("Piano con gruppi:", JSON.stringify(completePlan.exercise_groups, null, 2));
    } 
    // Altrimenti, prova a ottenere tutti gli esercizi del piano (retrocompatibilità)
    else {
      const { data: exercises, error: exercisesError } = await supabaseClient
        .from("exercises")
        .select("*")
        .eq("training_plan_id", training_plan_id)
        .order("order");

      if (exercisesError) {
        throw new Error(`Errore nel recupero degli esercizi: ${exercisesError.message}`);
      }

      completePlan.exercises = exercises || [];
      
      // Se abbiamo esercizi ma non gruppi, proviamo a ricavare i gruppi dagli esercizi
      if (exercises && exercises.length > 0) {
        // Raggruppa gli esercizi per group_id
        const groupMap = new Map();
        
        for (const exercise of exercises) {
          const groupId = exercise.group_id || 'default';
          
          if (!groupMap.has(groupId)) {
            // Ottieni le informazioni sul gruppo se disponibili
            if (groupId !== 'default') {
              const { data: groupData } = await supabaseClient
                .from("exercise_groups")
                .select("*")
                .eq("id", groupId)
                .single();
                
              if (groupData) {
                groupMap.set(groupId, {
                  ...groupData,
                  exercises: [exercise]
                });
                continue;
              }
            }
            
            // Se non abbiamo trovato informazioni sul gruppo, creiamo un gruppo di default
            groupMap.set(groupId, {
              id: groupId,
              training_plan_id: training_plan_id,
              title: groupId === 'default' ? "Esercizi" : `Gruppo ${groupMap.size + 1}`,
              order: groupMap.size + 1,
              exercises: [exercise]
            });
          } else {
            // Aggiungi l'esercizio al gruppo esistente
            const group = groupMap.get(groupId);
            group.exercises.push(exercise);
          }
        }
        
        // Converte la mappa in un array di gruppi
        const exerciseGroups = Array.from(groupMap.values());
        if (exerciseGroups.length > 0) {
          completePlan.exercise_groups = exerciseGroups;
          console.log("Gruppi ricavati dagli esercizi:", JSON.stringify(completePlan.exercise_groups, null, 2));
        }
      }
    }
    
    // Verifica la presenza di gruppi nel piano completo
    console.log("Gruppi nel piano:", completePlan.exercise_groups ? completePlan.exercise_groups.length : 0);
    console.log("Esercizi nel piano:", completePlan.exercises ? completePlan.exercises.length : 0);
    
    // Debug dettagliato dei gruppi
    if (completePlan.exercise_groups && completePlan.exercise_groups.length > 0) {
      console.log("Dettaglio gruppi:");
      completePlan.exercise_groups.forEach((group, index) => {
        console.log(`Gruppo ${index + 1}: ${group.title}, ID: ${group.id}, Esercizi: ${group.exercises ? group.exercises.length : 0}`);
        if (group.exercises && group.exercises.length > 0) {
          group.exercises.forEach((ex, i) => {
            console.log(`  - Esercizio ${i + 1}: ${ex.name}, group_id: ${ex.group_id}`);
          });
        }
      });
    }
    // Se non ci sono gruppi ma ci sono esercizi, creiamo un gruppo predefinito
    else if (completePlan.exercises && completePlan.exercises.length > 0 && 
            (!completePlan.exercise_groups || completePlan.exercise_groups.length === 0)) {
      console.log("Nessun gruppo trovato, creazione di un gruppo predefinito");
      completePlan.exercise_groups = [
        {
          id: "default",
          training_plan_id: training_plan_id,
          title: "ESERCIZI PER PETTO E SPALLE",
          order: 1,
          exercises: completePlan.exercises
        }
      ];
      console.log("Gruppo creato con", completePlan.exercises.length, "esercizi");
    }

    // Genera il PDF
    const pdfBytes = await generatePDF(completePlan);

    // Nome del file
    const fileName = `training_plan_${training_plan_id}_${Date.now()}.pdf`;

    // Carica il PDF su storage
    const { error: storageError } = await supabaseClient
      .storage
      .from("client_media")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
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
  
  // Debug all'inizio della funzione PDF
  console.log("Generazione PDF - Dati del piano:", JSON.stringify({
    name: planData.name,
    has_groups: planData.exercise_groups ? true : false,
    groups_count: planData.exercise_groups ? planData.exercise_groups.length : 0,
    exercises_count: planData.exercises ? planData.exercises.length : 0
  }));
  
  // Forziamo l'uso del formato con gruppi
  if (!planData.exercise_groups || planData.exercise_groups.length === 0) {
    if (planData.exercises && planData.exercises.length > 0) {
      console.log("Nessun gruppo nel piano, creazione di un gruppo predefinito in generatePDF");
      planData.exercise_groups = [
        {
          id: "default",
          training_plan_id: planData.id,
          title: "ESERCIZI PER PETTO E SPALLE",
          order: 1,
          exercises: planData.exercises
        }
      ];
    }
  }
  
  if (planData.exercise_groups && planData.exercise_groups.length > 0) {
    console.log("Nomi dei gruppi:");
    planData.exercise_groups.forEach(g => console.log(` - ${g.title}`));
  }
  
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
    // Suddividi la descrizione in righe se è più lunga di un certo limite
    const maxCharsPerLine = 60; // Numero massimo di caratteri per riga
    const descriptionLines = [];
    
    // Dividi la descrizione in righe usando gli a capo esistenti
    const paragraphs = planData.description.split('\n');
    
    // Per ogni paragrafo, applicare il wrapping del testo
    for (const paragraph of paragraphs) {
      let remainingText = paragraph.trim();
      
      // Se il paragrafo è vuoto, salta
      if (remainingText.length === 0) continue;
      
      while (remainingText.length > 0) {
        // Trova l'ultimo spazio entro il limite di caratteri
        let cutPoint = Math.min(remainingText.length, maxCharsPerLine);
        
        // Se la descrizione è più lunga di maxCharsPerLine, cerca l'ultimo spazio
        if (remainingText.length > maxCharsPerLine) {
          const lastSpace = remainingText.substring(0, maxCharsPerLine).lastIndexOf(' ');
          if (lastSpace > 0) {
            cutPoint = lastSpace;
          }
        }
        
        // Aggiungi la parte tagliata alle righe della descrizione
        descriptionLines.push(remainingText.substring(0, cutPoint));
        
        // Rimuovi la parte già elaborata
        remainingText = remainingText.substring(cutPoint).trim();
      }
    }
    
    // Disegna titolo della descrizione in grassetto
    page.drawText(`Descrizione:`, {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.6),
    });
    
    yPosition -= lineHeight * 1.5;
    
    // Disegna un box leggero attorno alla descrizione
    const descBoxHeight = lineHeight * descriptionLines.length + 15;
    page.drawRectangle({
      x: margin + 10,
      y: yPosition - descBoxHeight + lineHeight,
      width: width - (margin * 2) - 20,
      height: descBoxHeight,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.85, 0.85, 0.9),
      borderWidth: 0.5,
      opacity: 0.7,
      borderOpacity: 0.5,
    });
    
    // Disegna ogni riga della descrizione con bullet point
    for (const line of descriptionLines) {
      page.drawText(`• ${line}`, {
        x: margin + 20,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= lineHeight;
    }
    
    // Aggiungi spazio extra dopo la descrizione
    yPosition -= lineHeight * 1.5;
  }
  
  // Nuovo formato con gruppi
  if (planData.exercise_groups && planData.exercise_groups.length > 0) {
    for (const group of planData.exercise_groups) {
      // Controlla se c'è bisogno di una nuova pagina
      if (yPosition < margin + lineHeight * 8) {
        page = pdfDoc.addPage();
        yPosition = height - margin;
      }
      
      // Aggiungi intestazione del gruppo senza rettangolo colorato
      const groupTitleText = group.title.toUpperCase();
      
      // Aggiungi titolo del gruppo
      page.drawText(groupTitleText, {
        x: margin,
        y: yPosition,
        size: 16,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.3),
      });
      
      yPosition -= lineHeight * 2.5;
      
      if (group.exercises && group.exercises.length > 0) {
        for (const exercise of group.exercises) {
          // Controlla se c'è bisogno di una nuova pagina
          if (yPosition < margin + lineHeight * 8) {
            page = pdfDoc.addPage();
            yPosition = height - margin;
          }
          
          // Nome esercizio con bullet point
          page.drawText(`• ${exercise.name}`, {
            x: margin + 15,
            y: yPosition,
            size: 14,
            font: helveticaBold,
          });
          
          yPosition -= lineHeight;
          
          // Dettagli esercizio in un box leggero
          const detailsText = `Serie: ${exercise.sets} | Ripetizioni: ${exercise.reps}`;
          const detailsWidth = helveticaFont.widthOfTextAtSize(detailsText, 12);
          
          page.drawRectangle({
            x: margin + 30,
            y: yPosition - 3,
            width: detailsWidth + 20,
            height: 20,
            color: rgb(0.97, 0.97, 0.97),
            borderColor: rgb(0.9, 0.9, 0.9),
            borderWidth: 0.5,
            opacity: 0.8,
            borderOpacity: 0.6,
          });
          
          page.drawText(detailsText, {
            x: margin + 40,
            y: yPosition,
            size: 12,
            font: helveticaFont,
          });
          
          yPosition -= lineHeight;
          
          if (exercise.notes) {
            page.drawText(`Note: ${exercise.notes}`, {
              x: margin + 40,
              y: yPosition,
              size: 12,
              font: helveticaFont,
              color: rgb(0.3, 0.3, 0.3)
            });
            
            yPosition -= lineHeight;
          }
          
          if (exercise.video_link) {
            // Testo del link
            const linkText = "Guarda il video";
            const textWidth = helveticaFont.widthOfTextAtSize(linkText, 12);
            
            // Crea un link cliccabile
            page.drawText(linkText, {
              x: margin + 40,
              y: yPosition,
              size: 12,
              font: helveticaFont,
              color: rgb(0, 0, 0.8)  // Colore blu per indicare che è un link
            });
            
            // Aggiungi il link cliccabile
            const annotation = pdfDoc.context.register(
              pdfDoc.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: [
                  margin + 40,           // x1
                  yPosition - 2,         // y1
                  margin + 40 + textWidth, // x2
                  yPosition + 14         // y2
                ],
                Border: [0, 0, 0],
                C: [0, 0, 0.8],
                A: {
                  Type: 'Action',
                  S: 'URI',
                  URI: pdfDoc.context.obj(exercise.video_link),
                },
              })
            );
            
            page.node.set(PDFLib.PDFName.of('Annots'), pdfDoc.context.obj([annotation]));
            
            yPosition -= lineHeight;
          }
          
          yPosition -= lineHeight / 2;
        }
      } else {
        page.drawText("Nessun esercizio in questo gruppo.", {
          x: margin + 20,
          y: yPosition,
          size: 12,
          font: helveticaFont,
        });
        yPosition -= lineHeight;
      }
      
      // Aggiungi separatore tra gruppi
      page.drawLine({
        start: { x: margin, y: yPosition - lineHeight / 2 },
        end: { x: width - margin, y: yPosition - lineHeight / 2 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.5,
      });
      
      yPosition -= lineHeight * 1.5;
    }
  }
  // Vecchio formato (retrocompatibilità)
  else if (planData.exercises && planData.exercises.length > 0) {
    page.drawText("ESERCIZI", {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBold,
    });
    
    yPosition -= lineHeight * 1.5;
    
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
        const linkText = "Guarda il video";
        const textWidth = helveticaFont.widthOfTextAtSize(linkText, 12);
        
        // Crea un link cliccabile
        page.drawText(linkText, {
          x: margin + 60,
          y: yPosition,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0.8)  // Colore blu per indicare che è un link
        });
        
        // Aggiungi il link cliccabile
        const annotation = pdfDoc.context.register(
          pdfDoc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [
              margin + 60,           // x1
              yPosition - 2,         // y1
              margin + 60 + textWidth, // x2
              yPosition + 14         // y2
            ],
            Border: [0, 0, 0],
            C: [0, 0, 0.8],
            A: {
              Type: 'Action',
              S: 'URI',
              URI: pdfDoc.context.obj(exercise.video_link),
            },
          })
        );
        
        page.node.set(PDFLib.PDFName.of('Annots'), pdfDoc.context.obj([annotation]));
        
        // Aggiungi l'URL sotto il link (per permettere la copia manuale)
        const shortUrl = exercise.video_link.replace(/^https?:\/\//, '').substring(0, 40) + '...';
        page.drawText(shortUrl, {
          x: margin + 60,
          y: yPosition - 12,
          size: 8,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4)  // Grigio
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