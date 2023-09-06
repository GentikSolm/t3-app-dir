import { config } from "dotenv";
import type { Config } from "drizzle-kit";
config();

export default {
  schema: "./src/db/schema/*",
  driver: "mysql2",
  dbCredentials: {
    connectionString: `mysql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/papertrail?ssl={"rejectUnauthorized":true}`,
  },
} satisfies Config;
