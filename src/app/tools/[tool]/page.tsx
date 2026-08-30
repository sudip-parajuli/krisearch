import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getEquipmentBySlug,
  getSchemeById,
  getVendorEquipmentFor,
  getPosts,
} from "@/lib/data";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";

export default async function ToolDetailPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const equipment = await getEquipmentBySlug(slug);
  if (!equipment) notFound();

  const [scheme, vendorOfferings, posts] = await Promise.all([
    equipment.related_scheme_id ? getSchemeById(equipment.related_scheme_id) : Promise.resolve(null),
    getVendorEquipmentFor(equipment.id),
    getPosts({ equipmentId: equipment.id }, "new", 30),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SupabaseSetupNotice />

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{equipment.name}</h1>
          <AvailabilityBadge status={equipment.availability_status} />
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
            {equipment.scope === "global" ? "🌍 Global / emerging" : "🇳🇵 Nepal"}
          </span>
        </div>
        {equipment.description && <p className="text-sm text-neutral-600 dark:text-neutral-400">{equipment.description}</p>}
        {equipment.how_it_helps && (
          <p className="mt-2 rounded-lg bg-green-50 p-3 text-sm text-green-900 dark:bg-green-950 dark:text-green-200">
            💡 {equipment.how_it_helps}
          </p>
        )}
        <p className="mt-2 text-xs text-neutral-400">
          {equipment.source_url ? (
            <>
              Source:{" "}
              <a href={equipment.source_url} target="_blank" rel="noreferrer" className="underline">
                {new URL(equipment.source_url).hostname.replace(/^www\./, "")}
              </a>
            </>
          ) : (
            "Source: unverified estimate — check before relying on this price"
          )}{" "}
          · Last checked {equipment.last_verified}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Purchase price</p>
          <p className="mt-1 text-lg font-bold">
            {equipment.purchase_price_min || equipment.purchase_price_max
              ? `NPR ${equipment.purchase_price_min?.toLocaleString()} – ${equipment.purchase_price_max?.toLocaleString()}`
              : "Not typically purchased"}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Rental / service price</p>
          <p className="mt-1 text-lg font-bold">
            {equipment.rental_price
              ? `NPR ${equipment.rental_price.toLocaleString()} ${equipment.rental_price_unit ?? ""}`
              : "Not commonly rented"}
          </p>
        </div>
      </div>

      {scheme && (
        <Link
          href="/schemes"
          className="block rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm hover:border-blue-400 dark:border-blue-900 dark:bg-blue-950"
        >
          <span className="font-semibold text-blue-800 dark:text-blue-300">🏛️ Related scheme: {scheme.title}</span>
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">Last verified {scheme.last_verified} — tap to view details</p>
        </Link>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">Vendors for this tool</h2>
        {vendorOfferings.length === 0 ? (
          <EmptyState icon="🏪" title="No vendors listed yet for this tool" />
        ) : (
          <div className="flex flex-col gap-2">
            {vendorOfferings.map((v) => (
              <div
                key={`${v.vendor_id}-${v.offering_type}`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div>
                  <p className="font-medium">{v.vendors?.business_name ?? "Vendor"}</p>
                  <p className="text-xs capitalize text-neutral-400">{v.offering_type}</p>
                </div>
                {v.price && (
                  <p className="font-semibold">
                    NPR {v.price.toLocaleString()} {v.price_unit}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Community reviews & experiences</h2>
          <Link href="/post/new" className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
            + Share a review
          </Link>
        </div>
        {posts.length === 0 ? (
          <EmptyState title="No reviews yet" body="Used this? Share what worked, what didn't, and real cost." />
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// No generateStaticParams here: equipment data needs the request-time,
// cookie-based server Supabase client, which isn't available at build time
// — render on demand instead (see the same note on /crops/[crop]).
