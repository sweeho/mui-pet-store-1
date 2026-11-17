"use client";

import { ErrorFrame } from "@/components/frames/ErrorFrame";

/** The route error boundary for every page in the shell: the shared error frame, with Retry. */
export default function RouteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorFrame
      message="Something went wrong while loading this page. Nothing was changed. Try again in a moment."
      onRetry={reset}
    />
  );
}
