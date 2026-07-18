import { z } from "zod";

export const headersSchema = {
    xtraceid: z.string().min(1).max(350).optional(),
    xclientid: z.string().min(1).max(350),
};
