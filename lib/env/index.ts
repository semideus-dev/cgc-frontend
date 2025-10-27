// Environment configuration with validation
const env = {
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Authentication
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  appUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  // External APIs
  apiUrl: process.env.API_URL,
  
  // File uploads
  uploadthingToken: process.env.UPLOADTHING_TOKEN,
  
  // Environment
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

// Validate required environment variables
const requiredEnvVars = {
  DATABASE_URL: env.databaseUrl,
  BETTER_AUTH_SECRET: env.betterAuthSecret,
} as const;

// Check for missing required environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

export default env;
