import NepaliDate from "nepali-date-converter";

const months = [
  "बैशाख|वैशाख|बैसाख|वैसाख",
  "जेठ|जेष्ठ",
  "असार|आषाढ",
  "साउन|श्रावण",
  "भदौ|भाद्र",
  "असोज|आश्विन",
  "कात्तिक|कार्तिक",
  "मंसिर|मार्ग",
  "पुस|पौष",
  "माघ",
  "फागुन|फाल्गुण|फाल्गुन",
  "चैत|चैत्र",
];
export function parseMarketDate(text: string): string | null {
  const normalized = text.replace(/[०-९]/g, (d) =>
    String(d.charCodeAt(0) - 0x966),
  );
  for (let month = 0; month < months.length; month++) {
    const match = normalized.match(
      new RegExp(`(?:${months[month]})\\s+(\\d{1,2})\\s*[,،]?\\s*(20\\d{2})`),
    );
    if (!match) continue;
    try {
      const bs = new NepaliDate(Number(match[2]), month, Number(match[1]));
      if (bs.getMonth() !== month || bs.getDate() !== Number(match[1]))
        return null;
      const ad = bs.getAD();
      return `${ad.year}-${String(ad.month + 1).padStart(2, "0")}-${String(ad.date).padStart(2, "0")}`;
    } catch {
      return null;
    }
  }
  return null;
}
export function nepalToday(now = new Date()) {
  return new Date(now.getTime() + 20700000).toISOString().slice(0, 10);
}
