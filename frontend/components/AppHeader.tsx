"use client";

import { IconButton } from "@/components/ui";

type Props = {
  onLogoClick?: () => void;
};

/**
 * Top app bar — ring logo and avatar vertically centered in the bar; space-between horizontally.
 */
export function AppHeader({ onLogoClick }: Props) {
  return (
    <header
      className="sticky top-0 z-40 w-full shrink-0 bg-white outline-none"
      role="banner"
    >
      {/* Match DocsLayout main: lg:pl-5 shell + max-w-2xl + px-4 sm:px-6 lg:px-8 */}
      <div className="w-full lg:pl-5">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <IconButton
            type="button"
            variant="header"
            label="Sentiment.ai — scroll to top"
            onClick={onLogoClick}
          >
            <span className="flex h-8 w-8 items-center justify-center" aria-hidden>
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="11.5"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </span>
          </IconButton>

          <IconButton type="button" variant="avatar" label="Account">
            S
          </IconButton>
        </div>
      </div>
    </header>
  );
}
