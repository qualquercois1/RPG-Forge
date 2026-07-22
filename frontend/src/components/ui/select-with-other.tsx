import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SelectWithOtherProps {
  value: string;
  onValueChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  customPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectWithOther({
  value,
  onValueChange,
  options,
  placeholder = "Selecione...",
  customPlaceholder = "Escreva o valor personalizado...",
  className,
  disabled = false,
}: SelectWithOtherProps) {
  // Check if current value matches one of the predefined options
  const isPredefined = options.includes(value);

  const [isCustomMode, setIsCustomMode] = useState<boolean>(!isPredefined && value !== "");
  const [customInputValue, setCustomInputValue] = useState<string>(!isPredefined ? value : "");

  useEffect(() => {
    if (options.includes(value)) {
      setIsCustomMode(false);
    } else if (value !== "") {
      setIsCustomMode(true);
      setCustomInputValue(value);
    }
  }, [value, options]);

  const handleSelectChange = (selected: string) => {
    if (selected === "outro") {
      setIsCustomMode(true);
      onValueChange(customInputValue);
    } else {
      setIsCustomMode(false);
      onValueChange(selected);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomInputValue(text);
    onValueChange(text);
  };

  const selectValue = isCustomMode ? "outro" : (value || "");

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Select value={selectValue} onValueChange={handleSelectChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
          <SelectItem value="outro" className="font-semibold text-primary">
            ✨ Outro (Especificar...)
          </SelectItem>
        </SelectContent>
      </Select>

      {isCustomMode && (
        <Input
          type="text"
          value={customInputValue}
          onChange={handleCustomInputChange}
          placeholder={customPlaceholder}
          disabled={disabled}
          className="h-9 text-sm bg-background border-primary/50 focus:border-primary animate-in fade-in slide-in-from-top-1 duration-200"
          autoFocus
        />
      )}
    </div>
  );
}
