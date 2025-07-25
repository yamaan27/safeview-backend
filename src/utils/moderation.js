// src/utils/moderation.js

const bannedWords = [
  // Violence & Gore
  "gun",
  "rifle",
  "pistol",
  "kill",
  "blood",
  "murder",
  "weapon",
  "knife",
  "grenade",
  "bomb",
  "fight",
  "behead",
  "assault",
  "death",
  "dead",
  "shooting",
  "sniper",
  "massacre",
  "stab",
  "violence",
  "gore",
  "explosion",
  "hostage",
  "execution",
  "war",
  "terrorism",
  "shootout",
  "gang",
  "mafia",
  "hitman",
  "serial killer",
  "torture",
  "mutilation",
  "warzone",
  "combat",
  "battle",
  "shank",
  "brutality",
  "mass shooting",
  "genocide",

  // Suicide, self-harm & mental health
  "suicide",
  "self harm",
  "self-harm",
  "cutting",
  "depression",
  "anxiety",
  "die",
  "hang",
  "overdose",
  "kill myself",
  "kms",
  "unalive",
  "sad",
  "mental illness",
  "suicidal",
  "self injury",
  "bleeding",
  "rope",
  "noose",
  "jump off",
  "bridge",
  "overdosing",
  "self destruction",
  "self sabotage",
  "harmful thoughts",
  "hopeless",
  "worthless",
  "end it all",
  "painful death",
  "self medicate",
  "psych ward",

  // Horror & disturbing
  "horror",
  "ghost",
  "paranormal",
  "zombie",
  "satan",
  "demon",
  "curse",
  "witch",
  "ritual",
  "creepypasta",
  "jumpscare",
  "killer clown",
  "bloodbath",
  "possessed",
  "haunted",
  "evil",
  "sacrifice",
  "cult",
  "voodoo",
  "scary",
  "terror",
  "exorcism",
  "nightmare",
  "slender man",
  "skinwalker",
  "wendigo",
  "hell",
  "devil worship",
  "black magic",
  "dark web",
  "disturbing",
  "gory",
  "mutilated",
  "body horror",
  "snuff film",
  "found footage",
  "torture porn",

  // Drugs, alcohol, abuse
  "drug",
  "alcohol",
  "weed",
  "cocaine",
  "heroin",
  "meth",
  "vape",
  "smoking",
  "e-cigarette",
  "blunt",
  "joint",
  "bong",
  "dope",
  "pot",
  "stoned",
  "drunk",
  "high",
  "intoxicated",
  "narcotic",
  "abuse",
  "fentanyl",
  "oxy",
  "xanax",
  "adderall",
  "psychedelic",
  "LSD",
  "mushrooms",
  "ecstasy",
  "MDMA",
  "ketamine",
  "PCP",
  "lean",
  "codeine",
  "opioid",
  "crack",
  "meth lab",
  "needle",
  "injection",
  "overdosing",
  "withdrawal",
  "addiction",
  "rehab",
  "bath salts",

  // Sexual, adult & inappropriate
  "sex",
  "nude",
  "naked",
  "porn",
  "erotic",
  "fetish",
  "boobs",
  "strip",
  "twerk",
  "xxx",
  "kiss",
  "romance",
  "romantic",
  "hot",
  "suhagraat",
  "ullu",
  "web series",
  "bhabhi",
  "kamasutra",
  "onlyfans",
  "nsfw",
  "lust",
  "adult",
  "escort",
  "lingerie",
  "thirst trap",
  "milf",
  "bikini",
  "underwear",
  "seduce",
  "masturbate",
  "orgasm",
  "foreplay",
  "sexting",
  "hookup",
  "one night stand",
  "affair",
  "cheating",
  "swinger",
  "polyamory",
  "threesome",
  "gangbang",
  "virginity",
  "rape",
  "molest",
  "pedophile",
  "incest",
  "voyeur",
  "explicit",
  "hardcore",
  "anal",
  "blowjob",
  "handjob",
  "dildo",
  "vibrator",
  "sex toy",
  "prostitute",
  "brothel",

  // Harmful trends
  "challenge",
  "blackout challenge",
  "tide pod",
  "choking game",
  "momo",
  "blue whale",
  "devious lick",
  "skull breaker",
  "crazy dare",
  "fire challenge",
  "salt ice challenge",
  "outlet challenge",
  "benadryl challenge",
  "eraser challenge",
  "condom snorting",
  "car surfing",
  "duct tape challenge",
  "hot water challenge",
  "pass out challenge",
  "whisper challenge",
  "cinnamon challenge",
  "ghost pepper challenge",
  "vodka eyeballing",
  "milk crate challenge",
  "no bones challenge",
  "shell on challenge",
  "cha cha slide challenge",

  // Bullying, hate speech
  "hate",
  "racist",
  "sexist",
  "bully",
  "abuse",
  "threat",
  "harass",
  "retard",
  "nazi",
  "slur",
  "homophobic",
  "transphobic",
  "fat shaming",
  "cyberbully",
  "kys",
  "die",
  "ugly",
  "worthless",
  "loser",
  "nobody likes you",
  "kill yourself",
  "you should die",
  "go die",
  "trash",
  "garbage",
  "disgusting",
  "pathetic",
  "useless",
  "freak",
  "weirdo",
  "creep",
  "stalker",
  "cancel culture",
  "doxxing",
  "swatting",
  "trolling",
  "gaslighting",
  "manipulate",
  "emotional abuse",

  // Gambling & scams
  "casino",
  "betting",
  "lottery",
  "scam",
  "hack",
  "cheat",
  "jackpot",
  "roulette",
  "slots",
  "poker",
  "earn money fast",
  "get rich quick",
  "money trick",
  "bitcoin scam",
  "crypto scam",
  "ponzi scheme",
  "pyramid scheme",
  "forex scam",
  "binary options",
  "sports betting",
  "online gambling",
  "underage gambling",
  "loan scam",
  "credit card scam",
  "identity theft",
  "phishing",
  "fake check",
  "advance fee",
  "romance scam",
  "catfishing",
  "fake lottery",
  "Nigerian prince",
  "IRS scam",
  "tech support scam",
  "fake antivirus",

  // Crime
  "robbery",
  "jail",
  "prison",
  "arrest",
  "terrorist",
  "explosion",
  "kidnap",
  "abduction",
  "felony",
  "criminal",
  "cartel",
  "murderer",
  "criminal minds",
  "heist",
  "burglary",
  "theft",
  "shoplifting",
  "carjacking",
  "hijack",
  "cybercrime",
  "fraud",
  "forgery",
  "arson",
  "vandalism",
  "homicide",
  "manslaughter",
  "assassin",
  "hit list",
  "bomb threat",
  "school shooter",
  "mass murderer",
  "hate crime",
  "domestic violence",
  "human trafficking",
  "sex trafficking",
  "child abuse",
  "elder abuse",
  "animal cruelty",
  "illegal weapons",
  "drug trafficking",
  "money laundering",
  "corruption",
  "bribery",
];

function isUnsafe(text = "") {
  const lower = text.toLowerCase();
  return bannedWords.some((word) => lower.includes(word));
}

module.exports = { isUnsafe };
