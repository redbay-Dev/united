// Cloudflare Worker for United Civil Group Contact Form
// Sends emails via SMTP2GO API

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://unitedcivil.com.au",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only allow POST
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const formData = await request.json();

      // Validate required fields
      const { name, email, phone, service, message } = formData;
      if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
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
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://unitedcivil.com.au",
          },
        });
      } else {
        console.error("SMTP2GO error:", result);
        return new Response(JSON.stringify({ error: "Failed to send email" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://unitedcivil.com.au",
          },
        });
      }
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://unitedcivil.com.au",
        },
      });
    }
  },
};
