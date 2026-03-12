"use client";

import { useMemo, useState } from "react";

const unitSizes = [2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1, 8.5, 10.0];

const wallModelMap = {
  2.0: {
    mitsubishi: "MSZ-AY20VGKP",
    midea: "Xtreme Save Lite 2.0kW",
  },
  2.5: {
    mitsubishi: "MSZ-AY25VGKP",
    midea: "Solstice 2.6kW",
  },
  3.5: {
    mitsubishi: "MSZ-AY35VGKP",
    midea: "Solstice 3.5kW",
  },
  4.2: {
    mitsubishi: "MSZ-AP42VGKP",
    midea: "Solstice 5.0kW",
  },
  5.0: {
    mitsubishi: "MSZ-AP50VGKP",
    midea: "Solstice 5.0kW",
  },
  6.0: {
    mitsubishi: "MSZ-AP60VGKP",
    midea: "Solstice 7.0kW",
  },
  7.1: {
    mitsubishi: "MSZ-AP71VGKP",
    midea: "Solstice 7.0kW",
  },
  8.5: {
    mitsubishi: "Larger wall split / alternative system required",
    midea: "Larger wall split / alternative system required",
  },
  10.0: {
    mitsubishi: "Larger wall split / alternative system required",
    midea: "Larger wall split / alternative system required",
  },
};

const cassetteModelMap = {
  2.0: {
    mitsubishi: "PLA-M25EA cassette",
    midea: "Compact cassette 2.6kW",
  },
  2.5: {
    mitsubishi: "PLA-M25EA cassette",
    midea: "Compact cassette 2.6kW",
  },
  3.5: {
    mitsubishi: "PLA-M35EA cassette",
    midea: "Cassette 3.5kW",
  },
  4.2: {
    mitsubishi: "PLA-M42EA cassette",
    midea: "Cassette 5.0kW",
  },
  5.0: {
    mitsubishi: "PLA-M50EA cassette",
    midea: "Cassette 5.0kW",
  },
  6.0: {
    mitsubishi: "PLA-M60EA cassette",
    midea: "Cassette 7.0kW",
  },
  7.1: {
    mitsubishi: "PLA-M71EA cassette",
    midea: "Cassette 7.0kW",
  },
  8.5: {
    mitsubishi: "PLA / larger cassette system",
    midea: "Larger cassette system",
  },
  10.0: {
    mitsubishi: "Larger cassette system",
    midea: "Larger cassette system",
  },
};

const ductedModelMap = {
  2.0: {
    mitsubishi: "PEAD-M25 ducted",
    midea: "Slim duct 2.6kW",
  },
  2.5: {
    mitsubishi: "PEAD-M25 ducted",
    midea: "Slim duct 2.6kW",
  },
  3.5: {
    mitsubishi: "PEAD-M35 ducted",
    midea: "Slim duct 3.5kW",
  },
  4.2: {
    mitsubishi: "PEAD-M42 ducted",
    midea: "Ducted 5.0kW",
  },
  5.0: {
    mitsubishi: "PEAD-M50 ducted",
    midea: "Ducted 5.0kW",
  },
  6.0: {
    mitsubishi: "PEAD-M60 ducted",
    midea: "Ducted 7.0kW",
  },
  7.1: {
    mitsubishi: "PEAD-M71 ducted",
    midea: "Ducted 7.0kW",
  },
  8.5: {
    mitsubishi: "Larger ducted system",
    midea: "Larger ducted system",
  },
  10.0: {
    mitsubishi: "Larger ducted system",
    midea: "Larger ducted system",
  },
};

function roundToRecommendedSize(kw) {
  for (const size of unitSizes) {
    if (kw <= size) return size;
  }
  return unitSizes[unitSizes.length - 1];
}

function getPriceBand(brand, recommended, systemType) {
  let uplift = 0;

  if (systemType === "cassette") uplift = 250;
  if (systemType === "ducted") uplift = 500;

  if (brand === "mitsubishi") {
    if (recommended <= 3.5) {
      return { from: 1800 + uplift, to: 2000 + uplift };
    }
    if (recommended <= 5.0) {
      return { from: 2400 + uplift, to: 2600 + uplift };
    }
    if (recommended <= 7.1) {
      return { from: 3000 + uplift, to: 3300 + uplift };
    }
    return { from: 3500 + uplift, to: 4500 + uplift };
  }

  if (recommended <= 3.5) {
    return { from: 1500 + uplift, to: 1700 + uplift };
  }
  if (recommended <= 5.0) {
    return { from: 2000 + uplift, to: 2200 + uplift };
  }
  if (recommended <= 7.1) {
    return { from: 2600 + uplift, to: 2900 + uplift };
  }
  return { from: 3000 + uplift, to: 4000 + uplift };
}

