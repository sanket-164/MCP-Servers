import { z } from "zod";
import { gql, ok } from "./helpers.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTools(server: McpServer) {

  // User Profile

  server.registerTool(
    "get-user-profile",
    {
      description:
        "Get a LeetCode user's public profile: ranking, bio, social links, " +
        "country, company, skill tags, badges, and accepted-submission counts " +
        "broken down by difficulty.",
      inputSchema: z.object({
        username: z.string().describe("LeetCode username"),
      }),
    },
    async ({ username }) => {
      const data = await gql(
        `query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          githubUrl
          twitterUrl
          linkedinUrl
          profile {
            ranking
            userAvatar
            realName
            aboutMe
            school
            websites
            countryName
            company
            jobTitle
            skillTags
            reputation
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          badges {
            id
            displayName
            icon
            creationDate
          }
          activeBadge {
            displayName
            icon
          }
        }
      }`,
        { username }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-user-solved-stats",
    {
      description:
        "Get the number of problems a user has solved broken down by difficulty " +
        "(Easy/Medium/Hard), plus failed and untouched counts.",
      inputSchema: z.object({
        username: z.string().describe("LeetCode username"),
      }),
    },
    async ({ username }) => {
      const data = await gql(
        `query getUserSolved($username: String!) {
        matchedUser(username: $username) {
          username
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        userProfileUserQuestionProgressV2(userSlug: $username) {
          numAcceptedQuestions {
            difficulty
            count
          }
          numFailedQuestions {
            difficulty
            count
          }
          numUntouchedQuestions {
            difficulty
            count
          }
        }
      }`,
        { username }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-user-contest-info",
    {
      description:
        "Get a user's contest rating, global ranking, attended contests count, and top percentage.",
      inputSchema: z.object({
        username: z.string().describe("LeetCode username"),
      }),
    },
    async ({ username }) => {
      const data = await gql(
        `query getUserContestInfo($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        userContestRankingHistory(username: $username) {
          attended
          trendDirection
          problemsSolved
          totalProblems
          finishTimeInSeconds
          rating
          ranking
          contest {
            title
            startTime
          }
        }
      }`,
        { username }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-user-recent-submissions",
    {
      description:
        "Get the most recent submissions (all statuses) for a user. Returns up to `limit` entries.",
      inputSchema: z.object({
        username: z.string().describe("LeetCode username"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Max number of submissions to return (default 20)"),
      }),
    },
    async ({ username, limit }) => {
      const data = await gql(
        `query getRecentSubmissions($username: String!, $limit: Int) {
        recentSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
          id
        }
      }`,
        { username, limit }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-user-recent-accepted-submissions",
    {
      description:
        "Get the most recent ACCEPTED submissions for a user. Requires authentication (LEETCODE_SESSION env var).",
      inputSchema: z.object({
        username: z.string().describe("LeetCode username"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Max number of accepted submissions to return (default 20)"),
      }),
    },
    async ({ username, limit }) => {
      const data = await gql(
        `query getAcSubmissions($username: String!, $limit: Int) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
          lang
        }
      }`,
        { username, limit }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-user-submission-calendar",
    {
      description:
        "Get a user's submission activity calendar (heatmap data). Optionally filter by year.",
      inputSchema: z.object({
        username: z.string().describe("LeetCode username"),
        year: z
          .number()
          .int()
          .optional()
          .describe("Year to filter by (e.g. 2024). Omit for current year."),
      }),
    },
    async ({ username, year }) => {
      const data = await gql(
        `query getUserCalendar($username: String!, $year: Int) {
        matchedUser(username: $username) {
          userCalendar(year: $year) {
            activeYears
            streak
            totalActiveDays
            dccBadges {
              timestamp
              badge {
                name
                icon
              }
            }
            submissionCalendar
          }
        }
      }`,
        { username, year }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-user-skill-stats",
    {
      description:
        "Get a user's skill stats — topics they have solved problems in, categorised by advanced/intermediate/fundamental.",
      inputSchema: z.object({
        username: z.string().describe("LeetCode username"),
      }),
    },
    async ({ username }) => {
      const data = await gql(
        `query getUserSkillStats($username: String!) {
        matchedUser(username: $username) {
          tagProblemCounts {
            advanced {
              tagName
              tagSlug
              problemsSolved
            }
            intermediate {
              tagName
              tagSlug
              problemsSolved
            }
            fundamental {
              tagName
              tagSlug
              problemsSolved
            }
          }
        }
      }`,
        { username }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-user-language-stats",
    {
      description:
        "Get the breakdown of how many problems a user has solved in each programming language.",
      inputSchema: z.object({
        username: z.string().describe("LeetCode username"),
      }),
    },
    async ({ username }) => {
      const data = await gql(
        `query getUserLanguageStats($username: String!) {
        matchedUser(username: $username) {
          languageProblemCount {
            languageName
            problemsSolved
          }
        }
      }`,
        { username }
      );
      return ok(data);
    }
  );

  // Problems

  server.registerTool(
    "list-problems",
    {
      description:
        "List LeetCode problems with optional filters for difficulty, topic tags, search keyword, pagination (skip/limit).",
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Number of problems to return (default 20, max 100)"),
        skip: z
          .number()
          .int()
          .min(0)
          .default(0)
          .describe("Number of problems to skip for pagination (default 0)"),
        difficulty: z
          .enum(["EASY", "MEDIUM", "HARD"])
          .optional()
          .describe("Filter by difficulty"),
        tags: z
          .array(z.string())
          .optional()
          .describe("Filter by topic tag slugs (e.g. ['array', 'dynamic-programming'])"),
        searchKeyword: z.string().optional().describe("Search problems by keyword"),
        categorySlug: z
          .string()
          .default("")
          .describe("Category slug (e.g. 'algorithms'). Leave empty for all."),
      }),
    },
    async ({ limit, skip, difficulty, tags, searchKeyword, categorySlug }) => {
      const filters: Record<string, unknown> = {};
      if (difficulty) filters.difficulty = difficulty;
      if (tags?.length) filters.tags = tags;
      if (searchKeyword) filters.searchKeywords = searchKeyword;

      const data = await gql(
        `query problemsetQuestionList(
        $categorySlug: String
        $limit: Int
        $skip: Int
        $filters: QuestionListFilterInput
      ) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            acRate
            difficulty
            freqBar
            frontendQuestionId: questionFrontendId
            isFavor
            paidOnly: isPaidOnly
            status
            title
            titleSlug
            topicTags {
              name
              id
              slug
            }
            hasSolution
            hasVideoSolution
          }
        }
      }`,
        { categorySlug, limit, skip, filters }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-problem-details",
    {
      description:
        "Get full details for a specific LeetCode problem by its title slug, including description (content), constraints, examples, hints, difficulty, topic tags, and stats.",
      inputSchema: z.object({
        titleSlug: z
          .string()
          .describe("Problem title slug, e.g. 'two-sum' or 'longest-substring-without-repeating-characters'"),
      }),
    },
    async ({ titleSlug }) => {
      const data = await gql(
        `query getProblemDetails($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          titleSlug
          content
          difficulty
          likes
          dislikes
          isLiked
          isPaidOnly
          status
          stats
          hints
          topicTags {
            name
            slug
          }
          codeSnippets {
            lang
            langSlug
            code
          }
          sampleTestCase
          metaData
          solution {
            id
            canSeeDetail
            paidOnly
            hasVideoSolution
            rating {
              count
              average
            }
          }
          hasSolution
          hasVideoSolution
          similarQuestions
          companyTagStats
          acRate
          freqBar
        }
      }`,
        { titleSlug }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-daily-challenge",
    {
      description: "Get today\'s LeetCode Daily Coding Challenge problem.",
      inputSchema: z.object({}),
    },
    async () => {
      const data = await gql<{
        activeDailyCodingChallengeQuestion: {
          date: string;
          link: string;
          question: {
            questionId: string;
            questionFrontendId: string;
            title: string;
            titleSlug: string;
            difficulty: string;
            content: string;
            topicTags: { name: string; slug: string }[];
            acRate: number;
            stats: string;
            hints: string[];
            hasSolution: boolean;
            hasVideoSolution: boolean;
          };
        };
      }>(
        `query getDailyChallenge {
        activeDailyCodingChallengeQuestion {
          date
          link
          question {
            questionId
            questionFrontendId
            title
            titleSlug
            difficulty
            content
            topicTags {
              name
              slug
            }
            acRate
            stats
            hints
            hasSolution
            hasVideoSolution
          }
        }
      }`
      );

      // Post-process
      // LeetCode returns `content` as raw HTML. Strip the tags so the LLM (and
      // any human reading the tool output) sees plain readable text. We keep the
      // original HTML under `contentHtml` in case the caller needs it.
      const q = data.activeDailyCodingChallengeQuestion;
      const processed = {
        date: q.date,
        link: `https://leetcode.com${q.link}`,
        problem: {
          id: q.question.questionFrontendId,
          title: q.question.title,
          titleSlug: q.question.titleSlug,
          difficulty: q.question.difficulty,
          acRate: `${q.question.acRate.toFixed(1)}%`,
          topics: q.question.topicTags.map((t) => t.name),
          description: q.question.content,
          hints: q.question.hints,
          hasSolution: q.question.hasSolution,
          hasVideoSolution: q.question.hasVideoSolution,
          stats: (() => {
            try { return JSON.parse(q.question.stats); } catch { return q.question.stats; }
          })(),
        },
      };

      return ok(processed);
    }
  );

  server.registerTool(
    "get-problem-solution",
    {
      description:
        "Get the official LeetCode editorial/solution article for a problem (if available).",
      inputSchema: z.object({
        titleSlug: z.string().describe("Problem title slug, e.g. 'two-sum'"),
      }),
    },
    async ({ titleSlug }) => {
      const data = await gql(
        `query getProblemSolution($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          solution {
            id
            title
            content
            contentTypeId
            paidOnly
            hasVideoSolution
            rating {
              id
              count
              average
              userRating {
                score
              }
            }
            topic {
              id
              commentCount
              topLevelCommentCount
              viewCount
              subscribed
              solutionTags {
                name
                slug
              }
              post {
                id
                status
                creationDate
                author {
                  username
                  isActive
                  profile {
                    reputation
                    userAvatar
                  }
                }
              }
            }
          }
        }
      }`,
        { titleSlug }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "search-problems-by-topic",
    {
      description:
        "Search for LeetCode problems matching specific topic tags. Returns titles, difficulty, acceptance rate, and whether solutions exist.",
      inputSchema: z.object({
        tags: z
          .array(z.string())
          .min(1)
          .describe("Topic tag slugs to filter by, e.g. ['array', 'hash-table']"),
        difficulty: z
          .enum(["EASY", "MEDIUM", "HARD"])
          .optional()
          .describe("Optional difficulty filter"),
        limit: z.number().int().min(1).max(50).default(20).describe("Max results"),
      }),
    },
    async ({ tags, difficulty, limit }) => {
      const filters: Record<string, unknown> = { tags };
      if (difficulty) filters.difficulty = difficulty;

      const data = await gql(
        `query searchByTopic(
        $limit: Int
        $filters: QuestionListFilterInput
      ) {
        problemsetQuestionList: questionList(
          categorySlug: ""
          limit: $limit
          skip: 0
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            frontendQuestionId: questionFrontendId
            title
            titleSlug
            difficulty
            acRate
            topicTags { name slug }
            hasSolution
            paidOnly: isPaidOnly
          }
        }
      }`,
        { limit, filters }
      );
      return ok(data);
    }
  );


  // Contests

  server.registerTool(
    "list-upcoming-contests",
    {
      description: "Get the list of upcoming LeetCode contests.",
      inputSchema: z.object({}),
    },
    async () => {
      const data = await gql(
        `query listUpcomingContests {
        upcomingContests {
          title
          titleSlug
          startTime
          duration
          originStartTime
          isVirtual
        }
      }`
      );
      return ok(data);
    }
  );

  server.registerTool(
    "list-past-contests",
    {
      description:
        "Get past LeetCode contests with pagination. Each page contains 10 contests.",
      inputSchema: z.object({
        pageNo: z
          .number()
          .int()
          .min(1)
          .default(1)
          .describe("Page number, starting from 1"),
      }),
    },
    async ({ pageNo }) => {
      const data = await gql(
        `query listPastContests($pageNo: Int) {
        pastContests(pageNo: $pageNo) {
          pageNum
          currentPage
          totalNum
          numPerPage
          data {
            title
            titleSlug
            startTime
            duration
            originStartTime
            isVirtual
          }
        }
      }`,
        { pageNo }
      );
      return ok(data);
    }
  );


  // Discussions

  server.registerTool(
    "list-trending-discussions",
    {
      description: "Get trending LeetCode community discussions.",
      inputSchema: z.object({
        first: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(20)
          .describe("Number of trending discussions to return"),
      }),
    },
    async ({ first }) => {
      const data = await gql(
        `query listTrendingDiscussions($first: Int!) {
        cachedTrendingCategoryTopics(first: $first) {
          id
          title
          commentCount
          viewCount
          pinned
          tags {
            name
            slug
          }
          post {
            id
            creationDate
            author {
              username
              profile {
                userAvatar
                reputation
              }
            }
          }
        }
      }`,
        { first }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-discussion-topic",
    {
      description: "Get a specific LeetCode discussion topic by its numeric ID.",
      inputSchema: z.object({
        topicId: z.number().int().describe("The numeric discussion topic ID"),
      }),
    },
    async ({ topicId }) => {
      const data = await gql(
        `query getDiscussionTopic($topicId: Int!) {
        topic(id: $topicId) {
          id
          viewCount
          topLevelCommentCount
          subscribed
          title
          pinned
          tags {
            name
            slug
          }
          post {
            id
            voteCount
            voteStatus
            content
            updationDate
            creationDate
            author {
              username
              isActive
              nameColor
              activeBadge {
                displayName
                icon
              }
              profile {
                userAvatar
                reputation
              }
            }
            authorIsModerator
            isHidden
          }
        }
      }`,
        { topicId }
      );
      return ok(data);
    }
  );

  server.registerTool(
    "get-discussion-comments",
    {
      description: "Get comments for a LeetCode discussion topic.",
      inputSchema: z.object({
        topicId: z.number().int().describe("The numeric discussion topic ID"),
        orderBy: z
          .enum(["hot", "newest_to_oldest", "oldest_to_newest"])
          .default("hot")
          .describe("Sort order for comments"),
        pageNo: z.number().int().min(1).default(1).describe("Page number"),
        numPerPage: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Comments per page"),
      }),
    },
    async ({ topicId, orderBy, pageNo, numPerPage }) => {
      const data = await gql(
        `query getDiscussionComments(
        $topicId: Int!
        $orderBy: String
        $pageNo: Int
        $numPerPage: Int
      ) {
        topicComments(
          topicId: $topicId
          orderBy: $orderBy
          pageNo: $pageNo
          numPerPage: $numPerPage
        ) {
          data {
            id
            pinned
            pinnedBy { username }
            post {
              id
              voteCount
              voteStatus
              content
              updationDate
              creationDate
              author {
                username
                isActive
                profile {
                  userAvatar
                  reputation
                }
              }
              isHidden
            }
            numChildren
          }
          totalNum
        }
      }`,
        { topicId, orderBy, pageNo, numPerPage }
      );
      return ok(data);
    }
  );
}