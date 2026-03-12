"use client";

import { useMemo, useState } from "react";

const unitSizes = [2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1, 8.5, 10.0];

const modelMap = {
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
    mitsubishi: "Larger split / cassette / ducted system",
    midea: "Larger split / cassette / ducted system",
  },
  10.0: {
    mitsubishi: "Larger split / cassette / ducted system",
    midea: "Larger split / cassette / ducted system",
  },
};

function roundToRecommendedSize(kw) {
  for (const size of unitSizes) {
    if (kw <= size) return size;
  }
  return unitSizes[unitSizes.length - 1];
}

export default function Page() {
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(2.4);
  const [roomType, setRoomType] = useState("living");
  const [glazing, setGlazing] = useState("medium");
  const [exposure, setExposure] = useState("south");

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
    const models = modelMap[recommended] || {
      mitsubishi: "No model mapped",
      midea: "No model mapped",
    };

    return {
      area: area.toFixed(1),
      kw: kw.toFixed(2),
      recommended: recommended.toFixed(1),
      mitsubishi: models.mitsubishi,
      midea: models.midea,
    };
  }, [length, width, height, roomType, glazing, exposure]);

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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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

            <p>
              <strong>Area:</strong> {result.area} m²
            </p>
            <p>
              <strong>Estimated load:</strong> {result.kw} kW
            </p>

            <p
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#0b2e73",
                marginTop: "24px",
                marginBottom: "24px",
              }}
            >
              Recommended unit: {result.recommended} kW
            </p>

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
              <p>{result.mitsubishi}</p>

              <p style={{ fontWeight: 700, marginTop: "16px" }}>
                Suggested Midea
              </p>
              <p style={{ marginBottom: 0 }}>{result.midea}</p>
            </div>
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
