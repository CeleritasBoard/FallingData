"use client";

import { useState } from "react";
import DatabaseTable, {
  UserCell,
  UserCellInput,
} from "../../components/db-table";
import { Tables } from "@repo/supabase/database.types.ts";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/src/components/button";
import { createClient } from "@/lib/supabase/client";
import apiFetch from "@/lib/api_client";
import NewDocumentDialog from "./new-document-dialog";
import EditDocumentDialog from "./edit-document-dialog";

type DocumentRow = Tables<"documents_table">;

function DocumentActions({
  row,
  onEdit,
}: {
  row: DocumentRow;
  onEdit: (row: DocumentRow) => void;
}) {
  const supabase = createClient();

  async function handleOpen() {
    const path = row.path ?? "";
    let url: string;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      url = path;
    } else {
      const { data } = supabase.storage.from("docs").getPublicUrl(path);
      url = data.publicUrl;
    }
    window.open(url, "_blank");
  }

  async function handleDelete() {
    if (!confirm("Biztosan törölni szeretnéd ezt a dokumentumot?")) return;
    try {
      await apiFetch(`/documents/${row.id}`, "DELETE", null);
      window.location.reload();
    } catch (e) {
      alert("Hiba a törlés során!");
      console.error(e);
    }
  }

  return (
    <div className="flex flex-row gap-1">
      <Button variant="ghost" size="icon" onClick={handleOpen}>
        <ExternalLink className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function DocumentsPage() {
  const [editingDoc, setEditingDoc] = useState<DocumentRow | null>(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const columns: ColumnDef<DocumentRow>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      meta: { filterVariant: "number" },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cím
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      meta: { filterVariant: "text" },
    },
    {
      accessorKey: "authors",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Szerzők
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      meta: { filterVariant: "text" },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dátum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>{row.original.date ?? ""}</span>,
      meta: { filterVariant: "dateRange" },
    },
    {
      id: "uploader",
      header: "Feltöltő",
      cell: ({ row }) => {
        if (!row.original.uploader_meta) return null;
        return (
          <UserCell metadata={row.original.uploader_meta as UserCellInput} />
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DocumentActions row={row.original} onEdit={setEditingDoc} />
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Dokumentumok
        </h1>
        <button
          className="text-primary hover:underline text-left w-fit text-sm"
          onClick={() => setNewDialogOpen(true)}
        >
          Új dokumentum →
        </button>
      </div>
      <DatabaseTable columns={columns} table="documents_table" />
      <NewDocumentDialog open={newDialogOpen} onOpenChange={setNewDialogOpen} />
      {editingDoc && (
        <EditDocumentDialog
          open={!!editingDoc}
          onOpenChange={(open) => !open && setEditingDoc(null)}
          document={editingDoc}
        />
      )}
    </div>
  );
}
