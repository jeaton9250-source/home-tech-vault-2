export function getTimeGreeting(
  firstName: string,
  now = new Date()
): string {
  const hour = now.getHours();

  if (hour < 12) {
    return `Good morning, ${firstName}.`;
  }

  if (hour < 17) {
    return `Good afternoon, ${firstName}.`;
  }

  return `Good evening, ${firstName}.`;
}

export function formatDisplayDate(
  now = new Date()
): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);
}
