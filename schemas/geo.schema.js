import { z } from "zod";

const headers = {
    xtraceid: z.string().min(1).max(350).optional(),
    xclientid: z.string().min(1).max(350),
};

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
    .strict(); // impide que se envíen propiedades adicionales no definidas en el esquema
