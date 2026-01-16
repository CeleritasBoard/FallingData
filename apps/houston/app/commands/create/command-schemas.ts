import * as z from "zod"

export const formSchema = z.object({
    device: z.enum(["BME_HUNITY", "ONIONSAT_TEST", "SLOTH"], {
        errorMap: () => ({ message: "Kérjük válasszon eszközt" }),
    }),
    type: z.string().min(1, "Kérjük válasszon típust"),
    executionDate: z.string().min(1, "Kérjük adjon meg végrehajtás dátumot"),
    communicationWindow: z.string().min(1, "Kérjük válasszon kommunikációs ablakot"),
})

export const requestMeasurementSchema = z.object({
    execution_time: z.coerce.number(),
        //.min(0, "Add meg a mérés kivitelezésének UNIX idejét:"),
    byte: z.boolean()
})

export const setDurSchema = z.object({
    repCount: z.coerce.number(),
        //.min(0)
        //.max(63),
    repMode: z.enum(["MAX_HITS", "MAX_TIME"]),
    isOkaying: z.boolean(),
    duration: z.coerce.number(),
        //.min(0, "Állítsd be a mérés hosszát:").max(65535),
    breaktime: z.coerce.number(),
        //.min(0, "Állítsd be a mérések közötti várakozási időt:").max(65535),
})

export const setScaleSchema = z.object({
    measurement_range_min: z.coerce.number(),
        //.min(186).max(3101),
    measurement_range_max: z.coerce.number(),
    //.min(187).max(3102),
    resolution: z.coerce.number(),
        //.min(0).max(16),
    sample: z.coerce.number()
        //.min(0).max(255),
})




export type FormValues = z.infer<typeof formSchema>
export type RequestMeasurementValues = z.infer<typeof requestMeasurementSchema>
export type SetDurValues = z.infer<typeof setDurSchema>
export type SetScaleValues = z.infer<typeof setScaleSchema>


