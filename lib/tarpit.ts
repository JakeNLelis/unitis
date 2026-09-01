/**
 * Progressive Tarpitting Utility (Anti-Scraping / Anti-Enumeration Delay)
 *
 * Adds an intentional asynchronous delay with randomized jitter to slow down
 * automated script crawlers, making bulk student ID scanning mathematically impractical
 * without negatively impacting single human interactions.
 */

export async function applyTarpitDelay(
  minDelayMs = 1000,
  maxJitterMs = 400,
): Promise<void> {
  const jitter = Math.floor(Math.random() * maxJitterMs);
  const totalDelay = minDelayMs + jitter;

  await new Promise((resolve) => setTimeout(resolve, totalDelay));
}
