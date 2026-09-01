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
  // Coordinates are the district HQ town (approximate) — general guidance
  // for district-level weather, same honesty framing as everything else in
  // this file, not precise for every village in a district.
  const districtRows = [
    ["Jhapa", "Koshi", "Terai", 26.5626, 87.9975], ["Morang", "Koshi", "Terai", 26.4525, 87.2718], ["Sunsari", "Koshi", "Terai", 26.6650, 87.2718],
    ["Ilam", "Koshi", "Middle Hill", 26.9096, 87.9271], ["Taplejung", "Koshi", "Mountain", 27.3500, 87.6667],
    ["Saptari", "Madhesh", "Terai", 26.5390, 86.7500], ["Dhanusha", "Madhesh", "Terai", 26.7288, 85.9266], ["Sarlahi", "Madhesh", "Terai", 26.8600, 85.5600],
    ["Kathmandu", "Bagmati", "Middle Hill", 27.7172, 85.3240], ["Bhaktapur", "Bagmati", "Middle Hill", 27.6710, 85.4298],
    ["Kavrepalanchok", "Bagmati", "Middle Hill", 27.6217, 85.5484], ["Sindhupalchok", "Bagmati", "High Hill", 27.8167, 85.6833],
    ["Rasuwa", "Bagmati", "Mountain", 28.1167, 85.3167], ["Chitwan", "Bagmati", "Terai", 27.6244, 84.4278],
    ["Gorkha", "Gandaki", "High Hill", 28.0000, 84.6333], ["Kaski", "Gandaki", "Middle Hill", 28.2096, 83.9856],
    ["Mustang", "Gandaki", "High Mountain", 28.7833, 83.7167], ["Nawalparasi", "Gandaki", "Terai", 27.6167, 83.9667],
    ["Rupandehi", "Lumbini", "Terai", 27.7000, 83.4486], ["Palpa", "Lumbini", "Middle Hill", 27.8667, 83.5500], ["Dang", "Lumbini", "Siwalik", 28.0500, 82.4833],
    ["Salyan", "Karnali", "High Hill", 28.3833, 82.1667], ["Jumla", "Karnali", "Mountain", 29.2747, 82.1838], ["Surkhet", "Karnali", "Middle Hill", 28.6000, 81.6167],
    ["Kailali", "Sudurpashchim", "Terai", 28.6833, 80.6000], ["Kanchanpur", "Sudurpashchim", "Terai", 28.9333, 80.1833], ["Baitadi", "Sudurpashchim", "High Hill", 29.5333, 80.4667],
  ].map(([name, province, zone, latitude, longitude]) => ({ name, province, zone_id: zoneId(zone), latitude, longitude }));

  const hasCoords = !(await supabase.from("districts").select("latitude").limit(1)).error;
  if (!hasCoords) console.log("  (districts.latitude not found yet — apply migration 0009, then re-run this script)");
  const districtPayload = hasCoords ? districtRows : districtRows.map(({ latitude: _lat, longitude: _lon, ...rest }) => rest);
  fail(
    "districts",
    (
      await supabase
        .from("districts")
        .upsert(districtPayload, { onConflict: "name,province" }) // full upsert (not ignoreDuplicates) so coordinates backfill onto already-seeded rows
    ).error
  );

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
    ["Coffee", "कफी", "cash_crop", "Grown in ~23 mid-hill districts (e.g. Kavre, Gorkha, Palpa, Syangja); a small but growing specialty-export crop, coordinated nationally by the Nepal Coffee Federation."],
    ["Turmeric", "बेसार", "spice", "Hill/Terai spice crop, usually intercropped; steady demand as both a spice and a dye."],
    ["Garlic", "लसुन", "vegetable", "Widely grown winter crop, high local demand, partly import-dependent like onion."],
    ["Soybean", "भटमास", "cash_crop", "Hill oilseed/protein crop, also eaten fresh as edamame-style भटमासकोशा."],
    ["Buckwheat (Faper)", "फापर", "cereal", "High-hill/mountain staple where rice/wheat don't grow well; increasingly marketed as a specialty grain."],
    ["Poultry (Chicken)", "कुखुरा", "livestock", "Nepal's most common smallholder livestock — broiler and layer farming both widespread."],
    ["Milk (Dairy Products)", "दूध", "animal_product", "The product, not the animal — cow/buffalo milk and processed dairy (curd, ghee, paneer). See Buffalo (Dairy) and Goat for the animals themselves."],
    ["Egg", "अन्डा", "animal_product", "Major smallholder income source alongside poultry meat; commercial layer farming is widespread near urban markets."],
    ["Honey (Beekeeping)", "मह (मौरीपालन)", "animal_product", "Growing smallholder sideline — both Apis cerana (traditional) and Apis mellifera (commercial) beekeeping are practiced."],
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
    {
      title: "Agriculture, Livestock & Herb Insurance (govt.-subsidized premium)",
      description: "Government-subsidized crop/livestock/herb insurance: 80% premium subsidy on coverage up to NPR 1 crore (10 million), 50% subsidy above that. Covers 27 crops (incl. paddy, potato, sugarcane, coffee, banana, tea, pulses, ginger, cardamom, timur, mango, and other fruits/vegetables) and 6 livestock/fisheries categories (poultry, pigs, fish, goats, cattle, fodder). Administered jointly by federal + provincial governments; insurance companies collect only the non-subsidized portion of the premium directly from farmers. The government has announced digitalization of the full insurance lifecycle (policy, premium, subsidy, claims) for FY 2026/27.",
      subsidy_type: "insurance_premium_subsidy",
      eligibility: "Farmers/farmer groups raising an eligible crop or livestock category; provincial governments oversee implementation, so specifics vary somewhat by province.",
      how_to_apply: "Apply through a licensed insurance company offering the government-subsidized product (e.g. Nepal Insurance Company) or your provincial agriculture office; ask your local Krishi Gyan Kendra which insurer covers your district.",
      source_url: "https://en.nepalinsurance.com/policy/agriculture-livestock-insurance",
      last_verified: "2026-09-01",
    },
    {
      title: "Sana Kisan Bikas Laghubitta (SKBBL) Agriculture Loan",
      description: "SKBBL is a wholesale microfinance institution (est. 2001, HQ Babarmahal, Kathmandu) that channels low-cost credit through partner Small Farmer Agriculture Cooperatives Ltd. (SFACLs) and other cooperatives to reach small, marginalized, and women farmers who typically can't access mainstream bank credit directly. Reports reaching around 4.5 million people nationally through its cooperative network.",
      subsidy_type: "microfinance_loan",
      eligibility: "Farmers who are members (or can join) a partner SFACL/cooperative in their area — this is wholesale lending through cooperatives, not a walk-in bank loan.",
      how_to_apply: "Find and join your nearest partner cooperative/SFACL, or contact SKBBL directly for their agriculture loan product.",
      source_url: "https://www.skbbl.com.np/products/agriculture-loan",
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

  console.log("Vendors — real organizations (checked live 2026-09-01)...");
  // Two provenance tiers, marked per-row below:
  // - INDEPENDENTLY VERIFIED: we found this organization ourselves via live
  //   web search (official site, business registry, or a listing on another
  //   real platform) and confirmed what it does.
  // - USER-PROVIDED, NOT RE-VERIFIED: the user supplied this business (real
  //   Nepali agribusiness landscape, plausible and internally consistent),
  //   but we did not independently re-confirm every detail ourselves — no
  //   fabricated phone numbers either way, only real emails/URLs we have.
  // crops_supplied/crops_bought below use a representative subset, not an
  // exhaustive catalog — these are large, multi-product businesses.
  const cropIds = (names) => names.map((n) => cropId(n)).filter(Boolean);
  const vendorRows = [
    // --- independently verified ---
    {
      business_name: "Mahindra Farm Equipment (Nepal)", vendor_type: "equipment_supplier",
      district_id: null, contact_info: "Official manufacturer page — Nepal dealer locator for your nearest of 14 authorized dealers: mahindrafarmequipment.com/nepal",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "National Seed Company Ltd. (NSC)", vendor_type: "input_supplier",
      district_id: districtId("Kathmandu"), contact_info: "Central Office, Kuleshwor, Kathmandu — nscl.org.np for your nearest area office",
      crops_bought: null, crops_supplied: cropIds(["Rice", "Maize", "Wheat", "Potato", "Lentil (Musuro)"]), rating_avg: null,
    },
    {
      business_name: "Muktinath Krishi Company Ltd. (MKCL)", vendor_type: "input_supplier",
      district_id: districtId("Kathmandu"), contact_info: "Basundhara, Ring Road, Kathmandu — NEPSE-listed (symbol: MKCL), a Muktinath Bikas Bank subsidiary. Seeds, fertilizers, crop-protection chemicals, technical guidance.",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Muktinath Krishi Company Ltd. (MKCL)", vendor_type: "equipment_supplier",
      district_id: districtId("Kathmandu"), contact_info: "Basundhara, Ring Road, Kathmandu — mini-tillers, power weeders, and other agriculture/livestock equipment.",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Krishighar", vendor_type: "input_supplier",
      district_id: null, contact_info: "Online wholesale portal for agro-medicine, veterinary medicine & agro tools — krishighar.com.np",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Krishi Bajar", vendor_type: "input_supplier",
      district_id: null, contact_info: "Online marketplace/directory connecting farmers to agrovets and listings for crops, manures, cattle, used machinery — krishibajar.com (a directory, not a single seller)",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "NMS Agro Pvt. Ltd.", vendor_type: "input_supplier",
      district_id: null, contact_info: "Distributes Bayer Cropscience crop-protection products and Neem India organic treatments — listed on krishibajar.com",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Hardwarepasal", vendor_type: "equipment_supplier",
      district_id: districtId("Kathmandu"), contact_info: "Online hardware & irrigation-parts retailer, Kathmandu — hardwarepasal.com",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Grown in Nepal (by aQysta)", vendor_type: "input_supplier",
      district_id: null, contact_info: "Seeds, fertilizers, modern tools, pesticides — part of aQysta's afforestation + coffee income-diversification program — growninnepal.com",
      crops_bought: null, crops_supplied: cropIds(["Coffee"]), rating_avg: null,
    },
    {
      business_name: "Grown in Nepal (by aQysta)", vendor_type: "crop_buyer",
      district_id: null, contact_info: "Buys fresh fruits, vegetables, native herbs, and raw spices from partner farmers; technical training + catering/HORECA market access — growninnepal.com",
      crops_bought: cropIds(["Coffee", "Tomato", "Ginger"]), crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Nepal Coffee Federation (NCF)", vendor_type: "crop_buyer",
      district_id: null, contact_info: "Umbrella federation, ~2,000 members incl. District Coffee Producers Associations; connects producers to international markets, supplies machine/parts/technical aid — coffeenepal.org.np, sanskriti.acharya@coffeenepal.org.np",
      crops_bought: cropIds(["Coffee"]), crops_supplied: null, rating_avg: null,
    },
    // --- user-provided, not independently re-verified by us ---
    {
      business_name: "Panchkhal Agro Group", vendor_type: "input_supplier",
      district_id: districtId("Kavrepalanchok"), contact_info: "Kavre vegetable belt — six-company group distributing seeds, crop protection, and plant nutrition to local agrovets/cooperatives. (Not independently re-verified by us.)",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "NAFSCOL Krishiban Pvt. Ltd.", vendor_type: "input_supplier",
      district_id: null, contact_info: "Agroforestry setups, nursery materials, growth hormones, organic manures, rooftop farming setups. (Not independently re-verified by us.)",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Shalom Agriculture", vendor_type: "equipment_supplier",
      district_id: null, contact_info: "Irrigation systems and structural farming tools from certified hardware brands. (Not independently re-verified by us.)",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Thulo Marketplace", vendor_type: "equipment_supplier",
      district_id: null, contact_info: "Business directory of 110+ physical storefronts across Nepal selling farm machinery, feed, and plant bulbs — a directory, not a single seller. (Not independently re-verified by us.)",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Machine Pasal", vendor_type: "equipment_supplier",
      district_id: null, contact_info: "Online catalog of food-processing plants, power tools, water pumps, and feed-milling machines. (Not independently re-verified by us.)",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Krishihub Nepal", vendor_type: "crop_buyer",
      district_id: null, contact_info: "Buys 100% certified organic farm produce, distributed within 24 hours of harvest; also provides agritech training + supply logistics. (Not independently re-verified by us.)",
      crops_bought: null, crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Organic Venture Nepal", vendor_type: "crop_buyer",
      district_id: null, contact_info: "Buys buckwheat (Faper), cow ghee, and Timur from smallholder communities; provides organic-input and sustainability counseling. (Not independently re-verified by us.)",
      crops_bought: cropIds(["Buckwheat (Faper)", "Milk (Dairy Products)"]), crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "Original Organic Farm", vendor_type: "crop_buyer",
      district_id: null, contact_info: "Structured maize/staple-crop buyback partnerships (e.g. with Belaka Municipality). (Not independently re-verified by us.)",
      crops_bought: cropIds(["Maize"]), crops_supplied: null, rating_avg: null,
    },
    {
      business_name: "The Farm Shop KTM", vendor_type: "crop_buyer",
      district_id: districtId("Kathmandu"), contact_info: "Buys artisanal cheeses, raw honey, organic vegetables, and specialty grains for fair-trade urban delivery. (Not independently re-verified by us.)",
      crops_bought: cropIds(["Milk (Dairy Products)", "Honey (Beekeeping)"]), crops_supplied: null, rating_avg: null,
    },
  ];
  // vendors.crops_supplied only exists once migration 0007 is applied — probe
  // for it so the OTHER 18+ real vendor rows aren't all blocked by one
  // missing column on rows that don't even use it.
  const hasCropsSupplied = !(await supabase.from("vendors").select("crops_supplied").limit(1)).error;
  if (!hasCropsSupplied) console.log("  (vendors.crops_supplied not found yet — apply migration 0007, then re-run this script to fill it in)");

  for (const v of vendorRows) {
    const payload = hasCropsSupplied ? v : Object.fromEntries(Object.entries(v).filter(([k]) => k !== "crops_supplied"));
    const { data: existing } = await supabase.from("vendors").select("id").eq("business_name", v.business_name).eq("vendor_type", v.vendor_type).maybeSingle();
    if (existing) fail(`update vendor "${v.business_name}"`, (await supabase.from("vendors").update(payload).eq("id", existing.id)).error);
    else fail(`insert vendor "${v.business_name}"`, (await supabase.from("vendors").insert(payload)).error);
  }
  // No vendor_equipment rows: we couldn't verify which specific catalog item
  // any of these vendors actually stocks at what price — better to leave
  // that section showing "no vendors listed yet" than fabricate a
  // price/product link nobody has confirmed.

  console.log("Crop <-> equipment links (needs migration 0007 — reports an error and continues if not yet applied)...");
  const { data: equipmentForLinking } = await supabase.from("equipment").select("id, name");
  const equipmentIdByName = (name) => equipmentForLinking?.find((e) => e.name === name)?.id;
  const cropEquipmentRows = [
    ["Coffee", "Solar Dryer (Post-Harvest)", "Drying coffee cherries/parchment post-harvest."],
    ["Coffee", "Drip Irrigation Kit (per Ropani)", "Irrigating young coffee plants during establishment."],
    ["Coffee", "IoT Soil-Moisture Sensor Kit", "Managing soil moisture under shade-grown coffee."],
    ["Rice", "Mini-Tiller (Power Tiller, Walk-Behind)", "Land preparation on small/terraced paddy plots."],
    ["Rice", "Agricultural Spraying Drone", "Pest/fertilizer spraying over paddy fields."],
    ["Maize", "Mini-Tiller (Power Tiller, Walk-Behind)", "Land preparation on hill maize plots."],
    ["Wheat", "Mini-Tiller (Power Tiller, Walk-Behind)", "Land preparation after rice/maize harvest."],
    ["Potato", "Mini-Tiller (Power Tiller, Walk-Behind)", "Land prep and ridging for potato beds."],
    ["Potato", "Drip Irrigation Kit (per Ropani)", "Consistent moisture for tuber development."],
    ["Tomato", "Small Greenhouse / Polyhouse Kit", "Season extension and protection from hail/erratic rain."],
    ["Tomato", "Drip Irrigation Kit (per Ropani)", "Water-efficient irrigation for tunnel/polyhouse tomato."],
    ["Cauliflower", "Small Greenhouse / Polyhouse Kit", "Nursery-stage protection before transplanting."],
    ["Cabbage", "Small Greenhouse / Polyhouse Kit", "Nursery-stage protection before transplanting."],
    ["Ginger", "Solar Dryer (Post-Harvest)", "Drying ginger for higher-value dried/powdered product."],
    ["Chilli (Dry)", "Solar Dryer (Post-Harvest)", "Drying chilli for the dry/wholesale market."],
    ["Turmeric", "Solar Dryer (Post-Harvest)", "Drying turmeric rhizomes before grinding."],
  ]
    .map(([crop, equipmentName, notes]) => ({ crop_id: cropId(crop), equipment_id: equipmentIdByName(equipmentName), notes }))
    .filter((r) => r.crop_id && r.equipment_id);
  if (cropEquipmentRows.length > 0) {
    fail("crop_equipment", (await supabase.from("crop_equipment").upsert(cropEquipmentRows, { onConflict: "crop_id,equipment_id" })).error);
  } else {
    fail("crop_equipment", new Error("no rows resolved — is migration 0007 applied, and did the equipment lookup run first?"));
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
