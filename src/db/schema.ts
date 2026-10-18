import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(), // e.g. 'tech', 'crypto', 'promos'
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  gradient: text("gradient").notNull().default("from-blue-500/20 to-cyan-500/20"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const telegramLinks = pgTable("telegram_links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  handle: text("handle").notNull(), // e.g. '@pythonbrasil'
  url: text("url").notNull(), // e.g. 'https://t.me/pythonbrasil'
  description: text("description").notNull(),
  longDescription: text("long_description"),
  type: text("type").notNull().default("channel"), // channel, group, bot, sticker_pack, supergroup
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  language: text("language").notNull().default("pt"), // pt, en, es, global
  memberCount: integer("member_count").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNsfw: boolean("is_nsfw").notNull().default(false),
  ratingAvg: numeric("rating_avg", { precision: 3, scale: 2 }).notNull().default("5.00"),
  ratingCount: integer("rating_count").notNull().default(1),
  clicksCount: integer("clicks_count").notNull().default(0),
  likesCount: integer("likes_count").notNull().default(0),
  status: text("status").notNull().default("approved"), // approved, pending, rejected
  avatarUrl: text("avatar_url"),
  submittedBy: text("submitted_by").default("Comunidade"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => telegramLinks.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull().default("Usuário Anônimo"),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const linkReports = pgTable("link_reports", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => telegramLinks.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(), // broken_link, scam, nsfw, spam, other
  details: text("details"),
  status: text("status").notNull().default("pending"), // pending, resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const curatedCollections = pgTable("curated_collections", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  badge: text("badge").notNull(),
  icon: text("icon").notNull(),
  gradient: text("gradient").notNull(),
  linkIds: jsonb("link_ids").$type<number[]>().notNull().default([]),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Anonymous browser presence used by the moderation dashboard.
 * The visitorId is generated client-side and contains no personal data.
 */
export const onlinePresence = pgTable("online_presence", {
  visitorId: text("visitor_id").primaryKey(),
  lastSeenAt: timestamp("last_seen", { withTimezone: true }).defaultNow().notNull(),
  lastPath: text("last_path").notNull().default("/"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
