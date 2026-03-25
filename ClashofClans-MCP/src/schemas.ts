import { z } from "zod";

export const tagSchema = (label: string) =>
    z.string().describe(`${label} tag (with or without leading #)`);

export const paginationSchema = {
    limit: z.number().int().positive().optional().describe("Max items to return"),
    after: z.string().optional().describe("Cursor for next page"),
    before: z.string().optional().describe("Cursor for previous page"),
};
