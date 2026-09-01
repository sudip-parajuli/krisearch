import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { slugify } from "@/lib/slug";
import { expandSearchTerms } from "@/lib/search-synonyms";
import type {
  Zone,
  District,
  Crop,
  CropZone,
  Scheme,
  MarketPrice,
  Equipment,
  Vendor,
  VendorEquipment,
  VendorType,
  CropEquipment,
  Post,
  PostType,
  Comment,
  Profile,
  Report,
  Tag,
  Feedback,
  GroupBuyPledge,
} from "@/types/database";

/**
 * Every function below fails soft: if Supabase isn't configured yet, or a
 * query errors, it returns an empty result instead of throwing so pages
 * still render (with an empty state) rather than crashing the build/request.
 */
function warnUnconfigured(what: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[krisearch] Supabase not configured — ${what} returning empty.`);
  }
}

export async function getZones(): Promise<Zone[]> {
  if (!isSupabaseConfigured) return (warnUnconfigured("getZones"), []);
  const supabase = await createClient();
  const { data, error } = await supabase.from("zones").select("*").order("altitude_min");
  if (error) return [];
  return data ?? [];
}

export async function getDistricts(): Promise<District[]> {
  if (!isSupabaseConfigured) return (warnUnconfigured("getDistricts"), []);
  const supabase = await createClient();
  const { data, error } = await supabase.from("districts").select("*").order("name");
  if (error) return [];
  return data ?? [];
}

export async function getCrops(): Promise<Crop[]> {
  if (!isSupabaseConfigured) return (warnUnconfigured("getCrops"), []);
  const supabase = await createClient();
  const { data, error } = await supabase.from("crops").select("*").order("name_en");
  if (error) return [];
  return data ?? [];
}

export async function getCropBySlug(slug: string): Promise<Crop | null> {
  const crops = await getCrops();
  return crops.find((c) => slugify(c.name_en) === slug) ?? null;
}

export async function getCropZones(cropId: number): Promise<CropZone[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("crop_zones").select("*").eq("crop_id", cropId);
  if (error) return [];
  return data ?? [];
}

export async function getSchemes(): Promise<Scheme[]> {
  if (!isSupabaseConfigured) return (warnUnconfigured("getSchemes"), []);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schemes")
    .select("*")
    .order("last_verified", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getSchemeById(id: number): Promise<Scheme | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("schemes").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data;
}

export async function getMarketPrices(cropId?: number): Promise<MarketPrice[]> {
  if (!isSupabaseConfigured) return (warnUnconfigured("getMarketPrices"), []);
  const supabase = await createClient();
  let query = supabase.from("market_prices").select("*").order("date_recorded", { ascending: false });
  if (cropId) query = query.eq("crop_id", cropId);
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getEquipmentList(): Promise<Equipment[]> {
  if (!isSupabaseConfigured) return (warnUnconfigured("getEquipmentList"), []);
  const supabase = await createClient();
  const { data, error } = await supabase.from("equipment").select("*").order("category");
  if (error) return [];
  return data ?? [];
}

export async function getEquipmentBySlug(slug: string): Promise<Equipment | null> {
  const list = await getEquipmentList();
  return list.find((e) => slugify(e.name) === slug) ?? null;
}

export async function getVendors(vendorType?: VendorType): Promise<Vendor[]> {
  if (!isSupabaseConfigured) return (warnUnconfigured("getVendors"), []);
  const supabase = await createClient();
  let query = supabase.from("vendors").select("*").order("rating_avg", { ascending: false });
  if (vendorType) query = query.eq("vendor_type", vendorType);
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getVendorEquipmentFor(equipmentId: number): Promise<
  (VendorEquipment & { vendors: Vendor | null })[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendor_equipment")
    .select("*, vendors(*)")
    .eq("equipment_id", equipmentId);
  if (error) return [];
  return (data ?? []) as (VendorEquipment & { vendors: Vendor | null })[];
}

/** Vendors relevant to a crop — buys it from farmers, or sells seeds/inputs for it. */
export async function getVendorsForCrop(cropId: number): Promise<Vendor[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .or(`crops_bought.cs.{${cropId}},crops_supplied.cs.{${cropId}}`);
  if (error) return [];
  return data ?? [];
}

/** Tools/technology relevant to a specific crop (e.g. a solar dryer for coffee post-harvest). */
export async function getEquipmentForCrop(cropId: number): Promise<
  (CropEquipment & { equipment: Equipment | null })[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crop_equipment")
    .select("*, equipment(*)")
    .eq("crop_id", cropId);
  if (error) return [];
  return (data ?? []) as (CropEquipment & { equipment: Equipment | null })[];
}

export type PostFilters = {
  cropId?: number;
  districtId?: number;
  type?: PostType;
  equipmentId?: number;
};

export type PostRow = Post & {
  profiles: Pick<Profile, "id" | "display_name" | "verified_badge" | "avatar_url" | "verification_method"> | null;
  crops: Pick<Crop, "id" | "name_en" | "name_np"> | null;
  districts: Pick<District, "id" | "name"> | null;
  vote_score: number;
  comment_count: number;
};

export async function getPosts(
  filters: PostFilters = {},
  sort: "new" | "top" = "new",
  limit = 30
): Promise<PostRow[]> {
  if (!isSupabaseConfigured) return (warnUnconfigured("getPosts"), []);
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(
      "*, profiles:author_id(id, display_name, verified_badge, avatar_url, verification_method), crops:crop_id(id, name_en, name_np), districts:district_id(id, name)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.cropId) query = query.eq("crop_id", filters.cropId);
  if (filters.districtId) query = query.eq("district_id", filters.districtId);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.equipmentId) query = query.eq("equipment_id", filters.equipmentId);

  const { data: posts, error } = await query;
  if (error || !posts) return [];

  const postIds = posts.map((p) => p.id);
  const [{ data: votes }, { data: comments }] = await Promise.all([
    postIds.length
      ? supabase.from("votes").select("post_id, value").in("post_id", postIds)
      : Promise.resolve({ data: [] as { post_id: string | null; value: number }[] }),
    postIds.length
      ? supabase.from("comments").select("post_id").in("post_id", postIds)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
  ]);

  const scoreByPost = new Map<string, number>();
  (votes ?? []).forEach((v) => {
    if (!v.post_id) return;
    scoreByPost.set(v.post_id, (scoreByPost.get(v.post_id) ?? 0) + v.value);
  });
  const commentsByPost = new Map<string, number>();
  (comments ?? []).forEach((c) => {
    commentsByPost.set(c.post_id, (commentsByPost.get(c.post_id) ?? 0) + 1);
  });

  const rows = (posts as unknown as PostRow[]).map((p) => ({
    ...p,
    vote_score: scoreByPost.get(p.id) ?? 0,
    comment_count: commentsByPost.get(p.id) ?? 0,
  }));

  if (sort === "top") {
    rows.sort((a, b) => b.vote_score - a.vote_score);
  }

  return rows;
}

export async function getPostById(id: string): Promise<PostRow | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, profiles:author_id(id, display_name, verified_badge, avatar_url, verification_method), crops:crop_id(id, name_en, name_np), districts:district_id(id, name)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  const [{ data: votes }, { data: comments }] = await Promise.all([
    supabase.from("votes").select("value").eq("post_id", id),
    supabase.from("comments").select("id").eq("post_id", id),
  ]);

  return {
    ...(data as unknown as PostRow),
    vote_score: (votes ?? []).reduce((sum, v) => sum + v.value, 0),
    comment_count: (comments ?? []).length,
  };
}

export async function getCommentsForPost(postId: string): Promise<
  (Comment & { profiles: Pick<Profile, "id" | "display_name" | "verified_badge" | "avatar_url" | "verification_method"> | null })[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles:author_id(id, display_name, verified_badge, avatar_url, verification_method)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as (Comment & {
    profiles: Pick<Profile, "id" | "display_name" | "verified_badge" | "avatar_url" | "verification_method"> | null;
  })[];
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data;
}

export async function getPostsByAuthor(authorId: string): Promise<PostRow[]> {
  if (!isSupabaseConfigured) return [];
  return getPosts({}, "new", 100).then((posts) => posts.filter((p) => p.author_id === authorId));
}

export async function getTags(): Promise<Tag[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) return [];
  return data ?? [];
}

export async function getOpenReports(): Promise<Report[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export type PlatformStats = {
  postCount: number;
  farmerCount: number;
  districtCount: number;
  cropCount: number;
};

/** Real counts for the homepage stats strip — zeros (not an error) if unconfigured. */
export async function getPlatformStats(): Promise<PlatformStats> {
  const empty = { postCount: 0, farmerCount: 0, districtCount: 0, cropCount: 0 };
  if (!isSupabaseConfigured) return empty;
  const supabase = await createClient();

  const [posts, profiles, districtsWithPosts, crops] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("district_id"),
    supabase.from("crops").select("id", { count: "exact", head: true }),
  ]);

  const distinctDistricts = new Set((districtsWithPosts.data ?? []).map((p) => p.district_id).filter(Boolean));

  return {
    postCount: posts.count ?? 0,
    farmerCount: profiles.count ?? 0,
    districtCount: distinctDistricts.size,
    cropCount: crops.count ?? 0,
  };
}

export type SearchResults = {
  crops: Crop[];
  equipment: Equipment[];
  vendors: Vendor[];
  schemes: Scheme[];
  posts: PostRow[];
};

/** Simple ilike search across the facts layer + posts — one query per table, run in parallel. */
export async function searchAll(query: string): Promise<SearchResults> {
  const empty: SearchResults = { crops: [], equipment: [], vendors: [], schemes: [], posts: [] };
  const q = query.trim();
  if (!isSupabaseConfigured || !q) return empty;
  const supabase = await createClient();

  // Expand "corn" -> also search "maize"/"makai"/"मकै", so English, romanized
  // Nepali, and Devanagari spellings of the same crop all find each other.
  // See search-synonyms.ts.
  const terms = [q, ...expandSearchTerms(q)];
  const orFields = (fields: string[]) => terms.flatMap((t) => fields.map((f) => `${f}.ilike.%${t}%`)).join(",");

  const [crops, equipment, vendors, schemes, posts] = await Promise.all([
    supabase.from("crops").select("*").or(orFields(["name_en", "name_np", "baseline_notes"])).limit(8),
    supabase.from("equipment").select("*").or(orFields(["name", "name_np", "description"])).limit(8),
    supabase.from("vendors").select("*").or(orFields(["business_name", "contact_info"])).limit(8),
    supabase.from("schemes").select("*").or(orFields(["title", "description"])).limit(6),
    supabase
      .from("posts")
      .select(
        "*, profiles:author_id(id, display_name, verified_badge, avatar_url, verification_method), crops:crop_id(id, name_en, name_np), districts:district_id(id, name)"
      )
      .or(orFields(["title", "body"]))
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return {
    crops: crops.data ?? [],
    equipment: equipment.data ?? [],
    vendors: vendors.data ?? [],
    schemes: schemes.data ?? [],
    posts: ((posts.data ?? []) as unknown as PostRow[]).map((p) => ({ ...p, vote_score: 0, comment_count: 0 })),
  };
}

/** Publicly-readable resolved feedback with an admin note — the "what's changed" trust loop. */
export async function getChangelog(): Promise<Feedback[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("status", "reviewed")
    .not("resolution_note", "is", null)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) return [];
  return data ?? [];
}

/** Best-answer comments on posts tagged with this crop — surfaced on the crop page itself. */
export async function getBestAnswersForCrop(cropId: number): Promise<
  (Comment & { posts: Pick<Post, "id" | "title"> | null })[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, posts:post_id!inner(id, title, crop_id)")
    .eq("is_best_answer", true)
    .eq("posts.crop_id", cropId)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) return [];
  return (data ?? []) as (Comment & { posts: Pick<Post, "id" | "title"> | null })[];
}

export async function getPledgesForPost(postId: string): Promise<
  (GroupBuyPledge & { profiles: Pick<Profile, "id" | "display_name" | "avatar_url" | "verification_method" | "verified_badge"> | null })[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_buy_pledges")
    .select("*, profiles:user_id(id, display_name, avatar_url, verification_method, verified_badge)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as (GroupBuyPledge & {
    profiles: Pick<Profile, "id" | "display_name" | "avatar_url" | "verification_method" | "verified_badge"> | null;
  })[];
}
