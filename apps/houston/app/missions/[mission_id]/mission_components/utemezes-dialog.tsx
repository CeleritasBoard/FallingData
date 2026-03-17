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
import apiFetch from "@/lib/api_client.ts";

interface UtemezesDialogProps {
    open: boolean
    id: string,
    onOpenChange: (open: boolean) => void
}

interface datum{
    date: number
}

export function UtemezesDialog({ open, id, onOpenChange }: UtemezesDialogProps) {
    const [dateTime, setDateTime] = useState("2026. 05. 01 11:11:11")

    async function handleSave(){
        // TODO: Implement save logic here
        // TODO: Date to number
        const date: datum = {date: 10000};

        console.log(dateTime);
        const response = await apiFetch(`/missions/${id}/schedule`, "POST", date);
        console.log("This is the response: ", response);
        console.log("Ütemezés mentése:", dateTime)
        onOpenChange(false)
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Küldetés ütemezése</DialogTitle>
                    <DialogDescription>
                        A küldetés ütemezéséhez adj meg egy végrehajtási dátumot.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Input
                        type="text"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        placeholder="YYYY. MM. DD HH:MM:SS"
                        className="bg-background"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleCancel}>
                        Vissza
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        Ütemezés
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
