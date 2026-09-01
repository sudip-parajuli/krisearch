import { ImageResponse } from "next/og";

/** Generated PWA icon (512x512) — same mark as icons/192, larger for splash screens / app lists. */
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
          borderRadius: 108,
        }}
      >
        <div
          style={{
            fontSize: 288,
            fontWeight: 700,
            color: "#f1f7f3",
          }}
        >
          K
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
