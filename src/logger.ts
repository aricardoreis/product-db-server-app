import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",
      options: {},
      level: "debug",
    },
    ...(process.env.AXIOM_TOKEN
      ? [
          {
            target: "@axiomhq/pino",
            options: {
              dataset: process.env.AXIOM_DATASET || "product-db-logs",
              token: process.env.AXIOM_TOKEN,
            },
            level: "info" as const,
          },
        ]
      : []),
  ],
});

export const logger = pino(
  {
    level: process.env.NODE_ENV !== "production" ? "debug" : "info",
    base: { service: "product-db-server-app" },
  },
  transport
);
