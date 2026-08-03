import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env, validateEnv } from "./config/env.js";

validateEnv();

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Voice of Light API listening on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

