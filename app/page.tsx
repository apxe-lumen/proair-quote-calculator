"use client";

import { useMemo, useState } from "react";

const unitSizes = [2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1, 8.5, 10.0];

function roundToRecommendedSize(kw: number) {
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

    return {
      area: area.toFixed(1),
      kw: kw.toFixed(2),
      recommended: recommended.toFixed(1),
    };
  }, [length, width, height, roomType, glazing, exposure]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "8px" }}>
          <span style={{ color: "#55575b" }}>PRO</span>
          <span style={{ color: "#0b2e73" }}>AIR</span>
        </h1>
        <p style={{ color: "#cbd5e1", marginTop: 0 }}>Climate Control Room Sizer</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              color: "#111827",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <h2>Inputs</h2>

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
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={inputStyle}>
              <option value="bedroom">Bedroom</option>
              <option value="living">Living room</option>
              <option value="office">Office</option>
              <option value="garden_room">Garden room</option>
              <option value="kitchen">Kitchen</option>
            </select>

            <label>Glazing</label>
            <select value={glazing} onChange={(e) => setGlazing(e.target.value)} style={inputStyle}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="very_high">Very high / bifolds</option>
            </select>

            <label>Sun exposure</label>
            <select value={exposure} onChange={(e) => setExposure(e.target.value)} style={inputStyle}>
              <option value="north">North</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="south">South</option>
            </select>
          </div>

          <div
            style={{
              background: "white",
              color: "#111827",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <h2>Result</h2>
            <p><strong>Area:</strong> {result.area} m²</p>
            <p><strong>Estimated load:</strong> {result.kw} kW</p>
            <p style={{ fontSize: "32px", fontWeight: 700, color: "#0b2e73" }}>
              Recommended unit: {result.recommended} kW
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
};
