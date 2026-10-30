import { expandSearchTerms, normalizeSearchQuery } from "@/lib/search-synonyms";
export function mentionsCrop(crop: {name_en:string;name_np:string|null}, question:string) {
 const query=normalizeSearchQuery(question).toLowerCase();
 // Nepali case suffixes are attached to the crop noun (गोलभेडाको, धानमा).
 const nepali=crop.name_np ? normalizeSearchQuery(crop.name_np) : "";
 if(nepali.length > 1 && /[\u0900-\u097f]/.test(nepali) && query.includes(nepali)) return true;
 const terms=[query,...query.split(/\s+/).filter(t=>t.length>2)].flatMap(t=>[t,...expandSearchTerms(t)]).filter(Boolean);
 return terms.some(term=>`${crop.name_en} ${crop.name_np ?? ""}`.toLowerCase().includes(term));
}
