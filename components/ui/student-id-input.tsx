"use client";

import { Input } from "@/components/ui/input";
import * as React from "react";

export const StudentIdInput = React.forwardRef<HTMLDivElement, React.ComponentProps<"input">>(
  ({ value, onChange, placeholder, ...props }, ref) => {
    const [part1, setPart1] = React.useState("");
    const [part2, setPart2] = React.useState("");
    const [part3, setPart3] = React.useState("");
    const part1Ref = React.useRef<HTMLInputElement>(null);
    const part2Ref = React.useRef<HTMLInputElement>(null);
    const part3Ref = React.useRef<HTMLInputElement>(null);

    // Initialize from value prop
    React.useEffect(() => {
      if (value && typeof value === "string") {
        const parts = value.split("-");
        if (parts.length === 3) {
          setPart1(parts[0]);
          setPart2(parts[1]);
          setPart3(parts[2]);
        }
      }
    }, [value]);

    const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, "").substring(0, 2);
      
      // Validate year
      if (val.length === 2) {
        const year = parseInt(val, 10);
        const maxYear = new Date().getFullYear() % 100;
        if (year > maxYear) {
          val = maxYear.toString();
        }
      }

      setPart1(val);

      // Auto-focus to next field when 2 digits entered
      if (val.length === 2) {
        part2Ref.current?.focus();
      }

      updateParent(val, part2, part3);
    };

    const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, "").substring(0, 1);
      setPart2(val);

      // Auto-focus to next field when 1 digit entered
      if (val.length === 1) {
        part3Ref.current?.focus();
      }

      updateParent(part1, val, part3);
    };

    const handlePart3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, "").substring(0, 5);
      setPart3(val);
      updateParent(part1, part2, val);
    };

    const updateParent = (p1: string, p2: string, p3: string) => {
      const formatted = `${p1}${p2 ? "-" + p2 : ""}${p3 ? "-" + p3 : ""}`;
      if (onChange) {
        const event = new Event("change", { bubbles: true });
        Object.defineProperty(event, "target", {
          writable: false,
          value: { value: formatted },
        });
        onChange(event as any);
      }
    };

    const handlePart1Backspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && part1.length === 0 && part2.length === 0 && part3.length === 0) {
        return;
      }
    };

    const handlePart2Backspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && part2.length === 0) {
        part1Ref.current?.focus();
      }
    };

    const handlePart3Backspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && part3.length === 0) {
        part2Ref.current?.focus();
      }
    };

    return (
      <div className="flex gap-1 items-center" ref={ref}>
        <Input
          type="number"
          inputMode="numeric"
          ref={part1Ref}
          value={part1}
          onChange={handlePart1Change}
          onKeyDown={handlePart1Backspace}
          placeholder="00"
          maxLength={2}
          className="w-12 text-center"
          {...props}
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          inputMode="numeric"
          ref={part2Ref}
          value={part2}
          onChange={handlePart2Change}
          onKeyDown={handlePart2Backspace}
          placeholder="0"
          maxLength={1}
          className="w-8 text-center"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          inputMode="numeric"
          ref={part3Ref}
          value={part3}
          onChange={handlePart3Change}
          onKeyDown={handlePart3Backspace}
          placeholder="00000"
          maxLength={5}
          className="w-20 text-center"
        />
      </div>
    );
  }
);
StudentIdInput.displayName = "StudentIdInput";
