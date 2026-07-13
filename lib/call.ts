/**
 * Free video/voice calls via Jitsi Meet — no account, no server, no cost.
 * We generate a hard-to-guess room URL and open it in a new tab; sharing the
 * link (in a message, email or text) lets the client or crew join in one tap.
 * Audio-only works on the same link (participants just keep the camera off).
 */
export function newVideoRoom(label = "ForgedLandscapes"): string {
  const slug =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `https://meet.jit.si/${label}-${slug}`;
}
