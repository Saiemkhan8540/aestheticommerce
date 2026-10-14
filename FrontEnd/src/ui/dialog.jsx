import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const dialogIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const dialogOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.95);
  }
`;

const DialogOverlay = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  
  &[data-state='open'] {
    animation: ${fadeIn} 200ms ease-out;
  }
  &[data-state='closed'] {
    animation: ${fadeOut} 200ms ease-in;
  }
`;

const DialogContent = styled(DialogPrimitive.Content)`
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 50;
  display: grid;
  width: 100%;
  max-width: 32rem;
  transform: translate(-50%, -50%);
  gap: 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  &[data-state='open'] {
    animation: ${dialogIn} 200ms ease-out;
  }
  &[data-state='closed'] {
    animation: ${dialogOut} 200ms ease-in;
  }

  @media (min-width: 640px) {
    border-radius: 0.5rem;
  }
`;

const DialogClose = styled(DialogPrimitive.Close)`
  position: absolute;
  right: 1rem;
  top: 1rem;
  border-radius: 0.25rem;
  opacity: 0.7;
  transition: opacity 200ms;
  padding: 0.25rem;
  
  &:hover {
    opacity: 1;
  }
  
  &:focus {
    outline: 2px solid #94a3b8;
    outline-offset: 2px;
  }
`;

const DialogHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  text-align: center;
  
  @media (min-width: 640px) {
    text-align: left;
  }
`;

const DialogFooter = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: flex-end;
    gap: 0.5rem;
  }
`;

const DialogTitle = styled(DialogPrimitive.Title)`
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
`;

const DialogDescription = styled(DialogPrimitive.Description)`
  font-size: 0.875rem;
  color: #64748b;
`;

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const StyledX = styled(X)`
  width: 1rem;
  height: 1rem;
`;

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

export const DialogComponent = () => (
  <Dialog>
    <DialogTrigger>Open Dialog</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>Dialog Description</DialogDescription>
      </DialogHeader>
      <DialogClose>
        <StyledX />
        <SrOnly>Close</SrOnly>
      </DialogClose>
      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  StyledX as DialogCloseIcon,
  SrOnly as DialogCloseSr,
};