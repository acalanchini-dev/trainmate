import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

// @ts-ignore - Deno è disponibile nell'ambiente Supabase Edge Functions
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailTrainingPlanRequest {
  to: string;
  subject: string;
  html: string;
  attachmentUrl: string;
  filename: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Gestione CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, attachmentUrl, filename } = await req.json();

    // Verifica che i parametri necessari siano stati forniti
    if (!to || !subject || !attachmentUrl) {
      throw new Error("Parametri mancanti: to, subject e attachmentUrl sono obbligatori");
    }

    // Download del file PDF dall'URL
    console.log("Tentativo di scaricare l'allegato da:", attachmentUrl);
    const fileResponse = await fetch(attachmentUrl);
    
    if (!fileResponse.ok) {
      throw new Error(`Impossibile scaricare il file: ${fileResponse.status} ${fileResponse.statusText}`);
    }
    
    const fileArrayBuffer = await fileResponse.arrayBuffer();

    // Converti ArrayBuffer in base64 (compatibile con Deno)
    const base64Content = btoa(
      new Uint8Array(fileArrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );
    
    // Invio dell'email con Resend
    console.log("Invio email a:", to);
    const emailResponse = await resend.emails.send({
      from: "TrainMate <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
      attachments: [
        {
          filename: filename || "piano-allenamento.pdf",
          content: base64Content,
          encoding: 'base64'
        }
      ]
    });

    console.log("Risposta Resend:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email inviata con successo", data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Errore nell'invio dell'email:", error);
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler); 