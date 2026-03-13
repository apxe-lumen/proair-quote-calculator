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

const defaultRoom = {
  id: 1,
  name: "Room 1",
  length: 5,
  width: 4,
  height: 2.4,
  roomType: "living",
  glazing: "medium",
  exposure: "south",
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
    if (recommended <= 3.5) return { from: 1800 + uplift, to: 2000 + uplift };
    if (recommended <= 5.0) return { from: 2400 + uplift, to: 2600 + uplift };
    if (recommended <= 7.1) return { from: 3000 + uplift, to: 3300 + uplift };
    return { from: 3500 + uplift, to: 4500 + uplift };
  }

  if (recommended <= 3.5) return { from: 1500 + uplift, to: 1700 + uplift };
  if (recommended <= 5.0) return { from: 2000 + uplift, to: 2200 + uplift };
  if (recommended <= 7.1) return { from: 2600 + uplift, to: 2900 + uplift };
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

function calculateRoom(room) {
  const area = Number(room.length) * Number(room.width);

  let wattsPerM2 = 125;
  if (room.roomType === "bedroom") wattsPerM2 = 110;
  if (room.roomType === "office") wattsPerM2 = 130;
  if (room.roomType === "garden_room") wattsPerM2 = 135;
  if (room.roomType === "kitchen") wattsPerM2 = 150;

  let factor = 1;
  if (room.glazing === "medium") factor += 0.1;
  if (room.glazing === "high") factor += 0.22;
  if (room.glazing === "very_high") factor += 0.35;

  if (room.exposure === "west") factor += 0.08;
  if (room.exposure === "south") factor += 0.14;

  if (Number(room.height) > 2.7) factor += 0.08;
  if (Number(room.height) > 3.0) factor += 0.08;

  const kw = (area * wattsPerM2 * factor) / 1000;
  const recommended = roundToRecommendedSize(kw);

  return {
    ...room,
    area: area.toFixed(1),
    kw: kw.toFixed(2),
    recommended: recommended.toFixed(1),
    recommendedNumber: recommended,
  };
}

function getOutdoorSuggestion(roomSpread, roomCount, totalRecommended, systemType) {
  if (roomCount === 1) {
    return "Single room setup. One outdoor unit is likely suitable.";
  }

  if (roomSpread === "same_side") {
    if (roomCount <= 3 && totalRecommended <= 10) {
      return "Rooms are grouped together. A single outdoor unit or multi-split may be suitable depending on pipe routes and manufacturer limits.";
    }
    return "Rooms are grouped together, but total load is climbing. Compare a multi-split against multiple single splits.";
  }

  if (roomSpread === "adjacent") {
    return "Rooms are close together. A single outdoor unit could work well, but still sense-check trunking routes and condensate runs.";
  }

  if (roomSpread === "opposite_sides") {
    return "Rooms are on opposite sides of the property. Consider outdoor units on each side to reduce long pipe runs and visible trunking.";
  }

  if (roomSpread === "different_floors") {
    return "Rooms are on different floors. Review outdoor locations carefully, as two outdoor units may give a neater install and simpler condensate routing.";
  }

  if (roomSpread === "spread_out") {
    return "Rooms appear spread across the property. Two outdoor units or separate systems may be the cleaner option over one heavily stretched multi-split.";
  }

  if (systemType === "ducted") {
    return "Ducted systems are very layout-sensitive. Check route, static pressure, returns and outdoor position before committing.";
  }

  return "Review outdoor locations on site to balance pipe length, access, aesthetics and future serviceability.";
}

function getSystemOptions(totalRecommended, roomCount, roomSpread, systemType) {
  const options = [];

  if (roomCount === 1) {
    options.push(`1 x single split system around ${totalRecommended.toFixed(1)}kW total capacity`);
    return options;
  }

  options.push(`${roomCount} x single split systems`);

  if (roomCount <= 3 && totalRecommended <= 12) {
    options.push(`1 x multi-split system around ${Math.ceil(totalRecommended)}kW total connected load, subject to layout and pipe runs`);
  }

  if (roomSpread === "opposite_sides" || roomSpread === "different_floors" || roomSpread === "spread_out") {
    options.push("Consider 2 outdoor units to reduce long runs and installation complexity");
  }

  if (systemType === "ducted") {
    options.push("Review whether one larger ducted system or multiple smaller systems is the better fit");
  }

  return options;
}

