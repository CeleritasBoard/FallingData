"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/src/components/dialog.tsx"
import { Button } from "@workspace/ui/src/components/button.tsx"
import { Input } from "@workspace/ui/src/components/input.tsx"
import { Label } from "@workspace/ui/src/components/label.tsx"
import apiFetch from "@/lib/api_client.ts";

interface MegszakitasDialogProps {
    open: boolean
    id: string
    status: string,
    onOpenChange: (open: boolean) => void
}

export function MegszakitasDialog({ open, id, status, onOpenChange }: MegszakitasDialogProps) {
    const [indoklas, setIndoklas] = useState("")

    async function handleSave() {

        const response = await apiFetch(`/missions/${id}/abort`, "DELETE",
            {type : status=="SCHEDULED" ? "USER" : "NO_RESPONSE", reason : indoklas});
        console.log("This is the response: ", response);
        console.log("Megszakítás indoklása:", indoklas)
        onOpenChange(false)
        window.location.reload();
    }

    const handleClose = () => {
        setIndoklas("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Küldetés megszakítása</DialogTitle>
                    <DialogDescription>
                        A küldetés törlése - amennyiben ez lehetséges.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="indoklas">Indoklás:</Label>
                        <Input
                            id="indoklas"
                            placeholder="Hibás konfiguráció..."
                            value={indoklas}
                            onChange={(e) => setIndoklas(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleClose}>
                        Vissza
                    </Button>
                    <Button variant="destructive" onClick={handleSave}>
                        Megszakítás
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
