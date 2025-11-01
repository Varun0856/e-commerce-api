import app from './app.js'
import prisma from './database/prisma.js'
import { PORT } from './config/env.js'
import logger from './utils/winstonLogger.js';

process.on('uncaughtException', (error) => {
  logger.error(`UncaughtException: ${error.message}`)
  process.exit(1);
})

async function startServer() {
  try {
    await prisma.$connect();
    logger.info(`Connected to PostgreSQL database`);

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Database connection failed: ${error}`);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

process.on('unhandledRejection', (error) => {
  logger.error(`Unhandled Rejection: ${error.message}`);
  process.exit(1);
});
