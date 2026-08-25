/* @jsxImportSource react */
import type { ReactNode } from "react";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const colors = {
  page: "#FAFAF8",
  navy: "#183B56",
  navyDark: "#172033",
  green: "#3BAF75",
  greenSoft: "#EAF8F0",
  muted: "#667085",
  border: "#E7E9EC",
  card: "#FFFFFF",
  cardMuted: "#EDF3F7",
  white: "#FFFFFF",
};

const navItems = [
  "Devices",
  "Documents",
  "Warranties",
  "Maintenance",
  "Home Wi-Fi",
] as const;

const devices = [
  { name: "Living Room TV", meta: "Apple · Living Room", online: true },
  { name: "MacBook Pro", meta: "Apple · Office", online: true },
  { name: "Doorbell Camera", meta: "Ring · Front Door", online: true },
  { name: "Wi-Fi Router", meta: "Eero · Networking", online: true },
  { name: "Smart Thermostat", meta: "Nest · Hallway", online: false },
] as const;

function LogoMark() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: colors.navy,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.white,
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        HT
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: colors.navyDark,
            letterSpacing: "-0.03em",
          }}
        >
          Home Tech Vault
        </span>
        <span
          style={{
            fontSize: 13,
            color: colors.muted,
          }}
        >
          Organize Your Home Technology
        </span>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 28,
        border: `1px solid ${colors.border}`,
        background: colors.card,
        boxShadow: "0 28px 70px -28px rgba(23, 32, 51, 0.35)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 18px",
          background: colors.cardMuted,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#D9DEE5",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#D9DEE5",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#D9DEE5",
          }}
        />
        <span
          style={{
            marginLeft: 8,
            fontSize: 13,
            color: colors.muted,
          }}
        >
          hometechvault.com
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "14px 18px 0",
          flexWrap: "wrap",
        }}
      >
        {navItems.map((item) => {
          const active = item === "Devices";

          return (
            <div
              key={item}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                color: active ? colors.white : colors.muted,
                background: active ? colors.navy : colors.page,
                border: active
                  ? "none"
                  : `1px solid ${colors.border}`,
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 14,
          padding: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: colors.muted,
              }}
            >
              Home Overview
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 24,
                fontWeight: 600,
                color: colors.navyDark,
                letterSpacing: "-0.03em",
              }}
            >
              Morgan Household
            </div>
          </div>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              background: colors.greenSoft,
              color: colors.navy,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            28 devices tracked
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
          }}
        >
          {[
            { label: "Devices", value: "28" },
            { label: "Documents", value: "46" },
            { label: "Warranties", value: "12" },
            { label: "Home Wi-Fi", value: "9" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                borderRadius: 18,
                border: `1px solid ${colors.border}`,
                background: colors.page,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: colors.muted,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 600,
                  color: colors.navyDark,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 20,
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
            flex: 1,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: colors.page,
              borderBottom: `1px solid ${colors.border}`,
              fontSize: 13,
              fontWeight: 600,
              color: colors.muted,
            }}
          >
            Recent devices
          </div>

          {devices.map((device, index) => (
            <div
              key={device.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom:
                  index < devices.length - 1
                    ? `1px solid ${colors.border}`
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: colors.navyDark,
                  }}
                >
                  {device.name}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                  }}
                >
                  {device.meta}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: device.online ? colors.green : colors.muted,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: device.online
                      ? colors.green
                      : "#C7CED8",
                  }}
                />
                {device.online ? "Online" : "Idle"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OgImageContent(): ReactNode {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${colors.page} 0%, #F3F7FA 48%, ${colors.greenSoft} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: 999,
          background: "rgba(59, 175, 117, 0.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 260,
          height: 260,
          borderRadius: 999,
          background: "rgba(24, 59, 86, 0.08)",
        }}
      />

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "48px 54px",
          gap: 42,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 470,
            flexShrink: 0,
          }}
        >
          <LogoMark />

          <h1
            style={{
              marginTop: 34,
              marginBottom: 0,
              fontSize: 52,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: colors.navyDark,
            }}
          >
            Everything about your home&apos;s technology.
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              fontSize: 52,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: colors.navy,
            }}
          >
            Finally organized.
          </p>

          <p
            style={{
              marginTop: 22,
              marginBottom: 0,
              maxWidth: 420,
              fontSize: 20,
              lineHeight: 1.45,
              color: colors.muted,
            }}
          >
            Organize devices, receipts, warranties, manuals, and
            maintenance in one secure place.
          </p>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 28px",
                borderRadius: 999,
                background: colors.navy,
                color: colors.white,
                fontSize: 18,
                fontWeight: 600,
                boxShadow: "0 16px 40px -18px rgba(24, 59, 86, 0.55)",
              }}
            >
              Start Free
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                color: colors.green,
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: colors.green,
                }}
              />
              Free plan available
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <DashboardMockup />
        </div>
      </div>
    </div>
  );
}
