export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const apiKey =
      request.headers.get("X-API-Key") || url.searchParams.get("key");
    if (!apiKey || apiKey !== env.USAGE_API_KEY) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (request.method === "POST" && url.pathname === "/v1/log") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response("Bad Request", { status: 400 });
      }
      const { deviceId, day, report, appVersion } = body;
      if (!deviceId || !day || !report) {
        return new Response("Bad Request", { status: 400 });
      }
      const dayKey = `logs:${day}`;
      const existing = (await env.USAGE_LOGS.get(dayKey, "json")) || [];
      const entry = {
        deviceId,
        appVersion: appVersion || "unknown",
        uploadedAt: Date.now(),
        report: String(report).slice(0, 200_000),
      };
      const withoutDevice = existing.filter((item) => item.deviceId !== deviceId);
      withoutDevice.push(entry);
      await env.USAGE_LOGS.put(dayKey, JSON.stringify(withoutDevice));
      return json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/v1/export") {
      const day =
        url.searchParams.get("day") ||
        new Date().toISOString().slice(0, 10);
      const dayKey = `logs:${day}`;
      const entries = (await env.USAGE_LOGS.get(dayKey, "json")) || [];
      if (entries.length === 0) {
        return text(`No logs for ${day}.`);
      }
      const lines = [`=== Bible App usage logs (${day}) ===`, ""];
      for (const entry of entries) {
        const time = new Date(entry.uploadedAt).toISOString();
        lines.push(`--- device ${entry.deviceId} · ${entry.appVersion} · ${time} ---`);
        lines.push(entry.report);
        lines.push("");
      }
      return text(lines.join("\n"));
    }

    return new Response("Not Found", { status: 404 });
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function text(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
