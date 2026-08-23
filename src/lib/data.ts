import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { slugify } from "@/lib/slug";
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
  Post,
  PostType,
  Comment,
  Profile,
  Report,
  Tag,
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

export type PostFilters = {
  cropId?: number;
  districtId?: number;
  type?: PostType;
  equipmentId?: number;
};

export type PostRow = Post & {
  profiles: Pick<Profile, "id" | "display_name" | "verified_badge"> | null;
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
      "*, profiles:author_id(id, display_name, verified_badge), crops:crop_id(id, name_en, name_np), districts:district_id(id, name)"
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
      "*, profiles:author_id(id, display_name, verified_badge), crops:crop_id(id, name_en, name_np), districts:district_id(id, name)"
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
  (Comment & { profiles: Pick<Profile, "id" | "display_name" | "verified_badge"> | null })[]
> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles:author_id(id, display_name, verified_badge)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as (Comment & {
    profiles: Pick<Profile, "id" | "display_name" | "verified_badge"> | null;
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
