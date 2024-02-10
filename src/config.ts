import type { Options } from "sequelize";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

interface Env {
  HUBSPOT_CLIENT_ID: string;
  HUBSPOT_CLIENT_SECRET: string;
  HUBSPOT_DEVELOPER_API_KEY: string;
  APP_BASE_URL: string;
}

interface Config {
  sequelize: Options;
  envPath: string;
  env: Env;
}

const development: Omit<Config, "env"> = {
  sequelize: {
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "db", "development.sqlite"),
    logging: false,
  },
  envPath: path.join(__dirname, "..", ".env.development"),
};

const production: Omit<Config, "env"> = {
  sequelize: {
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "db", "production.sqlite"),
    logging: false,
  },
  envPath: path.join(__dirname, "..", ".env.production"),
};

const configurations: Record<string, Omit<Config, "env">> = {
  development,
  production,
};

const maybeEnv = process.env.NODE_ENV ?? "";
const env = configurations[maybeEnv] ? maybeEnv : "development";

console.log(`NODE_ENV=${maybeEnv}`);
console.log(`Using "${env}" configuration`);

const partialConfig = configurations[env];

if (!fs.existsSync(partialConfig.envPath)) {
  console.log(`.env file not found: ${partialConfig.envPath}`);
} else {
  dotenv.config({ path: partialConfig.envPath });
}

function getEnvOrThrow(name: string): string {
  if (name in process.env) {
    return (process.env[name] ?? "").trim();
  } else {
    throw new Error(`Environment variable ${name} not found`);
  }
}

const config: Config = {
  ...partialConfig,
  env: {
    HUBSPOT_CLIENT_ID: getEnvOrThrow("HUBSPOT_CLIENT_ID"),
    HUBSPOT_CLIENT_SECRET: getEnvOrThrow("HUBSPOT_CLIENT_SECRET"),
    HUBSPOT_DEVELOPER_API_KEY: getEnvOrThrow("HUBSPOT_DEVELOPER_API_KEY"),
    APP_BASE_URL: getEnvOrThrow("APP_BASE_URL"),
  },
};

export default config;