function formatPrice(value) {
  return `£${value.toLocaleString("en-GB")}`;
}

function getModelMapForSystem(systemType) {
  if (systemType === "cassette") return cassetteModelMap;
  if (systemType === "ducted") return ductedModelMap;
  return wallModelMap;
}

function getSystemLabel(systemType) {
  if (systemType === "cassette") return "Cassette system";
  if (systemType === "ducted") return "Ducted system";
  return "Wall mounted split system";
}

export default function Page() {
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(2.4);
  const [roomType, setRoomType] = useState("living");
  const [glazing, setGlazing] = useState("medium");
  const [exposure, setExposure] = useState("south");
  const [brandPreference, setBrandPreference] = useState("both");
  const [systemType, setSystemType] = useState("wall");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const area = length * width;

    let wattsPerM2 = 125;
    if (roomType === "bedroom") wattsPerM2 = 110;
    if (roomType === "office") wattsPerM2 = 130;
    if (roomType === "garden_room") wattsPerM2 = 135;
    if (roomType === "kitchen") wattsPerM2 = 150;

    let factor = 1;
    if (glazing === "medium") factor += 0.1;
    if (glazing === "high") factor += 0.22;
    if (glazing === "very_high") factor += 0.35;

    if (exposure === "west") factor += 0.08;
    if (exposure === "south") factor += 0.14;

    if (height > 2.7) factor += 0.08;
    if (height > 3.0) factor += 0.08;

    const kw = (area * wattsPerM2 * factor) / 1000;
    const recommended = roundToRecommendedSize(kw);

    const selectedMap = getModelMapForSystem(systemType);
    const models = selectedMap[recommended] || {
      mitsubishi: "No model mapped",
      midea: "No model mapped",
    };

    const mitsubishiPrice = getPriceBand("mitsubishi", recommended, systemType);
    const mideaPrice = getPriceBand("midea", recommended, systemType);

    return {
      area: area.toFixed(1),
      kw: kw.toFixed(2),
      recommended: recommended.toFixed(1),
      systemLabel: getSystemLabel(systemType),
      mitsubishi: models.mitsubishi,
      midea: models.midea,
      mitsubishiPrice,
      mideaPrice,
    };
  }, [length, width, height, roomType, glazing, exposure, systemType]);

  const summary = useMemo(() => {
    const lines = [
      "PROAIR | Climate Control",
      "",
      `Room size: ${length}m x ${width}m x ${height}m`,
      `Area: ${result.area} m²`,
      `Room type: ${roomType}`,
      `Glazing: ${glazing}`,
      `Sun exposure: ${exposure}`,
      `System type: ${result.systemLabel}`,
      `Estimated load: ${result.kw} kW`,
      `Recommended unit: ${result.recommended} kW`,
      "",
    ];

    if (brandPreference === "both" || brandPreference === "mitsubishi") {
      lines.push("Mitsubishi Electric");
      lines.push(result.mitsubishi);
      lines.push(
        `Estimated installed price: ${formatPrice(result.mitsubishiPrice.from)} to ${formatPrice(result.mitsubishiPrice.to)}`
      );
      lines.push("");
    }

    if (brandPreference === "both" || brandPreference === "midea") {
      lines.push("Midea");
      lines.push(result.midea);
      lines.push(
        `Estimated installed price: ${formatPrice(result.mideaPrice.from)} to ${formatPrice(result.mideaPrice.to)}`
      );
      lines.push("");
    }

    if (notes.trim()) {
      lines.push("Survey notes");
      lines.push(notes.trim());
      lines.push("");
    }

    lines.push(
      "Guide prices only. Final pricing depends on pipe run, trunking, access, electrics, condensate route and overall install difficulty."
    );

    return lines.join("\n");
  }, [
    length,
    width,
    height,
    roomType,
    glazing,
    exposure,
    brandPreference,
    notes,
    result,
  ]);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07153a",
        color: "white",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 700 }}>
            <span style={{ color: "#666a73" }}>PRO</span>
            <span style={{ color: "#0b2e73" }}>AIR</span>
          </h1>
          <p style={{ marginTop: "8px", fontSize: "20px", color: "#ffffff" }}>
            Climate Control Room Sizer
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px",
          }}
        >
          <div
            style={{
              background: "#f3f3f3",
              color: "#0b1b3a",
              borderRadius: "24px",
              padding: "26px",
            }}
          >
            <h2 style={{ fontSize: "32px", marginTop: 0 }}>Inputs</h2>

            <label>Length (m)</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              style={inputStyle}
            />

            <label>Width (m)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={inputStyle}
            />

            <label>Ceiling height (m)</label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              style={inputStyle}
            />

            <label>Room type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              style={inputStyle}
            >
              <option value="bedroom">Bedroom</option>
              <option value="living">Living room</option>
              <option value="office">Office</option>
              <option value="garden_room">Garden room</option>
              <option value="kitchen">Kitchen</option>
            </select>

            <label>Glazing</label>
            <select
              value={glazing}
              onChange={(e) => setGlazing(e.target.value)}
              style={inputStyle}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="very_high">Very high / bifolds</option>
            </select>

            <label>Sun exposure</label>
            <select
              value={exposure}
              onChange={(e) => setExposure(e.target.value)}
              style={inputStyle}
            >
              <option value="north">North</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="south">South</option>
            </select>

            <label>System type</label>
            <select
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
              style={inputStyle}
            >
              <option value="wall">Wall mounted</option>
              <option value="cassette">Cassette</option>
              <option value="ducted">Ducted</option>
            </select>

            <label>Preferred brand</label>
            <select
              value={brandPreference}
              onChange={(e) => setBrandPreference(e.target.value)}
              style={inputStyle}
            >
              <option value="both">Show both</option>
              <option value="mitsubishi">Mitsubishi Electric only</option>
              <option value="midea">Midea only</option>
            </select>

            <label>Survey notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. long pipe run, awkward condensate route, external wall brackets, customer prefers premium option..."
              style={textAreaStyle}
              rows={5}
            />
          </div>

          <div
            style={{
              background: "#f3f3f3",
              color: "#0b1b3a",
              borderRadius: "24px",
              padding: "26px",
            }}
          >
            <h2 style={{ fontSize: "32px", marginTop: 0 }}>Result</h2>

            <p><strong>Area:</strong> {result.area} m²</p>
            <p><strong>Estimated load:</strong> {result.kw} kW</p>

            <p
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#0b2e73",
                marginTop: "24px",
                marginBottom: "12px",
              }}
            >
              Recommended unit: {result.recommended} kW
            </p>

            <p style={{ marginTop: 0, fontWeight: 600 }}>
              Suggested system: {result.systemLabel}
            </p>

            {(brandPreference === "both" || brandPreference === "mitsubishi") && (
              <div
                style={{
                  marginTop: "24px",
                  background: "#e9edf3",
                  borderRadius: "14px",
                  padding: "18px",
                }}
              >
                <p style={{ marginTop: 0, fontWeight: 700 }}>
                  Suggested Mitsubishi Electric
                </p>
                <p style={{ marginBottom: "8px" }}>{result.mitsubishi}</p>
                <p style={{ marginTop: 0, marginBottom: 0, color: "#334155" }}>
                  Estimated installed price: {formatPrice(result.mitsubishiPrice.from)} to{" "}
                  {formatPrice(result.mitsubishiPrice.to)}
                </p>
              </div>
            )}

            {(brandPreference === "both" || brandPreference === "midea") && (
              <div
                style={{
                  marginTop: "18px",
                  background: "#e9edf3",
                  borderRadius: "14px",
                  padding: "18px",
                }}
              >
                <p style={{ marginTop: 0, fontWeight: 700 }}>Suggested Midea</p>
                <p style={{ marginBottom: "8px" }}>{result.midea}</p>
                <p style={{ marginTop: 0, marginBottom: 0, color: "#334155" }}>
                  Estimated installed price: {formatPrice(result.mideaPrice.from)} to{" "}
                  {formatPrice(result.mideaPrice.to)}
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: "20px",
                background: "#eef2f7",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <p style={{ marginTop: 0, fontWeight: 700 }}>Copy summary</p>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "14px",
                  color: "#334155",
                  marginBottom: "14px",
                }}
              >
                {summary}
              </pre>

              <button onClick={handleCopySummary} style={buttonStyle}>
                {copied ? "Copied" : "Copy survey summary"}
              </button>
            </div>

            <p
              style={{
                marginTop: "18px",
                marginBottom: 0,
                fontSize: "14px",
                color: "#475569",
                lineHeight: 1.5,
              }}
            >
              Guide prices only. Final pricing should still be adjusted for pipe run,
              brackets, trunking, access, electrical work, condensate route and overall
              install difficulty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "8px",
  marginBottom: "18px",
  borderRadius: "14px",
  border: "1px solid #c8ced8",
  boxSizing: "border-box",
  fontSize: "16px",
};

const textAreaStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "8px",
  marginBottom: "18px",
  borderRadius: "14px",
  border: "1px solid #c8ced8",
  boxSizing: "border-box",
  fontSize: "16px",
  resize: "vertical",
  fontFamily: "Arial, sans-serif",
};

const buttonStyle = {
  width: "100%",
  background: "#0b2e73",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "14px 16px",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
};
