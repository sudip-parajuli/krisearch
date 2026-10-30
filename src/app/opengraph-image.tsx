import { ImageResponse } from "next/og";
export const alt =
  "Krisearch: Agricultural information and community knowledge for Nepal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#102d20",
          color: "#f5f5e9",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#b4d8a8" }}>
          KRISEARCH / NEPAL AGRICULTURE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 100, fontWeight: 700 }}>Krisearch</div>
          <div style={{ fontSize: 38 }}>Grow knowledge. Share experience.</div>
        </div>
        <div style={{ display: "flex", fontSize: 25, color: "#c9d9c8" }}>
          Crops · Market records · Weather · Farmer questions
        </div>
      </div>
    ),
    size,
  );
}
