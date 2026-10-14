import React, { forwardRef } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import './checkbox.css'; // Import internal CSS

const Checkbox = forwardRef((props, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className="custom-checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator className="custom-checkbox-indicator">
        <Check className="custom-check-icon" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };