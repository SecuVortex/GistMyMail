import { buildApp } from './app.js';
import { config } from './config.js';
import { getDatabase } from './db/index.js';
import { startDeliveryScheduler } from './delivery/scheduler.js';

async function main() {
  console.log('Starting GistMyMail API Server...');
  
  // Initialize Database
  const db = await getDatabase();
  await db.init();

  const app = await buildApp();

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`GistMyMail API Server running at http://localhost:${config.PORT}`);
    console.log(`Health check: http://localhost:${config.PORT}/health`);

    if (config.SCHEDULER_ENABLED) {
      startDeliveryScheduler();
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
