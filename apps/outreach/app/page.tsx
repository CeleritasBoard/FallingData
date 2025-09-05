import { Badge } from "@workspace/ui/components/badge";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      Welcome tutorial!
      <Badge variant="secondary">A secondary badge</Badge>
    </main>
  );
}
