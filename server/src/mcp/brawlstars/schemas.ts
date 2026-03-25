import { z } from "zod";

export const tagSchema = (label: string) =>
    z.string().describe(`${label} tag (with or without leading #)`);