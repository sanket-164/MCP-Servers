export type RawSearchedClan = {
    tag: string;
    name: string;
    type: "open" | "inviteOnly" | "closed";

    location?: {
        id: number;
        name: string;
        isCountry: boolean;
        countryCode: string;
    };

    isFamilyFriendly: boolean;

    badgeUrls: {
        small: string;
        medium: string;
        large: string;
    };

    clanLevel: number;
    clanPoints: number;
    clanBuilderBasePoints: number;
    clanCapitalPoints: number;

    capitalLeague?: {
        id: number;
        name: string;
    };

    warLeague?: {
        id: number;
        name: string;
    };

    warWins: number;
    warWinStreak: number;

    requiredTrophies: number;
    requiredBuilderBaseTrophies: number;
    requiredTownhallLevel: number;

    members: number;

    labels?: {
        id: number;
        name: string;
    }[];

    chatLanguage?: {
        id: number;
        name: string;
        languageCode: string;
    };
};


export type RawClan = {
    tag: string;
    name: string;
    type: string; // e.g., "open", "closed", "inviteOnly"
    description: string;

    location?: {
        id: number;
        name: string;
        isCountry: boolean;
        countryCode: string;
    };
    isFamilyFriendly: boolean;
    badgeUrls: BadgeUrls;
    chatLanguage?: {
        id: number;
        name: string;
        languageCode: string;
    };

    clanLevel: number;
    clanPoints: number;
    clanBuilderBasePoints: number;
    clanCapitalPoints: number;
    requiredTrophies: number;
    members: number;

    warFrequency?: string; // e.g., "always", "moreThanOncePerWeek", etc.
    warWinStreak: number;
    warWins: number;
    warLosses: number;
    warTies: number;
    isWarLogPublic: boolean;

    warLeague?: {
        id: number;
        name: string;
    };
    capitalLeague?: {
        id: number;
        name: string;
    };

    memberList: RawMember[];
};

export type RawMember = {
    tag: string;
    name: string;
    role: string;
    townHallLevel: number;

    league?: {
        id: number;
        name: string;
    };

    leagueTier?: {
        id: number;
        name: string;
    };
};

export type WarResult = "win" | "lose" | "draw" | null;

export interface BadgeUrls {
    small: string;
    medium: string;
    large: string;
}

export interface ClanInfo {
    tag: string;
    name: string;
    badgeUrls: BadgeUrls;
    clanLevel: number;
    attacks: number;
    stars: number;
    destructionPercentage: number;
    expEarned: number;
}

export interface OpponentInfo {
    tag: string;
    name: string;
    badgeUrls: BadgeUrls;
    clanLevel: number;
    stars: number;
    destructionPercentage: number;
}

export interface RawWarLog {
    result: WarResult;
    endTime: string;
    teamSize: number;
    attacksPerMember: number;
    battleModifier: string;
    clan: ClanInfo;
    opponent: OpponentInfo;
}

type IconUrls = {
    small: string;
    medium: string;
    large: string;
};

type VillageType = "home" | "builderBase" | "clanCapital";

type RawLeague = {
    id: number;
    name: string;
    iconUrls: IconUrls;
};

type RawAchievement = {
    name: string;
    stars: number;
    value: number;
    target: number;
    info: string;
    completionInfo: string | null;
    village: VillageType;
};

type RawUnit = {
    name: string;
    level: number;
    maxLevel: number;
    village: VillageType;
};

type RawHeroEquipment = {
    name: string;
    level: number;
    maxLevel: number;
    village: VillageType;
};

type RawHero = {
    name: string;
    level: number;
    maxLevel: number;
    equipment: RawHeroEquipment[];
    village: VillageType;
};

type RawLabel = {
    id: number;
    name: string;
    iconUrls: IconUrls;
};

type RawPlayerHouseElement = {
    type: string;
    id: number;
};

type RawPlayerHouse = {
    elements: RawPlayerHouseElement[];
};

export type RawPlayer = {
    tag: string;
    name: string;

    townHallLevel: number;
    townHallWeaponLevel: number;

    expLevel: number;

    trophies: number;
    bestTrophies: number;

    warStars: number;
    attackWins: number;
    defenseWins: number;

    builderHallLevel: number;
    builderBaseTrophies: number;
    bestBuilderBaseTrophies: number;

    role: string;
    warPreference: "in" | "out";

    donations: number;
    donationsReceived: number;
    clanCapitalContributions: number;

    clan: {
        tag: string;
        name: string;
        clanLevel: number;
        badgeUrls: IconUrls;
    } | null;

    leagueTier: RawLeague;
    builderBaseLeague: RawLeague;

    achievements: RawAchievement[];

    labels: RawLabel[];

    troops: RawUnit[];
    heroes: RawHero[];
    heroEquipment: RawHeroEquipment[];
    spells: RawUnit[];

    playerHouse: RawPlayerHouse;
};

export type BattleType = "homeVillage" | "ranked";

export type Resource = {
    name: string;
    amount: number;
};

export type RawBattle = {
    battleType: BattleType;
    attack: boolean;
    armyShareCode: string;
    opponentPlayerTag: string;

    stars: number;
    destructionPercentage: number;

    lootedResources: Resource[];
    extraLootedResources: Resource[];
    availableLoot: Resource[];
};

type RawLeagueSeason = {
    leagueSeasonId: number; // timestamp
    leagueTrophies: number;
    leagueTierId: number;
    placement: number;

    attackWins: number;
    attackLosses: number;
    attackStars: number;

    defenseWins: number;
    defenseLosses: number;
    defenseStars: number;

    maxBattles: number;
};

export type RawLeagueHistory = {
    items: RawLeagueSeason[];
};