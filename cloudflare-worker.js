// Cloudflare Worker for United Civil Group Contact Form
// Sends emails via SMTP2GO API with Turnstile verification

// The site answers on both the apex and www (no redirect between them), so the
// form posts from either origin. Every response carries the CORS header, or the
// browser hides the reply from the page.
const ALLOWED_ORIGINS = ["https://unitedcivil.com.au", "https://www.unitedcivil.com.au"];

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    Vary: "Origin",
  };
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          ...corsHeaders(request),
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only allow POST
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders(request) });
    }

    try {
      const formData = await request.json();

      // Validate required fields
      const { name, email, phone, service, message, turnstileToken } = formData;
      if (!name || !email || !message) {
        return json(request, { error: "Missing required fields" }, 400);
      }

      // Verify Turnstile token
      if (!turnstileToken) {
        return json(request, { error: "Missing verification token" }, 400);
      }

      const turnstileResponse = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
            remoteip: request.headers.get("CF-Connecting-IP"),
          }),
        }
      );

      const turnstileResult = await turnstileResponse.json();

      if (!turnstileResult.success) {
        console.error("Turnstile verification failed:", turnstileResult);
        return json(request, { error: "Verification failed" }, 400);
      }

      // Build email content
      const emailBody = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Service: ${service || "Not specified"}

Message:
${message}
      `.trim();

      // Send via SMTP2GO API
      const smtp2goResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: env.SMTP2GO_API_KEY,
          to: ["info@unitedcivil.com.au"],
          sender: "info@unitedcivil.com.au",
          subject: `Website Enquiry from ${name}`,
          text_body: emailBody,
          custom_headers: [
            {
              header: "Reply-To",
              value: email,
            },
          ],
        }),
      });

      const result = await smtp2goResponse.json();

      if (result.data?.succeeded > 0) {
        return json(request, { success: true });
      } else {
        console.error("SMTP2GO error:", result);
        return json(request, { error: "Failed to send email" }, 500);
      }
    } catch (error) {
      console.error("Worker error:", error);
      return json(request, { error: "Server error" }, 500);
    }
  },
};
