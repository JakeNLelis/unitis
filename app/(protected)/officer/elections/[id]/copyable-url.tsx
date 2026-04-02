"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyableUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="text-sm bg-muted px-3 py-2 rounded-lg block flex-1 truncate">
        {url}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 size-8 flex items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors"
        aria-label={copied ? "Copied" : "Copy URL"}
      >
        {copied ? (
          <Check className="size-4 text-green-600" />
        ) : (
          <Copy className="size-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
