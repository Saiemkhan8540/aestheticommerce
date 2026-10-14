import React, { forwardRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

const labelStyle = {
  fontSize: '0.875rem', // text-sm
  fontWeight: 500,      // font-medium
  lineHeight: '1.25rem' // leading-none
};

const disabledStyle = {
  cursor: 'not-allowed',
  opacity: 0.7
};

const Label = forwardRef(({ style = {}, disabled = false, ...props }, ref) => {
  const combinedStyle = {
    ...labelStyle,
    ...(disabled ? disabledStyle : {}),
    ...style
  };

  return (
    <LabelPrimitive.Root
      ref={ref}
      style={combinedStyle}
      {...props}
    />
  );
});

Label.displayName = 'Label';

export { Label };