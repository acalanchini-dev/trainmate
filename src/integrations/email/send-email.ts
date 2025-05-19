
// Modulo di integrazione per l'invio di email
// Questo è solo un placeholder che può essere implementato successivamente

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    url?: string; // Aggiungiamo l'opzione url per supportare allegati da URL
  }>;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  console.log("Simulating email sending:", options);
  // Qui si implementerebbe la logica di invio email reale
  return true;
};

export const sendTrainingPlanEmail = async (
  email: string, 
  clientName: string, 
  planName: string,
  planContent: any
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: `Piano di Allenamento: ${planName}`,
    html: `<p>Ciao ${clientName},</p><p>Ecco il tuo piano di allenamento: ${planName}</p>`
  });
};
