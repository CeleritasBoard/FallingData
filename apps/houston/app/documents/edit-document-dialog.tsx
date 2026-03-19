"use client";

import { useState } from "react";
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
import { Tables } from "@repo/supabase/database.types.ts";
import apiFetch from "@/lib/api_client";

type DocumentRow = Tables<"documents_table">;

interface EditDocumentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: DocumentRow;
}

export default function EditDocumentDialog({
    open,
    onOpenChange,
    document,
}: EditDocumentDialogProps) {
    const [title, setTitle] = useState(document.title ?? "");
    const [authors, setAuthors] = useState(() => {
        const raw = document.authors;
        if (Array.isArray(raw)) return (raw as string[]).join(", ");
        return (raw as string) ?? "";
    });
    const [date, setDate] = useState(() => {
        if (!document.date) return "";
        return new Date(document.date).toISOString().split("T")[0];
    });
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        if (!title.trim()) {
            alert("A cím megadása kötelező!");
            return;
        }
        if (!date) {
            alert("A dátum megadása kötelező!");
            return;
        }

        setSaving(true);
        try {
            await apiFetch(`/documents/${document.id}`, "POST", {
                title: title.trim(),
                authors: authors
                    .split(",")
                    .map((a) => a.trim())
                    .filter(Boolean),
                date: new Date(date).getTime(),
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Dokumentum szerkesztése</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-title">Cím</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-authors">Szerzők</Label>
                        <Input
                            id="edit-authors"
                            value={authors}
                            onChange={(e) => setAuthors(e.target.value)}
                            placeholder="Szerző1, Szerző2, ..."
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-date">Dátum</Label>
                        <Input
                            id="edit-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Mégse
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Mentés..." : "Mentés"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
