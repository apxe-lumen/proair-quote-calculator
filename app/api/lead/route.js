import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const data = await req.json();

    const email = await resend.emails.send({
      from: "ProAir Estimator <onboarding@resend.dev>",
      to: ["contact@proairuk.co.uk"], // change this to the email you want leads sent to
      subject: "New ProAir Estimate Lead",
      html: `
        <h2>New Estimate Lead</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Postcode:</strong> ${data.postcode}</p>
        <p><strong>System selected:</strong> ${data.system}</p>
        <p><strong>Rooms:</strong> ${data.rooms}</p>
        <p><strong>Cooling load:</strong> ${data.load} kW</p>
        <p><strong>Suggested capacity:</strong> ${data.capacity} kW</p>
      `,
    });

    return Response.json({ success: true, email });
  } catch (error) {
    console.error("Email send failed:", error);
    return Response.json({ success: false, error });
  }
}
