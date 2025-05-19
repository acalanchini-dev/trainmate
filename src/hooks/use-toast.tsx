"use client"

import * as React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  type ToastActionElement as ToastPrimitiveActionElement,
  type ToastProps as ToastPrimitiveProps,
} from "@/components/ui/toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Configurazione migliorata
const TOAST_CONFIG = {
  REMOVE_DELAY: 3000, // 3 secondi
  LIMIT: 5, // Massimo 5 toast contemporanei
  PRIORITY: {
    destructive: 0,
    warning: 1,
    success: 2,
    default: 3
  }
} as const;

type ToastVariant = "default" | "destructive" | "success" | "warning"

export interface ToastProps extends Omit<ToastPrimitiveProps, "variant"> {
  variant?: ToastVariant;
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  id?: string;
  duration?: number; // Durata personalizzabile
  priority?: number; // Priorità personalizzabile
}

export type ToastActionElement = ToastPrimitiveActionElement

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToastProps
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToastProps>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Funzione helper per la gestione della priorità
const sortToastsByPriority = (toasts: ToastProps[]): ToastProps[] => {
  return [...toasts].sort((a, b) => {
    const priorityA = a.priority ?? TOAST_CONFIG.PRIORITY[a.variant ?? 'default'];
    const priorityB = b.priority ?? TOAST_CONFIG.PRIORITY[b.variant ?? 'default'];
    return priorityA - priorityB;
  });
};

const addToRemoveQueue = (toastId: string, duration?: number) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
    toastTimeouts.delete(toastId);
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    })
  }, duration ?? TOAST_CONFIG.REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST: {
      const newToasts = sortToastsByPriority([action.toast, ...state.toasts])
        .slice(0, TOAST_CONFIG.LIMIT);
      
      return {
        ...state,
        toasts: newToasts,
      }
    }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id as string)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST: {
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToastProps, "id"> & {
  id?: string
}

type ToastResponse = {
  id: string;
  dismiss: () => void;
  update: (props: ToastProps) => void;
}

function toast(props: Toast): ToastResponse;
function toast(message: string, options?: Partial<ToastProps>): ToastResponse;
function toast(messageOrProps: string | Toast, options?: Partial<ToastProps>): ToastResponse {
  const props: Toast = typeof messageOrProps === 'string' 
    ? { ...options, description: messageOrProps }
    : messageOrProps;

  const id = props.id || genId();
  const duration = props.duration ?? TOAST_CONFIG.REMOVE_DELAY;

  // Gestione automatica della variante in base al contenuto
  const variant = props.variant ?? (
    props.description?.toString().toLowerCase().includes('error') 
      ? 'destructive' 
      : props.description?.toString().toLowerCase().includes('success')
        ? 'success'
        : 'default'
  );

  const update = (newProps: ToastProps) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...newProps, id },
    });

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      variant,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Imposta il timeout per la rimozione automatica
  addToRemoveQueue(id, duration);

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export { toast, useToast }
