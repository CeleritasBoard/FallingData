"use client";
import {
  Dialog,
  DialogDescription,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@workspace/ui/src/components/dialog";
import { Button } from "@workspace/ui/src/components/button";
import { MailPlus } from "lucide-react";
import { Input } from "@workspace/ui/src/components/input";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import apiFetch from "@/lib/api_client";

export default function CreateUserDialog() {
  const [email, setEmail] = useState<string>("");

  const supa = createClient();

  const inviteUser = () => {
    apiFetch("/users", "PUT", { email: email }, null, supa)
      .then(() => {
        alert("A meghívó sikeresen elküldve");
        window.location.reload();
      })
      .catch((e) => {
        alert("Hiba a meghívó elküldése közben!");
        console.error(e);
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="max-w-30">
        <Button>
          <MailPlus />
          Meghívás
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Új felhasználó meghívása</DialogTitle>
          <DialogDescription>
            Add meg a felhasználó e-mail címét a létrehozáshoz
          </DialogDescription>
        </DialogHeader>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="someone@gmail.com"
        />
        <DialogFooter className="flex justify-end">
          <Button type="button" onClick={inviteUser}>
            Invite
          </Button>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Close
            </Button>
          </DialogClose>{" "}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
