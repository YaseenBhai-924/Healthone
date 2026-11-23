import { z, ZodError } from "zod";

/**
 * Server-only env. Validated when getServerConfig() / getAuthEnvConfig() is called
 * (request/runtime), never at module import / build time, so `next build` does not
 * need real secrets. Do not expose these via NEXT_PUBLIC_*.
 *
 * Error messages name the KEY, never the value, to prevent secret leakage in logs.
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseOrThrow<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  values: Record<string, string | undefined>,
): z.infer<typeof schema> {
  try {
    return schema.parse(values);
  } catch (err) {
    if (err instanceof ZodError) {
      const lines = err.errors.map(
        (e) => `  ${e.path.join(".")}: ${e.message}`,
      );
      throw new Error(
        `Invalid server configuration:\n${lines.join("\n")}`,
      );
    }
    throw err;
  }
}

// ─── base config ──────────────────────────────────────────────────────────────

const serverConfigSchema = z.object({
  SITE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  API_SCOPE: z
    .string()
    .regex(
      /^api:\/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/Requests\.Access$/i,
      "Must match api://<guid>/Requests.Access",
    ),
  ENTRA_TENANT_ID: z.string().uuid(),
  ENTRA_CLIENT_ID: z.string().uuid(),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

export function getServerConfig(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): ServerConfig {
  return parseOrThrow(serverConfigSchema, {
    SITE_URL: env.SITE_URL,
    API_BASE_URL: env.API_BASE_URL,
    API_SCOPE: env.API_SCOPE,
    ENTRA_TENANT_ID: env.ENTRA_TENANT_ID,
    ENTRA_CLIENT_ID: env.ENTRA_CLIENT_ID,
  });
}

// ─── auth config ──────────────────────────────────────────────────────────────

const authEnvSchema = z.object({
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters"),
  ENTRA_TENANT_ID: z.string().uuid(),
  ENTRA_CLIENT_ID: z.string().uuid(),
  ENTRA_CLIENT_SECRET: z
    .string()
    .min(1, "ENTRA_CLIENT_SECRET must not be empty"),
  API_SCOPE: z
    .string()
    .regex(
      /^api:\/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/Requests\.Access$/i,
      "Must match api://<guid>/Requests.Access",
    ),
  API_BASE_URL: z.string().url(),
  SITE_URL: z.string().url(),
});

export type AuthEnvConfig = z.infer<typeof authEnvSchema>;

export function getAuthEnvConfig(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): AuthEnvConfig {
  return parseOrThrow(authEnvSchema, {
    AUTH_SECRET: env.AUTH_SECRET,
    ENTRA_TENANT_ID: env.ENTRA_TENANT_ID,
    ENTRA_CLIENT_ID: env.ENTRA_CLIENT_ID,
    ENTRA_CLIENT_SECRET: env.ENTRA_CLIENT_SECRET,
    API_SCOPE: env.API_SCOPE,
    API_BASE_URL: env.API_BASE_URL,
    SITE_URL: env.SITE_URL,
  });
}
