#!/usr/bin/env node
// Removes everything scripts/seed-demo.mjs created: posts/comments/votes
// authored by @demo.krisearch.local accounts, then the accounts themselves
// (profiles cascade-delete automatically once the auth user is removed).
//
// Usage: node scripts/remove-demo.mjs

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

async function main() {
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  const demoUsers = (list?.users ?? []).filter((u) => u.email?.endsWith("@demo.krisearch.local"));

  if (demoUsers.length === 0) {
    console.log("No demo accounts found.");
    return;
  }

  const ids = demoUsers.map((u) => u.id);
  console.log(`Found ${ids.length} demo accounts. Deleting their content first...`);

  await supabase.from("votes").delete().in("user_id", ids);
  const { data: comments } = await supabase.from("comments").select("id").in("author_id", ids);
  if (comments?.length) await supabase.from("comments").delete().in("id", comments.map((c) => c.id));
  const { data: posts } = await supabase.from("posts").select("id").in("author_id", ids);
  if (posts?.length) {
    const postIds = posts.map((p) => p.id);
    await supabase.from("post_tags").delete().in("post_id", postIds);
    await supabase.from("comments").delete().in("post_id", postIds); // replies from real users on demo posts
    await supabase.from("votes").delete().in("post_id", postIds);
    await supabase.from("posts").delete().in("id", postIds);
  }

  console.log("Deleting demo accounts (profiles cascade automatically)...");
  for (const user of demoUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) console.error(`  ! Failed to delete ${user.email}:`, error.message);
    else console.log(`  ✓ removed ${user.email}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
