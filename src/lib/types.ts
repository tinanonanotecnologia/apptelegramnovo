export type LinkType = "channel" | "group" | "bot" | "sticker_pack" | "supergroup";

export interface TelegramLinkItem {
  id: number;
  title: string;
  handle: string;
  url: string;
  description: string;
  longDescription?: string | null;
  type: LinkType;
  categoryId: string;
  tags: string[];
  language: string;
  memberCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  isNsfw: boolean;
  ratingAvg: string;
  ratingCount: number;
  clicksCount: number;
  likesCount: number;
  status: "approved" | "pending" | "rejected";
  avatarUrl?: string | null;
  submittedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  category?: CategoryItem | null;
  reviews?: ReviewItem[];
  related?: TelegramLinkItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  gradient: string;
  order: number;
  linksCount?: number;
}

export interface ReviewItem {
  id: number;
  linkId: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CuratedCollectionItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  gradient: string;
  linkIds: number[];
  order: number;
  links?: TelegramLinkItem[];
}

export interface PlatformStats {
  totalLinks: number;
  totalClicks: number;
  totalMembers: number;
  totalVerified: number;
  totalCategories: number;
}
