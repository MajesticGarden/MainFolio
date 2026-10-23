export async function onRequestPost(context) {
  const { request, env } = context;
  const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "";

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const token = body["cf-turnstile-response"] || body.token;
  const expectedAction = "contact";
  const expectedHostnames = new Set(
    (env.TURNSTILE_HOSTNAMES ?? "momovahed.com,www.momovahed.com,momovahed.pages.dev,localhost,127.0.0.1")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );

  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048 ||
    expectedHostnames.size === 0
  ) {
    return new Response(JSON.stringify({ error: "forbidden", reason: "missing_or_invalid_token" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  let result;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: clientIp,
      }),
    });
    if (!r.ok) throw new Error(`siteverify ${r.status}`);
    result = await r.json();
  } catch {
    return new Response(JSON.stringify({ error: "forbidden", reason: "siteverify_failed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (
    !result.success ||
    result.action !== expectedAction ||
    !expectedHostnames.has(result.hostname)
  ) {
    return new Response(JSON.stringify({ error: "forbidden", reason: "challenge_unsuccessful" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // existing handler logic runs here, unchanged
  return new Response(JSON.stringify({ success: true, message: "Thank you for getting in touch! Your message has been received." }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
