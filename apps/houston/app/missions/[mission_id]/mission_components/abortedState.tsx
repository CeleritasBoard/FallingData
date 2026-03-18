import { AlertTriangle } from "lucide-react";

export function AbortedState({
  username,
  reason,
}: {
  username: string;
  reason: string;
}) {
  return (
    <div className="rounded-lg bg-[#F80F0F15] px-8 py-8 text-center">
      <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-600" />
      <h2 className="mb-2 text-2xl font-semibold text-red-900">
        Küldetés abortálva
      </h2>
      <p className="text-red-800">
        Abortálta: {username} <br />
        Megjegyzés: {reason ?? "N/A"}
      </p>
    </div>
  );
}
