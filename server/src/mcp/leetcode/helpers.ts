
const LEETCODE_GRAPHQL = "https://leetcode.com/graphql/";

// Optional: set LEETCODE_SESSION and LEETCODE_CSRF env vars for authentication
const SESSION = process.env.LEETCODE_SESSION ?? "";
const CSRF = process.env.LEETCODE_CSRF ?? "";


export async function gql<T = unknown>(
    query: string,
    variables: Record<string, unknown> = {}
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
    };

    if (SESSION && CSRF) {
        headers["Cookie"] = `LEETCODE_SESSION=${SESSION}; csrftoken=${CSRF}`;
        headers["x-csrftoken"] = CSRF;
    }

    const res = await fetch(LEETCODE_GRAPHQL, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
        throw new Error(`LeetCode API responded ${res.status}: ${res.statusText}`);
    }

    const json = (await res.json()) as { data?: T; errors?: { message: string }[] };

    if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join("; "));
    }

    return json.data as T;
}

// Helper to format results as pretty JSON text content
export function ok(data: unknown) {
    return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    };
}