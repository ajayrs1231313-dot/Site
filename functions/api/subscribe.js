export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const email = (body.email || "").trim();

    if (!email) {
      return new Response(
        JSON.stringify({ ok: false, error: "Email is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Please enter a valid email address." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    if (!env.DB) {
      return new Response(
        JSON.stringify({ ok: false, error: "Database binding not configured." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    await env.DB.prepare(
      "INSERT INTO mails (email) VALUES (?) ON CONFLICT(email) DO NOTHING"
    ).bind(email).run();

    return new Response(
      JSON.stringify({ ok: true, message: "You’re on the list." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || "Server error."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
