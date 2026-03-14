"use client";
import { useEffect, useMemo, useRef, useState } from "react";
const unitSizes = [2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1, 8.5, 10.0];

const wallModelMap = {
  2.0: {
    mitsubishi: "MSZ-AY20VGKP",
    midea: "Xtreme Save Lite 2.0kW",
    zen: "Not available in Zen range",
  },
  2.5: {
    mitsubishi: "MSZ-AY25VGKP",
    midea: "Solstice 2.6kW",
    zen: "MSZ-EF25VGK",
  },
  3.5: {
    mitsubishi: "MSZ-AY35VGKP",
    midea: "Solstice 3.5kW",
    zen: "MSZ-EF35VGK",
  },
  4.2: {
    mitsubishi: "MSZ-AP42VGKP",
    midea: "Solstice 5.0kW",
    zen: "MSZ-EF50VGK",
  },
  5.0: {
    mitsubishi: "MSZ-AP50VGKP",
    midea: "Solstice 5.0kW",
    zen: "MSZ-EF50VGK",
  },
  6.0: {
    mitsubishi: "MSZ-AP60VGKP",
    midea: "Solstice 7.0kW",
    zen: "Not available in Zen range",
  },
  7.1: {
    mitsubishi: "MSZ-AP71VGKP",
    midea: "Solstice 7.0kW",
    zen: "Not available in Zen range",
  },
  8.5: {
    mitsubishi: "Larger wall split / alternative system required",
    midea: "Larger wall split / alternative system required",
    zen: "Not available in Zen range",
  },
  10.0: {
    mitsubishi: "Larger wall split / alternative system required",
    midea: "Larger wall split / alternative system required",
    zen: "Not available in Zen range",
  },
};

const cassetteModelMap = {
  2.0: {
    mitsubishi: "PLA-M25EA cassette",
    midea: "Compact cassette 2.6kW",
    zen: "Not available in Zen range",
  },
  2.5: {
    mitsubishi: "PLA-M25EA cassette",
    midea: "Compact cassette 2.6kW",
    zen: "Not available in Zen range",
  },
  3.5: {
    mitsubishi: "PLA-M35EA cassette",
    midea: "Cassette 3.5kW",
    zen: "Not available in Zen range",
  },
  4.2: {
    mitsubishi: "PLA-M42EA cassette",
    midea: "Cassette 5.0kW",
    zen: "Not available in Zen range",
  },
  5.0: {
    mitsubishi: "PLA-M50EA cassette",
    midea: "Cassette 5.0kW",
    zen: "Not available in Zen range",
  },
  6.0: {
    mitsubishi: "PLA-M60EA cassette",
    midea: "Cassette 7.0kW",
    zen: "Not available in Zen range",
  },
  7.1: {
    mitsubishi: "PLA-M71EA cassette",
    midea: "Cassette 7.0kW",
    zen: "Not available in Zen range",
  },
  8.5: {
    mitsubishi: "PLA / larger cassette system",
    midea: "Larger cassette system",
    zen: "Not available in Zen range",
  },
  10.0: {
    mitsubishi: "Larger cassette system",
    midea: "Larger cassette system",
    zen: "Not available in Zen range",
  },
};

const ductedModelMap = {
  2.0: {
    mitsubishi: "PEAD-M25 ducted",
    midea: "Slim duct 2.6kW",
    zen: "Not available in Zen range",
  },
  2.5: {
    mitsubishi: "PEAD-M25 ducted",
    midea: "Slim duct 2.6kW",
    zen: "Not available in Zen range",
  },
  3.5: {
    mitsubishi: "PEAD-M35 ducted",
    midea: "Slim duct 3.5kW",
    zen: "Not available in Zen range",
  },
  4.2: {
    mitsubishi: "PEAD-M42 ducted",
    midea: "Ducted 5.0kW",
    zen: "Not available in Zen range",
  },
  5.0: {
    mitsubishi: "PEAD-M50 ducted",
    midea: "Ducted 5.0kW",
    zen: "Not available in Zen range",
  },
  6.0: {
    mitsubishi: "PEAD-M60 ducted",
    midea: "Ducted 7.0kW",
    zen: "Not available in Zen range",
  },
  7.1: {
    mitsubishi: "PEAD-M71 ducted",
    midea: "Ducted 7.0kW",
    zen: "Not available in Zen range",
  },
  8.5: {
    mitsubishi: "Larger ducted system",
    midea: "Larger ducted system",
    zen: "Not available in Zen range",
  },
  10.0: {
    mitsubishi: "Larger ducted system",
    midea: "Larger ducted system",
    zen: "Not available in Zen range",
  },
};

