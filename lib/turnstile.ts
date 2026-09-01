/**
 * Cloudflare Turnstile Server-Side Verification Helper
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const CLOUDFLARE_VERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Official Cloudflare testing dummy keys that always pass
const DUMMY_SECRET_KEY = "1x0000000000000000000000000000000AA";

export async function verifyTurnstileToken(
  token?: string | null,
  remoteIp?: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey =
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || DUMMY_SECRET_KEY;

  // In development without Turnstile configured, bypass gracefully
  if (!process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY && !token) {
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error: "Security verification token is missing. Please refresh and try again.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(CLOUDFLARE_VERIFY_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to verify security challenge with Cloudflare.",
      };
    }

    const data = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return {
        success: false,
        error:
          "Security check failed or expired. Please complete the verification again.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    // If external call fails unexpectedly, log and allow in dev or reject in prod
    if (process.env.NODE_ENV === "development") {
      return { success: true };
    }
    return {
      success: false,
      error: "Security service temporarily unavailable. Please try again.",
    };
  }
}
