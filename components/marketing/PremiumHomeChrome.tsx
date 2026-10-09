"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["Features", "remember"],
  ["How it works", "explore"],
  ["For Realtors", "/realtors"],
  ["Pricing", "/pricing"],
];

export function Header({ signupLink }: { signupLink: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#40502F] bg-[#183047] text-[#FFFDF8] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 lg:px-8">
        <a
          href="#top"
          className="text-[15px] font-semibold tracking-[-0.02em] text-[#FFFDF8]"
          aria-label="Home Tech Vault home"
        >
          Home Tech Vault
        </a>
        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          {links.map(([label, id]) => (
            <a
              key={id}
              href={id.startsWith("/") ? id : `#${id}`}
              className="text-xs text-white transition hover:text-[#DED7CA]"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a href="/login" className="text-xs text-white hover:text-[#DED7CA]">
            Sign in
          </a>
          <a
            href={signupLink}
            className="rounded-full bg-[#183047] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#40502F]"
          >
            Start your home vault
          </a>
        </div>
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="premium-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="premium-mobile-nav"
          className="flex flex-col gap-5 border-t border-[#40502F] bg-[#183047] px-5 py-6 text-[#FFFDF8] md:hidden"
          aria-label="Mobile navigation"
        >
          {links.map(([label, id]) => (
            <a
              key={id}
              href={id.startsWith("/") ? id : `#${id}`}
              onClick={() => setOpen(false)}
              className="text-sm"
            >
              {label}
            </a>
          ))}
          <a href="/login" onClick={() => setOpen(false)} className="text-sm">
            Sign in
          </a>
          <a
            href={signupLink}
            className="w-fit rounded-full bg-[#183047] px-5 py-2.5 text-sm font-medium text-white"
          >
            Start your home vault
          </a>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#F5F1E8] px-5 py-14 text-[#59625D] lg:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-8 md:flex-row">
        <div>
          <div className="text-[15px] font-semibold text-[#17212A]">
            Home Tech Vault
          </div>
          <p className="mt-3 max-w-xs text-xs leading-5">
            The simple, private way to keep your home’s most important details
            together.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs">
          <a href="#remember">Features</a>
          <a href="#explore">How it works</a>
          <a href="/realtors">For Realtors</a>
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1200px] border-t border-[#DED7CA] pt-5 text-xs">
        © {new Date().getFullYear()} Home Tech Vault. All rights reserved.
      </div>
    </footer>
  );
}

export default Header;
