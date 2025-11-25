// supabase/functions/rescue-alert/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";

serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const body = await req.json();
    const { report, message, rescue } = body;

    if (!rescue?.email) {
      return new Response(
        JSON.stringify({ error: "Rescue team email missing" }),
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
      );
    }

    // Email HTML
    const html = `
      <div style="font-family: Arial; color: #111">
        <h2>🚨 New Rescue Alert — ${report?.report_type}</h2>

        <p><b>Pet Type:</b> ${report?.pet_type}</p>
        <p><b>Location:</b> ${report?.location}</p>
        <p><b>Description:</b> ${report?.description}</p>

        <p><b>Message from User:</b> ${message || "(none)"}</p>

        <hr>
        <p>Open in Rescue Dashboard:</p>
        <a href="${APP_URL}/rescue/report/${report?.id}">
          View Report
        </a>
      </div>
    `;

    // SEND EMAIL via Resend
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Petlink Alerts <onboarding@resend.dev>",  // VERIFIED
        to: [rescue.email],
        subject: `Rescue Alert — ${report.report_type}`,
        html,
      }),
    });

    const detail = await send.text();

    return new Response(
      JSON.stringify({ ok: send.ok, resendResponse: detail }),
      {
        status: send.ok ? 200 : 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  }
});
