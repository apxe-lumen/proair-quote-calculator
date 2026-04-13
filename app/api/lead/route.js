import { Resend } from "resend";

// Lazy-init so missing API key doesn't crash module load in dev.
let resendClient = null;
const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

const escapeHtml = (value) => {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatMoney = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
};

export async function POST(req) {
  try {
    const data = await req.json();
    const stage = data.stage === "completed" ? "completed" : "partial";

    const safe = {
      name: escapeHtml(data.name),
      phone: escapeHtml(data.phone),
      email: escapeHtml(data.email),
      postcode: escapeHtml(data.postcode),
      system: escapeHtml(data.system),
      rooms: escapeHtml(data.rooms),
      load: escapeHtml(data.load),
      capacity: escapeHtml(data.capacity),
      notes: escapeHtml(data.notes),
      timeframe: escapeHtml(data.timeframe),
      roomBreakdown: escapeHtml(data.roomBreakdown),
    };

    const contactBlock = `
      <h3>Contact</h3>
      <p><strong>Name:</strong> ${safe.name}</p>
      <p><strong>Phone:</strong> ${safe.phone}</p>
      <p><strong>Email:</strong> ${safe.email}</p>
      <p><strong>Postcode:</strong> ${safe.postcode}</p>
      <p><strong>Install timeframe:</strong> ${safe.timeframe || "Not specified"}</p>
    `;

    const sizingBlock = `
      <h3>Sizing</h3>
      <p><strong>Rooms:</strong> ${safe.rooms}</p>
      <p><strong>Cooling load:</strong> ${safe.load} kW</p>
      <p><strong>Suggested capacity:</strong> ${safe.capacity} kW</p>
      <h4>Room breakdown</h4>
      <pre style="font-family:Arial,sans-serif;white-space:pre-wrap;">${
        safe.roomBreakdown || "No room breakdown provided"
      }</pre>
    `;

    const discountLine = data.totalDiscount > 0
      ? `<p><strong>Multi-room saving:</strong> £${formatMoney(data.totalDiscount)} off (first unit full price, extras discounted)</p>`
      : "";

    const outdoorLine = data.outdoorLocation
      ? `<p><strong>Outdoor unit preference:</strong> ${escapeHtml(data.outdoorLocation)}</p>`
      : "";

    const twoOutdoorLine = data.suggestTwoOutdoors
      ? `<p><strong>⚠ Recommended:</strong> 2 outdoor units (${safe.rooms} indoor units)</p>`
      : "";

    const accessLine = data.hasUpperFloorRoom
      ? `<p><strong>⚠ Access note:</strong> One or more rooms above ground floor — may need access equipment.</p>`
      : "";

    const pricingBlock = `
      <h3>Guide prices</h3>
      <p><strong>Selected system:</strong> ${safe.system}</p>
      <p><strong>Midea Solstice:</strong> £${formatMoney(data.mideaPrice)}</p>
      <p><strong>Mitsubishi Electric AY:</strong> £${formatMoney(data.mitsubishiPrice)}</p>
      <p><strong>Mitsubishi Zen:</strong> ${
        data.zenEligible
          ? `£${formatMoney(data.zenPrice)}`
          : "Not available above 5.0kW per room"
      }</p>
      ${discountLine}
      ${outdoorLine}
      ${twoOutdoorLine}
      ${accessLine}
    `;

    const notesBlock = `
      <h3>Customer notes</h3>
      <p>${safe.notes || "No additional notes"}</p>
    `;

    let subject;
    let html;

    if (stage === "completed") {
      subject = "ProAir — completed estimate request";
      html = `
        <h2>Completed estimate request</h2>
        <p>The customer finished the calculator and submitted their details.</p>
        ${contactBlock}
        ${sizingBlock}
        ${pricingBlock}
        ${notesBlock}
      `;
    } else {
      subject = "ProAir — partial lead (contact only, no submit)";
      html = `
        <h2>Partial lead — follow up</h2>
        <p>This customer entered their contact details and started sizing rooms
        but did not click submit. Guide prices have not been shown to them yet.</p>
        ${contactBlock}
        ${sizingBlock}
        <p style="color:#64748b;font-size:13px;">
          Guide prices are withheld from partial leads because the customer has
          not completed their enquiry. Reach out directly to finish their quote.
        </p>
      `;
    }

    const resend = getResend();
    if (!resend) {
      console.warn(
        `[lead] RESEND_API_KEY not set — skipping send. stage=${stage}`
      );
      return Response.json({ success: true, stage, skipped: true });
    }

    const email = await resend.emails.send({
      from: "ProAir Estimator <onboarding@resend.dev>",
      to: ["contact@proairuk.co.uk"],
      subject,
      html,
    });

    return Response.json({ success: true, stage, email });
  } catch (error) {
    console.error("Email send failed:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
