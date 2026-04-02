export default async (req) => {
  try {
    const text = await req.text();
    console.log("Received:", text.substring(0, 300));

    let payload;
    try { payload = JSON.parse(text); } catch { return new Response("Bad JSON", { status: 400 }); }

    const userEmail = payload.email || payload.data?.email;
    const formName = payload.form_name;
    const name = payload.data?.name || payload.name || "";
    const firstName = name ? name.split(" ")[0] : "";

    console.log("Email:", userEmail, "Form:", formName);
    if (!userEmail) return new Response("No email", { status: 400 });

    const apiKey = Netlify.env.get("RESEND_API_KEY");
    if (!apiKey) return new Response("No API key", { status: 500 });

    const subject = formName === "signup"
      ? "Primili smo Vasu prijavu"
      : "Primili smo Vasu platnu listu";

    const html = formName === "signup"
      ? `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a18"><p style="font-size:24px;font-weight:700">Koliko<span style="color:#1D9E75">.</span></p><hr/><p style="font-size:17px;font-weight:500">Hvala Vam na registraciji!</p><p style="font-size:15px;color:#5a5a56;line-height:1.75">Mnogi zaposleni zaradjuju manje nego sto zasluzuju. Uz Koliko saznajte tacno gde stojite u platnom rangu u Nemackoj.</p><p style="font-size:15px;color:#5a5a56;line-height:1.75">Ova usluga je za Vas <strong>potpuno besplatna</strong>.</p><p style="font-size:15px;color:#5a5a56;line-height:1.75">Da bismo Vam dali povratnu informaciju, potrebni su nam jos neki podaci i Vasa platna lista:</p><a href="https://koliko.de/upload" style="display:inline-block;margin-top:16px;padding:14px 28px;font-size:15px;font-weight:500;color:#ffffff;background:#1D9E75;text-decoration:none;border-radius:8px;">Posalji platnu listu</a><p style="font-size:13px;color:#9a9a94;margin-top:32px">Koliko tim &middot; koliko.de &middot; igor@koliko.de</p></div>`
      : `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a18"><p style="font-size:24px;font-weight:700">Koliko<span style="color:#1D9E75">.</span></p><hr/><p style="font-size:17px;font-weight:500">Zdravo${firstName ? " " + firstName : ""}!</p><p style="font-size:15px;color:#5a5a56;line-height:1.75">Primili smo Vasu platnu listu i zahvaljujemo Vam na poverenju.</p><div style="background:#E1F5EE;border-radius:8px;padding:16px;margin:16px 0"><p style="font-size:14px;color:#0F6E56;margin:0">Analiziracemo je i javicemo Vam se u roku od <strong>48 sati</strong>.</p></div><p style="font-size:15px;color:#5a5a56">Vasi podaci su sigurni i nikada ih ne delimo s trecim stranama.</p><p style="font-size:13px;color:#9a9a94;margin-top:32px">Koliko tim &middot; koliko.de &middot; igor@koliko.de</p></div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Netlify.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Koliko <noreply@koliko.de>", to: [userEmail], subject, html }),
    });

    const respText = await resp.text();
    console.log("Resend:", resp.status, respText);
    return new Response(resp.ok ? "OK" : "Failed", { status: resp.ok ? 200 : 500 });

  } catch (err) {
    console.error("Error:", err.message);
    return new Response("Error", { status: 500 });
  }
};
