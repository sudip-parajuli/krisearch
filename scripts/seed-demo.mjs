#!/usr/bin/env node
// Seeds demo content: fake farmer accounts + posts + comments + votes, so a
// first-time visitor sees an active community instead of empty states.
//
// Uses the Supabase Admin API (auth.admin.createUser) rather than a raw SQL
// insert into auth.users — safer, since GoTrue owns that table's exact
// column requirements and a hand-written insert can silently produce a
// broken user.
//
// All demo accounts use @demo.krisearch.local emails and share one obvious
// placeholder password — they're not meant to be real, usable logins, just
// display content. Every row this script creates is identifiable and
// removable later (see scripts/remove-demo.mjs).
//
// Usage: node scripts/seed-demo.mjs
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local (parsed manually below — no dotenv dependency needed for a
// one-off script).

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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "krisearch-demo-2026!";

const USERS = [
  { key: "sita", name: "सीता थापा", email: "sita.thapa@demo.krisearch.local", district: "Kaski", role: "farmer", bio: "काफल टार, पोखरामा टमाटर र आलु खेती गर्छु।", crops: ["Tomato", "Potato"] },
  { key: "ram", name: "राम बहादुर के.सी.", email: "ram.kc@demo.krisearch.local", district: "Chitwan", role: "farmer", bio: "चितवनमा धान र मकै खेती, १५ वर्षदेखि।", crops: ["Rice", "Maize"] },
  { key: "gita", name: "गीता शर्मा", email: "gita.sharma@demo.krisearch.local", district: "Ilam", role: "farmer", bio: "इलाममा चिया र अदुवा खेती गर्ने किसान।", crops: ["Tea", "Ginger"] },
  { key: "krishna", name: "कृष्ण पौडेल", email: "krishna.poudel@demo.krisearch.local", district: "Rupandehi", role: "dealer", bio: "बुटवलमा तरकारी संकलन र थोक व्यापार।", crops: [] },
  { key: "maya", name: "माया गुरुङ", email: "maya.gurung@demo.krisearch.local", district: "Kailali", role: "farmer", bio: "कैलालीमा गहुँ र मुसुरो खेती गर्छु।", crops: ["Wheat", "Lentil (Musuro)"] },
  { key: "bishnu", name: "विष्णु अधिकारी", email: "bishnu.adhikari@demo.krisearch.local", district: "Kathmandu", role: "extension_officer", badge: "extension_officer", bio: "कृषि प्रसार अधिकृत, काठमाडौं कृषि ज्ञान केन्द्र।", crops: [] },
  { key: "hari", name: "हरि प्रसाद कोइराला", email: "hari.koirala@demo.krisearch.local", district: "Gorkha", role: "dealer", badge: "agrovet", bio: "गोर्खा एग्रोभेट सेन्टर सञ्चालक — मल, बीउ, औषधि।", crops: [] },
  { key: "sunita", name: "सुनिता राई", email: "sunita.rai@demo.krisearch.local", district: "Jhapa", role: "farmer", bio: "झापामा धान र उखु खेती गर्ने किसान।", crops: ["Rice", "Sugarcane"] },
  { key: "dipesh", name: "दिपेश तामाङ", email: "dipesh.tamang@demo.krisearch.local", district: "Sindhupalchok", role: "farmer", bio: "युवा किसान — आलु र काउली खेतीमा नयाँ प्रविधि प्रयोग गर्न रुचि।", crops: ["Potato", "Cauliflower"] },
  { key: "anita", name: "अनिता मगर", email: "anita.magar@demo.krisearch.local", district: "Kavrepalanchok", role: "farmer", bio: "काभ्रेमा टमाटर र बन्दा खेती।", crops: ["Tomato", "Cabbage"] },
];

const POSTS = [
  {
    author: "sita", type: "disease_pest_report", crop: "Tomato", district: "Kaski", tags: ["blight", "urgent"],
    title: "टमाटरको पातमा खैरो दाग, चाँडै फैलिँदैछ", daysAgo: 2,
    body: "मेरो टमाटर बारीमा पातहरूमा खैरो/कालो गोलो दाग देखिन थालेको ३ दिन भयो र अरू बोटमा पनि फैलिँदैछ। भर्खरै पानी परेको थियो। यो ब्लाइट हो कि अरू केही? के गर्नु पर्छ?",
  },
  {
    author: "anita", type: "disease_pest_report", crop: "Cabbage", district: "Kavrepalanchok", tags: ["pest"],
    title: "बन्दागोबीको बोटमा सानो हरियो किरा टन्न लागेको", daysAgo: 5,
    body: "बन्दागोबीका पातहरूमा सानो हरियो कमिला जस्तो किरा (aphid) धेरै मात्रामा टन्न लागेको छ। जैविक उपाय केही छ कि छैन?",
  },
  {
    author: "ram", type: "fertilizer_tip", crop: "Maize", district: "Chitwan", tags: ["organic", "soil-health"],
    title: "मकैको लागि घरेलु जैविक मल बनाउने तरिका (गाईको गोबर + दाल)", daysAgo: 10,
    body: "म वर्षौंदेखि गाईको गोबर, दाल पिठो, र गुड मिसाएर १५ दिन कुहाएर मकैमा प्रयोग गर्दै आएको छु। रासायनिक मलको खर्च आधाभन्दा बढी घटेको छ र उत्पादन पनि राम्रो छ। विधि: १० किलो गोबर + १ किलो दाल पिठो + आधा किलो गुड + २० लिटर पानी, दैनिक हल्लाउने, १०-१५ दिनमा तयार।",
  },
  {
    author: "gita", type: "fertilizer_tip", crop: "Tea", district: "Ilam", tags: ["organic"],
    title: "चिया बगानमा भर्मी कम्पोष्ट प्रयोगको अनुभव", daysAgo: 15,
    body: "भर्मी कम्पोष्ट (केंचुवा मल) प्रयोग गरेपछि चियाको पात हरियो र बाक्लो भएको महसुस गरेको छु। वर्षको २ पटक (चैत र भदौतिर) प्रयोग गर्छु।",
  },
  {
    author: "maya", type: "question", crop: "Wheat", district: "Kailali", tags: [],
    title: "गहुँ छर्ने उत्तम समय कहिले हो, कैलालीमा?", daysAgo: 20,
    body: "यस वर्ष मनसुन ढिलो सकियो। कैलालीको हाम्रो क्षेत्रमा गहुँ छर्ने ठीक समय कहिले हुन्छ? अलि ढिलो भइसक्यो कि अझै ठीकै छ?",
  },
  {
    author: "dipesh", type: "question", crop: "Potato", district: "Sindhupalchok", tags: [],
    title: "आलुमा ड्रिप सिँचाइ प्रयोग गर्दा फाइदा हुन्छ?", daysAgo: 8,
    body: "सानो जग्गा (५ रोपनी) मा आलु खेती गर्छु। ड्रिप सिँचाइ किट किन्दा वास्तवमा उत्पादन बढ्छ कि पानी मात्र जोगिन्छ? लगानी उठ्छ कि उठ्दैन?",
  },
  {
    author: "sunita", type: "market_price_report", crop: "Rice", district: "Jhapa", tags: [],
    title: "झापाको स्थानीय बजारमा धानको भाउ अहिले कस्तो छ", daysAgo: 3,
    body: "यस हप्ता झापाको स्थानीय पैकारीले प्रति मन रु. ३,१०० मा धान लगिरहेका छन्। अघिल्लो हप्ताभन्दा अलि बढी हो। अरू ठाउँमा कति चलिरहेको छ?",
  },
  {
    author: "krishna", type: "market_price_report", crop: "Tomato", district: "Rupandehi", tags: ["good-buyer"],
    title: "बुटवल क्षेत्रमा टमाटर संकलन गर्दैछौं — उचित मूल्य", daysAgo: 4,
    body: "बुटवल र आसपासका किसानहरूबाट टमाटर सिधै फार्मबाट संकलन गर्दैछौं। गुणस्तर अनुसार उचित मूल्य दिन्छौं। सम्पर्क गर्नुहोस्।",
  },
  {
    author: "ram", type: "success_story", crop: "Rice", district: "Chitwan", tags: ["success-story"],
    title: "SRI विधिबाट धान खेती गरेर उत्पादन ३० प्रतिशत बढाएको अनुभव", daysAgo: 25,
    body: "गत वर्षदेखि SRI (System of Rice Intensification) विधि अपनाएपछि उस्तै जग्गामा उत्पादन झण्डै ३० प्रतिशत बढेको छ, र बीउ पनि कम लाग्छ। सुरुमा गाह्रो लागे पनि अहिले अभ्यस्त भइसकें।",
  },
  {
    author: "gita", type: "success_story", crop: "Ginger", district: "Ilam", tags: ["success-story"],
    title: "अदुवा खेतीबाट यस वर्ष राम्रो आम्दानी", daysAgo: 18,
    body: "यस वर्ष अदुवाको भाउ राम्रो पाइयो र उत्पादन पनि ठीकै भयो। मल्चिङ प्रयोग गरेपछि झारपात व्यवस्थापनमा धेरै सजिलो भयो।",
  },
  {
    author: "dipesh", type: "equipment_review", crop: "Potato", district: "Sindhupalchok", equipment: "Mini-Tiller (Power Tiller, Walk-Behind)", tags: [],
    title: "मिनी टिलर किनेको ६ महिना भयो — साँच्चै भन्ने अनुभव", daysAgo: 30,
    body: "५ रोपनी जग्गाको लागि मिनी टिलर किनें। जोत्ने समय धेरै घटेको छ, तर ठाडो भिरालो जग्गामा अलि गाह्रो हुन्छ। भाडामा लगाएर पनि केही आम्दानी भइरहेको छ।",
  },
  {
    author: "sita", type: "equipment_review", crop: "Tomato", district: "Kaski", equipment: "Small Greenhouse / Polyhouse Kit", tags: [],
    title: "पोलिहाउसमा टमाटर खेती गरेको पहिलो अनुभव", daysAgo: 12,
    body: "यस वर्ष पहिलो पटक सानो पोलिहाउस राखेर टमाटर खेती गरें। असिनाबाट जोगियो र समय अगावै फल आयो, तर भित्र गर्मी नियन्त्रण गर्न अलि ध्यान दिनु पर्छ।",
  },
  {
    author: "krishna", type: "equipment_review", crop: null, district: "Rupandehi", equipment: "Agricultural Spraying Drone", tags: [],
    title: "ड्रोन स्प्रे सेवा प्रयोग गरेको अनुभव — समय धेरै बच्यो", daysAgo: 7,
    body: "यस पटक आफ्नै ट्र्याक्टर/नाप्सक भन्दा ड्रोन सेवा लिएर स्प्रे गरायौं। १० बिघा जति क्षेत्रमा साढे २ घण्टामा सकियो, जुन म्यानुअलमा दिनभर लाग्थ्यो।",
  },
  {
    author: "anita", type: "general_discussion", crop: null, district: "Kavrepalanchok", tags: [],
    title: "यो वर्षको असिना/असामान्य मौसमबारे अरूको अनुभव के छ?", daysAgo: 6,
    body: "यस वर्ष असामान्य समयमा असिना परेर धेरै किसानको बाली बिग्रियो भन्ने सुनेको छु। तपाईंहरूको क्षेत्रमा कस्तो भयो? कसरी जोगाउनुभयो?",
  },
  {
    author: "maya", type: "general_discussion", crop: "Lentil (Musuro)", district: "Kailali", tags: [],
    title: "मुसुरो खेतीमा कसैले नयाँ जात प्रयोग गर्नुभएको छ?", daysAgo: 14,
    body: "पुरानै जातको मुसुरो प्रयोग गर्दै आएको छु। कसैले नयाँ रोग-प्रतिरोधी जात प्रयोग गर्नुभएको छ भने अनुभव सुन्न मन छ।",
  },
  {
    author: "hari", type: "fertilizer_tip", crop: null, district: "Gorkha", tags: ["soil-health"],
    title: "माटो परीक्षण नगरी रासायनिक मल नहाल्नुहोस् — किन महत्त्वपूर्ण छ", daysAgo: 22,
    body: "धेरै किसानले अन्दाजले मल हाल्नुहुन्छ, जसले गर्दा माटोको स्वास्थ्य बिग्रन सक्छ। नजिकैको कृषि ज्ञान केन्द्रमा निःशुल्क माटो परीक्षण हुन्छ — त्यसपछि मात्र मल तय गर्नुहोस्।",
  },
  {
    author: "bishnu", type: "general_discussion", crop: null, district: "Kathmandu", tags: [],
    title: "यस वर्ष प्रदेशस्तरीय कृषि अनुदानका लागि आवेदन खुलेको छ", daysAgo: 9,
    body: "यस वर्षको उपकरण अनुदान कार्यक्रमको आवेदन प्रक्रिया सुरु भएको छ। नजिकैको कृषि ज्ञान केन्द्रमा सम्पर्क गरी विवरण बुझ्न सकिन्छ। Schemes पेजमा हेर्नुहोस्।",
  },
  {
    author: "sunita", type: "question", crop: "Sugarcane", district: "Jhapa", tags: [],
    title: "उखुमा सेतो झुसिल्किरा (white grub) नियन्त्रण गर्ने उपाय?", daysAgo: 11,
    body: "उखुको जरामा सेतो झुसिल्किराले क्षति पुर्‍याइरहेको छ। रासायनिक र जैविक दुवै उपाय जान्न चाहन्छु।",
  },
];

// Answers/comments — some flagged with a demo AI verdict to show the badge
// system, some marked as the post's best answer.
const COMMENTS = [
  { postTitle: "टमाटरको पातमा खैरो दाग, चाँडै फैलिँदैछ", author: "hari", body: "यो लक्षण Early Blight जस्तो देखिन्छ। कपर-अक्सीक्लोराइड आधारित फफूँदनाशक ७-१० दिनको फरकमा छर्नुहोस्, र पातहरू हटाएर जलाइदिनुहोस् जसले फैलन नदेओस्।", best: true, aiVerdict: "safe", aiRationale: "Standard copper-based fungicide advice for early blight, applied at a normal interval — a widely accepted practice." },
  { postTitle: "टमाटरको पातमा खैरो दाग, चाँडै फैलिँदैछ", author: "sita", body: "मैले पनि उस्तै समस्या भोगेको थिएँ, बिहान चिसोमा पानी नछर्कने गरेपछि केही सुधार भयो।" },
  { postTitle: "बन्दागोबीको बोटमा सानो हरियो किरा टन्न लागेको", author: "bishnu", body: "साबुन-पानीको छिटो घोल (न्युट्रल साबुन १ चम्चा + १ लिटर पानी) छर्केर हेर्नुहोस्, प्रायः aphid मा प्रभावकारी हुन्छ। धेरै भए नीम तेल प्रयोग गर्नुहोस्।", best: true, aiVerdict: "safe", aiRationale: "Soap-water spray and neem oil are common, low-risk organic aphid controls." },
  { postTitle: "मकैको लागि घरेलु जैविक मल बनाउने तरिका (गाईको गोबर + दाल)", author: "dipesh", body: "राम्रो जानकारी! मैले पनि यसपाली प्रयोग गरेर हेर्छु।" },
  { postTitle: "आलुमा ड्रिप सिँचाइ प्रयोग गर्दा फाइदा हुन्छ?", author: "hari", body: "५ रोपनीमा सुरुमा लगानी अलि बढी लाग्छ, तर पानी लगभग ४०% जोगिन्छ र उत्पादन पनि स्थिर हुन्छ। साना प्लटमा २-३ सिजनमै लगानी उठ्छ भन्ने अनुभव छ।", best: true },
  { postTitle: "उखुमा सेतो झुसिल्किरा (white grub) नियन्त्रण गर्ने उपाय?", author: "gita", body: "मैले सुनेको उपाय: बिचल्लीको खोस्रो जमिनमा मिसाउनुहोस्, अलि प्रभावकारी हुन्छ भन्छन् — तर म आफैं प्रयोग गरेको छैन, पक्का भन्न सक्दिनँ।", aiVerdict: "unverified", aiRationale: "Commenter themselves says they haven't verified this; not enough information to judge safety or efficacy." },
  { postTitle: "उखुमा सेतो झुसिल्किरा (white grub) नियन्त्रण गर्ने उपाय?", author: "krishna", body: "धेरै मात्रामा क्लोरपाइरिफोस हाल्नुहोस्, तुरुन्तै सबै मर्छ।", aiVerdict: "danger", aiRationale: "Chlorpyrifos is a restricted/banned pesticide in many contexts and 'heavy application' language suggests unsafe overdosing — real risk to health and soil." },
  { postTitle: "गहुँ छर्ने उत्तम समय कहिले हो, कैलालीमा?", author: "bishnu", body: "यस वर्ष मनसुन ढिलो भएकोले नोभेम्बर दोस्रो हप्तासम्म छर्दा पनि ठीकै हुन्छ, तर त्यसपछि ढिलो हुन्छ।", best: true },
  { postTitle: "ड्रोन स्प्रे सेवा प्रयोग गरेको अनुभव — समय धेरै बच्यो", author: "dipesh", body: "मूल्य कति पर्‍यो प्रति बिघा?" },
  { postTitle: "मिनी टिलर किनेको ६ महिना भयो — साँच्चै भन्ने अनुभव", author: "ram", body: "भिरालो जग्गामा गाह्रो हुन्छ भन्ने सहमत छु, समथर जग्गामा भने राम्रै चल्छ।" },
];

const VOTES_PER_POST_RANGE = [1, 9]; // random upvote-heavy score per post

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Looking up reference data...");
  const [{ data: districts }, { data: crops }, { data: equipment }, { data: tags }] = await Promise.all([
    supabase.from("districts").select("id, name"),
    supabase.from("crops").select("id, name_en"),
    supabase.from("equipment").select("id, name"),
    supabase.from("tags").select("id, name"),
  ]);
  const districtByName = new Map(districts.map((d) => [d.name, d.id]));
  const cropByName = new Map(crops.map((c) => [c.name_en, c.id]));
  const equipmentByName = new Map(equipment.map((e) => [e.name, e.id]));
  const tagByName = new Map(tags.map((t) => [t.name, t.id]));

  console.log(`Creating ${USERS.length} demo users...`);
  const userIdByKey = new Map();
  for (const u of USERS) {
    const { data: existingList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = existingList?.users.find((x) => x.email === u.email);
    let userId = existing?.id;
    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { demo_seed: true },
      });
      if (error) {
        console.error(`  ! Failed to create ${u.email}:`, error.message);
        continue;
      }
      userId = data.user.id;
    }
    userIdByKey.set(u.key, userId);

    await supabase.from("profiles").upsert({
      id: userId,
      display_name: u.name,
      role: u.role,
      district_id: districtByName.get(u.district) ?? null,
      verified_badge: u.badge ?? null,
      crops_grown: u.crops.map((c) => cropByName.get(c)).filter(Boolean),
      bio: u.bio,
    });
    console.log(`  ✓ ${u.name} (${u.email})`);
  }

  console.log(`Creating ${POSTS.length} posts...`);
  const postIdByTitle = new Map();
  for (const p of POSTS) {
    const authorId = userIdByKey.get(p.author);
    if (!authorId) continue;
    const createdAt = new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await supabase.from("posts").select("id").eq("title", p.title).maybeSingle();
    let postId = existing?.id;
    if (!postId) {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: authorId,
          type: p.type,
          crop_id: p.crop ? cropByName.get(p.crop) ?? null : null,
          equipment_id: p.equipment ? equipmentByName.get(p.equipment) ?? null : null,
          district_id: districtByName.get(p.district) ?? null,
          title: p.title,
          body: p.body,
          created_at: createdAt,
        })
        .select("id")
        .single();
      if (error) {
        console.error(`  ! Failed to create post "${p.title}":`, error.message);
        continue;
      }
      postId = data.id;

      for (const tagName of p.tags ?? []) {
        const tagId = tagByName.get(tagName);
        if (tagId) await supabase.from("post_tags").insert({ post_id: postId, tag_id: tagId });
      }

      // Organic-looking vote spread from a few of the other demo users.
      const voters = USERS.map((u) => u.key).filter((k) => k !== p.author);
      const voteCount = randInt(...VOTES_PER_POST_RANGE);
      for (let i = 0; i < Math.min(voteCount, voters.length); i++) {
        const voterId = userIdByKey.get(voters[i]);
        if (voterId) await supabase.from("votes").insert({ post_id: postId, user_id: voterId, value: 1 });
      }
    }
    postIdByTitle.set(p.title, postId);
  }

  console.log(`Creating ${COMMENTS.length} comments...`);
  for (const c of COMMENTS) {
    const postId = postIdByTitle.get(c.postTitle);
    const authorId = userIdByKey.get(c.author);
    if (!postId || !authorId) continue;

    const { data: existing } = await supabase
      .from("comments")
      .select("id")
      .eq("post_id", postId)
      .eq("author_id", authorId)
      .eq("body", c.body)
      .maybeSingle();
    if (existing) continue;

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: authorId,
        body: c.body,
        is_best_answer: !!c.best,
        ai_verdict: c.aiVerdict ?? null,
        ai_rationale: c.aiRationale ?? null,
        ai_checked_at: c.aiVerdict ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) {
      console.error(`  ! Failed to create comment on "${c.postTitle}":`, error.message);
      continue;
    }

    const voters = USERS.map((u) => u.key).filter((k) => k !== c.author);
    const voteCount = randInt(0, 5);
    for (let i = 0; i < Math.min(voteCount, voters.length); i++) {
      const voterId = userIdByKey.get(voters[i]);
      if (voterId) await supabase.from("votes").insert({ comment_id: comment.id, user_id: voterId, value: 1 });
    }
  }

  console.log("\nDone. Demo accounts use @demo.krisearch.local emails — run `node scripts/remove-demo.mjs` to remove them later.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
