export default async (req) => {
  try {
    const text = await req.text();
    console.log("Incoming payload:", text);

    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const userEmail = payload.email || payload.data?.email;
    const formName = payload.form_name;
    const name = payload.data?.name || payload.name || "";
    const firstName = name ? name.split(" ")[0] : "";

    console.log("Email:", userEmail, "Form:", formName);

    if (!userEmail) {
      return new Response("No email found", { status: 400 });
    }

    const apiKey = Netlify.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("No API key found");
      return new Response("No API key", { status: 500 });
    }

    let subject, html;

    if (formName === "signup") {
      subject = "Hvala na registraciji — Koliko";
      html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a18"><div style="padding:2rem 0 1rem"><span style="font-size:24px;font-weight:700">Koliko<span style="color:#1D9E75">.</span></span></div><hr style="border:none;border-top:1px solid #e8e8e4;margin-bottom:2rem"/><p style="font-size:16px;margin-bottom:1rem">Hvala na registraciji!</p><p style="font-size:15px;color:#5a5a56;line-height:1.7;margin-bottom:1.5rem">Primili smo tvoju prijavu. Javićemo ti se čim aplikacija bude spremna.</p><p style="font-size:15px;color:#5a5a56;line-height:1.7;margin-bottom:2rem">Do tada — ako želiš saznati da li si pošteno plaćen, možeš nam već sada poslati svoju platnu listu na analizu:</p><a href="https://koliko.de/upload" style="display:inline-block;background:#1D9E75;color:white;padding:13px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500">Pošalji platnu listu →</a><p style="font-size:13px;color:#9a9a94;margin-top:3rem">Koliko tim · <a href="https://koliko.de" style="color:#1D9E75">koliko.de</a> · <a href="mailto:igor@koliko.de" style="color:#1D9E75">igor@koliko.de</a></p></div>`;
    } else if (formName === "upload") {
      subject = "Primili smo tvoju platnu listu — Koliko";
      html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a18"><div style="padding:2rem 0 1rem"><span style="font-size:24px;font-weight:700">Koliko<span style="color:#1D9E75">.</span></span></div><hr style="border:none;border-top:1px solid #e8e8e4;margin-bottom:2rem"/><p style="font-size:16px;margin-bottom:1rem">Zdravo${firstName ? " " + firstName : ""}!</p><p style="font-size:15px;color:#5a5a56;line-height:1.7;margin:1rem 0">Primili smo tvoju platnu listu i zahvaljujemo na poverenju.</p><div style="background:#E1F5EE;border-radius:8px;padding:1.25rem 1.5rem;margin-bottom:1.5rem"><p style="font-size:14px;color:#0F6E56;margin:0">Analiziraćemo je i javiti ti se na ovaj email u roku od <strong>48 sati</strong>.</p></div><p style="font-size:15px;color:#5a5a56;line-height:1.7">Tvoji podaci su sigurni i nikada ih ne delimo s trećim stranama.</p><p style="font-size:13px;color:#9a9a94;margin-top:3rem">Koliko tim · <a href="https://koliko.de" style="color:#1D9E75">koliko.de</a> · <a href="mailto:igor@koliko.de" style="color:#1D9E75">igor@koliko.de</a></p></div>`;
    } else {
      subject = "Hvala — Koliko";
      html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a18"><div style="padding:2rem 0 1rem"><span style="font-size:24px;font-weight:700">Koliko<span style="color:#1D9E75">.</span></span></div><hr style="border:none;border-top:1px solid #e8e8e4;margin-bottom:2rem"/><p style="font-size:16px;margin-bottom:1rem">Hvala!</p><p style="font-size:15px;color:#5a5a56;line-height:1.7">Primili smo tvoju poruku. Javićemo ti se uskoro.</p><p style="font-size:13px;color:#9a9a94;margin-top:3rem">Koliko tim · <a href="https://koliko.de" style="color:#1D9E75">koliko.de</a></p></div>`;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Koliko <noreply@koliko.de>",
        to: [userEmail],
        subject,
        html,
      }),
    });

    const resendText = await resendResponse.text();
    console.log("Resend response:", resendResponse.status, resendText);

    if (!resendResponse.ok) {
      return new Response("Email failed: " + resendText, { status: 500 });
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Function error:", err.message);
    return new Response("Error: " + err.message, { status: 500 });
  }
};

export const config = {
  path: "/api/form-submit",
};
