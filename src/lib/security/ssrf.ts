/**
 * RESORA SSRF (Server-Side Request Forgery) Defense Engine
 * Validates outgoing fetch requests to prevent access to private networks, loopbacks, and cloud metadata.
 */

// Private & reserved IP range prefixes
const BLOCKED_IP_PREFIXES = [
  '0.',          // Current network
  '10.',         // Private RFC 1918
  '127.',        // Loopback
  '169.254.',    // Link-local / AWS / GCP metadata
  '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.',
  '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.', // Private RFC 1918
  '192.168.',    // Private RFC 1918
  '::1',         // IPv6 loopback
  'fc00:',       // IPv6 Unique local
  'fe80:',       // IPv6 Link-local
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'instance-data',
  '169.254.169.254',
];

export interface SsrfValidationResult {
  isSafe: boolean;
  reason?: string;
  sanitizedUrl?: string;
}

/**
 * Validates a target URL against SSRF threats:
 * - Ensures scheme is strictly http or https
 * - Disallows dangerous schemes (file, ftp, gopher, javascript, data, etc.)
 * - Blocks localhosts, RFC 1918 private subnets, link-local, and cloud metadata endpoints
 */
export function validateUrlForSsrf(rawUrl: string): SsrfValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isSafe: false, reason: 'URL string is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { isSafe: false, reason: 'Invalid URL syntax' };
  }

  // 1. Protocol restriction: only http and https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isSafe: false, reason: `Unsafe protocol '${parsed.protocol}'. Only HTTP and HTTPS are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Block explicitly banned hostnames
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { isSafe: false, reason: `Access to internal host '${hostname}' is strictly forbidden.` };
  }

  // 3. Block private & link-local IP prefixes
  for (const prefix of BLOCKED_IP_PREFIXES) {
    if (hostname.startsWith(prefix) || hostname === prefix.replace(/\.$/, '')) {
      return { isSafe: false, reason: `Access to private/internal IP space (${hostname}) is forbidden.` };
    }
  }

  // 4. Block decimal/hex encoded IP variations (e.g. 2130706433 for 127.0.0.1)
  if (/^\d+$/.test(hostname) || /^0x[0-9a-fA-F]+$/.test(hostname)) {
    return { isSafe: false, reason: 'Numeric or hex-encoded IP addresses are prohibited.' };
  }

  // 5. Block local top-level domains (.local, .internal, .lan, .corp)
  if (
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.corp')
  ) {
    return { isSafe: false, reason: `Internal domain suffix in '${hostname}' is prohibited.` };
  }

  return {
    isSafe: true,
    sanitizedUrl: parsed.toString(),
  };
}
