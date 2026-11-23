"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  revealTokenAction,
  tokenCopiedAction,
} from "@/app/(pharmacy)/admin/requests/actions";

const HIDE_MS = 60_000;

function formatTokenDisplay(token: string): string {
  const clean = token.replace(/\s+/g, "");
  return clean.match(/.{1,4}/g)?.join(" ") ?? token;
}

export function TokenPanel({
  requestId,
  tokenAvailable,
}: {
  requestId: string;
  tokenAvailable: boolean;
}) {
  const { addToast } = useToast();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function scheduleHide() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setRevealed(null), HIDE_MS);
  }

  function onReveal() {
    if (revealed) {
      setRevealed(null);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      return;
    }

    startTransition(async () => {
      const result = await revealTokenAction(requestId);
      if (!result.ok) {
        addToast({ variant: "danger", message: result.message });
        return;
      }
      setRevealed(result.token);
      scheduleHide();
      addToast({
        variant: "info",
        message: "Token revealed. Auto-hides in 60 seconds. Audited.",
      });
    });
  }

  function onCopy() {
    if (!revealed) return;
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(revealed);
      } catch {
        addToast({
          variant: "danger",
          message: "Could not copy to clipboard.",
        });
        return;
      }
      const result = await tokenCopiedAction(requestId);
      if (!result.ok) {
        addToast({ variant: "danger", message: result.message });
        return;
      }
      addToast({
        variant: "success",
        message: "Copied. Written to the audit log.",
      });
    });
  }

  if (!tokenAvailable) {
    return (
      <p className="text-sm text-fg-muted">
        The eScript token is not available for this order.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xl tracking-[0.15em] text-heading">
          {revealed ? formatTokenDisplay(revealed) : "XXXXXXXXXXXX"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onReveal}
            loading={pending && !revealed}
            disabled={pending}
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
            {revealed ? "Hide" : "Reveal"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCopy}
            disabled={!revealed || pending}
          >
            <Copy className="h-4 w-4" aria-hidden />
            Copy
          </Button>
        </div>
      </div>
      <p className="text-xs text-fg-muted">
        Reveal and copy are written to the audit log. Auto-hides after 60 seconds.
      </p>
    </div>
  );
}
