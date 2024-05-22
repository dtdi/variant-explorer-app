export function formatDuration(seconds) {
  const weeks = Math.floor(seconds / (86400 * 7));
  seconds %= 86400 * 7;

  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  seconds = Math.floor(seconds);

  const parts = [];

  if (weeks > 0) {
    parts.push(`${weeks}w`);
  }
  if (days > 0) {
    parts.push(`${days}d`);
  }
  // Padding each value to always display two digits
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  parts.push(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);

  return parts.join(" ");
};

export function formatNumber(number) {
  return new Intl.NumberFormat(undefined, { maximumSignificantDigits: 2 }).format(number);
}