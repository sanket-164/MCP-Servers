import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { BattleType, RawBattle, RawClan, RawLeagueHistory, RawMember, RawPlayer, RawSearchedClan, RawWarLog } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    // Resolve from `server/.env` (helpers live under `server/src/mcp/clash-of-clans`)
    path: path.resolve(__dirname, "../../../.env"),
});

const BASE_URL = process.env.COC_API_URL;
const API_TOKEN = process.env.COC_API_TOKEN;

if (!API_TOKEN) {
    console.error(
        "ERROR: COC_API_TOKEN environment variable is not set."
    );
    process.exit(1);
}

if (!BASE_URL) {
    console.error(
        "ERROR: COC_API_URL environment variable is not set."
    );
    process.exit(1);
}


/** Helper function to call the Clash of Clans API with proper headers and error handling */
export async function cocFetch(
    path: string,
    query: Record<string, string | number | undefined> = {}
): Promise<any> {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`CoC API error ${res.status}: ${err}`);
    }

    return res.json();
}

/** URL-encode a clan/player tag (# → %23) */
export function encodeTag(tag: string): string {
    return encodeURIComponent(tag.startsWith("#") ? tag : `#${tag}`);
}

/** Format a date string from the CoC API into a more readable format */
function formatDate(dateStr: string): string {
    const iso = dateStr.replace(
        /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
        "$1-$2-$3T$4:$5:$6"
    );

    const date = new Date(iso);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatSearchedClan(clan: RawSearchedClan): string {
    const labels =
        clan.labels?.map((l) => l.name).join(", ") || "None";

    return `
Clan: ${clan.name} (${clan.tag})
Location: ${clan.location?.name ?? "Unknown"} (${clan.location?.id ?? "N/A"})
Members: ${clan.members}/50

Level: ${clan.clanLevel}
Points: ${clan.clanPoints}

War League: ${clan.warLeague?.name ?? "Unranked"}
War Wins: ${clan.warWins} | Streak: ${clan.warWinStreak}

Capital League: ${clan.capitalLeague?.name ?? "Unranked"}

Requirements:
- Trophies: ${clan.requiredTrophies}
- Builder Base: ${clan.requiredBuilderBaseTrophies}
- Town Hall: ${clan.requiredTownhallLevel}

Labels: ${labels}
Language: ${clan.chatLanguage?.name ?? "Unknown"} (${clan.chatLanguage?.id ?? "N/A"})

Type: ${clan.type.toUpperCase()}
${clan.isFamilyFriendly ? "" : "Not"}Family Friendly
----------------------------------------`;
}

export function formatMemberList(members: RawMember[]): string {
    return members.map((member, index) => formatMember(member, index)).join('\n');
}

export function formatMember(member: RawMember, index: number): string {
    return `${index + 1}. ${member.name} ${member.tag}
Role: ${member.role}
Town Hall: ${member.townHallLevel}
League: ${member.league?.name} (ID: ${member.league?.id ?? "N/A"})
Tier: ${member.leagueTier?.name} (ID: ${member.leagueTier?.id ?? "N/A"})`;
}

export function formatClan(clan: RawClan): string {
    const lines: string[] = [];

    lines.push(`**${clan.name}** ${clan.tag}`);
    lines.push(`Level ${clan.clanLevel} • Points: ${clan.clanPoints}`);
    lines.push(`Location: ${clan.location?.name ?? "Unknown"} (${clan.location?.countryCode ?? "Unknown"}) • War Frequency: ${clan.warFrequency ?? "Unknown"}`);


    if (clan.description && clan.description.trim() !== '') {
        lines.push(`Description: ${clan.description}`);
    }

    const warLeagueName = clan.warLeague?.name ?? 'Unranked';
    const capitalLeagueName = clan.capitalLeague?.name ?? 'Unranked';

    lines.push(`War Record: ${clan.warWins} Wins | ${clan.warLosses} Losses | ${clan.warTies} Ties`);
    lines.push(`War League: ${warLeagueName}`);
    lines.push(`Capital League: ${capitalLeagueName}`);
    lines.push(`Member Count: ${clan.members}`);

    lines.push(`--- Member List (${clan.memberList.length}) ---`);

    if (clan.memberList.length === 0) {
        lines.push('No members found.');
    } else {
        lines.push(formatMemberList(clan.memberList));
    }

    return lines.join('\n');
}

/** Format raw war log data into a readable string */
export function formatWarLog(war: RawWarLog): string {
    const clan = war.clan;
    const opponent = war.opponent;

    const resultMap: Record<string, string> = {
        win: "Victory",
        lose: "Defeat",
        draw: "Draw",
    };

    if (war.result) {
        const result = resultMap[war.result];

        const date = formatDate(war.endTime);

        const score = `${clan.stars}⭐ vs ${opponent.stars}⭐`;

        const destruction = `${clan.destructionPercentage.toFixed(
            2
        )}% vs ${opponent.destructionPercentage.toFixed(2)}%`;

        const maxStars = war.teamSize * 3;
        const isPerfectWar = clan.stars === maxStars;

        return `
${result} | ${date}
${clan.name} vs ${opponent.name || "Unknown Clan"}
Score: ${score}
Destruction: ${destruction}
Size: ${war.teamSize}v${war.teamSize}
XP Earned: ${clan.expEarned ?? 0}
----------------------------------------`;
    } else {
        return ""
    }
};

/** Format a player's profile data into a readable string */
export function formatPlayer(player: RawPlayer): string {
    const troops = player.troops
        .filter(t => t.village === "home")
        .map(t => `${t.name} (Lv ${t.level}/${t.maxLevel})`)
        .join(", ");

    const spells = player.spells
        .filter(s => s.village === "home")
        .map(s => `${s.name} (Lv ${s.level}/${s.maxLevel})`)
        .join(", ");

    const heroes = player.heroes
        .map(h => `${h.name} (Lv ${h.level}/${h.maxLevel})`)
        .join(", ");

    const heroEquipments = player.heroEquipment
        .map(h => `${h.name} (Lv ${h.level}/${h.maxLevel})`)
        .join(", ");

    const achievements = player.achievements.map(a => `${a.name} (${a.stars}⭐)`).join(", ");

    return `
${player.name} Player Profile
-------------------------
Tag: ${player.tag}

Town Hall: ${player.townHallLevel}
Level: ${player.expLevel}

Trophies: ${player.trophies} (Best: ${player.bestTrophies})
War Stars: ${player.warStars}

Attack Wins: ${player.attackWins}
Defense Wins: ${player.defenseWins}

Builder Hall: ${player.builderHallLevel ?? "N/A"}
Builder Trophies: ${player.builderBaseTrophies ?? "N/A"}

Clan: ${player.clan?.name ?? "No Clan"} (Level ${player.clan?.clanLevel ?? "-"})
Clan Role: ${player.role ?? "N/A"}
Clan Tag: ${player.clan?.tag ?? "N/A"}

War Preference: ${player.warPreference === "in" ? "Opted In" : "Opted Out"}

Donations: ${player.donations}
Donations Received: ${player.donationsReceived}

Achievements: ${achievements || "None"}

Heroes:
${heroes || "None"}

Hero Equipment:
${heroEquipments || "None"}

Troops:
${troops || "None"}

Spells:
${spells || "None"}

League:
${player.leagueTier?.name ?? "Unranked"}

-------------------------
`.trim();
}


/** Format a battle log entry into a readable string */
export function formatBattle(raw: RawBattle): string {
    const loot = (raw.lootedResources ?? [])
        .map((r) => `${r.name}: ${r.amount.toLocaleString()}`)
        .join(", ");

    const extraLoot = (raw.extraLootedResources ?? [])
        .filter((r) => r.amount > 0)
        .map((r) => `${r.name}: ${r.amount.toLocaleString()}`)
        .join(", ");

    const availableLoot = (raw.availableLoot ?? [])
        .filter((r) => r.amount > 0)
        .map((r) => `${r.name}: ${r.amount.toLocaleString()}`)
        .join(", ");

    return `
------------------------
Type: ${raw.battleType}
Mode: ${raw.attack ? "Attack" : "Defense"}
Opponent: ${raw.opponentPlayerTag}

Stars: ${raw.stars}
Destruction: ${raw.destructionPercentage}%

Loot Gained:
${loot || "None"}

Bonus Loot:
${extraLoot || "None"}

Available Loot:
${availableLoot || "None"}

Army Code:
${raw.armyShareCode ?? "N/A"}
------------------------
`.trim();
}

export function formatLeagueHistory(data: RawLeagueHistory): string {
    return data.items
        .map((season, index) => {
            const attackTotal = season.attackWins + season.attackLosses;
            const defenseTotal = season.defenseWins + season.defenseLosses;

            const attackWinRate =
                attackTotal > 0
                    ? ((season.attackWins / attackTotal) * 100).toFixed(0)
                    : "0";

            const defenseWinRate =
                defenseTotal > 0
                    ? ((season.defenseWins / defenseTotal) * 100).toFixed(0)
                    : "0";

            return `
Season ${season.leagueSeasonId})
--------------------------------
Trophies: ${season.leagueTrophies}
Placement: #${season.placement}
League Tier ID: ${season.leagueTierId}

Attacks:
- Wins: ${season.attackWins}
- Losses: ${season.attackLosses}
- Win Rate: ${attackWinRate}%

Defense:
- Wins: ${season.defenseWins}
- Losses: ${season.defenseLosses}
- Win Rate: ${defenseWinRate}%
- Stars Conceded: ${season.defenseStars}

Total Battles: ${season.maxBattles}
--------------------------------
      `.trim();
        })
        .join("\n\n");
}

