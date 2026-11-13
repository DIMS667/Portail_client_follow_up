export const AUTO_REGISTRATION_PATTERN = /^[A-Z]{2} [0-9]{3} [A-Z]{2}$/;
export const MOTO_REGISTRATION_PATTERN = /^[A-Z]{4} [0-9]{3} [A-Z]{2}$/;
export const CHASSIS_NUMBER_PATTERN = /^[A-Z0-9]{17}$/;

export function currentLocalDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function isValidFirstRegistrationDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && value >= "1950-01-01"
    && value <= currentLocalDate();
}

export function normalizeChassisNumber(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
}

function formatRegistration(value: string, prefixLength: number) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, prefixLength + 5);
  return [
    compact.slice(0, prefixLength),
    compact.slice(prefixLength, prefixLength + 3),
    compact.slice(prefixLength + 3, prefixLength + 5),
  ].filter(Boolean).join(" ");
}

export function formatAutoRegistration(value: string) {
  return formatRegistration(value, 2);
}

export function formatMotoRegistration(value: string) {
  return formatRegistration(value, 4);
}
