/**
 * Query expansion for search — so "corn" finds "Maize", and a farmer typing
 * romanized Nepali ("makai", "kera", "syau") finds the same crop as someone
 * typing Devanagari ("मकै") or English ("maize"). Postgres ILIKE only does
 * substring matching, so without this, each of those is a different string
 * that never matches the others — this maps them onto one search.
 *
 * Each inner array is a group of interchangeable terms for one concept
 * (crop, livestock, or product). Kept lowercase; matching is done against a
 * lowercased, trimmed query.
 */
const SYNONYM_GROUPS: string[][] = [
  ["rice", "paddy", "dhan", "dhaan", "chamal", "धान", "चामल"],
  ["maize", "corn", "makai", "मकै"],
  ["wheat", "gahu", "gahoon", "गहुँ"],
  ["millet", "kodo", "finger millet", "कोदो"],
  ["buckwheat", "fapar", "phapar", "फापर"],
  ["potato", "aloo", "alu", "आलु"],
  ["tomato", "golbheda", "गोलभेडा"],
  ["cauliflower", "kauli", "काउली"],
  ["cabbage", "banda", "बन्दा"],
  ["onion", "pyaj", "प्याज"],
  ["carrot", "gajar", "गाजर"],
  ["mustard", "tori", "mustard oil", "तोरी"],
  ["lentil", "lentils", "musuro", "dal", "daal", "मुसुरो", "दाल"],
  ["chickpea", "chana", "gram", "चना"],
  ["sugarcane", "ukhu", "उखु"],
  ["ginger", "aduwa", "अदुवा"],
  ["chilli", "chili", "pepper", "khursani", "खुर्सानी"],
  ["cardamom", "alaichi", "elaichi", "अलैंची"],
  ["tea", "chiya", "चिया"],
  ["apple", "syau", "स्याउ"],
  ["banana", "kera", "केरा"],
  ["orange", "junar", "suntala", "citrus", "सुन्तला"],
  ["mushroom", "chyau", "च्याउ"],
  ["buffalo", "bhaisi", "भैंसी"],
  ["goat", "bakhra", "khasi", "boka", "बाख्रा"],
  ["coffee", "kafi", "कफी"],
  ["turmeric", "besar", "बेसार"],
  ["garlic", "lasun", "लसुन"],
  ["soybean", "soya", "soyabean", "bhatmas", "भटमास"],
  ["poultry", "chicken", "kukhura", "कुखुरा"],
  ["milk", "dairy", "dudh", "दूध"],
  ["egg", "eggs", "anda", "फुल", "अन्डा"],
  ["honey", "beekeeping", "maha", "मह"],
  ["cow", "gai", "गाई"],
  ["ghee", "घ्यू"],
  ["curd", "yogurt", "dahi", "दही"],
  ["meat", "masu", "मासु"],
];

const aliasIndex = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  for (const term of group) {
    aliasIndex.set(term, group);
  }
}

/** Given a raw search query, returns extra terms (other names for the same thing) to search alongside it. Empty if the query isn't a known alias. */
export function expandSearchTerms(query: string): string[] {
  const q = query.trim().toLowerCase();
  const group = aliasIndex.get(q);
  if (!group) return [];
  return group.filter((term) => term !== q);
}
