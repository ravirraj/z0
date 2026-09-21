export interface MissingEnvVar {
  name: string;
  description: string;
  example: string;
  required: boolean;
}

export function checkRequiredEnvVars(): MissingEnvVar[] {
  const requiredVars: MissingEnvVar[] = [
    {
      name: "BETTER_AUTH_SECRET",
      description: "Secret key for Better Auth authentication",
      example: "your-secret-key-here",
      required: true,
    },
    {
      name: "POSTGRES_URL",
      description: "PostgreSQL database connection string",
      example: "", // No example - user needs to provide their own
      required: true,
    },
    {
      name: "GOOGLE_CLIENT_ID",
      description: "Google OAuth client ID (required for Google sign-in)",
      example: "",
      required: false,
    },
    {
      name: "GOOGLE_CLIENT_SECRET",
      description: "Google OAuth client secret (required for Google sign-in)",
      example: "",
      required: false,
    },
  ];

  const missing = requiredVars.filter((envVar) => {
    const value = process.env[envVar.name];
    return !value || value.trim() === "";
  });

  return missing;
}

export function hasAllRequiredEnvVars(): boolean {
  return checkRequiredEnvVars().filter((envVar) => envVar.required).length === 0;
}

export const hasEnvVars = !!(
  (process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET) &&
  process.env.POSTGRES_URL
);
