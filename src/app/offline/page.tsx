import { OfflineClient } from "@/components/OfflineClient";

// Static fallback shown by the service worker when a page isn't cached and
// the network request fails. No data fetching — this must render with zero
// network access.
export default function OfflinePage() {
  return <OfflineClient />;
}
