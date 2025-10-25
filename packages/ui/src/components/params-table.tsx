import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "./table.tsx";

export function ParamsTable({ params }: { params: string[][] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Név</TableCell>
          <TableCell>Érték</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {params.map((param, i) => (
          <TableRow key={i}>
            <TableCell>{param[0]}</TableCell>
            <TableCell>{param[1]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
