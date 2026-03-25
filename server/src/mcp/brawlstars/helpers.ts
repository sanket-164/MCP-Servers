import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    // Resolve from `server/.env` (helpers live under `server/src/mcp/brawlstars`)
    path: path.resolve(__dirname, "../../../.env"),
});

const BASE_URL = process.env.BRAWLSTARS_API_URL;
const API_TOKEN = process.env.BRAWLSTARS_API_TOKEN;

if (!API_TOKEN) {
    console.error(
        "ERROR: BRAWL_STARS_API_TOKEN environment variable is not set."
    );
    process.exit(1);
}

if (!BASE_URL) {
    console.error(
        "ERROR: BRAWL_STARS_API_URL environment variable is not set."
    );
    process.exit(1);
}

export function encodeTag(tag: string): string {
    return encodeURIComponent(tag.startsWith("#") ? tag : `#${tag}`);
}

export async function brawlFetch(path: string) {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        throw new Error(`Brawl Stars API error ${res.status}: ${err}`);
    }

    return res.json();
}