/**
 * Security Utilities
 *
 * Provides functions for input validation, sanitization, and security best practices
 * to protect against common web vulnerabilities (OWASP Top 10).
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * Removes potentially dangerous HTML tags and attributes while preserving safe content.
 * For production use, consider using a library like DOMPurify for more robust sanitization.
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: URIs for images (potential XSS vector)
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, "");

  return sanitized.trim();
}

/**
 * Validate and sanitize URL to prevent open redirect vulnerabilities
 *
 * Ensures URLs are safe and don't contain malicious content.
 *
 * @param url - URL string to validate
 * @param allowedDomains - Optional list of allowed domains
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string, allowedDomains?: string[]): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "");

    // Block javascript: and data: protocols
    if (parsed.protocol === "javascript:" || parsed.protocol === "data:") {
      return null;
    }

    // If allowed domains specified, validate against them
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some((domain) => parsed.hostname.endsWith(domain));
      if (!isAllowed) {
        return null;
      }
    }

    return parsed.toString();
  } catch {
    // Invalid URL
    return null;
  }
}

/**
 * Escape special characters to prevent XSS in text content
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML rendering
 */
export function escapeHtml(text: string): string {
  if (!text) return "";

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // Basic email validation regex
  // More complex validation should be done server-side
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate that a string doesn't contain SQL injection patterns
 *
 * Note: This is a basic check. For production, use parameterized queries.
 *
 * @param input - String to validate
 * @returns True if input appears safe
 */
export function validateNoSqlInjection(input: string): boolean {
  if (!input) return true;

  // Check for common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\*|;|'|"|\\)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ];

  return !sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Generate a Content Security Policy nonce for inline scripts
 *
 * @returns Random nonce string
 */
export function generateNonce(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Validate file upload type and size
 *
 * @param file - File object to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSizeInBytes - Maximum file size in bytes
 * @returns Validation result with error message if invalid
 */
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSizeInBytes: number
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  // Check file size
  if (file.size > maxSizeInBytes) {
    const maxSizeMB = (maxSizeInBytes / (1024 * 1024)).toFixed(2);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  return { valid: true };
}

/**
 * Rate limiting helper (client-side)
 *
 * Tracks request timestamps to implement basic rate limiting.
 *
 * @param key - Unique key for the rate limit (e.g., "api-call")
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns True if request is allowed, false if rate limited
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  if (typeof window === "undefined") return true; // Skip on server

  const storageKey = `rateLimit_${key}`;
  const now = Date.now();

  try {
    const stored = localStorage.getItem(storageKey);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];

    // Filter out timestamps outside the window
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

    // Check if limit exceeded
    if (validTimestamps.length >= maxRequests) {
      return false;
    }

    // Add current timestamp
    validTimestamps.push(now);
    localStorage.setItem(storageKey, JSON.stringify(validTimestamps));

    return true;
  } catch {
    // If localStorage fails, allow the request
    return true;
  }
}

/**
 * Sanitize Contentful rich text content
 *
 * Ensures content from Contentful CMS is safe to render.
 *
 * @param content - Content object from Contentful
 * @returns Sanitized content
 */
export function sanitizeContentfulContent<T extends Record<string, unknown>>(content: T): T {
  if (!content || typeof content !== "object") {
    return content;
  }

  const sanitized: Record<string, unknown> = { ...content };

  // Recursively sanitize string values
  Object.keys(sanitized).forEach((key) => {
    const value = sanitized[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeContentfulContent(value as Record<string, unknown>);
    }
  });

  return sanitized as T;
}
