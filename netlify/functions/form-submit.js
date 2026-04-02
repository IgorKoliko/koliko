export default async (req) => {
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

    const apiKey = Netlify.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("No API key");
      return new Response("No API key", { status: 500 });
    }

    let subject, html;

    if (formName === "signup") {
      subject = "Primili smo Vašu prijavu — Koliko";
      html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f7f6f2;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;padding:40px 0">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="padding:32px 40px 24px;border-bottom:1px solid #e8e8e4;">
<span style="font-size:26px;font-weight:700;color:#1a1a18;letter-spacing:-0.5px">Koliko<span style="color:#1D9E75">.</span></span>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="font-size:17px;font-weight:500;color:#1a1a18;margin:0 0 16px">Hvala Vam na registraciji!</p>
<p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0 0 16px">Mnogi zaposleni zarađuju manje nego što zaslužuju — i toga najčešće nisu ni svesni. Uz <strong style="color:#1a1a18">Koliko</strong> saznajte tačno gde stojite u platnom rangu za Vaše zanimanje u Nemačkoj.</p>
<p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0 0 16px">Ova usluga je za Vas u svakom slučaju <strong style="color:#1a1a18">potpuno besplatna</strong>.</p>
<p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0 0 28px">Da bismo Vam dali povratnu informaciju, potrebni su nam još neki podaci i Vaša platna lista. Jednostavno kliknite na dugme ispod:</p>
<table cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:#1D9E75;">
<a href="https://koliko.de/upload" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;border-radius:8px;">Pošalji platnu listu →</a>
</td></tr></table>
</td></tr>
<tr><td style="padding:20px 40px 32px;border-top:1px solid #e8e8e4;">
<p style="font-size:13px;color:#9a9a94;margin:0;line-height:1.6">
Koliko tim &middot; <a href="https://koliko.de" style="color:#1D9E75;text-decoration:none">koliko.de</a> &middot; <a href="mailto:igor@koliko.de" style="color:#1D9E75;text-decoration:none">igor@koliko.de</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
    } else if (formName === "upload") {
      subject = "Primili smo Vašu platnu listu — Koliko";
      html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f7f6f2;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;padding:40px 0">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="padding:32px 40px 24px;border-bottom:1px solid #e8e8e4;">
<span style="font-size:26px;font-weight:700;color:#1a1a18;letter-spacing:-0.5px">Koliko<span style="color:#1D9E75">.</span></span>
</td></tr>
<tr><td style="padding:32px 40px;">
<p style="font-size:17px;font-weight:500;color:#1a1a18;margin:0 0 16px">Zdravo${firstName ? " " + firstName : ""}!</p>
<p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0 0 16px">Primili smo Vašu platnu listu i zahvaljujemo Vam na poverenju.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#E1F5EE;border-radius:8px;margin:0 0 20px"><tr><td style="padding:16px 20px;">
<p style="font-size:14px;color:#0F6E56;margin:0;line-height:1.65">Analiziraćemo je i javiti Vam se na ovaj email u roku od <strong>48 sati</strong> sa rezultatima poređenja.</p>
</td></tr></table>
<p style="font-size:15px;color:#5a5a56;line-height:1.75;margin:0">Vaši podaci su sigurni i koristimo ih isključivo za analizu plate. Nikada ih ne delimo s trećim stranama.</p>
</td></tr>
<tr><td style="padding:20px 40px 32px;border-top:1px solid #e8e8e4;">
<p style="font-size:13px;color:#9a9a94;margin:0;line-height:1.6">
Koliko tim &middot; <a href="https://koliko.de" style="color:#1D9E75;text-decoration:none">koliko.de</a> &middot; <a href="mailto:igor@koliko.de" style="color:#1D9E75;text-decoration:none">igor@koliko.de</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
    } else {
      subject = "Hvala — Koliko";
      html = `<p style="font-family:Arial,sans-serif;font-size:15px;color:#5a5a56">Hvala! Javićemo Vam se uskoro.<br><br>Koliko tim</p>`;
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
};      html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a18"><div style="padding:2rem 0 1rem"><span style="font-size:24px;font-weight:700">Koliko<span style="color:#1D9E75">.</span></span></div><hr style="border:none;border-top:1px solid #e8e8e4;margin-bottom:2rem"/><p style="font-size:16px;margin-bottom:1rem">Zdravo${firstName ? " " + firstName : ""}!</p><p style="font-size:15px;color:#5a5a56;line-height:1.7;margin:1rem 0">Primili smo tvoju platnu listu i zahvaljujemo na poverenju.</p><div style="background:#E1F5EE;border-radius:8px;padding:1.25rem 1.5rem;margin-bottom:1.5rem"><p style="font-size:14px;color:#0F6E56;margin:0">Analiziraćemo je i javiti ti se na ovaj email u roku od <strong>48 sati</strong>.</p></div><p style="font-size:15px;color:#5a5a56;line-height:1.7">Tvoji podaci su sigurni i nikada ih ne delimo s trećim stranama.</p><p style="font-size:13px;color:#9a9a94;margin-top:3rem">Koliko tim · <a href="https://koliko.de" style="color:#1D9E75">koliko.de</a> · <a href="mailto:igor@koliko.de" style="color:#1D9E75">igor@koliko.de</a></p></div>`;
    } else {
      subject = "Hvala — Koliko";
      html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a18"><p style="font-size:16px">Hvala! Javićemo ti se uskoro.</p></div>`;
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
