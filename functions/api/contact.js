export async function onRequestPost(context) {
  const { request, env } = context;

  // ---- helpers ----
  const s = (v) => (v == null ? "" : v.toString().trim());

  const pickTo = (formType) => {
    // Optional per-form destinations (add only if you want)
    // If not set, falls back to CONTACT_TO.
    const map = {
      contact: env.CONTACT_TO,
      application: env.APPLICATION_TO || env.CONTACT_TO,
      meetup: env.MEETUP_TO || env.CONTACT_TO,
      webinar: env.WEBINAR_TO || env.CONTACT_TO,
      careerday: env.CAREERDAY_TO || env.CONTACT_TO,
    };
    return map[formType] || env.CONTACT_TO;
  };

  // 1) Parse form data
  const form = await request.formData();

  // 2) Verify Turnstile server-side
  const token = form.get("cf-turnstile-response");
  if (!token) return new Response("Missing Turnstile token.", { status: 400 });

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

  // 3) Route based on form_type
  const formType = s(form.get("form_type")) || "contact";

  // Defaults
  let replyTo = "";
  let subjectLine = "CTE Form Submission";
  let redirectPath = "/contact/thanks/";
  let textLines = [`New submission`, `Type: ${formType}`, ``];

  // ---- CONTACT ----
  if (formType === "contact") {
    const first = s(form.get("first_name"));
    const last = s(form.get("last_name"));
    const telephone = s(form.get("telephone"));
    const email = s(form.get("email"));
    const subject = s(form.get("subject"));
    const message = s(form.get("message"));

    if (!first || !last || !telephone || !email || !subject || !message) {
      return new Response("Missing required fields.", { status: 400 });
    }

    replyTo = email;
    subjectLine = `CTE Contact: ${subject}`;
    redirectPath = "/contact/thanks/";

    textLines.push(
      `Name: ${first} ${last}`,
      `Email: ${email}`,
      `Phone: ${telephone}`,
      `Subject: ${subject}`,
      ``,
      `Message:`,
      message
    );
  }

  // ---- APPLICATION ----
  else if (formType === "application") {
    const fname = s(form.get("fname"));
    const lname = s(form.get("lname"));
    const phone = s(form.get("phone"));
    const email = s(form.get("email"));
    const location = s(form.get("location"));
    const track = s(form.get("track"));
    const funding = s(form.get("funding_type"));
    const weeklyHours = s(form.get("weekly_hours"));
    const preferredSchedule = s(form.get("preferred_schedule"));
    const startTimeframe = s(form.get("start_timeframe"));
    const goalStatement = s(form.get("goal_statement"));
    const experience = s(form.get("message"));

    if (!fname || !lname || !phone || !email || !track || !funding) {
      return new Response("Missing required application fields.", { status: 400 });
    }

    replyTo = email;
    subjectLine = `CTE Application: ${fname} ${lname} (${track})`;
    redirectPath = "/application/thanks/";

    textLines.push(
      `Name: ${fname} ${lname}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Location: ${location || "(not provided)"}`,
      `Track: ${track}`,
      `Funding: ${funding}`,
      ``,
      `Weekly Hours: ${weeklyHours || "(not provided)"}`,
      `Preferred Schedule: ${preferredSchedule || "(not provided)"}`,
      `Start Timeframe: ${startTimeframe || "(not provided)"}`,
      ``,
      `Goal Statement:`,
      goalStatement || "(not provided)",
      ``,
      `Previous IT Experience:`,
      experience || "(not provided)"
    );

    // If donor seat, include donor fields (optional)
    if (funding === "donor") {
      const employment = s(form.get("employment_status"));
      const income = s(form.get("income_range"));
      const hasLaptop = s(form.get("has_laptop"));
      const barrier = s(form.get("primary_barrier"));
      const donorStatement = s(form.get("donor_statement"));
      const donorReporting = form.get("donor_reporting_consent") ? "Yes" : "No";
      const testimonial = form.get("testimonial_consent") ? "Yes" : "No";

      textLines.push(
        ``,
        `--- Donor Screening ---`,
        `Employment: ${employment || "(not provided)"}`,
        `Income: ${income || "(not provided)"}`,
        `Has Laptop: ${hasLaptop || "(not provided)"}`,
        `Primary Barrier: ${barrier || "(not provided)"}`,
        ``,
        `Donor Statement:`,
        donorStatement || "(not provided)",
        ``,
        `Donor Reporting Consent: ${donorReporting}`,
        `Testimonial Consent: ${testimonial}`
      );
    }
  }

  // ---- MEETUP REG ----
  else if (formType === "meetup") {
    // Adjust field names to match your HTML
    const name = s(form.get("name")) || `${s(form.get("first_name"))} ${s(form.get("last_name"))}`.trim();
    const email = s(form.get("email"));
    const phone = s(form.get("phone")) || s(form.get("telephone"));
    const meetup = s(form.get("meetup")) || s(form.get("event"));
    const message = s(form.get("message"));

    if (!name || !email) return new Response("Missing required meetup fields.", { status: 400 });

    replyTo = email;
    subjectLine = `CTE Meetup Registration: ${meetup || "New registration"}`;
    redirectPath = "/meetups/thanks/";

    textLines.push(
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "(not provided)"}`,
      `Meetup/Event: ${meetup || "(not provided)"}`,
      ``,
      `Message:`,
      message || "(not provided)"
    );
  }

  // ---- WEBINAR REG ----
  else if (formType === "webinar") {
    const name = s(form.get("name")) || `${s(form.get("first_name"))} ${s(form.get("last_name"))}`.trim();
    const email = s(form.get("email"));
    const phone = s(form.get("phone")) || s(form.get("telephone"));
    const webinar = s(form.get("webinar")) || s(form.get("event"));
    const message = s(form.get("message"));

    if (!name || !email) return new Response("Missing required webinar fields.", { status: 400 });

    replyTo = email;
    subjectLine = `CTE Webinar Registration: ${webinar || "New registration"}`;
    redirectPath = "/webinars/thanks/";

    textLines.push(
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "(not provided)"}`,
      `Webinar/Event: ${webinar || "(not provided)"}`,
      ``,
      `Message:`,
      message || "(not provided)"
    );
  }

  // ---- CAREER DAY REG ----
  else if (formType === "careerday") {
    const name = s(form.get("name")) || `${s(form.get("first_name"))} ${s(form.get("last_name"))}`.trim();
    const email = s(form.get("email"));
    const phone = s(form.get("phone")) || s(form.get("telephone"));
    const message = s(form.get("message"));

    if (!name || !email) return new Response("Missing required career day fields.", { status: 400 });

    replyTo = email;
    subjectLine = `CTE Career Day Registration`;
    redirectPath = "/careerday/thanks/";

    textLines.push(
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "(not provided)"}`,
      ``,
      `Message:`,
      message || "(not provided)"
    );
  }

  else {
    return new Response(`Unknown form_type: ${formType}`, { status: 400 });
  }

  const text = textLines.join("\n");

  // 4) Send via Resend
  const to = pickTo(formType);

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [to],
      reply_to: replyTo || undefined,
      subject: subjectLine,
      text,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    return new Response(`Email send failed: ${err}`, { status: 502 });
  }

  // 5) Redirect to the right thank-you page
  return Response.redirect(`${new URL(request.url).origin}${redirectPath}`, 303);
}

(function () {
  const hasHero = document.querySelector('.page__title-area[data-background]');
  if (hasHero) document.body.classList.add('has-hero');
})();

