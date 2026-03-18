import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/src/components/card";
import Spectrum, {
  type Input as SpectrumInput,
} from "@workspace/ui/src/components/Spectrum.tsx";
import { Edit } from "lucide-react";

export function SpectrumCard({ data }: { data: SpectrumInput }) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Diagrammok</CardTitle>
        <Edit className="h-4 w-4" />
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-full p-0">
        <Spectrum data={data} />
      </CardContent>
    </Card>
  );
}