export default function Page() {
  const [rooms, setRooms] = useState([defaultRoom]);
  const [brandPreference, setBrandPreference] = useState("both");
  const [systemType, setSystemType] = useState("wall");
  const [roomSpread, setRoomSpread] = useState("same_side");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const updateRoom = (id, field, value) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === id ? { ...room, [field]: value } : room))
    );
  };

  const addRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        ...defaultRoom,
        id: Date.now(),
        name: `Room ${prev.length + 1}`,
      },
    ]);
  };

  const removeRoom = (id) => {
    setRooms((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((room) => room.id !== id);
    });
  };

  const result = useMemo(() => {
    const roomResults = rooms.map(calculateRoom);
    const totalLoad = roomResults.reduce((sum, room) => sum + Number(room.kw), 0);
    const totalRecommended = roomResults.reduce(
      (sum, room) => sum + Number(room.recommendedNumber),
      0
    );

    const selectedMap = getModelMapForSystem(systemType);
    const mitsubishiPrice = getPriceBand("mitsubishi", totalRecommended, systemType);
    const mideaPrice = getPriceBand("midea", totalRecommended, systemType);

    const groupedModels = roomResults.map((room) => {
      const models = selectedMap[room.recommendedNumber] || {
        mitsubishi: "No model mapped",
        midea: "No model mapped",
      };

      return {
        ...room,
        mitsubishi: models.mitsubishi,
        midea: models.midea,
      };
    });

    return {
      roomResults: groupedModels,
      totalLoad: totalLoad.toFixed(2),
      totalRecommended: totalRecommended.toFixed(1),
      systemLabel: getSystemLabel(systemType),
      mitsubishiPrice,
      mideaPrice,
      outdoorSuggestion: getOutdoorSuggestion(
        roomSpread,
        groupedModels.length,
        totalRecommended,
        systemType
      ),
      systemOptions: getSystemOptions(
        totalRecommended,
        groupedModels.length,
        roomSpread,
        systemType
      ),
    };
  }, [rooms, systemType, roomSpread]);

  const summary = useMemo(() => {
    const lines = [
      "PROAIR | Climate Control",
      "",
      `System type: ${result.systemLabel}`,
      `Room spread: ${roomSpread.replaceAll("_", " ")}`,
      "",
      "Room breakdown",
    ];

    result.roomResults.forEach((room, index) => {
      lines.push(
        `${index + 1}. ${room.name}: ${room.length}m x ${room.width}m x ${room.height}m | ${room.area}m² | Load ${room.kw}kW | Suggested ${room.recommended}kW`
      );
    });

    lines.push("");
    lines.push(`Total estimated load: ${result.totalLoad} kW`);
    lines.push(`Total recommended connected capacity: ${result.totalRecommended} kW`);
    lines.push(`Outdoor unit suggestion: ${result.outdoorSuggestion}`);
    lines.push("");
    lines.push("Possible system options");
    result.systemOptions.forEach((option) => lines.push(`- ${option}`));
    lines.push("");

    if (brandPreference === "both" || brandPreference === "mitsubishi") {
      lines.push("Mitsubishi Electric room suggestions");
      result.roomResults.forEach((room) => {
        lines.push(`${room.name}: ${room.mitsubishi}`);
      });
      lines.push(
        `Estimated installed total: ${formatPrice(result.mitsubishiPrice.from)} to ${formatPrice(result.mitsubishiPrice.to)}`
      );
      lines.push("");
    }

    if (brandPreference === "both" || brandPreference === "midea") {
      lines.push("Midea room suggestions");
      result.roomResults.forEach((room) => {
        lines.push(`${room.name}: ${room.midea}`);
      });
      lines.push(
        `Estimated installed total: ${formatPrice(result.mideaPrice.from)} to ${formatPrice(result.mideaPrice.to)}`
      );
      lines.push("");
    }

    if (notes.trim()) {
      lines.push("Survey notes");
      lines.push(notes.trim());
      lines.push("");
    }

    lines.push(
      "Guide prices only. Final pricing depends on pipe run, trunking, access, electrics, condensate route, outdoor locations and overall install difficulty."
    );

    return lines.join("\n");
  }, [brandPreference, notes, result, roomSpread]);

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
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 700 }}>
            <span style={{ color: "#666a73" }}>PRO</span>
            <span style={{ color: "#0b2e73" }}>AIR</span>
          </h1>
          <p style={{ marginTop: "8px", fontSize: "20px", color: "#ffffff" }}>
            Climate Control Multi-Room Sizer
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
              <h2 style={{ fontSize: "32px", marginTop: 0, marginBottom: "12px" }}>Rooms</h2>
              <button onClick={addRoom} style={smallButtonStyle}>Add room</button>
            </div>

            {rooms.map((room, index) => (
              <div key={room.id} style={roomCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <input
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, fontWeight: 700 }}
                  />
                  <button
                    onClick={() => removeRoom(room.id)}
                    style={{ ...smallButtonStyle, opacity: rooms.length === 1 ? 0.5 : 1 }}
                    disabled={rooms.length === 1}
                  >
                    Remove
                  </button>
                </div>

                <div style={twoColGridStyle}>
                  <div>
                    <label>Length (m)</label>
                    <input
                      type="number"
                      value={room.length}
                      onChange={(e) => updateRoom(room.id, "length", Number(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label>Width (m)</label>
                    <input
                      type="number"
                      value={room.width}
                      onChange={(e) => updateRoom(room.id, "width", Number(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={twoColGridStyle}>
                  <div>
                    <label>Ceiling height (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={room.height}
                      onChange={(e) => updateRoom(room.id, "height", Number(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label>Room type</label>
                    <select
                      value={room.roomType}
                      onChange={(e) => updateRoom(room.id, "roomType", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="bedroom">Bedroom</option>
                      <option value="living">Living room</option>
                      <option value="office">Office</option>
                      <option value="garden_room">Garden room</option>
                      <option value="kitchen">Kitchen</option>
                    </select>
                  </div>
                </div>

                <div style={twoColGridStyle}>
                  <div>
                    <label>Glazing</label>
                    <select
                      value={room.glazing}
                      onChange={(e) => updateRoom(room.id, "glazing", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="very_high">Very high / bifolds</option>
                    </select>
                  </div>
                  <div>
                    <label>Sun exposure</label>
                    <select
                      value={room.exposure}
                      onChange={(e) => updateRoom(room.id, "exposure", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="north">North</option>
                      <option value="east">East</option>
                      <option value="west">West</option>
                      <option value="south">South</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "24px" }}>Project setup</h3>

            <label>System type</label>
            <select value={systemType} onChange={(e) => setSystemType(e.target.value)} style={inputStyle}>
              <option value="wall">Wall mounted</option>
              <option value="cassette">Cassette</option>
              <option value="ducted">Ducted</option>
            </select>

            <label>Preferred brand</label>
            <select value={brandPreference} onChange={(e) => setBrandPreference(e.target.value)} style={inputStyle}>
              <option value="both">Show both</option>
              <option value="mitsubishi">Mitsubishi Electric only</option>
              <option value="midea">Midea only</option>
            </select>

            <label>Room spread / property layout</label>
            <select value={roomSpread} onChange={(e) => setRoomSpread(e.target.value)} style={inputStyle}>
              <option value="same_side">Same side of house</option>
              <option value="adjacent">Adjacent / close together</option>
              <option value="opposite_sides">Opposite sides of house</option>
              <option value="different_floors">Different floors</option>
              <option value="spread_out">Spread across property</option>
            </select>

            <label>Survey notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. front bedroom opposite to rear office, customer wants minimal trunking, garden room may suit separate outdoor unit..."
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
            <h2 style={{ fontSize: "32px", marginTop: 0 }}>Project result</h2>

            <p><strong>Total estimated load:</strong> {result.totalLoad} kW</p>
            <p><strong>Total recommended connected capacity:</strong> {result.totalRecommended} kW</p>
            <p><strong>Suggested system type:</strong> {result.systemLabel}</p>

            <div style={resultCardStyle}>
              <p style={{ marginTop: 0, fontWeight: 700 }}>Room breakdown</p>
              {result.roomResults.map((room) => (
                <div key={room.id} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid #cfd8e3" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{room.name}</p>
                  <p style={{ margin: "6px 0 0 0" }}>{room.area}m² • Load {room.kw}kW • Suggested {room.recommended}kW</p>
                </div>
              ))}
            </div>

            <div style={resultCardStyle}>
              <p style={{ marginTop: 0, fontWeight: 700 }}>Outdoor unit suggestion</p>
              <p style={{ marginBottom: 0 }}>{result.outdoorSuggestion}</p>
            </div>

            <div style={resultCardStyle}>
              <p style={{ marginTop: 0, fontWeight: 700 }}>Possible system options</p>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {result.systemOptions.map((option, index) => (
                  <li key={index} style={{ marginBottom: "8px" }}>{option}</li>
                ))}
              </ul>
            </div>

            {(brandPreference === "both" || brandPreference === "mitsubishi") && (
              <div style={resultCardStyle}>
                <p style={{ marginTop: 0, fontWeight: 700 }}>Suggested Mitsubishi Electric</p>
                {result.roomResults.map((room) => (
                  <p key={room.id} style={{ margin: "0 0 8px 0" }}>
                    <strong>{room.name}:</strong> {room.mitsubishi}
                  </p>
                ))}
                <p style={{ marginTop: "14px", marginBottom: 0, color: "#334155" }}>
                  Estimated installed total: {formatPrice(result.mitsubishiPrice.from)} to {formatPrice(result.mitsubishiPrice.to)}
                </p>
              </div>
            )}

            {(brandPreference === "both" || brandPreference === "midea") && (
              <div style={resultCardStyle}>
                <p style={{ marginTop: 0, fontWeight: 700 }}>Suggested Midea</p>
                {result.roomResults.map((room) => (
                  <p key={room.id} style={{ margin: "0 0 8px 0" }}>
                    <strong>{room.name}:</strong> {room.midea}
                  </p>
                ))}
                <p style={{ marginTop: "14px", marginBottom: 0, color: "#334155" }}>
                  Estimated installed total: {formatPrice(result.mideaPrice.from)} to {formatPrice(result.mideaPrice.to)}
                </p>
              </div>
            )}

            <div style={resultCardStyle}>
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
                {copied ? "Copied" : "Copy project summary"}
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
              Guide prices only. Final pricing should still be adjusted for pipe run, brackets, trunking, access, electrical work, condensate route, outdoor locations and overall install difficulty.
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

const smallButtonStyle = {
  background: "#0b2e73",
  color: "white",
  border: "none",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const roomCardStyle = {
  background: "#e9edf3",
  borderRadius: "18px",
  padding: "18px",
  marginBottom: "18px",
};

const twoColGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const resultCardStyle = {
  marginTop: "20px",
  background: "#e9edf3",
  borderRadius: "14px",
  padding: "18px",
};
