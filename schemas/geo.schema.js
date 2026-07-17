import { z } from "zod";

const headers = {
    xtraceid: z.string().min(1).max(350).optional(),
    xclientid: z.string().min(1).max(350),
};

const puntoSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

// Validacion para POST /api/v1/geo/geocode
export const geocodeSchema = z
    .object({
        address: z
            .string({
                required_error: "Address is required.",
            })
            .trim()
            .min(1, "Address is required."),
        ...headers,
    })
    .strict();

// Validacion para POST /api/v1/geo/route
export const routeSchema = z
    .object({
        origin: puntoSchema,
        destination: puntoSchema,
        ...headers,
    })
    .strict();
