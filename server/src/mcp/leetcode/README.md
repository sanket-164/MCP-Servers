# LeetCode MCP (`leetcode`)

Endpoint (initialize): `POST https://sanket-mcps.vercel.app/mcp/leetcode`

This MCP server wraps the LeetCode GraphQL API for user profiles, problems, contests, and discussions.

## Tools

- `get-user-profile` (input: `username`)
- `get-user-solved-stats` (input: `username`)
- `get-user-contest-info` (input: `username`)
- `get-user-recent-submissions` (inputs: `username`, `limit?`)
- `get-user-recent-accepted-submissions` (inputs: `username`, `limit?`; requires auth)
- `get-user-submission-calendar` (inputs: `username`, `year?`)
- `get-user-skill-stats` (input: `username`)
- `get-user-language-stats` (input: `username`)
- `list-problems` (inputs: `limit?`, `skip?`, `difficulty?`, `tags?`, `searchKeyword?`, `categorySlug?`)
- `get-problem-details` (input: `titleSlug`)
- `get-daily-challenge` (no inputs)
- `get-problem-solution` (input: `titleSlug`)
- `search-problems-by-topic` (inputs: `tags`, `difficulty?`, `limit?`)
- `list-upcoming-contests` (no inputs)
- `list-past-contests` (inputs: `pageNo?`)
- `list-trending-discussions` (inputs: `first?`)
- `get-discussion-topic` (input: `topicId`)
- `get-discussion-comments` (inputs: `topicId`, `orderBy?`, `pageNo?`, `numPerPage?`)

## Prompt presets

- `analyze-user-profile`
- `daily-challenge-explainer`
- `find-practice-problems`
- `contest-prep`
- `compare-users`

## Self-host requirements (env vars)

Optional (only needed for authenticated queries like accepted submissions):

- `LEETCODE_SESSION`
- `LEETCODE_CSRF`
