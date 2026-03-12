"use client";

import { useMemo, useState } from "react";

const unitSizes = [2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1, 8.5, 10.0];

function roundToRecommendedSize(kw) {
  for (const size of unitSizes) {
    if (kw <= size) return size;
  }
  return unitSizes[unitSizes.length - 1];
}

function getExposureFactor(exposure) {
  switch (exposure) {
    case "north":
      return 0.95;
    case "east":
      return 1.0;
    case "west":
      return 1.08;
    case "south":
      return 1.14;
    default:
      return 1.0;
  }
}

function getGlazingFactor(glazing) {
  switch (glazing) {
    case "low":
      return 1.0;
    case "medium":
      return 1.1;
    case "high":
      return 1.22;
    case "very_high":
      return 1.35;
    default:
      return 1.0;
  }
}

function getInsulationFactor(insulation) {
  switch (insulation) {
    case "poor":
      return 1.15;
    case "average":
      return 1.0;
    case "good":
      return 0.95;
    case "excellent":
      return 0.9;
    default:
      return 1.0;
  }
}

function getCeilingFactor(height) {
  if (height <= 2.4) return 0.96;
  if (height <= 2.7) return 1.0;
  if (height <= 3.0) return 1.08;
  if (height <= 3.4) return 1.16;
  return 1.25;
}

function getRoomTypeWm2(roomType) {
  switch (roomType) {
    case "bedroom":
      return 110;
    case "living":
      return 125;
    case "office":
      return 130;
    case "garden_room":
      return 135;
    case "kitchen":
      return 150;
    default:
      return 120;
  }
}

export default function Page() {
  const [roomName, setRoomName] = useState("Living Room");
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(2.4);
  const [roomType, setRoomType] = useState("living");
  const [exposure, setExposure] = useState("south");
  const [glazing, setGlazing] = useState("medium");
  const [insulation, setInsulation] = useState("average");
  const [occupants, setOccupants] = useState(2);

  const result = useMemo(() => {
    const area = length * width;
    const baseWm2 = getRoomTypeWm2(roomType);
    let watts = area * baseWm2;

    watts *= getExposureFactor(exposure);
    watts *= getGlazingFactor(glazing);
    watts *= getInsulationFactor(insulation);
    watts *= getCeilingFactor(height);

    const extraPeople = Math.max(0, occupants - 2);
    watts += extraPeople * 120;

    const kw = watts / 1000;
    const recommended = roundToRecommendedSize(kw);

    return {
      area: area.toFixed(1),
      kw: kw.toFixed(2),
      recommended: recommended.toFixed(1),
    };
  }, [length, width, height, roomType, exposure, glazing, insulation, occupants]);

  return (
    <div style={{padding:40,fontFamily:"Arial"}}>
      <h1>ProAir Room Size Calculator</h1>

      <div style={{display:"grid",gap:10,maxWidth:400}}>
        <input type="text" value={roomName} onChange={(e)=>setRoomName(e.target.value)} placeholder="Room name"/>
        <input type="number" value={length} onChange={(e)=>setLength(Number(e.target.value))} placeholder="Length (m)"/>
        <input type="number" value={width} onChange={(e)=>setWidth(Number(e.target.value))} placeholder="Width (m)"/>
        <input type="number" value={height} onChange={(e)=>setHeight(Number(e.target.value))} placeholder="Height (m)"/>

        <select value={roomType} onChange={(e)=>setRoomType(e.target.value)}>
          <option value="bedroom">Bedroom</option>
          <option value="living">Living room</option>
          <option value="office">Office</option>
          <option value="garden_room">Garden room</option>
          <option value="kitchen">Kitchen</option>
        </select>

        <select value={exposure} onChange={(e)=>setExposure(e.target.value)}>
          <option value="north">North</option>
          <option value="east">East</option>
          <option value="west">West</option>
          <option value="south">South</option>
        </select>

        <select value={glazing} onChange={(e)=>setGlazing(e.target.value)}>
          <option value="low">Low glazing</option>
          <option value="medium">Medium glazing</option>
          <option value="high">High glazing</option>
          <option value="very_high">Very high glazing</option>
        </select>

        <select value={insulation} onChange={(e)=>setInsulation(e.target.value)}>
          <option value="poor">Poor insulation</option>
          <option value="average">Average insulation</option>
          <option value="good">Good insulation</option>
          <option value="excellent">Excellent insulation</option>
        </select>

        <input type="number" value={occupants} onChange={(e)=>setOccupants(Number(e.target.value))} placeholder="People in room"/>
      </div>

      <div style={{marginTop:30}}>
        <h2>Results</h2>
        <p>Area: {result.area} m²</p>
        <p>Estimated Load: {result.kw} kW</p>
        <h3>Recommended Unit: {result.recommended} kW</h3>
      </div>
    </div>
  );
}
