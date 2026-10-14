import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const swipeOut = keyframes`
  from { transform: translateX(var(--radix-toast-swipe-end-x)); }
  to { transform: translateX(100%); }
`;

const ToastViewport = styled(ToastPrimitives.Viewport)`
  position: fixed;
  top: 0;
  z-index: 100;
  display: flex;
  max-height: 100vh;
  width: 100%;
  flex-direction: column-reverse;
  padding: 1rem;

  @media (min-width: 640px) {
    bottom: 0;
    right: 0;
    top: auto;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    max-width: 420px;
  }
`;

const ToastRoot = styled(ToastPrimitives.Root)`
  pointer-events: auto;
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  overflow: hidden;
  border-radius: 0.375rem;
  border: 1px solid;
  padding: 1.5rem;
  padding-right: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 200ms;

  &[data-swipe="cancel"] { transform: translateX(0); }
  &[data-swipe="end"] { transform: translateX(var(--radix-toast-swipe-end-x)); }
  &[data-swipe="move"] {
    transform: translateX(var(--radix-toast-swipe-move-x));
    transition: none;
  }

  &[data-state="open"] { animation: ${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1); }
  &[data-state="closed"] { animation: ${fadeOut} 200ms ease-in; }
  &[data-swipe="end"] { animation: ${swipeOut} 100ms ease-out; }

  ${({ variant }) => variant === 'destructive' ? `
    border-color: hsl(0 72% 51%);
    background: hsl(0 84% 60%);
    color: hsl(0 0% 98%);
  ` : `
    border-color: hsl(240 5% 84%);
    background: white;
    color: hsl(240 10% 3.9%);
  `}
`;

const ToastAction = styled(ToastPrimitives.Action)`
  display: inline-flex;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  border: 1px solid;
  background: transparent;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 200ms;

  &:focus {
    outline: 2px solid hsl(240 4.8% 95.9%);
    outline-offset: 2px;
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  ${({ variant }) => variant === 'destructive' && `
    border-color: hsl(0 0% 98% / 0.4);
    &:hover {
      border-color: hsl(0 84% 60% / 0.3);
      background: hsl(0 84% 60%);
      color: hsl(0 0% 98%);
    }
    &:focus {
      ring-color: hsl(0 84% 60%);
    }
  `}
`;

const ToastClose = styled(ToastPrimitives.Close)`
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  border-radius: 0.375rem;
  padding: 0.25rem;
  color: hsl(240 3.8% 46.1%);
  opacity: 0;
  transition: opacity 200ms;

  &:hover { color: hsl(240 10% 3.9%); }
  &:focus {
    opacity: 1;
    outline: 2px solid hsl(240 4.8% 95.9%);
  }

  ${({ variant }) => variant === 'destructive' && `
    color: hsl(0 74% 70%);
    &:hover { color: hsl(0 0% 98%); }
    &:focus { ring-color: hsl(0 84% 60%); }
  `}
`;

const ToastTitle = styled(ToastPrimitives.Title)`
  font-size: 0.875rem;
  font-weight: 600;
`;

const ToastDescription = styled(ToastPrimitives.Description)`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const ToastProvider = ToastPrimitives.Provider;

const Toast = React.forwardRef(({ variant, ...props }, ref) => (
  <ToastRoot ref={ref} variant={variant} {...props} />
));

const CloseIcon = styled(X)`
  width: 1rem;
  height: 1rem;
`;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  CloseIcon,
};