const defaultInstallerRoom = {
  id: 1,
  name: "Room 1",
  length: 5,
  width: 4,
  height: 2.4,
  roomType: "living",
  glazing: "medium",
  exposure: "south",
  pipeRun: "standard",
  floorLevel: "ground",
  outdoorSide: "same_side",
};

const defaultCustomerRoom = {
  id: 1,
  name: "Room 1",
  length: 5,
  width: 4,
  height: 2.4,
  roomType: "living",
  glazing: "medium",
  exposure: "south",
  floorLevel: "ground",
  outdoorSide: "same_side",
};

function roundToRecommendedSize(kw) {
  for (const size of unitSizes) {
    if (kw <= size) return size;
  }
  return unitSizes[unitSizes.length - 1];
}

function getUnitPrice(brand, size) {
  if (brand === "mitsubishi") {
    if (size <= 3.5) return 1800;
    if (size <= 5.0) return 2400;
    if (size <= 7.1) return 3000;
    return 3500;
  }

  if (brand === "zen") {
    if (size <= 3.5) return 2400;
    if (size <= 5.0) return 3000;
    return null;
  }

  if (size <= 3.5) return 1500;
  if (size <= 5.0) return 2000;
  if (size <= 7.1) return 2600;
  return 3000;
}

function getPipeRunExtra(pipeRun) {
  if (pipeRun === "medium") return 150;
  if (pipeRun === "long") return 300;
  if (pipeRun === "very_long") return 500;
  return 0;
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

function getPipeRunLabel(pipeRun) {
  if (pipeRun === "medium") return "3m to 5m";
  if (pipeRun === "long") return "5m to 7m";
  if (pipeRun === "very_long") return "7m+";
  return "Up to 3m";
}

function getFloorLabel(floorLevel) {
  if (floorLevel === "first") return "First floor";
  if (floorLevel === "loft") return "Loft / second floor";
  return "Ground floor";
}

function getOutdoorSideLabel(outdoorSide) {
  if (outdoorSide === "front") return "Front of property";
  if (outdoorSide === "rear") return "Rear of property";
  if (outdoorSide === "side") return "Side elevation";
  if (outdoorSide === "opposite_side") return "Opposite side of property";
  return "Same side as room";
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

function getOutdoorSuggestion(
  roomSpread,
  roomCount,
  totalRecommended,
  systemType,
  outdoorPreference,
  roomResults
) {
  const oppositeSideCount = roomResults.filter(
    (room) => room.outdoorSide === "opposite_side"
  ).length;
  const upperFloorCount = roomResults.filter(
    (room) => room.floorLevel === "first" || room.floorLevel === "loft"
  ).length;

  if (roomCount === 1) {
    return "Single room setup. One outdoor unit is likely suitable.";
  }

  if (outdoorPreference === "single" && roomCount > 2 && oppositeSideCount > 0) {
    return "A single outdoor unit is possible, but with rooms spread around the property it may create longer pipe runs and more visible trunking.";
  }

  if (outdoorPreference === "multiple") {
    return "Customer is happy with more than one outdoor unit. Compare separate systems to reduce pipe run and keep the install neater.";
  }

  if (roomSpread === "opposite_sides" || oppositeSideCount >= 2) {
    return "Rooms are split across opposite sides of the property. Consider one outdoor unit per side to reduce long pipe runs and installation mess.";
  }

  if (roomSpread === "different_floors" || upperFloorCount >= 2) {
    return "Rooms are across different floors. Review outdoor positions carefully, as two outdoor units may give a cleaner route and easier condensate management.";
  }

  if (roomSpread === "spread_out") {
    return "Rooms are spread across the property. Multiple outdoor units may be cleaner than stretching one multi-split too far.";
  }

  if (roomSpread === "same_side") {
    if (roomCount <= 3 && totalRecommended <= 10) {
      return "Rooms are grouped on the same side. A single outdoor unit or multi-split may work well, subject to manufacturer pipe limits.";
    }
    return "Rooms are grouped together, but total load is rising. Compare a multi-split against multiple single splits.";
  }

  if (roomSpread === "adjacent") {
    return "Rooms are close together. A single outdoor unit could work well, but still sense-check trunking routes and condensate paths.";
  }

  if (systemType === "ducted") {
    return "Ducted systems are layout-sensitive. Check route, returns, static pressure and outdoor position before deciding on one or more condensers.";
  }

  return "Review outdoor locations on site to balance pipe length, access, aesthetics and future serviceability.";
}

function getSystemOptions(
  totalRecommended,
  roomCount,
  roomSpread,
  systemType,
  outdoorPreference
) {
  const options = [];

  if (roomCount === 1) {
    options.push(`1 x single split system around ${totalRecommended.toFixed(1)}kW total capacity`);
    return options;
  }

  options.push(`${roomCount} x single split systems`);

  if (roomCount <= 3 && totalRecommended <= 12 && outdoorPreference !== "multiple") {
    options.push(
      `1 x multi-split system around ${Math.ceil(totalRecommended)}kW total connected load, subject to layout and pipe runs`
    );
  }

  if (
    roomSpread === "opposite_sides" ||
    roomSpread === "different_floors" ||
    roomSpread === "spread_out" ||
    outdoorPreference === "multiple"
  ) {
    options.push("Consider 2 outdoor units to reduce long runs and installation complexity");
  }

  if (systemType === "ducted") {
    options.push("Review whether one larger ducted system or multiple smaller systems is the better fit");
  }

  return options;
}

export default function Page() {
  const [viewMode, setViewMode] = useState("customer");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPostcode, setCustomerPostcode] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [customerRooms, setCustomerRooms] = useState([defaultCustomerRoom]);
  const [selectedCustomerSystem, setSelectedCustomerSystem] = useState("mitsubishi");

  const [rooms, setRooms] = useState([defaultInstallerRoom]);
  const [brandPreference, setBrandPreference] = useState("both");
  const [systemType, setSystemType] = useState("wall");
  const [roomSpread, setRoomSpread] = useState("same_side");
  const [outdoorPreference, setOutdoorPreference] = useState("best_layout");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [quoteCopied, setQuoteCopied] = useState(false);
 const leadSentRef = useRef(false);
const customerDetailsComplete =
  customerName.trim() &&
  customerPhone.trim() &&
  customerEmail.trim() &&
  customerPostcode.trim();

  const updateRoom = (id, field, value) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === id ? { ...room, [field]: value } : room))
    );
  };

  const addRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        ...defaultInstallerRoom,
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

  const updateCustomerRoom = (id, field, value) => {
  const roomTypeNames = {
    bedroom: "Bedroom",
    living: "Living Room",
    office: "Office",
    garden_room: "Garden Room",
    kitchen: "Kitchen",
  };

  setCustomerRooms((prev) =>
    prev.map((room) => {
      if (room.id !== id) return room;

      const updatedRoom = { ...room, [field]: value };

      if (field === "roomType") {
        updatedRoom.name = roomTypeNames[value] || "Room";
      }

      return updatedRoom;
    })
  );
};

  const addCustomerRoom = () => {
    setCustomerRooms((prev) => [
      ...prev,
      {
        ...defaultCustomerRoom,
        id: Date.now(),
        name: `Room ${prev.length + 1}`,
      },
    ]);
  };

  const removeCustomerRoom = (id) => {
    setCustomerRooms((prev) => {
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

    const groupedModels = roomResults.map((room) => {
      const models = selectedMap[room.recommendedNumber] || {
        mitsubishi: "No model mapped",
        midea: "No model mapped",
        zen: "Not available in Zen range",
      };

      const pipeRunExtra = getPipeRunExtra(room.pipeRun);
      const mitsubishiUnitPrice =
        getUnitPrice("mitsubishi", room.recommendedNumber) + pipeRunExtra;
      const mideaUnitPrice =
        getUnitPrice("midea", room.recommendedNumber) + pipeRunExtra;

      const zenBase = getUnitPrice("zen", room.recommendedNumber);
      const zenUnitPrice = zenBase === null ? null : zenBase + pipeRunExtra;

      return {
        ...room,
        mitsubishi: models.mitsubishi,
        midea: models.midea,
        zen: models.zen,
        pipeRunLabel: getPipeRunLabel(room.pipeRun),
        floorLabel: getFloorLabel(room.floorLevel),
        outdoorSideLabel: getOutdoorSideLabel(room.outdoorSide),
        pipeRunExtra,
        mitsubishiUnitPrice,
        mideaUnitPrice,
        zenUnitPrice,
      };
    });

    const mitsubishiTotal = groupedModels.reduce(
      (sum, room) => sum + room.mitsubishiUnitPrice,
      0
    );
    const mideaTotal = groupedModels.reduce(
      (sum, room) => sum + room.mideaUnitPrice,
      0
    );
    const zenAvailableRooms = groupedModels.filter((room) => room.zenUnitPrice !== null);
    const zenTotal = zenAvailableRooms.reduce((sum, room) => sum + room.zenUnitPrice, 0);

    return {
      roomResults: groupedModels,
      totalLoad: totalLoad.toFixed(2),
      totalRecommended: totalRecommended.toFixed(1),
      systemLabel: getSystemLabel(systemType),
      mitsubishiTotal,
      mideaTotal,
      zenTotal,
      zenAvailableRooms,
      outdoorSuggestion: getOutdoorSuggestion(
        roomSpread,
        groupedModels.length,
        totalRecommended,
        systemType,
        outdoorPreference,
        groupedModels
      ),
      systemOptions: getSystemOptions(
        totalRecommended,
        groupedModels.length,
        roomSpread,
        systemType,
        outdoorPreference
      ),
    };
  }, [rooms, systemType, roomSpread, outdoorPreference]);

  const summary = useMemo(() => {
    const lines = [
      "PROAIR | Climate Control",
      "",
      `System type: ${result.systemLabel}`,
      `Room spread: ${roomSpread.replaceAll("_", " ")}`,
      `Outdoor preference: ${outdoorPreference.replaceAll("_", " ")}`,
      "",
      "Room breakdown",
    ];

    result.roomResults.forEach((room, index) => {
      lines.push(
        `${index + 1}. ${room.name}: ${room.length}m x ${room.width}m x ${room.height}m | ${room.area}m² | Load ${room.kw}kW | Suggested ${room.recommended}kW | ${room.floorLabel} | Outdoor ${room.outdoorSideLabel} | Pipe run ${room.pipeRunLabel}`
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
        lines.push(
          `${room.name}: ${room.mitsubishi} | Estimated installed price ${formatPrice(room.mitsubishiUnitPrice)}`
        );
      });
      lines.push(`Estimated installed total: ${formatPrice(result.mitsubishiTotal)}`);
      lines.push("");
    }

    if (brandPreference === "both" || brandPreference === "midea") {
      lines.push("Midea room suggestions");
      result.roomResults.forEach((room) => {
        lines.push(
          `${room.name}: ${room.midea} | Estimated installed price ${formatPrice(room.mideaUnitPrice)}`
        );
      });
      lines.push(`Estimated installed total: ${formatPrice(result.mideaTotal)}`);
      lines.push("");
    }

    if (brandPreference === "both" || brandPreference === "zen") {
      lines.push("Mitsubishi Zen premium upgrade");
      result.roomResults.forEach((room) => {
        if (room.zenUnitPrice !== null) {
          lines.push(
            `${room.name}: ${room.zen} | Estimated installed price ${formatPrice(room.zenUnitPrice)}`
          );
        } else {
          lines.push(`${room.name}: Zen not available for this size`);
        }
      });
      if (result.zenAvailableRooms.length > 0) {
        lines.push(`Estimated installed total: ${formatPrice(result.zenTotal)}`);
      }
      lines.push("");
    }

    if (notes.trim()) {
      lines.push("Survey notes");
      lines.push(notes.trim());
      lines.push("");
    }

    lines.push(
      "Guide prices only. Final pricing depends on pipe run, trunking, access, electrics, condensate route and outdoor layout."
    );

    return lines.join("\n");
  }, [brandPreference, notes, result, roomSpread, outdoorPreference]);

  const whatsappQuote = useMemo(() => {
    const lines = [
      "Hi 👋",
      "",
      "Based on the room sizes and layout, we’d recommend the following setup:",
      "",
    ];

    result.roomResults.forEach((room) => {
      lines.push(`• ${room.name}: ${room.recommended}kW ${result.systemLabel.toLowerCase()}`);
    });

    lines.push("");
    lines.push(`Total estimated cooling load: ${result.totalLoad}kW`);
    lines.push(`Outdoor unit layout note: ${result.outdoorSuggestion}`);
    lines.push("");

    if (brandPreference === "mitsubishi") {
      lines.push("Suggested Mitsubishi Electric models:");
      result.roomResults.forEach((room) => {
        lines.push(`• ${room.name}: ${room.mitsubishi}`);
      });
      lines.push("");
      lines.push(`Estimated installed price: ${formatPrice(result.mitsubishiTotal)}`);
    } else if (brandPreference === "midea") {
      lines.push("Suggested Midea models:");
      result.roomResults.forEach((room) => {
        lines.push(`• ${room.name}: ${room.midea}`);
      });
      lines.push("");
      lines.push(`Estimated installed price: ${formatPrice(result.mideaTotal)}`);
    } else if (brandPreference === "zen") {
      lines.push("Suggested Mitsubishi Zen premium options:");
      result.roomResults.forEach((room) => {
        if (room.zenUnitPrice !== null) {
          lines.push(`• ${room.name}: ${room.zen}`);
        } else {
          lines.push(`• ${room.name}: Zen not available for this size`);
        }
      });
      if (result.zenAvailableRooms.length > 0) {
        lines.push("");
        lines.push(`Estimated installed price: ${formatPrice(result.zenTotal)}`);
      }
    } else {
      lines.push("Example options:");
      lines.push(`• Mitsubishi Electric total: ${formatPrice(result.mitsubishiTotal)}`);
      lines.push(`• Midea total: ${formatPrice(result.mideaTotal)}`);
      if (result.zenAvailableRooms.length > 0) {
        lines.push(`• Mitsubishi Zen premium total: ${formatPrice(result.zenTotal)}`);
      }
    }

    lines.push("");
    lines.push(
      "Guide prices only. Final price depends on pipe runs, access, electrical work and final installation layout."
    );
    lines.push("");
    lines.push("Happy to answer any questions 👍");

    return lines.join("\n");
  }, [brandPreference, result]);
const customerEstimate = useMemo(() => {
  const roomResults = customerRooms.map(calculateRoom)

  const totalLoad = roomResults.reduce((sum, r) => sum + Number(r.kw), 0)

  const totalRecommended = roomResults.reduce(
    (sum, r) => sum + Number(r.recommendedNumber),
    0
  )

  const mideaTotal = roomResults.reduce(
    (sum, r) => sum + getUnitPrice("midea", r.recommendedNumber),
    0
  )

  const mitsubishiTotal = roomResults.reduce(
    (sum, r) => sum + getUnitPrice("mitsubishi", r.recommendedNumber),
    0
  )

const zenEligible = roomResults.every((r) => r.recommendedNumber <= 5.0)

const zenTotal = zenEligible
  ? roomResults.reduce((sum, r) => {
      const price = getUnitPrice("zen", r.recommendedNumber)
      return price ? sum + price : sum
    }, 0)
  : null
  const estimatedCoolingMonthly = Math.round(totalRecommended * 3);
const estimatedHeatingMonthly = Math.round(totalRecommended * 4);

return {
  totalLoad: totalLoad.toFixed(2),
  totalRecommended: totalRecommended.toFixed(1),
  mideaTotal,
  mitsubishiTotal,
  zenTotal,
  zenEligible,
  roomResults,
  estimatedCoolingMonthly,
  estimatedHeatingMonthly,
}
}, [customerRooms])
  const customerRoomSummary = useMemo(() => {
    const lines = customerRooms.map((room, index) => {
      return `${index + 1}. ${room.name}: ${room.length}m x ${room.width}m x ${room.height}m | Room type: ${room.roomType} | Glazing: ${room.glazing} | Sun exposure: ${room.exposure} | Floor: ${getFloorLabel(room.floorLevel)} | Outdoor position: ${getOutdoorSideLabel(room.outdoorSide)}`;
    });

    return lines.join("\n");
  }, [customerRooms]);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const handleCopyWhatsAppQuote = async () => {
    try {
      await navigator.clipboard.writeText(whatsappQuote);
      setQuoteCopied(true);
      setTimeout(() => setQuoteCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };
const systemNames = {
  midea: "Midea Solstice",
  mitsubishi: "Mitsubishi Electric AY",
  zen: "Mitsubishi Electric Zen",
};

const roomBreakdown = customerRooms
  .map((room, index) => {
    const result = calculateRoom(room);
    return `${index + 1}. ${room.name || "Room"} – ${result.recommended} kW`;
  })
  .join("\n");

  useEffect(() => {
  if (!customerDetailsComplete || leadSentRef.current) return;

  const sendLead = async () => {
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  name: customerName,
  phone: customerPhone,
  email: customerEmail,
  postcode: customerPostcode,
  system: systemNames[selectedCustomerSystem],
  rooms: customerRooms.length,
  load: customerEstimate.totalLoad,
  capacity: customerEstimate.totalRecommended,
  roomBreakdown,
  mideaPrice: customerEstimate.mideaTotal,
  mitsubishiPrice: customerEstimate.mitsubishiTotal,
  zenPrice: customerEstimate.zenTotal,
  zenEligible: customerEstimate.zenEligible,
  notes: customerNotes
})
      });

      leadSentRef.current = true;
    } catch (error) {
      console.error("Lead send failed", error);
    }
  };

  sendLead();
}, [
  customerDetailsComplete,
  customerName,
  customerPhone,
  customerEmail,
  customerPostcode,
  selectedCustomerSystem,
  customerRooms.length,
  customerEstimate.totalLoad,
  customerEstimate.totalRecommended
]);
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
      <div style={{ maxWidth: "1480px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 700 }}>
            <span style={{ color: "#666a73" }}>PRO</span>
            <span style={{ color: "#0b2e73" }}>AIR</span>
          </h1>
          <p style={{ marginTop: "8px", fontSize: "20px", color: "#ffffff" }}>
            Climate Control Survey Tool
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => setViewMode("customer")}
            style={{
              ...tabButtonStyle,
              background: viewMode === "customer" ? "#0b2e73" : "#cbd5e1",
              color: viewMode === "customer" ? "white" : "#0b1b3a",
            }}
          >
            Customer estimate form
          </button>
        </div>

          <div
            style={{
              background: "#f3f3f3",
              color: "#0b1b3a",
              borderRadius: "24px",
              padding: "26px",
            }}
          >
            <div id="customer-form-start"></div>
            <h2 style={{ fontSize: "32px", marginTop: 0 }}>Get an estimate</h2>
            <p style={{ color: "#475569", marginTop: 0 }}>
              Fill in the details below and ProAir will review your enquiry and get back to you.
            </p>

            <form
              action="https://formsubmit.co/contact@proairuk.co.uk"
              method="POST"
            >
              <input type="hidden" name="_subject" value="New ProAir estimate request" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="Room summary" value={customerRoomSummary} />
              <input type="hidden" name="Selected system" value={selectedCustomerSystem} />
              <div style={twoColGridStyle}>
                <div>
                  <label>Full name</label>
                  <input
                    type="text"
                    name="Full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label>Phone number</label>
                  <input
                    type="text"
                    name="Phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={twoColGridStyle}>
                <div>
                  <label>Email address</label>
                  <input
                    type="email"
                    name="Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label>Postcode</label>
                  <input
                    type="text"
                    name="Postcode"
                    value={customerPostcode}
                    onChange={(e) => setCustomerPostcode(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "12px",
                }}
              >
                <h3 style={{ fontSize: "24px", margin: 0 }}>Rooms</h3>
                <button
                  type="button"
                  onClick={addCustomerRoom}
                  style={smallButtonStyle}
                >
                  Add room
                </button>
              </div>

              {customerRooms.map((room) => (
                <div key={room.id} style={roomCardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <input
                      value={room.name}
                      onChange={(e) =>
                        updateCustomerRoom(room.id, "name", e.target.value)
                      }
                      style={{ ...inputStyle, marginBottom: 0, fontWeight: 700 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomerRoom(room.id)}
                      style={{
                        ...smallButtonStyle,
                        opacity: customerRooms.length === 1 ? 0.5 : 1,
                      }}
                      disabled={customerRooms.length === 1}
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
                        onChange={(e) =>
                          updateCustomerRoom(room.id, "length", Number(e.target.value))
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label>Width (m)</label>
                      <input
                        type="number"
                        value={room.width}
                        onChange={(e) =>
                          updateCustomerRoom(room.id, "width", Number(e.target.value))
                        }
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
                        onChange={(e) =>
                          updateCustomerRoom(room.id, "height", Number(e.target.value))
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label>Room type</label>
                      <select
                        value={room.roomType}
                        onChange={(e) =>
                          updateCustomerRoom(room.id, "roomType", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateCustomerRoom(room.id, "glazing", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateCustomerRoom(room.id, "exposure", e.target.value)
                        }
                        style={inputStyle}
                      >
                        <option value="north">North</option>
                        <option value="east">East</option>
                        <option value="west">West</option>
                        <option value="south">South</option>
                      </select>
                    </div>
                  </div>

                  <div style={twoColGridStyle}>
                    <div>
                      <label>Floor level</label>
                      <select
                        value={room.floorLevel}
                        onChange={(e) =>
                          updateCustomerRoom(room.id, "floorLevel", e.target.value)
                        }
                        style={inputStyle}
                      >
                        <option value="ground">Ground floor</option>
                        <option value="first">First floor</option>
                        <option value="loft">Loft / second floor</option>
                      </select>
                    </div>
                    <div>
                      <label>Best outdoor unit position</label>
                      <select
                        value={room.outdoorSide}
                        onChange={(e) =>
                          updateCustomerRoom(room.id, "outdoorSide", e.target.value)
                        }
                        style={inputStyle}
                      >
                        <option value="same_side">Same side as room</option>
                        <option value="front">Front of property</option>
                        <option value="rear">Rear of property</option>
                        <option value="side">Side elevation</option>
                        <option value="opposite_side">Opposite side of property</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

                         <label>Anything else we should know?</label>
              <textarea
                name="Additional notes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                style={textAreaStyle}
                rows={4}
                placeholder="Access notes, preferred outdoor unit position, parking info, or anything else helpful"
              />

              <div
                style={{
                  background: "#e9edf3",
                  borderRadius: "14px",
                  padding: "18px",
                  marginBottom: "20px",
                }}
              >
               <h3 style={{ marginTop: 0 }}>Recommended systems & guide price</h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "12px",
      marginBottom: "20px",
    }}
  >
    <div style={resultCardStyle}>
      <strong>Total cooling load</strong>
      <p style={{ margin: "8px 0 0 0" }}>
        {customerEstimate.totalLoad} kW
      </p>
    </div>

    <div style={resultCardStyle}>
      <strong>Suggested capacity</strong>
      <p style={{ margin: "8px 0 0 0" }}>
        {customerEstimate.totalRecommended} kW
      </p>
    </div>

    <div style={resultCardStyle}>
      <strong>Rooms</strong>
      <p style={{ margin: "8px 0 0 0" }}>
        {customerRooms.length}
      </p>
    </div>
<div style={resultCardStyle}>
  <strong>Typical cooling cost</strong>
  <p style={{ margin: "8px 0 0 0" }}>
    {"£"}{customerEstimate.estimatedCoolingMonthly} / month
  </p>
</div>

<div style={resultCardStyle}>
  <strong>Typical heating cost</strong>
  <p style={{ margin: "8px 0 0 0" }}>
    {"£"}{customerEstimate.estimatedHeatingMonthly} / month
  </p>
</div>

</div>   {/* closes the summary grid */}

{!customerDetailsComplete && (
                  <p style={{ margin: 0, color: "#475569" }}>
                    Fill in your name, phone, email and postcode to view guide prices.
                  </p>
                )}

                {customerDetailsComplete && (
                  <>
                   <div style={{ ...resultCardStyle, marginBottom: "20px" }}>
  <h4 style={{ marginTop: 0, marginBottom: "12px" }}>
    Recommended room sizes
  </h4>

  {customerEstimate.roomResults.map((room) => (
    <div
      key={room.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #d6dde8",
      }}
    >
      <span style={{ fontWeight: 600 }}>{room.name}</span>
      <span style={{ color: "#0b2e73", fontWeight: 700 }}>
        {room.recommended} kW
      </span>
    </div>
  ))}
</div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "18px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        onClick={() => {
                          setSelectedCustomerSystem("midea");
                          document
                            .getElementById("customer-form-start")
                            ?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        style={{
                          background: "#e9edf3",
                          borderRadius: "16px",
                          padding: "18px",
                          border:
                            selectedCustomerSystem === "midea"
                              ? "2px solid #0b2e73"
                              : "2px solid #d6dde8",
                          boxShadow:
                            selectedCustomerSystem === "midea"
                              ? "0 8px 24px rgba(11,46,115,0.12)"
                              : "none",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            height: "160px",
                            borderRadius: "12px",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "14px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src="/midea-solstice.png"
                            alt="Midea Solstice"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>

                        {selectedCustomerSystem === "midea" && (
                          <p
                            style={{
                              display: "inline-block",
                              margin: "0 0 10px 8px",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              background: "#16a34a",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            ✓ Selected
                          </p>
                        )}

                        <p
                          style={{
                            display: "inline-block",
                            margin: "0 0 10px 0",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Budget
                        </p>

                        <h3 style={{ margin: "0 0 8px 0" }}>Midea Solstice</h3>

                        <p style={{ margin: "0 0 10px 0", color: "#475569" }}>
                          Best value option for effective heating and cooling.
                        </p>

                        <p style={{ margin: "0 0 6px 0", fontWeight: 700 }}>
                          From £{customerEstimate.mideaTotal.toLocaleString()}
                        </p>

                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                          Good budget-friendly choice.
                        </p>
                      </div>

                      <div
                        onClick={() => {
                          setSelectedCustomerSystem("mitsubishi");
                          document
                            .getElementById("customer-form-start")
                            ?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        style={{
                          background: "#e9edf3",
                          borderRadius: "16px",
                          padding: "18px",
                          border:
                            selectedCustomerSystem === "mitsubishi"
                              ? "2px solid #0b2e73"
                              : "2px solid #d6dde8",
                          boxShadow:
                            selectedCustomerSystem === "mitsubishi"
                              ? "0 8px 24px rgba(11,46,115,0.12)"
                              : "none",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            height: "160px",
                            borderRadius: "12px",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "14px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src="/mitsubishi-ay.png"
                            alt="Mitsubishi Electric AY"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>

                        {selectedCustomerSystem === "mitsubishi" && (
                          <p
                            style={{
                              display: "inline-block",
                              margin: "0 0 10px 8px",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              background: "#16a34a",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            ✓ Selected
                          </p>
                        )}

                        <p
                          style={{
                            display: "inline-block",
                            margin: "0 0 10px 0",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Standard
                        </p>

                        <p
                          style={{
                            display: "inline-block",
                            margin: "0 0 10px 8px",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            background: "#0b2e73",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Most Popular
                        </p>

                        <h3 style={{ margin: "0 0 8px 0" }}>Mitsubishi Electric AY</h3>

                        <p style={{ margin: "0 0 10px 0", color: "#475569" }}>
                          Reliable all-round option with a more premium feel.
                        </p>

                        <p style={{ margin: "0 0 6px 0", fontWeight: 700 }}>
                          From £{customerEstimate.mitsubishiTotal.toLocaleString()}
                        </p>

                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                          Popular balance of quality and value.
                        </p>
                      </div>

                      <div
                        onClick={() => {
  if (!customerEstimate.zenEligible) return;

  setSelectedCustomerSystem("zen");
  document
    .getElementById("customer-form-start")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}}
                        style={{
                          background: "#e9edf3",
                          borderRadius: "16px",
                          padding: "18px",
                          border:
                            selectedCustomerSystem === "zen"
                              ? "2px solid #0b2e73"
                              : "2px solid #d6dde8",
                          boxShadow:
                            selectedCustomerSystem === "zen"
                              ? "0 8px 24px rgba(11,46,115,0.12)"
                              : "none",
                          cursor: "pointer",
                          opacity: customerEstimate.zenEligible ? 1 : 0.55,
                        }}
                      >
                        <div
                          style={{
                            height: "160px",
                            borderRadius: "12px",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "14px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src="/zen.jpg"
                            alt="Mitsubishi Zen"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>

                        {selectedCustomerSystem === "zen" && (
                          <p
                            style={{
                              display: "inline-block",
                              margin: "0 0 10px 8px",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              background: "#16a34a",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            ✓ Selected
                          </p>
                        )}

                        <p
                          style={{
                            display: "inline-block",
                            margin: "0 0 10px 0",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            background: "#ede9fe",
                            color: "#6d28d9",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Premium
                        </p>

                        <h3 style={{ margin: "0 0 8px 0" }}>Mitsubishi Zen</h3>

                        <p style={{ margin: "0 0 10px 0", color: "#475569" }}>
                          Designer premium option for customers wanting a higher-end finish.
                        </p>

                        <p style={{ margin: "0 0 6px 0", fontWeight: 700 }}>
  {customerEstimate.zenEligible
    ? `From £${customerEstimate.zenTotal.toLocaleString()}`
    : "Only available up to 5.0kW per room"}
</p>

                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
  {customerEstimate.zenEligible
    ? "Premium look and feel."
    : "Zen range is not available above 5.0kW room sizes."}
</p>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/447833679777?text=${encodeURIComponent(`Hi ProAir, I used your estimator.

Selected system: ${systemNames[selectedCustomerSystem]}
Number of rooms: ${customerRooms.length}
Room breakdown:
${roomBreakdown}
Estimated cooling load: ${customerEstimate.totalLoad} kW
Suggested total capacity: ${customerEstimate.totalRecommended} kW
Guide price: ${
  selectedCustomerSystem === "midea"
    ? `£${customerEstimate.mideaTotal.toLocaleString()}`
    : selectedCustomerSystem === "zen"
    ? customerEstimate.zenEligible
      ? `£${customerEstimate.zenTotal.toLocaleString()}`
      : "Not available for this room size"
    : `£${customerEstimate.mitsubishiTotal.toLocaleString()}`
}

Can I get a quote / site survey please?`)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "16px",
                        marginBottom: "20px",
                        background: "#25D366",
                        color: "white",
                        textDecoration: "none",
                        padding: "12px 18px",
                        borderRadius: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Send this estimate on WhatsApp
                    </a>

                    <p>
                      <strong>Total estimated cooling load:</strong>{" "}
                      {customerEstimate.totalLoad} kW
                    </p>

                    <p>
                      <strong>Midea system guide price:</strong> £
                      {customerEstimate.mideaTotal.toLocaleString()}
                    </p>

                    <p>
                      <strong>Mitsubishi Electric guide price:</strong> £
                      {customerEstimate.mitsubishiTotal.toLocaleString()}
                    </p>

                    {customerEstimate.zenTotal > 0 && (
                      <p>
  <strong>Mitsubishi Zen premium guide price:</strong>{" "}
  {customerEstimate.zenEligible
    ? `£${customerEstimate.zenTotal.toLocaleString()}`
    : "Not available above 5.0kW per room"}
</p>
                    )}

                    <p style={{ fontSize: "13px", color: "#475569" }}>
                      Guide price only. Final cost depends on pipe runs, electrics,
                      access and installation layout.
                    </p>

                    <button type="submit" style={buttonStyle}>
                      Send estimate request
                    </button>
                  </>
                )}
              </div>
            </form>
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

const tabButtonStyle = {
  border: "none",
  borderRadius: "12px",
  padding: "14px 18px",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
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
