// ── Rate limiting (in-memory, resets on server restart) ──────────────
const ipHits = new Map();
const emailHits = new Map();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;

function isRateLimited(map, key, max) {
  const now = Date.now();
  const hits = map.get(key) || [];
  const recent = hits.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) return true;
  recent.push(now);
  map.set(key, recent);
  return false;
}

// ── Helpers ──────────────────────────────────────────────────────────
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

const LOGO_URL = "https://www.proairuk.co.uk/wp-content/uploads/2021/01/ProAirLogo.jpg";
const PHONE = "0800 009 6300";

// ── Email wrapper (table-based for email client compatibility) ───────
function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
    <tr><td align="center" style="padding:30px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#06122e 0%,#0b2e73 100%);padding:28px 32px;text-align:center;">
            <span style="font-size:28px;font-weight:800;letter-spacing:0.04em;color:rgba(255,255,255,0.85);">PRO</span><span style="font-size:28px;font-weight:800;letter-spacing:0.04em;color:#4dd4e6;">AIR</span>
            <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:6px;letter-spacing:0.1em;">AIR CONDITIONING &amp; HEAT PUMPS</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#64748b;">ProAir UK &mdash; Air Conditioning &amp; Heat Pumps</p>
            <p style="margin:0 0 6px;font-size:13px;color:#64748b;">
              <a href="tel:${PHONE.replace(/\s/g, "")}" style="color:#0b6f8f;text-decoration:none;font-weight:700;">${PHONE}</a>
              &nbsp;&bull;&nbsp;
              <a href="mailto:contact@proairuk.co.uk" style="color:#0b6f8f;text-decoration:none;">contact@proairuk.co.uk</a>
            </p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              <a href="https://www.proairuk.co.uk" style="color:#94a3b8;text-decoration:none;">www.proairuk.co.uk</a>
              &nbsp;&bull;&nbsp;
              <a href="https://www.proairuk.co.uk/privacy-policy/" style="color:#94a3b8;text-decoration:none;">Privacy Policy</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Styled section helpers ───────────────────────────────────────────
function sectionTitle(text) {
  return `<h3 style="margin:24px 0 12px;font-size:16px;color:#0b2e73;border-bottom:2px solid #dbeafe;padding-bottom:8px;">${text}</h3>`;
}

function infoRow(label, value) {
  return `<tr>
    <td style="padding:6px 0;font-size:14px;color:#64748b;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:600;">${value}</td>
  </tr>`;
}

function infoTable(rows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function alertBox(text, color = "#0b6f8f", bg = "#eef6f9") {
  return `<div style="background:${bg};border-left:4px solid ${color};border-radius:8px;padding:12px 16px;margin:12px 0;font-size:13px;color:${color};">${text}</div>`;
}

function priceCard(brand, price, isSelected, note) {
  const border = isSelected ? "2px solid #0b6f8f" : "1px solid #e5e7eb";
  const badge = isSelected ? '<span style="display:inline-block;background:#0b6f8f;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:99px;margin-left:8px;">Selected</span>' : "";
  return `<div style="border:${border};border-radius:12px;padding:14px 16px;margin-bottom:8px;">
    <span style="font-size:14px;font-weight:700;color:#0f172a;">${brand}</span>${badge}
    <span style="float:right;font-size:15px;font-weight:800;color:#0b2e73;">${price}</span>
    ${note ? `<div style="font-size:12px;color:#64748b;margin-top:4px;">${note}</div>` : ""}
  </div>`;
}

// ── Mailgun send (REST API, no SDK) ─────────────────────────────────
async function sendMailgun({ to, subject, html }) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM || `no-reply@${domain}`;

  if (!apiKey || !domain) {
    console.warn("[lead] MAILGUN_API_KEY or MAILGUN_DOMAIN not set — skipping send.");
    return null;
  }

  const form = new URLSearchParams();
  form.append("from", `ProAir <${from}>`);
  form.append("to", to);
  form.append("subject", subject);
  form.append("html", html);

  const region = process.env.MAILGUN_REGION === "us" ? "api.mailgun.net" : "api.eu.mailgun.net";
  const res = await fetch(`https://${region}/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`api:${apiKey}`).toString("base64"),
    },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mailgun ${res.status}: ${body}`);
  }

  return res.json();
}

