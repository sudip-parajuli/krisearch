import "server-only";

/**
 * Maps a scraped Nepali commodity name to one of our `crops.name_en` values.
 * Both source sites list many varieties per crop (e.g. 4 tomato rows); we
 * take the FIRST matching row per crop as its representative price, and the
 * caller stores the exact matched commodity name alongside the price so
 * which specific variety it came from is never hidden. Spelling of the same
 * word (e.g. गोलभेडा vs गोलभेंडा) genuinely differs between AMPIS and
 * Kalimati Market Board's own data entry — each crop lists every variant
 * spelling we've observed.
 *
 * Deliberately scoped to crops that actually appear in a wholesale
 * vegetable/fruit market table — grains, spices sold dried in bulk,
 * cash crops, and livestock aren't listed here and won't be matched
 * (that's correct: this source doesn't cover them).
 */
const CROP_PATTERNS: [cropNameEn: string, patterns: string[]][] = [
  ["Tomato", ["गोलभेडा", "गोलभेंडा"]],
  ["Potato", ["आलु"]],
  ["Onion", ["प्याज सुकेको", "सुकेको प्याज"]], // dry onion, not green onion (प्याज हरियो)
  ["Carrot", ["गाजर"]],
  ["Cabbage", ["बन्दा"]],
  ["Cauliflower", ["काउली"]],
  ["Mushroom (Button)", ["च्याउ"]],
  ["Apple", ["स्याउ"]],
  ["Banana", ["केरा"]],
  ["Ginger", ["अदुवा"]],
  ["Chilli (Dry)", ["सुकेको खुर्सानी", "खुर्सानी सुकेको"]],
];

export function matchCropForCommodity(commodity: string): string | null {
  for (const [cropNameEn, patterns] of CROP_PATTERNS) {
    if (patterns.some((p) => commodity.includes(p))) return cropNameEn;
  }
  return null;
}
