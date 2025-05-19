
// Esportiamo direttamente tutto da use-toast.tsx
import { toast, useToast, type ToastProps, type ToastActionElement } from "./use-toast.tsx";

// Riesportiamo tutto
export { toast, useToast, type ToastProps, type ToastActionElement };

// Definiamo un alias per ToastProps come ExtendedToastOptions per compatibilità
export type ExtendedToastOptions = ToastProps;
