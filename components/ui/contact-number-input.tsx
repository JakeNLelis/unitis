"use client";

import { Input } from "@/components/ui/input";
import * as React from "react";

export const ContactNumberInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let digits = e.target.value.replace(/\D/g, "");
      
      // Contact numbers in PH start with 09 and have 11 digits
      digits = digits.substring(0, 11);

      if (onChange) {
        e.target.value = digits;
        onChange(e);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        pattern="^[0-9]{11}$"
        title="Contact number must be exactly 11 digits (e.g. 09XXXXXXXXX)"
      />
    );
  }
);
ContactNumberInput.displayName = "ContactNumberInput";
