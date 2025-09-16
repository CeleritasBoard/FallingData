import {columns, Packet} from "../packets/columns"
import {DataTable} from "@workspace/ui/src/components/data-table"

async function getData(): Promise<Packet[]> {
    // Fetch data from your API here.
    return [
        {
            id: "1",
            type: "SPECTRUM",
            date: new Date("2025-12-31T23:59:59"),
            device: "SLOTH",
            packet: "123456789ABCDEF0"
        },

        {
            id: "2",
            type: "WELCOME",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "ONIONSAT_TEST",
            packet: "A1B2C3D4E5F67890"
        },
        {
            id: "3",
            type: "FLASH_DUMP",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "BME_HUNITY",
            packet: "F0E1D2C3B4A59687"
        },
        {
            id: "4",
            type: "HEADER",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "SLOTH",
            packet: "1122334455667788"
        },
        {
            id: "5",
            type: "SPECTRUM",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "SLOTH",
            packet: "99AABBCCDDEEFF00"
        },
        {
            id: "6",
            type: "SELFTEST",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "BME_HUNITY",
            packet: "1A2B3C4D5E6F7A8B"
        },
        {
            id: "7",
            type: "STATUS_REPORT",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "ONIONSAT_TEST",
            packet: "8B7A6F5E4D3C2B1A"
        },
        {
            id: "8",
            type: "ERROR",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "SLOTH",
            packet: "C3E5A7B9D1F23456"
        },
        {
            id: "9",
            type: "GEIGER_COUNT",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "BME_HUNITY",
            packet: "5634127890ABCDEF"
        },
        {
            id: "10",
            type: "WELCOME",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "SLOTH",
            packet: "FE98DCBA76543210"
        },
        {
            id: "11",
            type: "FLASH_DUMP",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "ONIONSAT_TEST",
            packet: "0123456789ABCDEF"
        },
        {
            id: "12",
            type: "HEADER",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "SLOTH",
            packet: "F0E1D2C3B4A59687"
        },
        {
            id: "13",
            type: "SPECTRUM",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "BME_HUNITY",
            packet: "1122334455667788"
        },
        {
            id: "14",
            type: "SELFTEST",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "ONIONSAT_TEST",
            packet: "99AABBCCDDEEFF00"
        },
        {
            id: "15",
            type: "STATUS_REPORT",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "SLOTH",
            packet: "1A2B3C4D5E6F7A8B"
        },
        {
            id: "16",
            type: "ERROR",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "BME_HUNITY",
            packet: "8B7A6F5E4D3C2B1A"
        },
        {
            id: "17",
            type: "GEIGER_COUNT",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "ONIONSAT_TEST",
            packet: "C3E5A7B9D1F23456"
        },
        {
            id: "18",
            type: "WELCOME",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "BME_HUNITY",
            packet: "5634127890ABCDEF"
        },
        {
            id: "19",
            type: "FLASH_DUMP",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "SLOTH",
            packet: "FE98DCBA76543210"
        },
        {
            id: "20",
            type: "HEADER",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "ONIONSAT_TEST",
            packet: "0123456789ABCDEF"
        },
        {
            id: "21",
            type: "SPECTRUM",
            date: new Date("2025-09-07T21:03:02.000Z"),
            device: "BME_HUNITY",
            packet: "A1B2C3D4E5F67890"
        }


    ]
}

export default async function DemoPage() {
    const data = await getData()

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data}/>
        </div>
    )
}