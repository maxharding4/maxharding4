/**
 * Viewport testing utility for responsive design tests
 *
 * Usage:
 * ```typescript
 * import { setViewportWidth, BREAKPOINTS } from '@/test-utils/viewport';
 *
 * it('should be mobile layout at small viewport', () => {
 *   setViewportWidth(BREAKPOINTS.MOBILE);
 *   // ... test mobile layout
 * });
 * ```
 */

export const BREAKPOINTS = {
  MOBILE_SMALL: 320,    // iPhone SE
  MOBILE: 375,          // iPhone 12/13
  SM: 640,              // Tailwind sm breakpoint
  MD: 768,              // Tailwind md breakpoint / Tablet portrait
  LG: 1024,             // Tailwind lg breakpoint / Tablet landscape
  XL: 1280,             // Tailwind xl breakpoint / Desktop
  DESKTOP: 1440,        // Standard desktop
  XL2: 1536,            // Tailwind 2xl breakpoint
  DESKTOP_LARGE: 1920,  // Full HD
} as const;

/**
 * Set the viewport width for testing responsive behavior
 * Mocks window.innerWidth and window.matchMedia
 */
export function setViewportWidth(width: number): void {
  // Mock window.innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => {
      // Parse media query to determine if it matches
      const matches = matchesMediaQuery(query, width);

      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });
}

/**
 * Helper to determine if a media query matches the current width
 */
function matchesMediaQuery(query: string, width: number): boolean {
  // Handle min-width queries
  const minWidthMatch = query.match(/min-width:\s*(\d+)px/);
  if (minWidthMatch) {
    const minWidth = parseInt(minWidthMatch[1], 10);
    return width >= minWidth;
  }

  // Handle max-width queries
  const maxWidthMatch = query.match(/max-width:\s*(\d+)px/);
  if (maxWidthMatch) {
    const maxWidth = parseInt(maxWidthMatch[1], 10);
    return width <= maxWidth;
  }

  // Default to true for unrecognized queries
  return true;
}

/**
 * Reset viewport to default
 */
export function resetViewport(): void {
  setViewportWidth(1024); // Default to desktop
}
