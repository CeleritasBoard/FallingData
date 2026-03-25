import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "./table.tsx";

export function ParamsTable({
  params,
  className,
}: {
  params: string[][];
  className?: string;
}) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableCell>Név</TableCell>
          <TableCell>Érték</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {params.map((param, i) => (
          <TableRow key={i}>
            <TableCell className="w-full">{param[0]}</TableCell>
            <TableCell>{param[1]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
