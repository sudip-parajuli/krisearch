"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureSession, applyGuestIdentity } from "@/lib/auth";
import { GuestIdentityFields } from "./GuestIdentityFields";
import type { Crop, District, PostType, Tag } from "@/types/database";

const postTypeOptions: { value: PostType; label: string; icon: string }[] = [
  { value: "question", label: "Question", icon: "❓" },
  { value: "disease_pest_report", label: "Pest / Disease report", icon: "🐛" },
  { value: "fertilizer_tip", label: "Fertilizer tip", icon: "🌱" },
  { value: "market_price_report", label: "Market price report", icon: "💰" },
  { value: "success_story", label: "Success story", icon: "🏆" },
  { value: "general_discussion", label: "General discussion", icon: "💬" },
  { value: "equipment_review", label: "Equipment review", icon: "🚜" },
];

export function NewPostForm({
  crops,
  districts,
  tags,
}: {
  crops: Crop[];
  districts: District[];
  tags: Tag[];
}) {
  const router = useRouter();
  const [type, setType] = useState<PostType>("question");
  const [cropId, setCropId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const user = await ensureSession(supabase).catch((err) => {
      setError(err.message);
      return null;
    });
    if (!user) {
      setUploading(false);
      return;
    }

    for (const file of Array.from(files)) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("post-images").upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data: publicUrl } = supabase.storage.from("post-images").getPublicUrl(path);
      setImages((prev) => [...prev, publicUrl.publicUrl]);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    let user;
    try {
      user = await ensureSession(supabase); // no login screen — starts a guest session if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start a session.");
      setSubmitting(false);
      return;
    }
    await applyGuestIdentity(supabase, user.id, { name: guestName, contact: guestContact });

    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        type,
        crop_id: cropId ? Number(cropId) : null,
        district_id: districtId ? Number(districtId) : null,
        title: title.trim(),
        body: body.trim(),
        image_urls: images.length ? images : null,
      })
      .select("id")
      .single();

    if (insertError || !post) {
      setError(insertError?.message ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    const tagNames = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    for (const name of tagNames) {
      let tagId = tags.find((t) => t.name === name)?.id;
      if (!tagId) {
        const { data: newTag } = await supabase.from("tags").insert({ name }).select("id").single();
        tagId = newTag?.id;
      }
      if (tagId) {
        await supabase.from("post_tags").insert({ post_id: post.id, tag_id: tagId });
      }
    }

    // Fire-and-forget AI safety check — never blocks navigation, and a
    // missing/failed check just leaves the post with no badge, not an error.
    fetch("/api/ai/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", id: post.id }),
    }).catch(() => {});

    router.push(`/post/${post.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Post type</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {postTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                type === opt.value
                  ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              <div className="text-lg">{opt.icon}</div>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Crop</label>
          <select
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">— none —</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">District</label>
          <select
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">— none —</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="e.g. Yellow spots on tomato leaves — what is this?"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Describe what you're seeing, what you've tried, and any details that might help."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Photos (helpful for pest/disease reports)</label>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="text-sm" />
        {uploading && <p className="mt-1 text-xs text-neutral-400">Uploading...</p>}
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Tags (comma-separated)</label>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="blight, urgent, organic"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Not signed in? No problem</label>
        <GuestIdentityFields name={guestName} onNameChange={setGuestName} contact={guestContact} onContactChange={setGuestContact} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {submitting ? "Posting..." : "Post to community"}
      </button>
    </form>
  );
}
