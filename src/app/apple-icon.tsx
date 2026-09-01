import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon — Apple applies its own rounding, so no radius here. */
export default function AppleIcon() {
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
        }}
      >
        <div style={{ fontSize: 100, fontWeight: 700, color: "#f1f7f3" }}>K</div>
      </div>
    ),
    size
  );
}
