import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import "./RadioGroup.css";

const RadioGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root
        className={`radio-group ${className}`}
        {...props}
        ref={ref}
      />
    );
  }
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="radio-item-container">
        <RadioGroupPrimitive.Item
          ref={ref}
          className={`radio-item ${className}`}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className="radio-indicator" />
        </RadioGroupPrimitive.Item>
        {children && <label className="radio-label">{children}</label>}
      </div>
    );
  }
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };