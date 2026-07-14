import { app } from "./app.js";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

const handleShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close the Express server first (stops accepting new connections)
  server.close(async (err) => {
    if (err) {
      console.error("Error during server close:", err);
      process.exit(1);
    }
    
    console.log("HTTP server closed.");
    
    // Close the database connection
    try {
      await prisma.$disconnect();
      console.log("Database connection closed.");
      process.exit(0);
    } catch (dbErr) {
      console.error("Error closing database connection:", dbErr);
      process.exit(1);
    }
  });

  // Force close after 10 seconds if connections are hanging
  setTimeout(() => {
    console.error("Forceful shutdown initiated after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
