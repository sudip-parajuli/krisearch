import { pageMetadata } from "@/lib/seo";
import { SourceUpdates } from "@/components/SourceUpdates";

export default function UpdatesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Source updates · स्रोत अपडेट</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Public agricultural notices collected from approved sources. Open the
          original notice to check its publication date, eligibility and
          deadlines.
        </p>
      </header>
      <SourceUpdates limit={30} />
    </div>
  );
}

export const metadata = pageMetadata("आधिकारिक कृषि सूचना · Source updates", "स्वीकृत स्रोतबाट संकलित कृषि सूचना। Collection dates are separate from publication dates; check the original notice.", "/updates");
