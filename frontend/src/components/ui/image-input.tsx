import React, { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveImageUrl, uploadImageFile } from "@/context/character-context";

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  label?: string;
}

export function ImageInput({
  value,
  onChange,
  placeholder = "https://exemplo.com/imagem.jpg",
  label = "",
}: ImageInputProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      onChange(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const resolved = resolveImageUrl(value);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded-lg border border-border bg-card/60 p-2 flex items-center gap-3">
          <img
            src={resolved}
            alt="Preview"
            className="w-10 h-10 rounded object-cover border border-primary/30 shrink-0 bg-background"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-mono text-foreground truncate">{value}</p>
            <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">✓ Imagem Carregada</p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onChange("")}
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            title="Remover Imagem"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-9 text-xs font-semibold flex items-center justify-center gap-1.5 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Upload className="h-4 w-4 text-primary" />
              )}
              {uploading ? "Carregando..." : "📁 Enviar do Computador"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUrlInput((v) => !v)}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
              title="Inserir URL da Imagem"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              <span className="text-[10px]">URL</span>
            </Button>
          </div>

          {showUrlInput && (
            <Input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-8 text-xs font-mono"
            />
          )}
        </div>
      )}
    </div>
  );
}
