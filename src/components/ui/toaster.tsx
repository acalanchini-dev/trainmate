import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            variant={variant}
            className={cn(
              "group relative",
              variant === "destructive" && "destructive border-destructive bg-destructive text-destructive-foreground",
              variant === "success" && "border-green-500 bg-green-50 text-green-900",
              variant === "warning" && "border-yellow-500 bg-yellow-50 text-yellow-900"
            )}
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className={cn(
                  "text-sm font-semibold",
                  variant === "destructive" && "text-destructive-foreground",
                  variant === "success" && "text-green-800",
                  variant === "warning" && "text-yellow-800"
                )}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className={cn(
                  "text-sm",
                  variant === "destructive" && "text-destructive-foreground/90",
                  variant === "success" && "text-green-700",
                  variant === "warning" && "text-yellow-700"
                )}>
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col gap-2 w-full max-w-[420px] p-4 sm:max-w-[380px]" />
    </ToastProvider>
  )
}
