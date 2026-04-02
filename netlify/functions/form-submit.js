const handler = async (req) => {
  try {
    const text = await req.text();
    console.log("Payload received:", text.substring(0, 200));

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
      return new Response("No email", { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("No API key");
      return new Response("No API key", { status: 500 });
    }

    let subject, html;

    if (formName === "signup") {
      subject = "Primili smo Vasu prijavu — Koliko";
      html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f7f6f2;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;padding:40px 0"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;"><tr><td style="padding:32px 40px 24px;border-bottom:1px solid #e8e8e4;"><span style="font-size:26px;font-weight:700;color:#1a1a18;letter-spacing:-0.5px">Koliko<span style="color:#1D9E75">.</span></span></td></tr><tr><td style="padding:32px 40px;"><p style="font-size:17px;font-weight:500;color:#1a1a18;margin:0 0 16px">Hvala Vam na registraciji!</p><p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0 0 16px">Mnogi zaposleni zaradjuju manje nego sto zasluzuju — i toga najcesce nisu ni svesni. Uz Koliko saznajte tacno gde stojite u platnom rangu za Vase zanimanje u Nemackoj.</p><p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0 0 16px">Ova usluga je za Vas u svakom slucaju <strong style="color:#1a1a18">potpuno besplatna</strong>.</p><p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0 0 28px">Da bismo Vam dali povratnu informaciju, potrebni su nam jos neki podaci i Vasa platna lista. Jednostavno kliknite na dugme ispod:</p><table cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:#1D9E75;"><a href="https://koliko.de/upload" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:8px;">Posalji platnu listu &rarr;</a></td></tr></table></td></tr><tr><td style="padding:20px 40px 32px;border-top:1px solid #e8e8e4;"><p style="font-size:13px;color:#9a9a94;margin:0;line-height:1.6">Koliko tim &middot; <a href="https://koliko.de" style="color:#1D9E75;text-decoration:none">koliko.de</a> &middot; <a href="mailto:igor@koliko.de" style="color:#1D9E75;text-decoration:none">igor@koliko.de</a></p></td></tr></table></td></tr></table></body></html>`;
    } else if (formName === "upload") {
      subject = "Primili smo Vasu platnu listu — Koliko";
      html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f7f6f2;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;padding:40px 0"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;"><tr><td style="padding:32px 40px 24px;border-bottom:1px solid #e8e8e4;"><span style="font-size:26px;font-weight:700;color:#1a1a18;letter-spacing:-0.5px">Koliko<span style="color:#1D9E75">.</span></span></td></tr><tr><td style="padding:32px 40px;"><p style="font-size:17px;font-weight:500;color:#1a1a18;margin:0 0 16px">Zdravo${firstName ? " " + firstName : ""}!</p><p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0 0 16px">Primili smo Vasu platnu listu i zahvaljujemo Vam na poverenju.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:#E1F5EE;border-radius:8px;margin:0 0 20px"><tr><td style="padding:16px 20px;"><p style="font-size:14px;color:#0F6E56;margin:0;line-height:1.65">Analiziracemo je i javiti Vam se na ovaj email u roku od <strong>48 sati</strong> sa rezultatima poredjena.</p></td></tr></table><p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0">Vasi podaci su sigurni i koristimo ih iskljucivo za analizu plate. Nikada ih ne delimo s trecim stranama.</p></td></tr><tr><td style="padding:20px 40px 32px;border-top:1px solid #e8e8e4;"><p style="font-size:13px;color:#9a9a94;margin:0;line-height:1.6">Koliko tim &middot; <a href="https://koliko.de" style="color:#1D9E75;text-decoration:none">koliko.de</a> &middot; <a href="mailto:igor@koliko.de" style="color:#1D9E75;text-decoration:none">igor@koliko.de</a></p></td></tr></table></td></tr></table></body></html>`;
    } else {
      subject = "Hvala — Koliko";
      html = `<p style="font-family:Arial,sans-serif;font-size:15px;color:#5a5a56">Hvala! Javicemo Vam se uskoro.<br><br>Koliko tim</p>`;
    }

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Koliko <noreply@koliko.de>", to: [userEmail], subject, html }),
    });

    const resendText = await resendResp.text();
    console.log("Resend:", resendResp.status, resendText);

    return new Response(resendResp.ok ? "OK" : "Failed", { status: resendResp.ok ? 200 : 500 });

  } catch (err) {
    console.error("Error:", err.message);
    return new Response("Error: " + err.message, { status: 500 });
  }
};

module.exports = { handler };
