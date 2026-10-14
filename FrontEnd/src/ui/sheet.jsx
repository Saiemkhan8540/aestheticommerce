import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import "./sheet.css";

// --- Components ---
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <SheetPrimitive.Overlay
      ref={ref}
      className={`sheet-overlay ${className}`}
      {...props}
    />
  )
);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef(
  ({ 
    side = "right", 
    className = "",
    children, 
    title, 
    description, 
    ...props 
  }, ref) => {
    const descriptionId = description ? "sheet-description" : undefined;

    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          ref={ref}
          aria-describedby={descriptionId}
          className={`sheet-content sheet-content-${side} ${className}`}
          {...props}
        >
          {(title || description) && (
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && (
                <SheetDescription id={descriptionId}>{description}</SheetDescription>
              )}
            </SheetHeader>
          )}
          {children}
          <SheetPrimitive.Close asChild>
            {/* <button className="sheet-close">
              <X width={20} height={20} />
              <span className="sr-only">Close</span>
            </button> */}
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  }
);

SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className = "", ...props }) => (
  <div className={`sheet-header ${className}`} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className = "", ...props }) => (
  <div className={`sheet-footer ${className}`} {...props} />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <SheetPrimitive.Title
      ref={ref}
      className={`sheet-title ${className}`}
      {...props}
    />
  )
);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <SheetPrimitive.Description
      ref={ref}
      className={`sheet-description ${className}`}
      {...props}
    />
  )
);
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};