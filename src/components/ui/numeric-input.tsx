import * as React from "react";
import { Input } from "@/components/ui/input";

export interface NumericInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type" | "onChange" | "value"> {
  value: string | number;
  onChange: (value: string) => void;
  maxLength?: number;
}

/**
 * Text input that only allows digits. Replaces native type="number" inputs
 * to avoid spinner UI, scroll-wheel changes, and locale parsing issues.
 */
export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onChange, maxLength, inputMode = "numeric", ...rest }, ref) => {
    const sanitize = (raw: string) => {
      const digits = raw.replace(/\D+/g, "");
      return maxLength ? digits.slice(0, maxLength) : digits;
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={inputMode}
        pattern="[0-9]*"
        autoComplete="off"
        value={value ?? ""}
        onChange={(e) => onChange(sanitize(e.target.value))}
        onPaste={(e) => {
          e.preventDefault();
          const pasted = e.clipboardData.getData("text");
          onChange(sanitize(String(value ?? "") + pasted));
        }}
        onBeforeInput={(e: React.FormEvent<HTMLInputElement> & { data?: string }) => {
          if (e.data && /\D/.test(e.data)) e.preventDefault();
        }}
        {...rest}
      />
    );
  }
);
NumericInput.displayName = "NumericInput";
