#!/usr/bin/env node
// Applies supabase/seed.sql's facts-layer data via the Supabase JS client
// (REST + service role) instead of the SQL Editor — avoids the SQL Editor
// clipboard-paste failure mode entirely. This mirrors seed.sql row-for-row;
// if you edit seed.sql, mirror the change here too (or just run seed.sql
// directly in the SQL Editor next time — both are safe to re-run).
//
// Usage: node scripts/apply-seed.mjs
// Requires migration 0005 already applied (real unique constraints).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(here, "..", ".env.local");

function loadEnv(file) {
  const text = readFileSync(file, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv(envPath);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function fail(label, error) {
  if (error) {
    console.error(`  ! ${label}:`, error.message);
    return true;
  }
  return false;
}

async function main() {
  console.log("Zones...");
  fail(
    "zones",
    (
      await supabase.from("zones").upsert(
        [
          { name: "Terai", altitude_min: 60, altitude_max: 300, description: "Flat plains along the southern border; Nepal's main grain belt." },
          { name: "Siwalik", altitude_min: 300, altitude_max: 1500, description: "Low outer foothills (Chure range); fragile soils, mixed farming." },
          { name: "Middle Hill", altitude_min: 700, altitude_max: 2000, description: "Densely settled hill terraces; the classic smallholder heartland." },
          { name: "High Hill", altitude_min: 2000, altitude_max: 3000, description: "Higher hill terraces; shorter growing season, more livestock reliance." },
          { name: "Mountain", altitude_min: 3000, altitude_max: 4000, description: "High Himalayan valleys; limited arable land, short summer cropping." },
          { name: "High Mountain", altitude_min: 4000, altitude_max: 5500, description: "Trans-Himalayan/alpine; minimal cropping, mostly pastoral." },
        ],
        { onConflict: "name", ignoreDuplicates: true }
      )
    ).error
  );

  const { data: zones } = await supabase.from("zones").select("id, name");
  const zoneId = (name) => zones.find((z) => z.name === name)?.id;

  console.log("Districts...");
  const districtRows = [
    ["Jhapa", "Koshi", "Terai"], ["Morang", "Koshi", "Terai"], ["Sunsari", "Koshi", "Terai"],
    ["Ilam", "Koshi", "Middle Hill"], ["Taplejung", "Koshi", "Mountain"],
    ["Saptari", "Madhesh", "Terai"], ["Dhanusha", "Madhesh", "Terai"], ["Sarlahi", "Madhesh", "Terai"],
    ["Kathmandu", "Bagmati", "Middle Hill"], ["Bhaktapur", "Bagmati", "Middle Hill"],
    ["Kavrepalanchok", "Bagmati", "Middle Hill"], ["Sindhupalchok", "Bagmati", "High Hill"],
    ["Rasuwa", "Bagmati", "Mountain"], ["Chitwan", "Bagmati", "Terai"],
    ["Gorkha", "Gandaki", "High Hill"], ["Kaski", "Gandaki", "Middle Hill"],
    ["Mustang", "Gandaki", "High Mountain"], ["Nawalparasi", "Gandaki", "Terai"],
    ["Rupandehi", "Lumbini", "Terai"], ["Palpa", "Lumbini", "Middle Hill"], ["Dang", "Lumbini", "Siwalik"],
    ["Salyan", "Karnali", "High Hill"], ["Jumla", "Karnali", "Mountain"], ["Surkhet", "Karnali", "Middle Hill"],
    ["Kailali", "Sudurpashchim", "Terai"], ["Kanchanpur", "Sudurpashchim", "Terai"], ["Baitadi", "Sudurpashchim", "High Hill"],
  ].map(([name, province, zone]) => ({ name, province, zone_id: zoneId(zone) }));
  fail("districts", (await supabase.from("districts").upsert(districtRows, { onConflict: "name,province", ignoreDuplicates: true })).error);

  const { data: districts } = await supabase.from("districts").select("id, name");
  const districtId = (name) => districts.find((d) => d.name === name)?.id;

  console.log("Crops...");
  const cropRows = [
    ["Rice", "धान", "cereal", "Main staple, dominant in Terai and irrigated hill valleys. Monsoon (main) and spring crop cycles."],
    ["Maize", "मकै", "cereal", "Key hill staple, often intercropped with legumes on terraced land."],
    ["Wheat", "गहुँ", "cereal", "Winter cereal, widely grown in Terai and mid-hills after rice/maize."],
    ["Millet (Kodo)", "कोदो", "cereal", "Drought-tolerant hill staple, important for food security at higher elevations."],
    ["Potato", "आलु", "vegetable", "Grown across nearly all zones; a major cash and subsistence crop in the hills."],
    ["Tomato", "गोलभेडा", "vegetable", "High-value crop, increasingly grown under plastic tunnels in hills and Terai."],
    ["Cauliflower", "काउली", "vegetable", "Popular winter vegetable, strong market demand near urban centers."],
    ["Cabbage", "बन्दा", "vegetable", "Common winter vegetable, similar growing conditions to cauliflower."],
    ["Onion", "प्याज", "vegetable", "Import-dependent nationally; local production is a policy priority."],
    ["Carrot", "गाजर", "vegetable", "Widely grown winter root vegetable, strong demand from urban markets."],
    ["Mustard", "तोरी", "cash_crop", "Major winter oilseed, grown widely across Terai and mid-hills."],
    ["Lentil (Musuro)", "मुसुरो", "cash_crop", "Nepal is a major global lentil exporter; grown post-rice in Terai."],
    ["Chickpea (Chana)", "चना", "cash_crop", "Winter legume, mostly Terai; improves soil nitrogen."],
    ["Sugarcane", "उखु", "cash_crop", "Terai cash crop tied to local sugar mill contracts."],
    ["Ginger", "अदुवा", "spice", "High-value hill cash crop; Nepal is among the world's top producers."],
    ["Chilli (Dry)", "सुकेको खुर्सानी", "spice", "High-value dried spice crop, strong wholesale demand year-round."],
    ["Cardamom (Large)", "अलैंची", "spice", "Major eastern hill export crop, grown under forest shade."],
    ["Tea", "चिया", "cash_crop", "Concentrated in Ilam, Jhapa, Panchthar; orthodox and CTC production."],
    ["Apple", "स्याउ", "fruit", "High-hill/mountain fruit crop, especially Mustang, Jumla, and nearby districts."],
    ["Banana", "केरा", "fruit", "Major Terai fruit crop, sold fresh and year-round."],
    ["Citrus (Junar/Orange)", "सुन्तला", "fruit", "Mid-hill fruit crop, vulnerable to citrus greening disease."],
    ["Mushroom (Button)", "च्याउ", "vegetable", "High-value, short-cycle crop increasingly grown by smallholders near urban markets."],
    ["Buffalo (Dairy)", "भैंसी", "livestock", "Primary dairy animal for most smallholder households."],
    ["Goat", "बाख्रा", "livestock", "Widespread smallholder livestock, important for cash income and meat."],
  ].map(([name_en, name_np, category, baseline_notes]) => ({ name_en, name_np, category, baseline_notes }));
  fail("crops", (await supabase.from("crops").upsert(cropRows, { onConflict: "name_en", ignoreDuplicates: true })).error);

  const { data: crops } = await supabase.from("crops").select("id, name_en");
  const cropId = (name) => crops.find((c) => c.name_en === name)?.id;

  console.log("Crop zones...");
  const cropZoneRows = [
    ["Rice", "Terai", "Jun-Jul"], ["Rice", "Middle Hill", "Jun-Jul"],
    ["Maize", "Middle Hill", "Mar-Apr"], ["Maize", "High Hill", "Apr-May"],
    ["Wheat", "Terai", "Nov-Dec"], ["Wheat", "Middle Hill", "Nov-Dec"],
    ["Potato", "Middle Hill", "Oct-Nov"], ["Potato", "High Hill", "Apr-May"],
    ["Tomato", "Middle Hill", "Feb-Mar"], ["Tomato", "Terai", "Sep-Oct"],
    ["Cauliflower", "Middle Hill", "Aug-Sep"],
    ["Mustard", "Terai", "Oct-Nov"], ["Lentil (Musuro)", "Terai", "Oct-Nov"],
    ["Ginger", "Middle Hill", "Mar-Apr"], ["Cardamom (Large)", "High Hill", "Apr-May"],
    ["Tea", "Middle Hill", "Year-round (perennial)"],
    ["Apple", "Mountain", "Dec-Jan (dormant planting)"],
    ["Citrus (Junar/Orange)", "Middle Hill", "Jul-Aug"],
  ].map(([crop, zone, months]) => ({ crop_id: cropId(crop), zone_id: zoneId(zone), typical_planting_months: months }));
  fail("crop_zones", (await supabase.from("crop_zones").upsert(cropZoneRows, { onConflict: "crop_id,zone_id", ignoreDuplicates: true })).error);

  console.log("Tags...");
  const tagRows = ["blight", "pest", "organic", "urgent", "good-buyer", "scam-alert", "irrigation", "drought", "flood", "soil-health", "seed-source", "success-story"].map((name) => ({ name }));
  fail("tags", (await supabase.from("tags").upsert(tagRows, { onConflict: "name", ignoreDuplicates: true })).error);

  console.log("Retiring the old illustrative-placeholder schemes (real ones below)...");
  const retiredTitles = [
    "Agricultural Equipment Subsidy (illustrative example)",
    "Youth-Targeted Agri-Entrepreneurship Loan (illustrative example)",
  ];
  const { data: retiredSchemes } = await supabase.from("schemes").select("id, title").in("title", retiredTitles);
  if (retiredSchemes?.length) {
    const retiredIds = retiredSchemes.map((s) => s.id);
    // equipment.related_scheme_id has no ON DELETE clause -> must be cleared first or the delete is rejected.
    await supabase.from("equipment").update({ related_scheme_id: null }).in("related_scheme_id", retiredIds);
    fail("delete retired schemes", (await supabase.from("schemes").delete().in("id", retiredIds)).error);
  }

  console.log("Schemes — real, sourced (central/provincial; local noted honestly as not centrally listable)...");
  // All checked live 2026-09-01. Note: Nepal's Ministry of Agriculture and
  // Livestock Development was merged into the new Ministry of Agriculture,
  // Forests and Environment on 2026-05-14 — it kept the moald.gov.np domain.
  const schemeRows = [
    {
      title: "Prime Minister Agriculture Modernization Project (PM-AMP)",
      description: "Nepal's largest national agriculture program, run by the Ministry of Agriculture, Forests and Environment (formerly the Ministry of Agriculture and Livestock Development, merged 2026-05-14). Supports commercial-scale agriculture through four tiers — Pocket (min. 10 ha), Block (min. 100 ha), Zone (min. 500 ha, with processing), and Super Zone (min. 1,000 ha, industrial-scale) — providing mechanization equipment, processing/marketing infrastructure, cold storage, and entrepreneurship development support. As of writing: 9,393 pockets, 1,699 blocks, 206 zones, and 21 super zones established nationwide.",
      subsidy_type: "mechanization_and_infrastructure_support",
      eligibility: "Farmer groups/cooperatives within an area already designated as a PM-AMP pocket/block/zone/super zone, or proposing a new one. Designation is based on \"national priorities and local feasibility\" set by the Program Management Unit.",
      how_to_apply: "Contact the PM-AMP Program Management Unit (Khumaltar, Lalitpur — phone 01-5446906, email pmamp.pmu@gmail.com) or your nearest subordinate Pocket/Block/Zone office listed on the PM-AMP website.",
      source_url: "https://pmamp.gov.np/en/",
      last_verified: "2026-09-01",
    },
    {
      title: "Krishi Gyan Kendra (Agriculture Knowledge Center) network",
      description: "Nepal's network of local Agriculture Knowledge Centers, under each province's Directorate of Agriculture Development, is the standard first point of contact for ANY government agriculture subsidy, technical advice, or equipment-support scheme — federal, provincial, or local. This is a general entry point, not one specific subsidy.",
      subsidy_type: "advisory_and_referral",
      eligibility: "Any registered farmer or farmer group.",
      how_to_apply: "Visit your district's Krishi Gyan Kendra in person, or contact your province's Directorate of Agriculture Development to ask what's currently open (example — Koshi Province: 021-5165568, doadprovince1@gmail.com).",
      source_url: "https://doad.koshi.gov.np/agriculture-knowledge-center",
      last_verified: "2026-09-01",
    },
    {
      title: "Provincial agriculture subsidy programs (varies by province)",
      description: "Each of Nepal's 7 provinces runs its own Directorate of Agriculture Development with province-specific annual subsidy programs (seeds, equipment, irrigation, etc.). These vary by province and by fiscal-year budget and are not standardized nationally — we can't list all 7 here.",
      subsidy_type: "varies_by_province",
      eligibility: "Varies by province and program.",
      how_to_apply: "Contact your provincial Directorate of Agriculture Development directly. Example — Koshi Province: 021-5165568, doadprovince1@gmail.com, doad.koshi.gov.np. Other provinces have an equivalent office; ask your local Krishi Gyan Kendra which one covers you.",
      source_url: "https://doad.koshi.gov.np/agriculture-knowledge-center",
      last_verified: "2026-09-01",
    },
    {
      title: "Local government (Gaunpalika / Nagarpalika) agriculture programs",
      description: "Nepal's 753 local governments each set their own small annual agriculture budget (seed/plough/irrigation subsidies, grants for youth agri-entrepreneurs, etc.) as part of local planning. Program details differ by municipality and aren't centrally published anywhere we could verify — genuinely can't be listed here specifically.",
      subsidy_type: "varies_by_municipality",
      eligibility: "Varies by municipality — typically residents/farmers registered within that local government's area.",
      how_to_apply: "Contact your Ward Office or municipality's agriculture branch directly, or ask at your local Krishi Gyan Kendra which local programs are currently open.",
      source_url: null,
      last_verified: "2026-09-01",
    },
  ];
  for (const s of schemeRows) {
    const { data: existing } = await supabase.from("schemes").select("id").eq("title", s.title).maybeSingle();
    if (existing) fail(`update scheme "${s.title}"`, (await supabase.from("schemes").update(s).eq("id", existing.id)).error);
    else fail(`insert scheme "${s.title}"`, (await supabase.from("schemes").insert(s)).error);
  }
  const { data: schemes } = await supabase.from("schemes").select("id, title");
  const schemeId = (title) => schemes.find((s) => s.title === title)?.id;

  console.log("Equipment (Nepal)...");
  const nepalEquipment = [
    { name: "Agricultural Spraying Drone", name_np: "कृषि स्प्रे ड्रोन", category: "drone", description: "Multirotor drone fitted with a tank and nozzles for pesticide/fertilizer spraying.", how_it_helps: "Cuts spraying time and chemical exposure sharply versus manual knapsack spraying; most useful on medium-to-larger or pooled plots.", purchase_price_min: 700000, purchase_price_max: 900000, rental_price: 1500, rental_price_unit: "per acre spray", availability_status: "service_only", related_scheme_id: schemeId("Prime Minister Agriculture Modernization Project (PM-AMP)"), source_url: null, video_url: "https://www.youtube.com/watch?v=0ksIHQ8KCfU", last_verified: "2026-06-01", scope: "nepal" },
    { name: "Mini-Tiller (Power Tiller, Walk-Behind)", name_np: "मिनी टिलर (पावर टिलर)", category: "machinery", description: "Small walk-behind tiller sized for terraced and fragmented hill/Terai plots.", how_it_helps: "Right-sized mechanization for plots too small or steep for a full tractor; cuts land-prep labor and time.", purchase_price_min: 120000, purchase_price_max: 220000, rental_price: 1500, rental_price_unit: "per day", availability_status: "available_in_nepal", related_scheme_id: schemeId("Prime Minister Agriculture Modernization Project (PM-AMP)"), source_url: null, video_url: "https://www.youtube.com/watch?v=F1baBchwgTg", last_verified: "2026-05-10", scope: "nepal" },
    { name: "Solar Irrigation Pump", name_np: "सोलार सिँचाइ पम्प", category: "solar", description: "Solar-powered water pump for lifting irrigation water without grid electricity or diesel.", how_it_helps: "Removes recurring diesel cost and gives off-grid plots reliable irrigation access.", purchase_price_min: 150000, purchase_price_max: 350000, rental_price: null, rental_price_unit: null, availability_status: "available_in_nepal", related_scheme_id: null, source_url: null, video_url: null, last_verified: "2026-04-20", scope: "nepal" },
    { name: "Drip Irrigation Kit (per Ropani)", name_np: "ड्रिप सिँचाइ किट", category: "irrigation", description: "Tubing, emitters, and filter kit sized for small-plot drip irrigation.", how_it_helps: "Cuts water use substantially versus flood irrigation and improves yield consistency for vegetables.", purchase_price_min: 8000, purchase_price_max: 25000, rental_price: null, rental_price_unit: null, availability_status: "available_in_nepal", related_scheme_id: null, source_url: "https://hardwarepasal.com/category/irrigation", video_url: null, last_verified: "2026-08-30", scope: "nepal" },
    { name: "IoT Soil-Moisture Sensor Kit", name_np: "माटो-आर्द्रता सेन्सर किट", category: "iot_sensor", description: "Wireless soil-moisture/temperature sensors with a phone-app dashboard.", how_it_helps: "Tells farmers when a plot actually needs water instead of guessing, saving both water and pump-running cost. NGO-backed pilots (e.g. AgriSmart-style programs) currently subsidize kits in a handful of districts rather than this being an open retail product yet.", purchase_price_min: 15000, purchase_price_max: 45000, rental_price: null, rental_price_unit: null, availability_status: "pilot_stage", related_scheme_id: null, source_url: null, video_url: null, last_verified: "2026-03-15", scope: "nepal" },
    { name: "Small Greenhouse / Polyhouse Kit", name_np: "साना ग्रीनहाउस / पोलिहाउस किट", category: "greenhouse", description: "Bamboo or steel-frame polyhouse kit sized for small vegetable plots (roughly 20x8 m).", how_it_helps: "Extends the growing season and protects high-value vegetables (tomato, cucumber, capsicum) from hail and erratic rain.", purchase_price_min: 60000, purchase_price_max: 180000, rental_price: null, rental_price_unit: null, availability_status: "available_in_nepal", related_scheme_id: schemeId("Prime Minister Agriculture Modernization Project (PM-AMP)"), source_url: null, video_url: null, last_verified: "2026-05-01", scope: "nepal" },
    { name: "Solar Dryer (Post-Harvest)", name_np: "सोलार ड्रायर", category: "post_harvest", description: "Solar-powered dehydration unit for grains, spices, and fruit.", how_it_helps: "Reduces post-harvest spoilage and lets farmers sell dried/higher-value product instead of raw perishables.", purchase_price_min: 30000, purchase_price_max: 90000, rental_price: null, rental_price_unit: null, availability_status: "pilot_stage", related_scheme_id: null, source_url: null, video_url: null, last_verified: "2026-02-10", scope: "nepal" },
    { name: "Farm Management Mobile App", name_np: "कृषि व्यवस्थापन मोबाइल एप", category: "digital_app", description: "Smartphone app for tracking planting dates, expenses, and reminders.", how_it_helps: "Helps farmers plan input timing and keep basic records without paper bookkeeping.", purchase_price_min: 0, purchase_price_max: 0, rental_price: null, rental_price_unit: null, availability_status: "available_in_nepal", related_scheme_id: null, source_url: null, video_url: null, last_verified: "2026-06-15", scope: "nepal" },
  ];
  fail("equipment (nepal)", (await supabase.from("equipment").upsert(nepalEquipment, { onConflict: "name" })).error);

  console.log("Equipment (global)...");
  const globalEquipment = [
    { name: "Autonomous Field Robots", name_np: "स्वचालित कृषि रोबोट", category: "machinery", description: "Small self-driving robots for weeding, seeding, or monitoring row crops, used commercially in parts of Europe and North America.", how_it_helps: "Removes manual weeding labor; used mainly on large, uniform commercial fields today, not smallholder terraces.", purchase_price_min: null, purchase_price_max: null, rental_price: null, rental_price_unit: null, availability_status: "pilot_stage", related_scheme_id: null, source_url: "https://en.wikipedia.org/wiki/Weeding", video_url: null, last_verified: "2026-06-01", scope: "global" },
    { name: "Satellite Precision-Agriculture Imagery", name_np: "स्याटेलाइट-आधारित सटीक कृषि", category: "digital_app", description: "Satellite/drone imagery services that flag crop stress, irrigation gaps, and yield estimates over large areas.", how_it_helps: "Lets a farm manager spot a problem area before it is visible on the ground, at large commercial scale.", purchase_price_min: null, purchase_price_max: null, rental_price: null, rental_price_unit: null, availability_status: "pilot_stage", related_scheme_id: null, source_url: null, video_url: null, last_verified: "2026-06-01", scope: "global" },
    { name: "AI Crop-Disease Detection App (Global)", name_np: "एआई बाली-रोग पहिचान एप", category: "digital_app", description: "Phone-camera apps that identify crop diseases from a leaf photo using AI models trained on global crop-image datasets.", how_it_helps: "Could give farmers an instant first read on a disease photo — accuracy for Nepal-specific crops/pests is not yet verified.", purchase_price_min: null, purchase_price_max: null, rental_price: null, rental_price_unit: null, availability_status: "pilot_stage", related_scheme_id: null, source_url: null, video_url: null, last_verified: "2026-06-01", scope: "global" },
    { name: "Vertical Farming Systems", name_np: "ठाडो (भर्टिकल) खेती प्रणाली", category: "greenhouse", description: "Stacked, climate-controlled indoor growing systems, mostly for leafy greens, used in urban commercial operations abroad.", how_it_helps: "High yield per square meter but high capital and energy cost — not yet a fit for typical Nepali smallholder economics.", purchase_price_min: null, purchase_price_max: null, rental_price: null, rental_price_unit: null, availability_status: "import_only", related_scheme_id: null, source_url: "https://farmonaut.com/precision-farming/new-method-of-farming-precision-vertical-agriculture-2026", video_url: null, last_verified: "2026-06-01", scope: "global" },
    { name: "Blockchain Crop Traceability Platforms", name_np: "ब्लकचेन बाली-ट्रेसेबिलिटी प्रणाली", category: "digital_app", description: "Supply-chain platforms that record a crop's journey from farm to buyer for provenance/certification purposes.", how_it_helps: "Could help premium/export crops (e.g. cardamom, tea) prove origin to buyers, but requires buyer-side adoption too.", purchase_price_min: null, purchase_price_max: null, rental_price: null, rental_price_unit: null, availability_status: "pilot_stage", related_scheme_id: null, source_url: "https://intellias.com/blockchain-in-agriculture-supply-chain/", video_url: null, last_verified: "2026-06-01", scope: "global" },
  ];
  fail("equipment (global)", (await supabase.from("equipment").upsert(globalEquipment, { onConflict: "name" })).error);

  console.log("Market prices...");
  const priceRows = [
    ["Rice", "Kalimati, Kathmandu", 65, "per kg", "2026-08-10", "illustrative sample"],
    ["Rice", "Kalimati, Kathmandu", 68, "per kg", "2026-08-17", "illustrative sample"],
    ["Tomato", "Kalimati, Kathmandu", 55, "per kg", "2026-08-10", "illustrative sample"],
    ["Tomato", "Kalimati, Kathmandu", 40, "per kg", "2026-08-17", "illustrative sample"],
    ["Potato", "Kalimati, Kathmandu", 45, "per kg", "2026-08-10", "illustrative sample"],
    ["Potato", "Kalimati, Kathmandu", 48, "per kg", "2026-08-17", "illustrative sample"],
    ["Tomato", "Kalimati, Kathmandu", 75, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Potato", "Kalimati, Kathmandu", 50, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Onion", "Kalimati, Kathmandu", 94, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Carrot", "Kalimati, Kathmandu", 110, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Cabbage", "Kalimati, Kathmandu", 35, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Banana", "Kalimati, Kathmandu", 275, "per dozen", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Apple", "Kalimati, Kathmandu", 367, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Mushroom (Button)", "Kalimati, Kathmandu", 425, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Ginger", "Kalimati, Kathmandu", 225, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
    ["Chilli (Dry)", "Kalimati, Kathmandu", 525, "per kg", "2026-08-30", "Kalimati wholesale (ramropatro.com)"],
  ].map(([crop, market_name, price_per_unit, unit, date_recorded, source]) => ({
    crop_id: cropId(crop), market_name, price_per_unit, unit, date_recorded, source,
  }));
  fail("market_prices", (await supabase.from("market_prices").upsert(priceRows, { onConflict: "crop_id,market_name,date_recorded", ignoreDuplicates: true })).error);

  console.log("Retiring the old made-up vendor listings (real ones below)...");
  // These were fabricated placeholder businesses with fake phone numbers —
  // not acceptable to keep once "real vendor data" was explicitly asked for.
  const retiredVendorNames = [
    "Himal Agro Machinery Pvt. Ltd.", "Chitwan Custom Hiring Center", "SkyField Drone Services",
    "Terai Solar Solutions", "Kalimati Fresh Buyers Coop", "Ilam Tea & Ginger Traders", "Gorkha Agrovet Center",
  ];
  const { data: retiredVendors } = await supabase.from("vendors").select("id").in("business_name", retiredVendorNames);
  if (retiredVendors?.length) {
    const retiredIds = retiredVendors.map((v) => v.id);
    await supabase.from("vendor_equipment").delete().in("vendor_id", retiredIds);
    fail("delete retired vendors", (await supabase.from("vendors").delete().in("id", retiredIds)).error);
  }

  console.log("Vendors — real organizations only (checked live 2026-09-01)...");
  // Deliberately short. We could only verify two organizations with a real,
  // public, checkable presence relevant to individual farmers — a
  // manufacturer's own Nepal dealer-network page, and a registered national
  // seed company. We did NOT find a verifiable real drone-spraying service
  // company or a specific real local crop-buyer/agrovet with public contact
  // info — rather than invent one, those vendor_type categories are left for
  // real vendors/farmers to fill in themselves via the platform (Krisearch's
  // whole model is community-submitted content, not a pre-populated
  // directory) — see the note in README.
  const vendorRows = [
    {
      business_name: "Mahindra Farm Equipment (Nepal)",
      vendor_type: "equipment_supplier",
      district_id: null, // nationwide dealer network, not one location
      contact_info: "Official manufacturer page — use the Nepal dealer locator for your nearest of 14 authorized dealers: mahindrafarmequipment.com/nepal",
      rating_avg: null,
    },
    {
      business_name: "National Seed Company Ltd. (NSC)",
      vendor_type: "input_supplier",
      district_id: districtId("Kathmandu"),
      contact_info: "Central Office, Kuleshwor, Kathmandu — see nscl.org.np for your nearest area office",
      rating_avg: null,
    },
  ];
  for (const v of vendorRows) {
    const { data: existing } = await supabase.from("vendors").select("id").eq("business_name", v.business_name).eq("vendor_type", v.vendor_type).maybeSingle();
    if (existing) fail(`update vendor "${v.business_name}"`, (await supabase.from("vendors").update(v).eq("id", existing.id)).error);
    else fail(`insert vendor "${v.business_name}"`, (await supabase.from("vendors").insert(v)).error);
  }
  // No vendor_equipment rows: we couldn't verify which specific catalog item
  // either real vendor actually stocks at what price — better to leave that
  // section showing "no vendors listed yet" than fabricate a price/product
  // link neither vendor has confirmed.

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
