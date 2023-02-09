export const HOST = "https://notebin.org";

export const RELAYS = [
  "wss://nostr-pub.wellorder.net",
  "wss://nostr.nosbin.net",
  // "wss://relay.nostr.ch",
  // "wss://relay.snort.social",
  // "wss://nostr.bitcoiner.social",
  // "wss://nostr.onsats.org",
  // "wss://nostr-relay.wlvs.space",
  // "wss://nostr.zebedee.cloud",
  // "wss://relay.damus.io",
  // "wss://relay.nostr.info",
];

export const PROFILE_RELAYS = [
  "wss://nostr-pub.wellorder.net",
  // "wss://relay.nostr.ch",
  "wss://relay.snort.social",
  // "wss://nostr.bitcoiner.social",
  // "wss://nostr.onsats.org",
  // "wss://nostr-relay.wlvs.space",
  // "wss://nostr.zebedee.cloud",
  "wss://relay.damus.io",
  // "wss://relay.nostr.info",
];

export const DUMMY_PROFILE_API = (seed: string) => {
  const style:
    | "adventurer"
    | "adventurer-neutral"
    | "avataaars"
    | "avataaars-neutral"
    | "big-ears"
    | "big-ears-neutral"
    | "big-smile"
    | "bottts"
    | "bottts-neutral"
    | "croodles"
    | "croodles-neutral"
    | "fun-emoji"
    | "icons"
    | "identicon"
    | "initials"
    | "lorelei"
    | "lorelei-neutral"
    | "micah"
    | "miniavs"
    | "open-peeps"
    | "personas"
    | "pixel-art"
    | "pixel-art-neutral" = "identicon";
  return `https://api.dicebear.com/5.x/${style}/svg?seed=${seed}`;
};

export const LANGUAGES = [
  "abap",
  "aes",
  "apex",
  "azcli",
  "bat",
  "bicep",
  "c",
  "cameligo",
  "clike",
  "clojure",
  "coffeescript",
  "cpp",
  "csharp",
  "csp",
  "css",
  "dart",
  "dockerfile",
  "ecl",
  "elixir",
  "erlang",
  "flow9",
  "freemarker2",
  "fsharp",
  "go",
  "graphql",
  "handlebars",
  "hcl",
  "html",
  "ini",
  "java",
  "javascript",
  "json",
  "jsx",
  "julia",
  "kotlin",
  "less",
  "lex",
  "lexon",
  "liquid",
  "livescript",
  "lua",
  "m3",
  "markdown",
  "mips",
  "msdax",
  "mysql",
  "nginx",
  "objective-c",
  "pascal",
  "pascaligo",
  "perl",
  "pgsql",
  "php",
  "pla",
  "plaintext",
  "postiats",
  "powerquery",
  "powershell",
  "proto",
  "pug",
  "python",
  "qsharp",
  "r",
  "razor",
  "redis",
  "redshift",
  "restructuredtext",
  "ruby",
  "rust",
  "sb",
  "scala",
  "scheme",
  "scss",
  "shell",
  "sol",
  "sparql",
  "sql",
  "st",
  "stylus",
  "swift",
  "systemverilog",
  "tcl",
  "toml",
  "tsx",
  "twig",
  "typescript",
  "vb",
  "vbscript",
  "verilog",
  "vue",
  "xml",
  "yaml",
];

export const FILE_EXTENSIONS = [
  ".markdown",
  ".md",
  ".mkd",
  ".mkdn",
  ".mkdown",
  ".ron",
];

export const VALIDATION = {
  required: "Required field",
  fileType: "File type unsupported",
  fileSize: "File size too large, max file size is 1MB",
};
