const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

function isValidIpv4(value: string): boolean {
  const match = IPV4_PATTERN.exec(value);
  if (!match) return false;
  return match.slice(1, 5).every((octet) => Number(octet) <= 255);
}

function isValidIpv6(value: string): boolean {
  return value.includes(":") && IPV6_PATTERN.test(value);
}

/**
 * Cloudflare sets CF-Connecting-IP from the actual TCP connection, unlike
 * X-Forwarded-For which a client can spoof — this is the only IP source we
 * trust. Never log or return this raw value.
 */
export function getClientIp(request: Request): string {
  const raw = request.headers.get("CF-Connecting-IP");
  if (!raw) return "unknown";
  if (isValidIpv4(raw) || isValidIpv6(raw)) return raw;
  return "unknown";
}

/**
 * Buckets an IP into a rate-limit key. IPv4 is used as-is. IPv6 is truncated
 * to its first 4 hextets (a /64) since residential ISPs commonly rotate the
 * trailing 64 bits per device/session — per-address buckets would undercount
 * abuse from a single network.
 */
export function toRateLimitKey(ip: string): string {
  if (ip === "unknown") return "unknown";
  if (isValidIpv4(ip)) return `v4:${ip}`;
  if (isValidIpv6(ip)) {
    const hextets = ip.split(":").filter((part) => part.length > 0).slice(0, 4);
    return `v6:${hextets.join(":")}`;
  }
  return "unknown";
}
