import { ImageResponse } from "next/og";

/** Generated PWA icon (192x192) — a simple sprout mark on the brand green, no external asset needed. */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2f6e4e",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            color: "#f1f7f3",
          }}
        >
          K
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
