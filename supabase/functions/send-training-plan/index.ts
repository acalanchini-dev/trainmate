
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TrainingPlanEmailRequest {
  clientEmail: string;
  clientName: string;
  trainerName: string;
  planName: string;
  planDescription?: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    notes?: string;
    video_link?: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: TrainingPlanEmailRequest = await req.json();
    const { clientEmail, clientName, trainerName, planName, planDescription, exercises } = data;

    // Costruisci la tabella degli esercizi in HTML
    let exercisesHtml = "";
    
    if (exercises && exercises.length > 0) {
      exercisesHtml = `
        <table style="width:100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Esercizio</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Serie</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Ripetizioni</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Note</th>
          </tr>
      `;
      
      exercises.forEach(exercise => {
        const videoLink = exercise.video_link 
          ? `<div><a href="${exercise.video_link}" target="_blank" style="color: #2563eb;">Guarda il video dell'esercizio</a></div>` 
          : '';
          
        exercisesHtml += `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
              ${exercise.name}
              ${videoLink}
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">${exercise.sets}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${exercise.reps}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${exercise.notes || ''}</td>
          </tr>
        `;
      });
      
      exercisesHtml += "</table>";
    } else {
      exercisesHtml = "<p>Nessun esercizio presente in questo piano.</p>";
    }

    const emailResponse = await resend.emails.send({
      from: "Trainer <onboarding@resend.dev>", // Puoi cambiare questo con il tuo dominio verificato in Resend
      to: [clientEmail],
      subject: `Il tuo piano di allenamento: ${planName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Il tuo piano di allenamento</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #0f172a; margin-top: 0;">Il tuo piano di allenamento</h1>
              <p>Ciao ${clientName},</p>
              <p>Ecco il piano di allenamento che ho preparato per te.</p>
            </div>

            <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin-top: 0;">${planName}</h2>
              ${planDescription ? `<p>${planDescription}</p>` : ''}
              
              <h3 style="color: #0f172a; margin-top: 20px;">Esercizi</h3>
              ${exercisesHtml}
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p>Buon allenamento!</p>
                <p>Saluti,<br>${trainerName}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email inviata con successo:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Errore nella funzione send-training-plan:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
