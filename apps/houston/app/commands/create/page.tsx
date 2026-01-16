"use client"

import { useState } from "react"
import CommandScheduleForm from "./command-schedule-form"
import { DynamicCommandForm } from "./dynamicCommandForm"
import type { FormValues } from "./command-schemas"

export default function CommandSchedulePage() {
    const [submittedData, setSubmittedData] = useState<FormValues | null>(null)

    const onSubmit = (data: FormValues) => {
        console.log("[v0] Step 1 Form submitted:", data)
        setSubmittedData(data)
    }
    const handleAbort = () => {
        setSubmittedData(null)
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-4xl">

                <CommandScheduleForm onSubmit={onSubmit} />

                {submittedData && (
                    <DynamicCommandForm submittedData={submittedData} onAbort={handleAbort} />
                )}
            </div>
        </div>
    )
}
