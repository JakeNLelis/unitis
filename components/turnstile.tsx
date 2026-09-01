"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

// Official Cloudflare testing site key (Always passes)
const DEFAULT_TEST_SITE_KEY = "1x00000000000000000000AA";

interface TurnstileProps {
  siteKey?: string;
  onSuccess: (token: string) => void;
  onError?: (error?: unknown) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  className?: string;
}

export interface TurnstileRef {
  reset: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error?: unknown) => void;
          "expired-callback"?: () => void;
          theme?: string;
          size?: string;
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  function Turnstile(
    {
      siteKey,
      onSuccess,
      onError,
      onExpire,
      theme = "auto",
      size = "normal",
      className = "",
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Keep latest callbacks in a ref to avoid re-rendering and tearing down the
    // Turnstile widget whenever parent component re-renders (e.g. while typing).
    const callbacksRef = useRef({ onSuccess, onError, onExpire });
    useEffect(() => {
      callbacksRef.current = { onSuccess, onError, onExpire };
    });

    const activeSiteKey =
      siteKey ||
      process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
      DEFAULT_TEST_SITE_KEY;

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            // Ignore
          }
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      function renderWidget() {
        if (!containerRef.current || !window.turnstile || !isMounted) return;

        if (widgetIdRef.current) {
          try {
            // Only remove if the container is still in the DOM to avoid
            // "Nothing to remove found for the provided container" error
            if (containerRef.current && document.body.contains(containerRef.current)) {
              window.turnstile.remove(widgetIdRef.current);
            }
          } catch {
            // Ignore
          }
          widgetIdRef.current = null;
        }

        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: activeSiteKey,
            callback: (token: string) => {
              if (isMounted) callbacksRef.current.onSuccess(token);
            },
            "error-callback": (err: unknown) => {
              if (isMounted) {
                if (callbacksRef.current.onError) callbacksRef.current.onError(err);
                // In local development, if domain is not configured or blocked, fallback
                if (
                  typeof window !== "undefined" &&
                  (window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1")
                ) {
                  callbacksRef.current.onSuccess("dummy_dev_token");
                }
              }
            },
            "expired-callback": () => {
              if (isMounted && callbacksRef.current.onExpire) callbacksRef.current.onExpire();
            },
            theme,
            size,
          });
        } catch (e) {
          console.error("Turnstile render error:", e);
        }
      }

      const existingScript = document.getElementById(
        "cloudflare-turnstile-api",
      );

      if (window.turnstile) {
        renderWidget();
      } else if (!existingScript) {
        const script = document.createElement("script");
        script.id = "cloudflare-turnstile-api";
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderWidget();
        };
        script.onerror = () => {
          // If script blocked by adblocker on localhost
          if (
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1")
          ) {
            callbacksRef.current.onSuccess("dummy_dev_token");
          }
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", renderWidget);
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            // Only remove if the container is still in the DOM to avoid the Turnstile error
            // "Nothing to remove found for the provided container" during unmounting
            if (containerRef.current && document.body.contains(containerRef.current)) {
              window.turnstile.remove(widgetIdRef.current);
            }
          } catch {
            // Ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [activeSiteKey, theme, size]);

    return <div ref={containerRef} className={className} />;
  },
);
