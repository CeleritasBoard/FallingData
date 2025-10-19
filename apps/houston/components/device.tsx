import { Enums } from "@repo/supabase/database.types.ts";
import { Card } from "@workspace/ui/src/components/card";
import Image from "next/image";

type DeviceData = {
  name: string;
  image: string;
};

const devices: {
  BME_HUNITY: DeviceData;
  ONIONSAT_TEST: DeviceData;
  SLOTH: DeviceData;
} = {
  BME_HUNITY: {
    name: "Hunity",
    image: "/devices/hunity.png",
  },
  ONIONSAT_TEST: {
    name: "Onionsat",
    image: "/devices/onionsat.webp",
  },
  SLOTH: {
    name: "Sloth",
    image: "/devices/sloth.png",
  },
};

export default function Device({ device }: { device: Enums<"device"> }) {
  const deviceData: DeviceData = devices[device] ?? {
    name: "Unknown Device",
    image: "",
  };
  return (
    <Card className="flex flex-col items-center justify-between h-full bg-[#434343]">
      <div className="h-full flex justify-center items-center">
        <Image
          src={deviceData.image}
          alt={deviceData.name}
          width={200}
          height={200}
        />
      </div>
      <h2>{deviceData.name}</h2>
    </Card>
  );
}
