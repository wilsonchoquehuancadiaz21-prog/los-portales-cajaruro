import crypto from "node:crypto";
export function isAdmin(req) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const raw = req.headers.cookie || "";
  const match = raw.match(/(?:^|;\\s*)admin_session=([^;]+)/);
  if (!match) return false;
  const parts = decodeURIComponent(match[1]).split(".");
  if (parts.length !== 2 || !/^\\d+$/.test(parts[0])) return false;
  const issued = Number(parts[0]);
  if (!Number.isFinite(issued) || Date.now() - issued > 8 * 60 * 60 * 1000 || issued > Date.now() + 60000) return false;
  const expected = crypto.createHmac("sha256", secret).update(parts[0]).digest("base64url");
  const a = Buffer.from(parts[1]); const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a,b);
}
