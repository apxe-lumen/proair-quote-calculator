/**
 * Pricing and sizing constants for the ProAir quote calculator.
 * Edit values here — no need to touch page.jsx.
 */

// Available unit sizes in kW (ascending). The calculator rounds up to the
// smallest size that covers the room's calculated load.
export const unitSizes = [2.0, 2.5, 3.5, 4.2, 5.0, 6.0, 7.1, 8.5, 10.0];

// Guide prices per brand, keyed by the maximum kW size the price covers.
// Each entry is [maxKw, price]. Checked in order — first match wins.
// Set price to null for sizes a brand doesn't offer.
export const brandPricing = {
  midea: [
    [3.5, 1500],
    [5.0, 2000],
    [7.1, 2600],
    [99, 3000],
  ],
  mitsubishi: [
    [3.5, 1800],
    [5.0, 2400],
    [7.1, 3000],
    [99, 3500],
  ],
  zen: [
    [3.5, 2400],
    [5.0, 3000],
    // Zen doesn't cover sizes above 5.0 — returns null
  ],
};

// Base watts per m² by room type. Higher values = more cooling capacity.
export const wattsPerM2 = {
  living: 125,
  bedroom: 110,
  office: 130,
  garden_room: 165,
  kitchen: 150,
};

// Glazing uplift factors (added to the base multiplier of 1.0).
export const glazingUplift = {
  low: 0,
  medium: 0.1,
  high: 0.22,
  very_high: 0.35,
};

// Sun-exposure uplift factors.
export const exposureUplift = {
  north: 0,
  east: 0,
  west: 0.08,
  south: 0.14,
};

// Insulation quality factor (multiplied against the total load).
export const insulationFactor = {
  modern: 0.85,
  average: 1.0,
  poor: 1.2,
};

// Multi-room discount: first unit is always full price, extras get a flat
// £ discount. Each entry is [minRoomCount, discountPerExtraUnit].
// Checked in reverse order — last match wins.
export const multiRoomDiscount = [
  [2, 300], // 2–3 rooms: £300 off each extra unit
  [4, 400], // 4+ rooms: £400 off each extra unit
];

// Suggest 2 outdoor units when the customer has more than this many indoors.
export const maxIndoorsPerOutdoor = 4;

// Ceiling-height uplift thresholds.
// Each entry is [aboveMetres, uplift]. Applied cumulatively.
export const heightUplifts = [
  [2.7, 0.08],
  [3.0, 0.08],
];
