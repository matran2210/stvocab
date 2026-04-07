const parseDurationSeconds = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const ACCESS_TOKEN_TTL_SECONDS = parseDurationSeconds(
  process.env.JWT_ACCESS_TTL_SECONDS,
  15 * 60
);

export const REFRESH_TOKEN_TTL_SECONDS = parseDurationSeconds(
  process.env.JWT_REFRESH_TTL_SECONDS,
  30 * 24 * 60 * 60
);

export const JWT_ISSUER = process.env.JWT_ISSUER || 'stvocab-backend';
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'stvocab-user';
export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'fallback_access_secret';
export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret';
