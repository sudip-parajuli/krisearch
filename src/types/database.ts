// Hand-written types mirroring supabase/migrations/0001_schema.sql.
// If the schema changes, update this file (or swap it for `supabase gen types typescript`
// output once a live project exists).

export type Zone = {
  id: number;
  name: string;
  altitude_min: number | null;
  altitude_max: number | null;
  description: string | null;
};

export type District = {
  id: number;
  name: string;
  province: string;
  zone_id: number | null;
};

export type CropCategory =
  | "cereal"
  | "vegetable"
  | "cash_crop"
  | "fruit"
  | "spice"
  | "livestock";

export type Crop = {
  id: number;
  name_en: string;
  name_np: string | null;
  category: CropCategory | null;
  baseline_notes: string | null;
};

export type CropZone = {
  crop_id: number;
  zone_id: number;
  typical_planting_months: string | null;
};

export type Scheme = {
  id: number;
  title: string;
  description: string | null;
  subsidy_type: string | null;
  eligibility: string | null;
  how_to_apply: string | null;
  source_url: string | null;
  last_verified: string; // date
};

export type MarketPrice = {
  id: number;
  crop_id: number | null;
  market_name: string | null;
  price_per_unit: number | null;
  unit: string | null;
  date_recorded: string | null; // date
  source: string | null;
};

export type EquipmentCategory =
  | "drone"
  | "iot_sensor"
  | "irrigation"
  | "machinery"
  | "greenhouse"
  | "solar"
  | "post_harvest"
  | "digital_app";

export type AvailabilityStatus =
  | "available_in_nepal"
  | "import_only"
  | "pilot_stage"
  | "service_only";

export type EquipmentScope = "nepal" | "global";

export type Equipment = {
  id: number;
  name: string;
  name_np: string | null;
  video_url: string | null;
  category: EquipmentCategory | null;
  description: string | null;
  how_it_helps: string | null;
  purchase_price_min: number | null;
  purchase_price_max: number | null;
  rental_price: number | null;
  rental_price_unit: string | null;
  availability_status: AvailabilityStatus | null;
  related_scheme_id: number | null;
  source_url: string | null;
  last_verified: string; // date
  scope: EquipmentScope;
};

export type ProfileRole = "farmer" | "dealer" | "extension_officer" | "general";
export type VerifiedBadge = "extension_officer" | "agrovet" | null;

export type Profile = {
  id: string;
  display_name: string | null;
  role: ProfileRole | null;
  district_id: number | null;
  verified_badge: VerifiedBadge;
  crops_grown: number[] | null;
  bio: string | null;
  created_at: string;
  contact_info: string | null;
  is_guest: boolean;
};

/** AI fact-check signal on a post/comment's content (see lib/ai/factcheck.ts). */
export type AIVerdict = "safe" | "caution" | "danger" | "unverified";

export type PostType =
  | "question"
  | "disease_pest_report"
  | "fertilizer_tip"
  | "market_price_report"
  | "success_story"
  | "general_discussion"
  | "equipment_review";

export type Post = {
  id: string;
  author_id: string | null;
  type: PostType;
  crop_id: number | null;
  equipment_id: number | null;
  district_id: number | null;
  title: string;
  body: string;
  image_urls: string[] | null;
  created_at: string;
  ai_verdict: AIVerdict | null;
  ai_rationale: string | null;
  ai_checked_at: string | null;
};

export type Tag = {
  id: number;
  name: string;
};

export type PostTag = {
  post_id: string;
  tag_id: number;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string | null;
  parent_comment_id: string | null;
  body: string;
  created_at: string;
  ai_verdict: AIVerdict | null;
  ai_rationale: string | null;
  ai_checked_at: string | null;
  is_best_answer: boolean;
};

export type Vote = {
  id: string;
  post_id: string | null;
  comment_id: string | null;
  user_id: string;
  value: 1 | -1;
};

export type ReportStatus = "open" | "reviewed" | "dismissed";

export type Report = {
  id: string;
  post_id: string | null;
  comment_id: string | null;
  reported_by: string | null;
  reason: string | null;
  status: ReportStatus;
  created_at: string;
};

export type VendorType =
  | "crop_buyer"
  | "equipment_supplier"
  | "input_supplier"
  | "drone_service";

export type Vendor = {
  id: string;
  profile_id: string | null;
  vendor_type: VendorType;
  business_name: string | null;
  crops_bought: number[] | null;
  district_id: number | null;
  contact_info: string | null;
  rating_avg: number | null;
};

export type OfferingType = "sale" | "rental" | "service";

export type VendorEquipment = {
  vendor_id: string;
  equipment_id: number;
  offering_type: OfferingType;
  price: number | null;
  price_unit: string | null;
};

export type Feedback = {
  id: string;
  name: string | null;
  contact: string | null;
  message: string;
  page_url: string | null;
  status: "open" | "reviewed";
  created_at: string;
};

// Convenience: a post enriched with the joins pages commonly need.
export type PostWithRelations = Post & {
  profiles: Pick<Profile, "id" | "display_name" | "verified_badge"> | null;
  crops: Pick<Crop, "id" | "name_en" | "name_np"> | null;
  districts: Pick<District, "id" | "name"> | null;
  vote_score?: number;
  comment_count?: number;
};
