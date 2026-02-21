export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}
