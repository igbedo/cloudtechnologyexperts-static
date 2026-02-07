export async function onRequestPost(context) {
  const { request, env } = context;

  // 1) Parse form data
  const form = await request.formData();

  // Turnstile token field name will match your widget's callback field
  // Default is: "cf-turnstile-response"
  const token = form.get("cf-turnstile-response");
  if (!token) {
    return new Response("Missing Turnstile token.", { status: 400 });
  }

  // 2) Verify Turnstile server-side (mandatory)
  // https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });

  const verifyJson = await verifyRes.json();
  if (!verifyJson.success) {
    return new Response("Turnstile verification failed.", { status: 403 });
  }

  // 3) Build email payload
  const first = (form.get("first_name") || "").toString().trim();
  const last = (form.get("last_name") || "").toString().trim();
  const telephone = (form.get("telephone") || "").toString().trim();
  const email = (form.get("email") || "").toString().trim();
  const subject = (form.get("subject") || "").toString().trim();
  const message = (form.get("message") || "").toString().trim();

  // Simple validation
  if (!first || !last || !telephone || !email || !subject || !message) {
    return new Response("Missing required fields.", { status: 400 });
  }

  const text = [
    `New Contact Submission`,
    ``,
    `Name: ${first} ${last}`,
    `Email: ${email}`,
    `Phone: ${telephone}`,
    `Subject: ${subject}`,
    ``,
    `Message:`,
    message,
  ].join("\n");

  // 4) Send via Resend Email API
  // https://resend.com/docs/api-reference/emails/send-email
  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,     // e.g. "Cloud Technology Experts <no-reply@cloudtechnologyexperts.com>"
      to: [env.CONTACT_TO],      // e.g. "training@cloudtechnologyexperts.com"
      reply_to: email,
      subject: `CTE Contact: ${subject}`,
      text,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    return new Response(`Email send failed: ${err}`, { status: 502 });
  }

  // 5) Redirect to thank-you page
  return Response.redirect(`${new URL(request.url).origin}/contact/thanks/`, 303);
}

