import { useToast } from "../toaster/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../toast";

// Internal CSS styles
const styles = {
  toastContent: {
    display: 'grid',
    gap: '0.25rem',
  },
  viewport: {
    position: 'fixed',
    right: '0',
    bottom: '0',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    gap: '0.625rem',
    width: '22.5rem',
    maxWidth: '100vw',
    margin: '0',
    listStyle: 'none',
    zIndex: '9999',
    outline: 'none'
  }
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div style={styles.toastContent}>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport style={styles.viewport} />
    </ToastProvider>
  );
}