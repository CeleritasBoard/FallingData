"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/src/components/form.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/src/components/select.tsx";
import { Input } from "@workspace/ui/src/components/input.tsx";
import { Button } from "@workspace/ui/src/components/button.tsx";
import Device from "../../../components/device.tsx";

const formSchema = z.object({
  device: z.enum(["BME_HUNITY", "ONIONSAT_TEST", "SLOTH"], {
    error: "Kérjük válasszon eszközt",
  }),
  type: z.string().min(1, "Kérjük válasszon típust"),
  execDate: z.string().min(1, "Kérjük adjon meg végrehajtás dátumot"),
  communicationWindow: z
    .string()
    .min(1, "Kérjük válasszon kommunikációs ablakot"),
});

type FormValues = z.infer<typeof formSchema>;

const devices = [
  { id: "BME_HUNITY" as const },
  { id: "ONIONSAT_TEST" as const },
  { id: "SLOTH" as const },
];

interface CommandScheduleFormProps {
  onSubmit: (data: FormValues) => void;
}

const communicationWindows = [
  { value: "1", label: "2025.10.14 20:45:55 - 2025.10.14 21:01:32" },
  { value: "2", label: "2025.10.15 08:30:00 - 2025.10.15 08:45:00" },
  { value: "3", label: "2025.10.15 16:20:00 - 2025.10.15 16:35:00" },
];

export default function CommandScheduleForm({
  onSubmit,
}: CommandScheduleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device: "BME_HUNITY",
      type: "SET_DURATION",
      execDate: "2025.10.15 14:55:55",
      communicationWindow: "1",
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Parancs ütemezése</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Device Selection */}
            <FormField
              control={form.control}
              name="device"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Eszköz:</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {devices.map((device) => (
                        <div
                          key={device.id}
                          onClick={() => field.onChange(device.id)}
                          className={`cursor-pointer rounded-lg transition-all ${
                            field.value === device.id
                              ? "ring-2 ring-blue-500 ring-offset-2"
                              : "hover:opacity-80"
                          }`}
                        >
                          <Device device={device.id} />
                        </div>
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Típus:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Válasszon típust" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FORCE_STATUS_REPORT">
                        FORCE STATUS REPORT
                      </SelectItem>
                      <SelectItem value="REQUEST_MEASUREMENT">
                        REQUEST MEASUREMENT
                      </SelectItem>
                      <SelectItem value="REQUEST_SELFTEST">
                        REQUEST SELFTEST
                      </SelectItem>
                      <SelectItem value="RESET">RESET</SelectItem>
                      <SelectItem value="RESTART">RESTART</SelectItem>
                      <SelectItem value="SAVE">SAVE</SelectItem>
                      <SelectItem value="SET_DURATION">SET DURATION</SelectItem>
                      <SelectItem value="SET_SCALE">SET SCALE</SelectItem>
                      <SelectItem value="STOP">STOP</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Execution Date */}
            <FormField
              control={form.control}
              name="execDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Végrehajtás Dátuma:</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="w-[200px]"
                      placeholder="YYYY.MM.DD HH:MM:SS"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Communication Window */}
            <FormField
              control={form.control}
              name="communicationWindow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kommunikációs ablak:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Válasszon ablakot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {communicationWindows.map((window) => (
                        <SelectItem key={window.value} value={window.value}>
                          {window.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button type="submit" variant="secondary" className="mt-6">
              Ütemezés
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
