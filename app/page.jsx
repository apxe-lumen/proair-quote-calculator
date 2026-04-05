"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

const unitSizes = [2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1, 8.5, 10.0];

const defaultCustomerRoom = {
  id: 1,
  name: "Living Room",
  length: "",
  width: "",
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

function calculateRoom(room) {
  if (!room.length || !room.width) {
    return {
      ...room,
      area: "Enter room size to calculate",
      kw: "",
      recommended: "",
      recommendedNumber: 0,
    };
  }

  const length = Number(room.length);
  const width = Number(room.width);
  const height = Number(room.height || 0);
  const area = length * width;

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

  if (height > 2.7) factor += 0.08;
  if (height > 3.0) factor += 0.08;

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

function DetailChip({ icon, label, value }) {
  return (
    <div style={detailChipStyle}>
      <span style={detailChipIconStyle}>{icon}</span>
      <div>
        <div style={detailChipLabelStyle}>{label}</div>
        <div style={detailChipValueStyle}>{value || "—"}</div>
      </div>
    </div>
  );
}

function RoomTypeBadge({ value }) {
  const map = {
    bedroom: "Bedroom",
    living: "Living room",
    office: "Office",
    garden_room: "Garden room",
    kitchen: "Kitchen",
  };

  return <span style={roomTypeBadgeStyle}>{map[value] || "Room"}</span>;
}

function SystemOptionCard({
  imageSrc,
  imageAlt,
  pill,
  pillStyle,
  extraPill,
  extraPillStyle,
  selected,
  title,
  description,
  priceText,
  note,
  onClick,
  disabled = false,
  selectedBorder = "blue",
  compact = false,
}) {
  const selectedStyle =
    selectedBorder === "green"
      ? selectedSystemCardStyleGreen
      : selectedSystemCardStyle;

  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        ...systemCardStyle,
        ...(compact ? systemCardCompactStyle : {}),
        ...(selected ? selectedStyle : {}),
        ...(disabled ? disabledSystemCardStyle : {}),
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div
        style={{
          ...systemImageWrapStyle,
          ...(compact ? systemImageWrapCompactStyle : {}),
        }}
      >
        <img src={imageSrc} alt={imageAlt} style={systemImageStyle} />
      </div>

      <div style={pillRowStyle}>
        <span style={pillStyle}>{pill}</span>
        {extraPill ? <span style={extraPillStyle}>{extraPill}</span> : null}
        {selected ? <span style={selectedPillStyle}>✓ Selected</span> : null}
      </div>

      <h3
        style={{
          ...systemTitleStyle,
          ...(compact ? systemTitleCompactStyle : {}),
        }}
      >
        {title}
      </h3>
      <p
        style={{
          ...systemDescriptionStyle,
          ...(compact ? systemDescriptionCompactStyle : {}),
        }}
      >
        {description}
      </p>
      <p
        style={{
          ...systemPriceStyle,
          ...(compact ? systemPriceCompactStyle : {}),
        }}
      >
        {priceText}
      </p>
      <p style={systemNoteStyle}>{note}</p>
    </div>
  );
}

function SystemCardsDeck({
  customerEstimate,
  selectedCustomerSystem,
  setSelectedCustomerSystem,
}) {
  const scrollRef = useRef(null);
  const [screenMode, setScreenMode] = useState("mobile");

  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) {
        setScreenMode("desktop");
      } else if (window.innerWidth >= 768) {
        setScreenMode("tablet");
      } else {
        setScreenMode("mobile");
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;

    const amount =
      screenMode === "desktop"
        ? scrollRef.current.clientWidth * 0.42
        : screenMode === "tablet"
        ? scrollRef.current.clientWidth * 0.7
        : scrollRef.current.clientWidth * 0.88;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const isDesktopDeck = screenMode === "desktop";
  const cardWidth =
    screenMode === "desktop" ? 350 : screenMode === "tablet" ? 320 : 290;
  const overlap = screenMode === "desktop" ? -78 : 0;

  return (
    <div style={systemCarouselWrapStyle}>
      <div style={systemCarouselHeaderStyle}>
        <div style={systemCarouselHintStyle}>
          Swipe or scroll to compare options
        </div>

        <div style={systemCarouselButtonsStyle}>
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            style={systemScrollButtonStyle}
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            style={systemScrollButtonStyle}
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="system-cards-scroller"
        style={systemCardsScrollerStyle}
      >
        <div
          style={{
            ...systemCardsRowStyle,
            gap: isDesktopDeck ? "0px" : "14px",
            paddingLeft: isDesktopDeck ? "28px" : "2px",
            paddingRight: isDesktopDeck ? "90px" : "2px",
          }}
        >
          <div
            style={{
              ...systemDeckItemStyle,
              width: `${cardWidth}px`,
              marginLeft: "0px",
              zIndex: selectedCustomerSystem === "midea" ? 4 : 1,
              transform: isDesktopDeck
                ? selectedCustomerSystem === "midea"
                  ? "translateY(-6px) rotate(-4deg)"
                  : "rotate(-4deg)"
                : "none",
            }}
          >
            <SystemOptionCard
              imageSrc="/midea-solstice.png"
              imageAlt="Midea Solstice"
              pill="Budget"
              pillStyle={budgetPillStyle}
              selected={selectedCustomerSystem === "midea"}
              title="Midea Solstice"
              description="Best value option for effective heating and cooling."
              priceText={`From £${customerEstimate.mideaTotal.toLocaleString()}`}
              note="Good budget-friendly choice."
              onClick={() => setSelectedCustomerSystem("midea")}
            />
          </div>

          <div
            style={{
              ...systemDeckItemStyle,
              width: `${cardWidth}px`,
              marginLeft: `${overlap}px`,
              zIndex: selectedCustomerSystem === "mitsubishi" ? 5 : 3,
              transform: isDesktopDeck
                ? selectedCustomerSystem === "mitsubishi"
                  ? "translateY(-12px) scale(1.03)"
                  : "translateY(-2px)"
                : "none",
            }}
          >
            <SystemOptionCard
              imageSrc="/mitsubishi-ay.png"
              imageAlt="Mitsubishi Electric AY"
              pill="Standard"
              pillStyle={standardPillStyle}
              extraPill="⭐ Recommended"
              extraPillStyle={recommendedPillStyle}
              selected={selectedCustomerSystem === "mitsubishi"}
              selectedBorder="green"
              title="Mitsubishi Electric AY"
              description="Reliable all-round option with a more premium feel."
              priceText={`From £${customerEstimate.mitsubishiTotal.toLocaleString()}`}
              note="Popular balance of quality and value."
              onClick={() => setSelectedCustomerSystem("mitsubishi")}
            />
          </div>

          <div
            style={{
              ...systemDeckItemStyle,
              width: `${cardWidth}px`,
              marginLeft: `${overlap}px`,
              zIndex: selectedCustomerSystem === "zen" ? 4 : 2,
              transform: isDesktopDeck
                ? selectedCustomerSystem === "zen"
                  ? "translateY(-6px) rotate(4deg)"
                  : "rotate(4deg)"
                : "none",
            }}
          >
            <SystemOptionCard
              imageSrc="/zen.jpg"
              imageAlt="Mitsubishi Zen"
              pill="Premium"
              pillStyle={premiumPillStyle}
              selected={selectedCustomerSystem === "zen"}
              title="Mitsubishi Zen"
              description="Designer premium option for customers wanting a higher-end finish."
              priceText={
                customerEstimate.zenEligible
                  ? `From £${customerEstimate.zenTotal.toLocaleString()}`
                  : "Only available up to 5.0kW per room"
              }
              note={
                customerEstimate.zenEligible
                  ? "Premium look and feel."
                  : "Zen range is not available above 5.0kW room sizes."
              }
              onClick={() => setSelectedCustomerSystem("zen")}
              disabled={!customerEstimate.zenEligible}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSystemCards({
  customerEstimate,
  selectedCustomerSystem,
  setSelectedCustomerSystem,
}) {
  return (
    <div style={sidebarSystemsStackStyle}>
      <SystemOptionCard
        imageSrc="/midea-solstice.png"
        imageAlt="Midea Solstice"
        pill="Budget"
        pillStyle={budgetPillStyle}
        selected={selectedCustomerSystem === "midea"}
        title="Midea Solstice"
        description="Best value option for effective heating and cooling."
        priceText={`From £${customerEstimate.mideaTotal.toLocaleString()}`}
        note="Good budget-friendly choice."
        onClick={() => setSelectedCustomerSystem("midea")}
        compact
      />

      <SystemOptionCard
        imageSrc="/mitsubishi-ay.png"
        imageAlt="Mitsubishi Electric AY"
        pill="Standard"
        pillStyle={standardPillStyle}
        extraPill="⭐ Recommended"
        extraPillStyle={recommendedPillStyle}
        selected={selectedCustomerSystem === "mitsubishi"}
        selectedBorder="green"
        title="Mitsubishi Electric AY"
        description="Reliable all-round option with a more premium feel."
        priceText={`From £${customerEstimate.mitsubishiTotal.toLocaleString()}`}
        note="Popular balance of quality and value."
        onClick={() => setSelectedCustomerSystem("mitsubishi")}
        compact
      />

      <SystemOptionCard
        imageSrc="/zen.jpg"
        imageAlt="Mitsubishi Zen"
        pill="Premium"
        pillStyle={premiumPillStyle}
        selected={selectedCustomerSystem === "zen"}
        title="Mitsubishi Zen"
        description="Designer premium option for customers wanting a higher-end finish."
        priceText={
          customerEstimate.zenEligible
            ? `From £${customerEstimate.zenTotal.toLocaleString()}`
            : "Only available up to 5.0kW per room"
        }
        note={
          customerEstimate.zenEligible
            ? "Premium look and feel."
            : "Zen range is not available above 5.0kW room sizes."
        }
        onClick={() => setSelectedCustomerSystem("zen")}
        disabled={!customerEstimate.zenEligible}
        compact
      />
    </div>
  );
}

export default function Page() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPostcode, setCustomerPostcode] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [installTimeframe, setInstallTimeframe] = useState("");
  const [customerRooms, setCustomerRooms] = useState([defaultCustomerRoom]);
  const [selectedCustomerSystem, setSelectedCustomerSystem] =
    useState("mitsubishi");
  const [isDesktop, setIsDesktop] = useState(false);
  const [expandedRoomIds, setExpandedRoomIds] = useState([1]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // "none" → nothing sent. "partial" → abandonment lead fired.
  // "completed" → full quote submitted (terminal — no further sends).
  const leadStageRef = useRef("none");
  const partialTimerRef = useRef(null);

  const hasAnySizedRoom = customerRooms.some(
    (room) => Number(room.length) > 0 && Number(room.width) > 0
  );

  const customerDetailsComplete =
    customerName.trim() &&
    customerPhone.trim() &&
    customerEmail.trim() &&
    customerPostcode.trim();

  // Basic shape check so we don't fire partial leads on half-typed emails.
  const contactDetailsValid =
    customerDetailsComplete && /^\S+@\S+\.\S+$/.test(customerEmail.trim());

  useEffect(() => {
    const updateLayout = () => {
      setIsDesktop(window.innerWidth >= 1080);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

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
    const newId = Date.now();

    setCustomerRooms((prev) => [
      ...prev,
      {
        ...defaultCustomerRoom,
        id: newId,
        name: `Room ${prev.length + 1}`,
      },
    ]);

    setExpandedRoomIds((prev) => [...new Set([...prev, newId])]);
  };

  const removeCustomerRoom = (id) => {
    setCustomerRooms((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((room) => room.id !== id);
    });

    setExpandedRoomIds((prev) => prev.filter((roomId) => roomId !== id));
  };

  const shouldUseCollapsibleRooms = customerRooms.length >= 3;

  const toggleRoomExpanded = (id) => {
    setExpandedRoomIds((prev) =>
      prev.includes(id)
        ? prev.filter((roomId) => roomId !== id)
        : [...prev, id]
    );
  };

  const customerEstimate = useMemo(() => {
    const roomResults = customerRooms.map(calculateRoom);

    const totalLoad = roomResults.reduce((sum, r) => sum + Number(r.kw || 0), 0);

    const totalRecommended = roomResults.reduce(
      (sum, r) => sum + Number(r.recommendedNumber || 0),
      0
    );

    const mideaTotal = roomResults.reduce(
      (sum, r) =>
        sum +
        (r.recommendedNumber
          ? getUnitPrice("midea", r.recommendedNumber)
          : 0),
      0
    );

    const mitsubishiTotal = roomResults.reduce(
      (sum, r) =>
        sum +
        (r.recommendedNumber
          ? getUnitPrice("mitsubishi", r.recommendedNumber)
          : 0),
      0
    );

    const sizedRoomResults = roomResults.filter((r) => r.recommendedNumber > 0);
    const zenEligible =
      sizedRoomResults.length > 0 &&
      sizedRoomResults.every((r) => r.recommendedNumber <= 5.0);

    const zenTotal = zenEligible
      ? roomResults.reduce((sum, r) => {
          if (!r.recommendedNumber) return sum;
          const price = getUnitPrice("zen", r.recommendedNumber);
          return price ? sum + price : sum;
        }, 0)
      : null;

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
    };
  }, [customerRooms]);

  const systemNames = {
    midea: "Midea Solstice",
    mitsubishi: "Mitsubishi Electric AY",
    zen: "Mitsubishi Electric Zen",
  };

  const selectedGuidePrice =
    selectedCustomerSystem === "midea"
      ? customerEstimate.mideaTotal
      : selectedCustomerSystem === "zen"
      ? customerEstimate.zenEligible
        ? customerEstimate.zenTotal
        : null
      : customerEstimate.mitsubishiTotal;

  const roomBreakdown = customerRooms
    .map((room, index) => {
      const result = calculateRoom(room);
      return `${index + 1}. ${room.name || "Room"} – ${
        result.recommended || "TBC"
      } kW`;
    })
    .join("\n");

  // Build a lead payload for /api/lead. `stage` is "partial" or "completed".
  const buildLeadPayload = (stage) => ({
    stage,
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
    notes: customerNotes,
    timeframe: installTimeframe,
  });

  // Partial-lead capture: if the user finishes typing valid contact details
  // but doesn't click submit, fire a "partial" lead so sales can follow up.
  // Gated on hasAnySizedRoom so we only capture people who actually engaged
  // with the calculator. Debounced so we don't send on every keystroke.
  useEffect(() => {
    if (leadStageRef.current !== "none") return;
    if (!hasAnySizedRoom || !contactDetailsValid) {
      if (partialTimerRef.current) {
        clearTimeout(partialTimerRef.current);
        partialTimerRef.current = null;
      }
      return;
    }

    if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
    partialTimerRef.current = setTimeout(() => {
      if (leadStageRef.current !== "none") return;
      leadStageRef.current = "partial";
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildLeadPayload("partial")),
        keepalive: true,
      }).catch((error) => {
        console.error("Partial lead send failed", error);
        // Roll back so a later submit can still fire as "completed".
        if (leadStageRef.current === "partial") leadStageRef.current = "none";
      });
    }, 4000);

    return () => {
      if (partialTimerRef.current) {
        clearTimeout(partialTimerRef.current);
        partialTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasAnySizedRoom,
    contactDetailsValid,
    customerName,
    customerPhone,
    customerEmail,
    customerPostcode,
  ]);

  // Tab-close / navigation fallback: if the user bails with valid contact
  // details but the debounced timer hasn't fired yet, send via sendBeacon
  // which survives page unload where fetch would be killed.
  useEffect(() => {
    const flushOnHide = () => {
      if (leadStageRef.current !== "none") return;
      if (!hasAnySizedRoom || !contactDetailsValid) return;
      if (typeof navigator === "undefined" || !navigator.sendBeacon) return;

      leadStageRef.current = "partial";
      const blob = new Blob(
        [JSON.stringify(buildLeadPayload("partial"))],
        { type: "application/json" }
      );
      navigator.sendBeacon("/api/lead", blob);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushOnHide();
    };

    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushOnHide);
    return () => {
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushOnHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasAnySizedRoom,
    contactDetailsValid,
    customerName,
    customerPhone,
    customerEmail,
    customerPostcode,
    customerEstimate.totalLoad,
    customerEstimate.totalRecommended,
  ]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || leadStageRef.current === "completed") return;
    if (!hasAnySizedRoom || !contactDetailsValid) return;

    // Cancel any pending partial-lead send — submit supersedes it.
    if (partialTimerRef.current) {
      clearTimeout(partialTimerRef.current);
      partialTimerRef.current = null;
    }

    setIsSubmitting(true);
    const previousStage = leadStageRef.current;
    leadStageRef.current = "completed";

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildLeadPayload("completed")),
      });
      setHasSubmitted(true);
    } catch (error) {
      console.error("Lead submit failed", error);
      leadStageRef.current = previousStage;
      alert(
        "Sorry, we couldn't send your estimate just now. Please try again or message us on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappHref = `https://wa.me/447833679777?text=${encodeURIComponent(
    `Hi ProAir

I’ve just used your air conditioning estimator and would like to arrange a quote or site survey.

System selected: ${systemNames[selectedCustomerSystem]}
Number of rooms: ${customerRooms.length}
Install timeframe: ${installTimeframe || "Not specified"}

Room breakdown:
${roomBreakdown}

Estimated cooling load: ${customerEstimate.totalLoad} kW
Recommended capacity: ${customerEstimate.totalRecommended} kW

Guide price: ${
      selectedGuidePrice !== null
        ? `£${selectedGuidePrice.toLocaleString()}`
        : "Not available"
    }

Please let me know the next available date for a survey.

Thank you.
`
  )}`;

  return (
    <div style={pageStyle}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.9/iframeResizer.contentWindow.min.js"
        strategy="afterInteractive"
      />

      <style>{`
        .system-cards-scroller::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={backgroundGlowOne} />
      <div style={backgroundGlowTwo} />

      <div style={containerStyle}>
        <div style={heroStyle}>
          <div style={brandBadgeStyle}>PROAIR</div>

          <h1 style={heroTitleStyle}>Quick estimate in under 30 seconds</h1>

          <p style={heroTextStyle}>
            Add your room sizes below to get a guide system size, example options
            and estimated installed price.
          </p>

          <div style={heroPillRowStyle}>
            <div style={heroPillStyle}>❄️ Cooling & heating estimate</div>
            <div style={heroPillStyle}>🏡 Domestic friendly</div>
            <div style={heroPillStyle}>✅ Free site survey included</div>
          </div>
        </div>

        <div
          style={{
            ...mainGridStyle,
            gridTemplateColumns: isDesktop ? "minmax(0, 1.3fr) 390px" : "1fr",
          }}
        >
          <div style={cardStyle}>
            <div style={sectionIntroStyle}>
              <h2 style={cardTitleStyle}>Get an estimate</h2>
              <p style={cardSubtitleStyle}>
                Fill in the details below and ProAir will review your enquiry
                and recommend the best setup.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div style={sectionTitleStyle}>Rooms</div>

              <div style={roomHeaderRowStyle}>
                <p style={cardSubtitleStyle}>
                  Add each room you want to estimate.
                </p>

                <button
                  type="button"
                  onClick={addCustomerRoom}
                  style={smallButtonStyle}
                >
                  + Add room
                </button>
              </div>

              {customerRooms.map((room, index) => {
                const roomResult = calculateRoom(room);
                const isExpanded =
                  !shouldUseCollapsibleRooms || expandedRoomIds.includes(room.id);

                return (
                  <div key={room.id} style={roomCardStyle}>
                    <div
                      style={{
                        ...roomCardTopStyle,
                        cursor: shouldUseCollapsibleRooms ? "pointer" : "default",
                        marginBottom: isExpanded ? "12px" : 0,
                      }}
                      onClick={() => {
                        if (shouldUseCollapsibleRooms)
                          toggleRoomExpanded(room.id);
                      }}
                    >
                      <div>
                        <div style={roomNumberStyle}>Room {index + 1}</div>

                        <div style={roomCardTitleRowStyle}>
                          <input
                            value={room.name}
                            onChange={(e) =>
                              updateCustomerRoom(room.id, "name", e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            style={roomNameInputStyle}
                          />
                          <RoomTypeBadge value={room.roomType} />
                        </div>

                        {!isExpanded && (
                          <div
                            style={{
                              marginTop: "10px",
                              color: "#475569",
                              fontSize: "14px",
                            }}
                          >
                            {room.length && room.width
                              ? `${room.length}m × ${room.width}m • ${
                                  roomResult.recommended || "TBC"
                                } kW`
                              : "Tap to expand room details"}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        {shouldUseCollapsibleRooms && (
                          <div style={collapseIconStyle}>
                            {isExpanded ? "−" : "+"}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomerRoom(room.id);
                          }}
                          style={{
                            ...removeButtonStyle,
                            opacity: customerRooms.length === 1 ? 0.45 : 1,
                            cursor:
                              customerRooms.length === 1
                                ? "not-allowed"
                                : "pointer",
                          }}
                          disabled={customerRooms.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <>
                        <div style={responsiveGridStyle}>
                          <div>
                            <label style={labelStyle}>Length (m)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={room.length}
                              onChange={(e) =>
                                updateCustomerRoom(
                                  room.id,
                                  "length",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Width (m)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={room.width}
                              onChange={(e) =>
                                updateCustomerRoom(
                                  room.id,
                                  "width",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div style={responsiveGridStyle}>
                          <div>
                            <label style={labelStyle}>Ceiling height (m)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={room.height}
                              onChange={(e) =>
                                updateCustomerRoom(
                                  room.id,
                                  "height",
                                  Number(e.target.value)
                                )
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Room type</label>
                            <select
                              value={room.roomType}
                              onChange={(e) =>
                                updateCustomerRoom(
                                  room.id,
                                  "roomType",
                                  e.target.value
                                )
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

                        <div style={responsiveGridStyle}>
                          <div>
                            <label style={labelStyle}>Glazing</label>
                            <select
                              value={room.glazing}
                              onChange={(e) =>
                                updateCustomerRoom(
                                  room.id,
                                  "glazing",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="very_high">
                                Very high / bifolds
                              </option>
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>Sun exposure</label>
                            <select
                              value={room.exposure}
                              onChange={(e) =>
                                updateCustomerRoom(
                                  room.id,
                                  "exposure",
                                  e.target.value
                                )
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

                        <div style={responsiveGridStyle}>
                          <div>
                            <label style={labelStyle}>Floor level</label>
                            <select
                              value={room.floorLevel}
                              onChange={(e) =>
                                updateCustomerRoom(
                                  room.id,
                                  "floorLevel",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            >
                              <option value="ground">Ground floor</option>
                              <option value="first">First floor</option>
                              <option value="loft">Loft / second floor</option>
                            </select>
                          </div>
                          <div>
                            <label style={labelStyle}>
                              Best outdoor unit position
                            </label>
                            <select
                              value={room.outdoorSide}
                              onChange={(e) =>
                                updateCustomerRoom(
                                  room.id,
                                  "outdoorSide",
                                  e.target.value
                                )
                              }
                              style={inputStyle}
                            >
                              <option value="same_side">
                                Same side as room
                              </option>
                              <option value="front">Front of property</option>
                              <option value="rear">Rear of property</option>
                              <option value="side">Side elevation</option>
                              <option value="opposite_side">
                                Opposite side of property
                              </option>
                            </select>
                          </div>
                        </div>

                        <div style={summaryCardStyle}>
                          <div style={summaryHeaderStyle}>
                            <strong>Room estimate</strong>
                            <span style={summaryTagStyle}>Live</span>
                          </div>

                          <div style={roomEstimateGridStyle}>
                            <div>
                              <div style={miniLabelStyle}>
                                Recommended room size
                              </div>
                              <div style={miniValueStyle}>
                                {roomResult.recommended
                                  ? `${roomResult.recommended} kW`
                                  : "Enter room size"}
                              </div>
                            </div>

                            <div>
                              <div style={miniLabelStyle}>Estimated area</div>
                              <div style={miniValueStyle}>
                                {typeof roomResult.area === "string"
                                  ? roomResult.area
                                  : `${roomResult.area} m²`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              <div>
                <label style={labelStyle}>Anything else we should know?</label>
                <textarea
                  name="Additional notes"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  style={textAreaStyle}
                  rows={4}
                  placeholder="Access notes, preferred outdoor unit position, parking info, or anything else helpful"
                />
              </div>

              {/* Mobile-only live sizing readout during the rooms step.
                  Pricing and running costs stay hidden until submit. */}
              {!isDesktop && hasAnySizedRoom && !hasSubmitted && (
                <div style={summaryCardStyle}>
                  <div style={summaryHeaderStyle}>
                    <strong>Your rooms so far</strong>
                    <span style={summaryTagStyle}>Live</span>
                  </div>

                  <div style={statsGridStyle}>
                    <div style={statCardStyle}>
                      <strong>Total cooling load</strong>
                      <p style={statValueStyle}>
                        {customerEstimate.totalLoad} kW
                      </p>
                    </div>
                    <div style={statCardStyle}>
                      <strong>Suggested capacity</strong>
                      <p style={statValueStyle}>
                        {customerEstimate.totalRecommended} kW
                      </p>
                    </div>
                    <div style={statCardStyle}>
                      <strong>Rooms</strong>
                      <p style={statValueStyle}>{customerRooms.length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Contact details. Only appears once the user has
                  actually sized a room, and only until they submit. */}
              {hasAnySizedRoom && !hasSubmitted && (
                <>
                  <div style={sectionTitleStyle}>Your details</div>
                  <p style={cardSubtitleStyle}>
                    Add your contact details and we&apos;ll send your guide
                    prices and recommended systems.
                  </p>

                  <div style={{ ...responsiveGridStyle, marginTop: "16px" }}>
                    <div>
                      <label style={labelStyle}>Full name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone number</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  <div style={responsiveGridStyle}>
                    <div>
                      <label style={labelStyle}>Email address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Postcode</label>
                      <input
                        type="text"
                        value={customerPostcode}
                        onChange={(e) => setCustomerPostcode(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      When are you looking to install?
                    </label>
                    <select
                      value={installTimeframe}
                      onChange={(e) => setInstallTimeframe(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select timeframe</option>
                      <option value="ASAP">As soon as possible</option>
                      <option value="1 Month">Within the next month</option>
                      <option value="Researching">Just researching</option>
                    </select>
                  </div>

                  <div style={benefitsCardStyle}>
                    <div style={benefitItemStyle}>
                      ✔{" "}
                      {customerRooms.length === 1 &&
                        "1 unit: typically 4–6 hours"}
                      {customerRooms.length === 2 &&
                        "2 units: typically completed in 1 day"}
                      {customerRooms.length === 3 &&
                        "3 units: typically 1–2 days"}
                      {customerRooms.length >= 4 &&
                        "4+ units: typically 2–3 days"}
                    </div>
                    <div style={benefitItemStyle}>
                      ✔ Free site survey included
                    </div>
                    <div style={benefitItemStyle}>
                      ✔ F-Gas certified installation
                    </div>
                    <div style={benefitItemStyle}>
                      ✔ Up to 7-year manufacturer warranty
                    </div>
                  </div>

                  <p style={consentNoteStyle}>
                    By submitting your details you agree that ProAir may contact
                    you about your enquiry. If you don&apos;t complete this form
                    a member of our team may still follow up using the details
                    you&apos;ve provided. See our privacy policy for more.
                  </p>

                  <button
                    type="submit"
                    style={{
                      ...buttonStyle,
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? "wait" : "pointer",
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending…" : "Get my guide prices"}
                  </button>
                </>
              )}

              {/* Step 3 — Results reveal. Full pricing, recommended systems
                  and WhatsApp CTA only appear after a successful submit. */}
              {hasSubmitted && (
                <>
                  <div style={summaryCardStyle}>
                    <div style={summaryHeaderStyle}>
                      <strong>Your estimate</strong>
                      <span style={summaryTagStyle}>Ready</span>
                    </div>

                    <div style={statsGridStyle}>
                      <div style={statCardStyle}>
                        <strong>Total cooling load</strong>
                        <p style={statValueStyle}>
                          {customerEstimate.totalLoad} kW
                        </p>
                      </div>
                      <div style={statCardStyle}>
                        <strong>Suggested capacity</strong>
                        <p style={statValueStyle}>
                          {customerEstimate.totalRecommended} kW
                        </p>
                      </div>
                      <div style={statCardStyle}>
                        <strong>Cooling cost</strong>
                        <p style={statValueStyle}>
                          £{customerEstimate.estimatedCoolingMonthly}/mo
                        </p>
                      </div>
                      <div style={statCardStyle}>
                        <strong>Heating cost</strong>
                        <p style={statValueStyle}>
                          £{customerEstimate.estimatedHeatingMonthly}/mo
                        </p>
                      </div>
                    </div>

                    <p style={priceNoteStyle}>
                      Estimated running costs based on typical domestic use and
                      current electricity prices. Actual costs vary by use,
                      insulation and tariff.
                    </p>
                  </div>

                  {!isDesktop && (
                    <div style={systemsWrapStyle}>
                      <div style={sectionTitleStyle}>
                        Recommended systems & guide price
                      </div>
                      <SystemCardsDeck
                        customerEstimate={customerEstimate}
                        selectedCustomerSystem={selectedCustomerSystem}
                        setSelectedCustomerSystem={setSelectedCustomerSystem}
                      />
                    </div>
                  )}

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    style={waStyle}
                  >
                    📲 Send this estimate to ProAir on WhatsApp
                  </a>

                  <p style={helperTextStyle}>
                    Thanks — we&apos;ve sent your details to the ProAir team.
                    Most customers receive a reply within 10 minutes during
                    working hours.
                  </p>

                  <p style={priceNoteStyle}>
                    Guide price only. Final cost depends on pipe runs,
                    electrics, access and installation layout.
                  </p>
                </>
              )}
            </form>
          </div>

          {isDesktop && (
            <div style={stickySidebarWrapStyle}>
              <div style={stickySidebarStyle}>
                <div style={sidebarCardStyle}>
                  <div style={sidebarLogoStyle}>
                    <span style={{ color: "#7c8593" }}>PRO</span>
                    <span style={{ color: "#0b6f8f" }}>AIR</span>
                  </div>

                  <div style={sidebarMiniTextStyle}>
                    {hasSubmitted
                      ? "Your estimate"
                      : hasAnySizedRoom
                      ? "Live sizing"
                      : "Get started"}
                  </div>

                  {!hasAnySizedRoom && (
                    <div style={unlockCardStyle}>
                      <div style={unlockTitleStyle}>📐 Add a room</div>
                      <p style={unlockTextStyle}>
                        Enter at least one room&apos;s length and width to see
                        its suggested system size.
                      </p>
                    </div>
                  )}

                  {hasAnySizedRoom && (
                    <div style={sidebarSectionStyle}>
                      <div style={sidebarSectionTitleStyle}>
                        {hasSubmitted ? "Estimate summary" : "Sizing so far"}
                      </div>

                      <div style={statsGridStyle}>
                        <div style={statCardStyle}>
                          <strong>Total cooling load</strong>
                          <p style={statValueStyle}>
                            {customerEstimate.totalLoad} kW
                          </p>
                        </div>
                        <div style={statCardStyle}>
                          <strong>Suggested capacity</strong>
                          <p style={statValueStyle}>
                            {customerEstimate.totalRecommended} kW
                          </p>
                        </div>
                        <div style={statCardStyle}>
                          <strong>Rooms</strong>
                          <p style={statValueStyle}>{customerRooms.length}</p>
                        </div>
                        {hasSubmitted && (
                          <>
                            <div style={statCardStyle}>
                              <strong>Cooling cost</strong>
                              <p style={statValueStyle}>
                                £{customerEstimate.estimatedCoolingMonthly}/mo
                              </p>
                            </div>
                            <div style={statCardStyle}>
                              <strong>Heating cost</strong>
                              <p style={statValueStyle}>
                                £{customerEstimate.estimatedHeatingMonthly}/mo
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {hasSubmitted && (
                        <p style={priceNoteStyle}>
                          Estimated running costs based on typical domestic use
                          and current electricity prices. Actual costs vary by
                          use, insulation and tariff.
                        </p>
                      )}
                    </div>
                  )}

                  {hasSubmitted ? (
                    <>
                      <div style={sidebarSectionStyle}>
                        <div style={sidebarSectionTitleStyle}>
                          Recommended systems & guide price
                        </div>

                        <SidebarSystemCards
                          customerEstimate={customerEstimate}
                          selectedCustomerSystem={selectedCustomerSystem}
                          setSelectedCustomerSystem={setSelectedCustomerSystem}
                        />
                      </div>

                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        style={waSidebarStyle}
                      >
                        📲 Send on WhatsApp
                      </a>
                    </>
                  ) : hasAnySizedRoom ? (
                    <div style={unlockCardStyle}>
                      <div style={unlockTitleStyle}>🔓 Unlock guide prices</div>
                      <p style={unlockTextStyle}>
                        Add your contact details below and submit to reveal
                        recommended systems and guide prices.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(11,111,143,0.22), transparent 35%), linear-gradient(180deg, #06122e 0%, #081733 100%)",
  color: "white",
  padding: "32px 18px",
  fontFamily:
    'Inter, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  position: "relative",
  overflow: "hidden",
};

const backgroundGlowOne = {
  position: "absolute",
  top: "-120px",
  left: "-80px",
  width: "320px",
  height: "320px",
  borderRadius: "999px",
  background: "rgba(11, 111, 143, 0.16)",
  filter: "blur(60px)",
  pointerEvents: "none",
};

const backgroundGlowTwo = {
  position: "absolute",
  bottom: "-120px",
  right: "-80px",
  width: "360px",
  height: "360px",
  borderRadius: "999px",
  background: "rgba(37, 211, 102, 0.10)",
  filter: "blur(70px)",
  pointerEvents: "none",
};

const containerStyle = {
  maxWidth: "1220px",
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

const heroStyle = {
  marginBottom: "22px",
};

const brandBadgeStyle = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  marginBottom: "14px",
};

const heroTitleStyle = {
  margin: 0,
  fontSize: "clamp(32px, 5vw, 54px)",
  lineHeight: 1.04,
  fontWeight: 800,
  letterSpacing: "-0.03em",
};

const heroTextStyle = {
  marginTop: "14px",
  marginBottom: "18px",
  maxWidth: "760px",
  color: "rgba(255,255,255,0.78)",
  fontSize: "16px",
  lineHeight: 1.6,
};

const heroPillRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const heroPillStyle = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.88)",
  fontSize: "13px",
  fontWeight: 600,
};

const mainGridStyle = {
  display: "grid",
  gap: "22px",
  alignItems: "start",
};

const cardStyle = {
  background: "rgba(243, 244, 246, 0.98)",
  color: "#0b1b3a",
  borderRadius: "28px",
  padding: "26px",
  boxShadow: "0 24px 60px rgba(2, 6, 23, 0.35)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const sectionIntroStyle = {
  marginBottom: "20px",
};

const cardTitleStyle = {
  fontSize: "32px",
  marginTop: 0,
  marginBottom: "8px",
  lineHeight: 1.1,
};

const cardSubtitleStyle = {
  color: "#475569",
  marginTop: 0,
  marginBottom: 0,
  lineHeight: 1.55,
};

const sectionTitleStyle = {
  fontSize: "13px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#0b2e73",
  marginTop: "24px",
  marginBottom: "12px",
};

const responsiveGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 15px",
  marginBottom: "18px",
  borderRadius: "16px",
  border: "1px solid #d4dbe6",
  boxSizing: "border-box",
  fontSize: "16px",
  background: "#ffffff",
  outline: "none",
  boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
};

const textAreaStyle = {
  width: "100%",
  padding: "14px 15px",
  marginBottom: "18px",
  borderRadius: "16px",
  border: "1px solid #d4dbe6",
  boxSizing: "border-box",
  fontSize: "16px",
  resize: "vertical",
  fontFamily:
    'Inter, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  background: "#ffffff",
  outline: "none",
};

const roomHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const smallButtonStyle = {
  background: "linear-gradient(135deg, #0b2e73 0%, #0b6f8f 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const roomCardStyle = {
  background: "linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%)",
  borderRadius: "22px",
  padding: "18px",
  marginBottom: "18px",
  border: "1px solid #dbe6ff",
};

const roomCardTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const roomNumberStyle = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "6px",
};

const roomCardTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const roomNameInputStyle = {
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid #d4dbe6",
  fontSize: "16px",
  fontWeight: 800,
  background: "#ffffff",
  minWidth: "180px",
};

const roomTypeBadgeStyle = {
  display: "inline-block",
  background: "#dbeafe",
  color: "#1d4ed8",
  borderRadius: "999px",
  padding: "7px 11px",
  fontSize: "12px",
  fontWeight: 800,
};

const removeButtonStyle = {
  background: "#ffffff",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  borderRadius: "12px",
  padding: "10px 12px",
  fontSize: "13px",
  fontWeight: 800,
};

const collapseIconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#0b2e73",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  fontWeight: 800,
  flexShrink: 0,
};

const summaryCardStyle = {
  background: "linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%)",
  border: "1px solid #dbe6ff",
  borderRadius: "18px",
  padding: "18px",
  marginBottom: "18px",
};

const summaryHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "10px",
};

const summaryTagStyle = {
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 700,
  borderRadius: "999px",
  padding: "6px 10px",
};

const roomEstimateGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
};

const miniLabelStyle = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  marginBottom: "4px",
};

const miniValueStyle = {
  fontSize: "16px",
  fontWeight: 800,
  color: "#0f172a",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const statCardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "14px",
  fontSize: "13px",
  color: "#334155",
};

const statValueStyle = {
  margin: "8px 0 0 0",
  fontSize: "20px",
  fontWeight: 900,
  color: "#0b2e73",
};

const systemsWrapStyle = {
  marginBottom: "16px",
};

const systemCarouselWrapStyle = {
  display: "grid",
  gap: "12px",
};

const systemCarouselHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
};

const systemCarouselHintStyle = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#64748b",
};

const systemCarouselButtonsStyle = {
  display: "flex",
  gap: "8px",
};

const systemScrollButtonStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  border: "1px solid #dbe6ff",
  background: "#ffffff",
  color: "#0b2e73",
  fontSize: "16px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const systemCardsScrollerStyle = {
  overflowX: "auto",
  overflowY: "visible",
  WebkitOverflowScrolling: "touch",
  scrollSnapType: "x proximity",
  paddingTop: "16px",
  paddingBottom: "10px",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const systemCardsRowStyle = {
  display: "flex",
  alignItems: "stretch",
  minWidth: "max-content",
};

const systemDeckItemStyle = {
  flex: "0 0 auto",
  transition: "transform 0.22s ease, z-index 0.22s ease",
  scrollSnapAlign: "center",
};

const sidebarSystemsStackStyle = {
  display: "grid",
  gap: "12px",
};

const systemCardStyle = {
  background: "#ffffff",
  borderRadius: "18px",
  padding: "16px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
  minHeight: "100%",
};

const systemCardCompactStyle = {
  padding: "14px",
};

const selectedSystemCardStyle = {
  border: "2px solid #0b2e73",
  boxShadow: "0 12px 30px rgba(11,46,115,0.12)",
};

const selectedSystemCardStyleGreen = {
  border: "2px solid #22c55e",
  boxShadow: "0 12px 30px rgba(34,197,94,0.18)",
};

const disabledSystemCardStyle = {
  opacity: 0.55,
};

const systemImageWrapStyle = {
  height: "150px",
  borderRadius: "14px",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "14px",
  overflow: "hidden",
};

const systemImageWrapCompactStyle = {
  height: "110px",
  marginBottom: "12px",
};

const systemImageStyle = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
};

const pillRowStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "10px",
};

const budgetPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 700,
};

const standardPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 700,
};

const premiumPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#ede9fe",
  color: "#6d28d9",
  fontSize: "12px",
  fontWeight: 700,
};

const recommendedPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#22c55e",
  color: "#ecfdf5",
  fontSize: "12px",
  fontWeight: 700,
};

const selectedPillStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#16a34a",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 700,
};

const systemTitleStyle = {
  margin: "0 0 8px 0",
  fontSize: "20px",
  color: "#0f172a",
};

const systemTitleCompactStyle = {
  fontSize: "18px",
};

const systemDescriptionStyle = {
  margin: "0 0 10px 0",
  color: "#475569",
  lineHeight: 1.5,
};

const systemDescriptionCompactStyle = {
  fontSize: "14px",
};

const systemPriceStyle = {
  margin: "0 0 6px 0",
  fontWeight: 900,
  color: "#0b2e73",
  fontSize: "18px",
};

const systemPriceCompactStyle = {
  fontSize: "17px",
};

const systemNoteStyle = {
  margin: 0,
  fontSize: "13px",
  color: "#64748b",
};

const benefitsCardStyle = {
  display: "grid",
  gap: "10px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "16px",
  marginBottom: "16px",
};

const benefitItemStyle = {
  fontSize: "14px",
  color: "#334155",
  fontWeight: 600,
};

const waStyle = {
  display: "inline-block",
  background: "#25D366",
  color: "white",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(37,211,102,0.28)",
};

const helperTextStyle = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "10px",
  marginBottom: "14px",
};

const priceNoteStyle = {
  fontSize: "13px",
  color: "#64748b",
  marginBottom: "14px",
  lineHeight: 1.55,
};

const consentNoteStyle = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "18px",
  marginBottom: "16px",
  lineHeight: 1.55,
  padding: "12px 14px",
  background: "rgba(11, 111, 143, 0.06)",
  border: "1px solid rgba(11, 111, 143, 0.14)",
  borderRadius: "12px",
};

const buttonStyle = {
  width: "100%",
  background: "linear-gradient(135deg, #0b2e73 0%, #0b6f8f 100%)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  padding: "16px 18px",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(11,46,115,0.28)",
};

const stickySidebarWrapStyle = {
  position: "relative",
};

const stickySidebarStyle = {
  position: "sticky",
  top: "24px",
};

const sidebarCardStyle = {
  background: "rgba(243, 244, 246, 0.98)",
  color: "#0b1b3a",
  borderRadius: "28px",
  padding: "20px",
  boxShadow: "0 24px 60px rgba(2, 6, 23, 0.28)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const sidebarLogoStyle = {
  fontSize: "32px",
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: "-0.04em",
};

const sidebarMiniTextStyle = {
  marginTop: "8px",
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 700,
};

const sidebarSectionStyle = {
  marginTop: "18px",
};

const sidebarSectionTitleStyle = {
  fontSize: "14px",
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: "12px",
};

const detailChipGridStyle = {
  display: "grid",
  gap: "10px",
};

const detailChipStyle = {
  display: "grid",
  gridTemplateColumns: "34px 1fr",
  gap: "10px",
  alignItems: "start",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "12px",
};

const detailChipIconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "12px",
  background: "#eef4ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
};

const detailChipLabelStyle = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  marginBottom: "3px",
};

const detailChipValueStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#0f172a",
  lineHeight: 1.4,
  wordBreak: "break-word",
};

const waSidebarStyle = {
  display: "block",
  marginTop: "16px",
  textAlign: "center",
  background: "#25D366",
  color: "white",
  textDecoration: "none",
  padding: "13px 18px",
  borderRadius: "14px",
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(37,211,102,0.28)",
};

const unlockCardStyle = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "18px",
  background: "linear-gradient(135deg,#eef4ff,#f8fafc)",
  border: "1px solid #dbe6ff",
  textAlign: "center",
};

const unlockTitleStyle = {
  fontSize: "20px",
  fontWeight: 900,
  marginBottom: "8px",
  color: "#0f172a",
};

const unlockTextStyle = {
  margin: 0,
  fontSize: "14px",
  color: "#475569",
  lineHeight: 1.6,
};
