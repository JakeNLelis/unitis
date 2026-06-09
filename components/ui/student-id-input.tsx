"use client";

import { Input } from "@/components/ui/input";
import * as React from "react";

export const StudentIdInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let digits = e.target.value.replace(/\D/g, "");
      
      if (digits.length >= 2) {
        const year = parseInt(digits.substring(0, 2), 10);
        const maxYear = new Date().getFullYear() % 100;
        if (year > maxYear) {
          digits = maxYear.toString() + digits.substring(2);
        }
      }
      
      digits = digits.substring(0, 8);
      
      let formatted = digits;
      if (digits.length > 2) {
        formatted = digits.substring(0, 2) + "-" + digits.substring(2);
      }
      if (digits.length > 3) {
        formatted = digits.substring(0, 2) + "-" + digits.substring(2, 3) + "-" + digits.substring(3);
      }

      if (onChange) {
        e.target.value = formatted;
        onChange(e);
      }
    };

    const maxYear = new Date().getFullYear() % 100;

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        pattern="^\\d{2}-\\d-\\d{5}$"
        title={`Format: xx-x-xxxxx (First two digits cannot exceed ${maxYear})`}
      />
    );
  }
);
StudentIdInput.displayName = "StudentIdInput";
