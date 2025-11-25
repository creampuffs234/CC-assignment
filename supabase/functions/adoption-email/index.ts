// supabase/functions/adoption-email/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173/";

serve(async (req: Request) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  try {
    const body = await req.json();
    const { adoptionId, animal, shelter, requester, message } = body;

    if (!shelter?.email) {
      return new Response(JSON.stringify({ error: "Shelter email missing" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const approveLink = `${APP_URL}adoption-approve/${adoptionId}`;
    const rejectLink = `${APP_URL}adoption-reject/${adoptionId}`;

    const html = `
      <h2>Adoption Request for ${animal?.title}</h2>
      <p><b>Name:</b> ${requester?.name}</p>
      <p><b>Contact:</b> ${requester?.contact}</p>
      <p><b>Message:</b> ${message || "(No message)"}</p>
      <hr/>
      <p><a href="${approveLink}">Approve Adoption</a></p>
      <p><a href="${rejectLink}">Reject Adoption</a></p>
    `;

    // ⭐ OPTION A: Use your own Gmail as sender
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
   // ⭐ Your Gmail (no domain verification needed)
        to: [shelter.email],
        subject: `Adoption Request – ${animal?.title}`,
        html,
      }),
    });

    const text = await resp.text();

    return new Response(JSON.stringify({ ok: resp.ok, resendResponse: text }), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
});