// ── ntfy push notification ──────────────────────────────────────────
async function sendNtfy({ title, message, priority = "high", actions = [] }) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return null;

  const headers = { "Content-Type": "application/json" };
  const token = process.env.NTFY_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = {
    topic,
    title,
    message,
    priority: priority === "high" ? 4 : 3,
    tags: ["house", "moneybag"],
  };
  if (actions.length > 0) body.actions = actions;

  try {
    await fetch("https://ntfy.sh/", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[ntfy] Push failed:", err);
  }
}

// ── Route handler ───────────────────────────────────────────────────
export async function POST(req) {
  try {
    // Rate limit by IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    if (isRateLimited(ipHits, ip, MAX_PER_IP)) {
      return Response.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const data = await req.json();
    const stage = data.stage === "completed" ? "completed" : "partial";

    // Basic payload validation. The character class explicitly excludes
    // comma/semicolon/angle brackets/quotes so a single field can't smuggle
    // additional recipients into Mailgun's `to` parameter.
    if (
      !data.email ||
      typeof data.email !== "string" ||
      data.email.length > 254 ||
      !/^[^\s,;<>"]+@[^\s,;<>"]+\.[^\s,;<>"]+$/.test(data.email)
    ) {
      return Response.json(
        { success: false, error: "Valid email is required." },
        { status: 400 }
      );
    }
    if (!data.name || !data.phone) {
      return Response.json(
        { success: false, error: "Name and phone are required." },
        { status: 400 }
      );
    }

    // Rate limit by customer email
    if (isRateLimited(emailHits, data.email.toLowerCase(), MAX_PER_EMAIL)) {
      return Response.json(
        { success: false, error: "Too many requests for this email. Please try again later." },
        { status: 429 }
      );
    }

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
      quoteRef: escapeHtml(data.quoteRef),
    };

    const proairTo = process.env.PROAIR_EMAIL || "contact@proairuk.co.uk";

    // ── Build shared content blocks ───────────────────────────────
    const contactRows = infoTable(
      infoRow("Name", safe.name) +
      infoRow("Phone", safe.phone) +
      infoRow("Email", `<a href="mailto:${safe.email}" style="color:#0b6f8f;">${safe.email}</a>`) +
      infoRow("Postcode", safe.postcode) +
      infoRow("Timeframe", safe.timeframe || "Not specified")
    );

    const sizingRows = infoTable(
      infoRow("Rooms", safe.rooms) +
      infoRow("Cooling load", `${safe.load} kW`) +
      infoRow("Suggested capacity", `${safe.capacity} kW`)
    );

    const roomBreakdownBlock = safe.roomBreakdown
      ? `<div style="background:#f8fafc;border-radius:8px;padding:12px 16px;margin:12px 0;font-size:13px;color:#334155;white-space:pre-wrap;line-height:1.7;">${safe.roomBreakdown}</div>`
      : "";

    const labelMap = {
      living: "Living room", bedroom: "Bedroom", office: "Office",
      garden_room: "Garden room", kitchen: "Kitchen",
      low: "Low", medium: "Medium", high: "High", very_high: "Very high",
      north: "North", east: "East", west: "West", south: "South",
      modern: "Modern / well-insulated", average: "Average", poor: "Older / poorly-insulated",
      ground: "Ground floor", first: "First floor", loft: "Loft / second floor",
    };
    const label = (v) => labelMap[v] || v || "—";

    const roomDetailCards = Array.isArray(data.roomDetails)
      ? data.roomDetails.map((r) => `
        <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin-bottom:10px;">
          <div style="font-size:15px;font-weight:700;color:#0b2e73;margin-bottom:6px;">
            ${escapeHtml(r.name)} — ${escapeHtml(r.recommended)} kW
          </div>
          <div style="font-size:13px;color:#475569;line-height:1.8;">
            ${escapeHtml(r.length)}m × ${escapeHtml(r.width)}m (${escapeHtml(r.area)} m²)
            · Ceiling ${escapeHtml(r.height)}m<br/>
            ${label(r.roomType)}
            · ${label(r.exposure)}-facing
            · ${label(r.glazing)} glazing
            · ${label(r.insulation)}
            · ${label(r.floorLevel)}
          </div>
        </div>
      `).join("")
      : roomBreakdownBlock;

    const mideaPrice = `£${formatMoney(data.mideaPrice)}`;
    const mitsubishiPrice = `£${formatMoney(data.mitsubishiPrice)}`;
    const zenPrice = data.zenEligible ? `£${formatMoney(data.zenPrice)}` : "N/A (above 5.0kW)";

    const pricingCards =
      priceCard("Midea Solstice", mideaPrice, safe.system === "Midea Solstice") +
      priceCard("Mitsubishi Electric AY", mitsubishiPrice, safe.system === "Mitsubishi Electric AY", "Most popular") +
      priceCard("Mitsubishi Zen", zenPrice, safe.system === "Mitsubishi Electric Zen", data.zenEligible ? "Premium finish" : "Only available up to 5.0kW per room");

    const discountAlert = data.totalDiscount > 0
      ? alertBox(`<strong>Multi-room saving: £${formatMoney(data.totalDiscount)} off</strong> — first unit full price, additional units discounted.`, "#15803d", "#f0fdf4")
      : "";

    const outdoorAlert = data.outdoorLocation
      ? alertBox(`<strong>Outdoor unit preference:</strong> ${escapeHtml(data.outdoorLocation)}`)
      : "";

    const twoOutdoorAlert = data.suggestTwoOutdoors
      ? alertBox(`<strong>Recommended: 2 outdoor units</strong> (${safe.rooms} indoor units) to spread the load and allow for future expansion.`, "#b45309", "#fffbeb")
      : "";

    const accessAlert = data.hasUpperFloorRoom
      ? alertBox(`<strong>Access note:</strong> One or more rooms above ground floor — additional costs may apply if access equipment is required.`, "#b45309", "#fffbeb")
      : "";

    const refBadge = safe.quoteRef
      ? `<div style="display:inline-block;background:#0b2e73;color:#ffffff;font-size:13px;font-weight:700;padding:6px 14px;border-radius:99px;margin-bottom:16px;">Quote ref: ${safe.quoteRef}</div>`
      : "";

    // ── Completed quote ─────────────────────────────────────────────
    if (stage === "completed") {
      // ── ProAir admin email ──────────────────────────────────────
      const proairSubject = data.quoteRef
        ? `New quote ${data.quoteRef} — ${safe.name}, ${safe.postcode}`
        : `New quote — ${safe.name}, ${safe.postcode}`;

      const proairHtml = emailWrapper(`
        ${refBadge}
        <h2 style="margin:0 0 8px;font-size:22px;color:#0b2e73;">New Quote Request</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#64748b;">A customer has submitted a quote via the estimator.</p>

        ${sectionTitle("Customer Details")}
        ${contactRows}

        ${sectionTitle("Sizing")}
        ${sizingRows}

        ${sectionTitle("Room Details")}
        ${roomDetailCards}

        ${sectionTitle("Guide Prices")}
        ${pricingCards}
        ${discountAlert}

        ${sectionTitle("Installation Notes")}
        ${outdoorAlert}
        ${twoOutdoorAlert}
        ${accessAlert}
        ${safe.notes ? `<div style="background:#f8fafc;border-radius:8px;padding:12px 16px;margin:12px 0;font-size:13px;color:#334155;">${safe.notes}</div>` : '<p style="font-size:13px;color:#94a3b8;">No additional notes.</p>'}
      `);

      // ── Customer email ──────────────────────────────────────────
      const customerSubject = data.quoteRef
        ? `Your ProAir quote — ${data.quoteRef}`
        : "Your ProAir air conditioning quote";

      const customerHtml = emailWrapper(`
        ${refBadge}
        <h2 style="margin:0 0 8px;font-size:22px;color:#0b2e73;">Your Air Conditioning Quote</h2>
        <p style="margin:0 0 20px;font-size:15px;color:#334155;">Hi ${safe.name}, thanks for using our estimator. Here&rsquo;s a summary of your quote.</p>

        ${sectionTitle("Your Rooms")}
        ${sizingRows}
        ${roomBreakdownBlock}

        ${sectionTitle("Guide Prices")}
        <p style="font-size:13px;color:#64748b;margin:0 0 12px;">Prices include supply, installation, and commissioning. All prices are guide estimates.</p>
        ${pricingCards}
        ${discountAlert}
        ${accessAlert}

        ${sectionTitle("What Happens Next?")}
        <p style="font-size:14px;color:#334155;line-height:1.6;">
          A member of the ProAir team will be in touch shortly to arrange your
          <strong>free site survey</strong>. We&rsquo;ll confirm the final price
          and answer any questions.
        </p>
        <p style="font-size:14px;color:#334155;line-height:1.6;">
          In the meantime, if you have any questions:
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0;">
          <tr>
            <td style="padding:8px 0;">
              <span style="font-size:18px;vertical-align:middle;">&#128222;</span>
              <a href="tel:${PHONE.replace(/\s/g, "")}" style="color:#0b6f8f;font-size:15px;font-weight:700;text-decoration:none;vertical-align:middle;margin-left:6px;">${PHONE}</a>
              <span style="font-size:13px;color:#64748b;margin-left:6px;">(Freephone)</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <span style="font-size:18px;vertical-align:middle;">&#9993;</span>
              <a href="mailto:${proairTo}" style="color:#0b6f8f;font-size:15px;font-weight:700;text-decoration:none;vertical-align:middle;margin-left:6px;">${proairTo}</a>
            </td>
          </tr>
        </table>

        <p style="font-size:12px;color:#94a3b8;margin-top:24px;line-height:1.5;">
          This is a guide price only. Final cost depends on pipe runs, electrics,
          access and installation layout. Prices are valid at the time of enquiry
          and may be subject to change.
        </p>
      `);

      // Send all notifications in parallel
      const results = await Promise.allSettled([
        sendMailgun({ to: proairTo, subject: proairSubject, html: proairHtml }),
        sendMailgun({ to: data.email, subject: customerSubject, html: customerHtml }),
        sendNtfy({
          title: `New quote ${data.quoteRef || ""}`.trim(),
          message: [
            `${data.name}`,
            `${data.rooms} room${data.rooms > 1 ? "s" : ""} · ${data.postcode}`,
            `Phone: ${data.phone}`,
            `Email: ${data.email}`,
            `System: ${data.system}`,
            `Load: ${data.load} kW · Capacity: ${data.capacity} kW`,
            data.totalDiscount > 0 ? `Saving: £${data.totalDiscount} off` : null,
            data.suggestTwoOutdoors ? `⚠ 2 outdoor units recommended` : null,
            data.hasUpperFloorRoom ? `⚠ Upper floor — access equipment may be needed` : null,
            `Timeframe: ${data.timeframe || "Not specified"}`,
            data.notes ? `Notes: ${data.notes}` : null,
          ].filter(Boolean).join("\n"),
          actions: [
            {
              action: "view",
              label: `📞 Call ${data.name.split(" ")[0]}`,
              url: `tel:${data.phone.replace(/\s/g, "")}`,
            },
            {
              action: "view",
              label: `✉️ Email ${data.name.split(" ")[0]}`,
              url: `mailto:${data.email}?subject=${encodeURIComponent(`Your ProAir quote ${data.quoteRef || ""}`.trim())}&body=${encodeURIComponent(
                `Hi ${data.name.split(" ")[0]},\r\n\r\nThanks for your quote request (ref: ${data.quoteRef || "N/A"}).\r\n\r\nHere's a summary:\r\n- Rooms: ${data.rooms}\r\n- Cooling load: ${data.load} kW\r\n- Suggested capacity: ${data.capacity} kW\r\n- Selected system: ${data.system}\r\n${data.totalDiscount > 0 ? `- Multi-room saving: £${data.totalDiscount} off\r\n` : ""}\r\nWe'd love to arrange your free site survey. Are any of the following dates convenient?\r\n\r\n- \r\n- \r\n- \r\n\r\nBest regards,\r\nProAir\r\n${PHONE}\r\nwww.proairuk.co.uk`
              )}`,
            },
          ],
        }),
      ]);

      const errors = results.filter((r) => r.status === "rejected");
      if (errors.length > 0) {
        console.error("[lead] Some sends failed:", errors.map((e) => e.reason));
      }

      return Response.json({ success: true, stage });
    } else {
      // ── Partial lead — only notify ProAir ─────────────────────
      const subject = `Partial lead — ${safe.name}, ${safe.postcode}`;
      const html = emailWrapper(`
        <div style="display:inline-block;background:#b45309;color:#ffffff;font-size:13px;font-weight:700;padding:6px 14px;border-radius:99px;margin-bottom:16px;">Partial Lead</div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#0b2e73;">Follow Up Required</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#64748b;">This customer entered their details and started sizing rooms but didn&rsquo;t click submit. Guide prices have <strong>not</strong> been shown.</p>

        ${sectionTitle("Customer Details")}
        ${contactRows}

        ${sectionTitle("Sizing (incomplete)")}
        ${sizingRows}
        ${roomBreakdownBlock}

        ${alertBox("Guide prices are withheld from partial leads. Reach out directly to complete their quote.", "#b45309", "#fffbeb")}
      `);

      await sendMailgun({ to: proairTo, subject, html }).catch((err) =>
        console.error("[lead] Partial lead send failed:", err)
      );

      return Response.json({ success: true, stage });
    }
  } catch (error) {
    console.error("Lead handler failed:", error);
    return Response.json(
      { success: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
