"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/src/components/dialog";
import { Button } from "@workspace/ui/src/components/button";
import { Input } from "@workspace/ui/src/components/input";
import { Label } from "@workspace/ui/src/components/label";
import { FileText, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import apiFetch from "@/lib/api_client";

interface NewDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCEPTED_EXTENSIONS =
  ".docx,.doc,.pdf,.xlsx,.xls,.pptx,.ppt,.odt,.ods,.odp,.txt,.csv";

export default function NewDocumentDialog({
  open,
  onOpenChange,
}: NewDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasInput = file !== null || urlInput.trim() !== "";

  function resetState() {
    setFile(null);
    setUrlInput("");
    setTitle("");
    setAuthors("");
    setDate("");
    setSaving(false);
  }

  function handleClose() {
    resetState();
    onOpenChange(false);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setUrlInput("");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setUrlInput("");
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrlInput(e.target.value);
    if (e.target.value) {
      setFile(null);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      alert("A cím megadása kötelező!");
      return;
    }
    if (!authors.trim()) {
      alert("Legalább egy szerző megadása kötelező!");
      return;
    }
    if (!date) {
      alert("A dátum megadása kötelező!");
      return;
    }
    if (!hasInput) {
      alert("Fájl vagy link megadása kötelező!");
      return;
    }

    setSaving(true);
    try {
      let path: string;
      let type: "file" | "url";

      if (file) {
        const supabase = createClient();
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("docs")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        path = uploadData.path;
        type = "file";
      } else {
        path = urlInput.trim();
        type = "url";
      }

      await apiFetch("/documents", "PUT", {
        path,
        title: title.trim(),
        authors: authors
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        date: new Date(date).getTime(),
        type,
      });

      window.location.reload();
    } catch (e) {
      alert("Hiba a dokumentum mentése során!");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Új dokumentum</DialogTitle>
        </DialogHeader>

        {!hasInput ? (
          <div
            className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Húzz ide egy dokumentumot, vagy válassz az alábbi lehetőségek
              közül
            </p>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
              <Upload className="h-4 w-4" />
              Fájl feltöltése
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <div className="w-full">
              <Input
                placeholder="Vagy illeszd be a dokumentum linkjét..."
                value={urlInput}
                onChange={handleUrlChange}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-md border px-3 py-2">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate flex-1">
                {file ? file.name : urlInput}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setUrlInput("");
                }}
              >
                Csere
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="doc-title">Cím</Label>
              <Input
                id="doc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dokumentum címe"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="doc-authors">Szerzők</Label>
              <Input
                id="doc-authors"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Szerző1, Szerző2, ..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="doc-date">Dátum</Label>
              <Input
                id="doc-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {hasInput && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Mégse
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Mentés..." : "Mentés"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
