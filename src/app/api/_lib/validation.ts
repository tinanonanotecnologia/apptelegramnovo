export const LINK_TYPES = ["channel", "group", "bot", "sticker_pack", "supergroup"] as const;
export type LinkTypeValue = (typeof LINK_TYPES)[number];

export const LINK_STATUSES = ["approved", "pending", "rejected"] as const;
export type LinkStatusValue = (typeof LINK_STATUSES)[number];

export const LINK_LANGUAGES = ["pt", "en", "es", "global"] as const;
export type LinkLanguageValue = (typeof LINK_LANGUAGES)[number];

export const REPORT_REASONS = ["broken_link", "scam", "nsfw", "spam", "other"] as const;
export type ReportReasonValue = (typeof REPORT_REASONS)[number];

const TELEGRAM_HOSTS = new Set(["t.me", "telegram.me", "www.t.me", "www.telegram.me"]);

export function isOneOf<T extends readonly string[]>(value: unknown, values: T): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

export function asTrimmedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

export function asOptionalTrimmedString(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null || value === "") return null;
  return asTrimmedString(value, maxLength);
}

export function parseBoundedInteger(
  value: unknown,
  options: { min: number; max: number; fallback?: number }
): number | null {
  if (value === undefined || value === null || value === "") return options.fallback ?? null;
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(numberValue) || numberValue < options.min || numberValue > options.max) {
    return null;
  }
  return numberValue;
}

export function normalizeTelegramLink(input: { handle?: unknown; url?: unknown }) {
  const rawHandle = typeof input.handle === "string" ? input.handle.trim() : "";
  const rawUrl = typeof input.url === "string" ? input.url.trim() : "";

  let normalizedUrl = rawUrl;
  let handle = rawHandle;

  if (normalizedUrl) {
    let parsed: URL;
    try {
      parsed = new URL(normalizedUrl);
    } catch {
      return { error: "Informe uma URL válida do Telegram (https://t.me/...)." } as const;
    }

    if (parsed.protocol !== "https:" || !TELEGRAM_HOSTS.has(parsed.hostname.toLowerCase())) {
      return { error: "A URL deve apontar para o domínio oficial https://t.me/." } as const;
    }

    const firstSegment = parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (!firstSegment || firstSegment.length > 128 || !/^[a-zA-Z0-9_+@-]+$/.test(firstSegment)) {
      return { error: "Informe um link válido de canal, grupo, bot ou convite do Telegram." } as const;
    }

    // Keep only a canonical host while preserving invite/query parameters.
    normalizedUrl = `https://t.me${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!handle) handle = firstSegment.startsWith("+") ? firstSegment : `@${firstSegment.replace(/^@/, "")}`;
  }

  if (!handle && !normalizedUrl) {
    return { error: "Informe o link do Telegram ou o @arroba." } as const;
  }

  if (handle) {
    if (handle.startsWith("http://") || handle.startsWith("https://")) {
      return { error: "O handle deve ser um @nome ou um convite iniciado por +." } as const;
    }
    if (!/^(@[a-zA-Z0-9_]{3,64}|\+[a-zA-Z0-9_\-]{5,128}|[a-zA-Z0-9_]{3,64})$/.test(handle)) {
      return { error: "Informe um @arroba ou convite do Telegram válido." } as const;
    }
    handle = handle.startsWith("+") ? handle : `@${handle.replace(/^@/, "")}`;
  }

  if (!normalizedUrl) {
    const path = handle.startsWith("+") ? handle : handle.slice(1);
    normalizedUrl = `https://t.me/${path}`;
  }

  return { handle, url: normalizedUrl } as const;
}

export function normalizeTags(value: unknown): string[] | null {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : value === undefined || value === null
        ? []
        : null;

  if (!values) return null;
  const tags = values
    .map((tag) => (typeof tag === "string" ? tag.trim().replace(/^#/, "").toLowerCase() : ""))
    .filter(Boolean);
  if (tags.length > 20 || tags.some((tag) => tag.length > 32 || !/^[\p{L}\p{N}_-]+$/u.test(tag))) {
    return null;
  }
  return Array.from(new Set(tags));
}

