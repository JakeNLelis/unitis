"use client";

import { ReactQRCode, type ReactQRCodeRef } from "@lglab/react-qr-code";
import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyableUrl({ url }: { url: string }) {
  const qrRef = useRef<ReactQRCodeRef>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  function copyWithExecCommand(text: string): boolean {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let successful = false;
    try {
      successful = document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }

    return successful;
  }

  async function handleCopy() {
    let copySuccessful = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        copySuccessful = true;
      }
    } catch {
      copySuccessful = false;
    }

    if (!copySuccessful) {
      copySuccessful = copyWithExecCommand(url);
    }

    if (copySuccessful) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    qrRef.current?.download({
      name: "election-link-qr",
      format: "png",
      size: 1000,
    });

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="text-sm bg-muted px-3 py-2 rounded-lg block flex-1 truncate">
        {url}
      </code>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleCopy}
        className="shrink-0"
        aria-label={copied ? "Copied" : "Copy URL"}
      >
        {copied ? (
          <Check className="size-4 text-green-600" />
        ) : (
          <Copy className="size-4 text-muted-foreground" />
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        aria-label="Download QR code"
      >
        {downloaded ? "Downloaded" : "Download QR"}
      </Button>

      <div className="sr-only" aria-hidden="true">
        <ReactQRCode
          ref={qrRef}
          value={url}
          size={256}
          marginSize={2}
          finderPatternOuterSettings={{
            color: "#1152d4",
            style: "leaf-lg",
          }}
          finderPatternInnerSettings={{
            style: "inpoint-lg",
            color: "#1152d4",
          }}
          dataModulesSettings={{
            style: "rounded",
            color: "#1152d4",
          }}
          imageSettings={{
            src: "/logo-blue.png",
            width: 60,
            height: 60,
            excavate: true,
            opacity: 1,
            crossOrigin: "anonymous",
          }}
        />
      </div>
    </div>
  );
}
