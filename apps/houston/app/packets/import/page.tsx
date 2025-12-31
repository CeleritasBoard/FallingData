"use client";

import { Button } from "@workspace/ui/src/components/button.tsx";
import { useState } from "react";
import apiFetch from "@/lib/api_client";

export default function ImportPage() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);

  const submitCallback = (e: any) => {
    e.preventDefault();
    apiFetch("/device-import", "POST", {
      device: "SLOTH",
      startDate: new Date(date!).getTime() / 1000,
      content: fileContent,
    })
      .then(() => {
        // Handle success
        alert("Import successful");
        window.location.replace("/packets");
      })
      .catch((error: any) => {
        // Handle error
        alert("Import failed");
        console.error(error);
      });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-16">
          Packetek importálása
        </h1>
        <form onSubmit={submitCallback} className="flex flex-col gap-4">
          <div className="block">
            <label className="block">Fájl:</label>
            <input
              name="file"
              type="file"
              onChange={async (e) =>
                setFileContent((await e.target.files?.[0]?.text()) ?? null)
              }
            />
          </div>
          <div className="block">
            <label className="block">Dátum:</label>
            <input
              name="date"
              type="datetime-local"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button className="self-start mt-4">Importálás</Button>
        </form>
      </div>
    </div>
  );
}
