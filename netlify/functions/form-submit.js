export default async (req) => {
  try {
    const payload = await req.json();

    // Netlify sends form submissions as "submission-created" events
    if (payload.event !== "submission-created") {
      return new Response("OK", { status: 200 });
    }

    const formData = payload.data;
    const userEmail = formData.email;
    const formName = payload.form_name;

    if (!userEmail) {
      return new Response("No email found", { status: 400 });
    }

    const apiKey = Netlify.env.get("RESEND_API_KEY");

    let subject, html;

    if (formName === "signup") {
      subject = "Hvala na registraciji — Koliko";
      html = `
        <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a18;">
          <div style="padding: 2rem 0 1rem;">
            <span style="font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Koliko<span style="color: #1D9E75;">.</span></span>
          </div>
          <hr style="border: none; border-top: 1px solid #e8e8e4; margin-bottom: 2rem;" />
          <p style="font-size: 16px; font-weight: 400; margin-bottom: 1rem;">Hvala na registraciji!</p>
          <p style="font-size: 15px; color: #5a5a56; line-height: 1.7; margin-bottom: 1.5rem;">
            Primili smo tvoju prijavu. Javićemo ti se čim aplikacija bude spremna.
          </p>
          <p style="font-size: 15px; color: #5a5a56; line-height: 1.7; margin-bottom: 2rem;">
            Do tada — ako želiš saznati da li si pošteno plaćen, možeš nam već sada poslati svoju platnu listu na analizu:
          </p>
          <a href="https://koliko.de/upload"
             style="display: inline-block; background: #1D9E75; color: white; padding: 13px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 500;">
            Pošalji platnu listu →
          </a>
          <p style="font-size: 13px; color: #9a9a94; margin-top: 3rem; line-height: 1.6;">
            Koliko tim · <a href="https://koliko.de" style="color: #1D9E75;">koliko.de</a><br/>
            Pitanja? Piši nam na <a href="mailto:igor@koliko.de" style="color: #1D9E75;">igor@koliko.de</a>
          </p>
        </div>
      `;
    } else if (formName === "upload") {
      const name = formData.name ? formData.name.split(" ")[0] : "";
      subject = "Primili smo tvoju platnu listu — Koliko";
      html = `
        <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a18;">
          <div style="padding: 2rem 0 1rem;">
            <span style="font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Koliko<span style="color: #1D9E75;">.</span></span>
          </div>
          <hr style="border: none; border-top: 1px solid #e8e8e4; margin-bottom: 2rem;" />
          <p style="font-size: 16px; font-weight: 400; margin-bottom: 1rem;">Zdravo${name ? " " + name : ""}!</p>
          <p style="font-size: 15px; color: #5a5a56; line-height: 1.7; margin-bottom: 1.5rem;">
            Primili smo tvoju platnu listu i zahvaljujemo na poverenju.
          </p>
          <div style="background: #E1F5EE; border-radius: 8px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;">
            <p style="font-size: 14px; color: #0F6E56; margin: 0; line-height: 1.6;">
              Analiziraćemo je i javiti ti se na ovaj email u roku od <strong>48 sati</strong> sa rezultatima.
            </p>
          </div>
          <p style="font-size: 15px; color: #5a5a56; line-height: 1.7; margin-bottom: 2rem;">
            Tvoji podaci su sigurni i koriste se isključivo za analizu tvoje plate. Nikada ih ne delimo s trećim stranama.
          </p>
          <p style="font-size: 13px; color: #9a9a94; margin-top: 3rem; line-height: 1.6;">
            Koliko tim · <a href="https://koliko.de" style="color: #1D9E75;">koliko.de</a><br/>
            Pitanja? Piši nam na <a href="mailto:igor@koliko.de" style="color: #1D9E75;">igor@koliko.de</a>
          </p>
        </div>
      `;
    } else {
      return new Response("Unknown form", { status: 200 });
    }

    const response = await fetch("https://api.resend.com/emails", {
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

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      return new Response("Email failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Function error:", err);
    return new Response("Error", { status: 500 });
  }
};

export const config = {
  path: "/api/form-submit",
};
