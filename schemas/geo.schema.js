import { z } from "zod";
import { headersSchema } from "./common.js";

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
        ...headersSchema,
    })
    .strict();

// Validacion para POST /api/v1/geo/route
export const routeSchema = z
    .object({
        origin: puntoSchema,
        destination: puntoSchema,
        ...headersSchema,
    })
    .strict();

// Validacion para POST /api/v1/geo/distance
export const distanceSchema = z
    .object({
        origin: puntoSchema,
        destination: puntoSchema,
        ...headersSchema,
    })
    .strict();
