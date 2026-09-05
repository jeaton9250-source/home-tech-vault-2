import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#f7f5f1",
          color: "#152335",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* BACKGROUND IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=90"
          alt=""
          width="1200"
          height="630"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(247,243,236,0.98) 0%, rgba(247,243,236,0.92) 42%, rgba(247,243,236,0.30) 100%)",
          }}
        />

        {/* CONTENT */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 36,
            }}
          >
            Home Tech Vault
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 74,
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
              maxWidth: 650,
            }}
          >
            <div>Your home</div>
            <div>has a memory.</div>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Arial, sans-serif",
              fontSize: 24,
              lineHeight: 1.45,
              color: "#4e5d6d",
              maxWidth: 650,
              marginTop: 34,
            }}
          >
            Manuals, warranties, receipts, maintenance and the useful
            history of your home — together in one place.
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Arial, sans-serif",
              fontSize: 18,
              fontWeight: 700,
              marginTop: 38,
              background: "#152335",
              color: "white",
              padding: "16px 24px",
              borderRadius: 999,
              width: "fit-content",
            }}
          >
            hometechvault.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
