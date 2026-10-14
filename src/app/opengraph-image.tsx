import { ImageResponse } from "next/og";

export const alt =
  "Bobaks Ranking, live rankings and historical trends for Roblox experiences.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const rankingRows = [
  { rank: "1", color: "#ffc64a", bar: "88%", tile: "#1768d5" },
  { rank: "2", color: "#c1d3ed", bar: "72%", tile: "#19aa97" },
  { rank: "3", color: "#e7965b", bar: "60%", tile: "#b34bb0" },
  { rank: "4", color: "#4c98fa", bar: "43%", tile: "#f19636" },
];

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
          color: "#f8fbff",
          fontFamily: "Arial, sans-serif",
          background:
            "linear-gradient(120deg, #04143f 0%, #071d43 54%, #0b2f66 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -110,
            top: -190,
            width: 620,
            height: 620,
            borderRadius: 310,
            display: "flex",
            background:
              "linear-gradient(145deg, rgba(18,158,245,0.24), rgba(11,47,102,0.02))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 590,
            bottom: -330,
            width: 500,
            height: 500,
            borderRadius: 250,
            display: "flex",
            background: "rgba(18,158,245,0.08)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 575,
            padding: "54px 0 42px 64px",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: 37,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                flexShrink: 0,
                background:
                  "linear-gradient(145deg, #129ef5 0%, #0b2f66 100%)",
                border: "2px solid #2bb1ff",
                boxShadow: "0 0 28px rgba(18,158,245,0.25)",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "#ffffff",
                  display: "flex",
                }}
              >
                B
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 11,
                  bottom: 12,
                  height: 24,
                  width: 5,
                  borderRadius: 3,
                  display: "flex",
                  background: "#129ef5",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 19,
                  bottom: 12,
                  height: 17,
                  width: 5,
                  borderRadius: 3,
                  display: "flex",
                  background: "#61ceff",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>
                Bobaks Ranking
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "2px",
                  color: "#55c2ff",
                }}
              >
                LIVE RANKINGS / HISTORICAL TRENDS
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 53,
              display: "flex",
              flexDirection: "column",
              fontSize: 51,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-1.8px",
            }}
          >
            <div style={{ display: "flex" }}>Roblox rankings.</div>
            <div style={{ display: "flex", color: "#71cbff" }}>
              At a glance.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 23,
              maxWidth: 470,
              fontSize: 20,
              lineHeight: 1.45,
              color: "#c0d1eb",
            }}
          >
            Live rankings and historical trends for Roblox experiences.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginTop: 28,
            }}
          >
            {["LIVE", "THIS WEEK", "THIS MONTH", "THIS YEAR"].map(
              (period, index) => (
                <div
                  key={period}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 13px",
                    borderRadius: 18,
                    fontSize: 12,
                    fontWeight: 700,
                    color: index === 0 ? "#ffffff" : "#c7d9f3",
                    background:
                      index === 0 ? "#0d70ee" : "rgba(16,42,82,0.8)",
                    border:
                      index === 0
                        ? "1px solid #50b7ff"
                        : "1px solid rgba(70,111,164,0.75)",
                  }}
                >
                  {period}
                </div>
              ),
            )}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              alignItems: "center",
              gap: 12,
              color: "#8eafd9",
              fontSize: 15,
            }}
          >
            <div
              style={{
                width: 34,
                height: 3,
                borderRadius: 2,
                display: "flex",
                background: "#129ef5",
              }}
            />
            One place for Roblox experience rankings
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            right: 46,
            top: 72,
            width: 520,
            height: 482,
            padding: 27,
            borderRadius: 25,
            border: "1px solid rgba(83,146,211,0.8)",
            background:
              "linear-gradient(150deg, rgba(8,24,49,0.98), rgba(5,18,39,0.96))",
            boxShadow: "0 18px 60px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "1.1px",
                color: "#e5efff",
              }}
            >
              RANKINGS AT A GLANCE
            </div>
            <div
              style={{
                marginTop: 9,
                fontSize: 14,
                color: "#97b3d8",
              }}
            >
              Explore the leaders across every period
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 27,
            }}
          >
            {rankingRows.map((row) => (
              <div
                key={row.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 68,
                  padding: "0 14px",
                  borderRadius: 14,
                  background: "#0f2443",
                  border: "1px solid #203e65",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: row.color,
                    color: "#07172f",
                    fontSize: 23,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {row.rank}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    position: "relative",
                    width: 47,
                    height: 47,
                    marginLeft: 13,
                    marginRight: 14,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: row.tile,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 5,
                      bottom: 7,
                      width: 37,
                      height: 31,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 3,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 14,
                        borderRadius: 2,
                        display: "flex",
                        background: "rgba(255,255,255,0.76)",
                      }}
                    />
                    <div
                      style={{
                        width: 8,
                        height: 25,
                        borderRadius: 2,
                        display: "flex",
                        background: "rgba(255,255,255,0.9)",
                      }}
                    />
                    <div
                      style={{
                        width: 8,
                        height: 19,
                        borderRadius: 2,
                        display: "flex",
                        background: "rgba(255,255,255,0.76)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: 6,
                      background: "rgba(5,24,53,0.8)",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    gap: 9,
                  }}
                >
                  <div
                    style={{
                      width: "74%",
                      height: 7,
                      borderRadius: 4,
                      background: "#e1edff",
                      display: "flex",
                    }}
                  />
                  <div
                    style={{
                      width: "46%",
                      height: 5,
                      borderRadius: 3,
                      background: "#7d9fc8",
                      display: "flex",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    width: 115,
                    height: 12,
                    marginLeft: 15,
                    borderRadius: 6,
                    overflow: "hidden",
                    background: "#143357",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: row.bar,
                      height: "100%",
                      borderRadius: 6,
                      background: "#129ef5",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "auto",
              height: 31,
              borderRadius: 16,
              border: "1px solid #2269a9",
              background: "#0b305e",
              color: "#b4ddff",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "1.1px",
            }}
          >
            LIVE  •  WEEKLY  •  MONTHLY  •  YEARLY
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: "100%",
            height: 5,
            display: "flex",
            background:
              "linear-gradient(90deg, #129ef5 0%, #2356b8 48%, #129ef5 100%)",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
