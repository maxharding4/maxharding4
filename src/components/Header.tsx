"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    // Valid use case: closing menu in response to navigation (external system change)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/cv", label: "CV" },
    { href: "/travel", label: "Travel" },
    { href: "/photo-of-the-day", label: "Daily Photo" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-ink text-white shadow-lg">
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Name */}
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white hover:text-white/80 transition-colors"
          >
            Max Harding
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-base font-medium transition-colors hover:text-white ${
                    isActive(link.href)
                      ? "text-white border-b-2 border-blue-500 pb-1 pointer-events-none"
                      : "text-white/60"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  tabIndex={isActive(link.href) ? -1 : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMenu}
          >
            <span className="sr-only">
              {mobileMenuOpen ? "Close menu" : "Open menu"}
            </span>
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 top-16 bg-black/50 md:hidden"
              aria-hidden="true"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div
              id="mobile-menu"
              className="fixed inset-x-0 top-16 bg-ink shadow-lg md:hidden"
            >
              <ul className="space-y-1 px-4 pb-4 pt-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-white/10 text-white border-l-2 border-blue-500 pointer-events-none"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      tabIndex={isActive(link.href) ? -1 : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
