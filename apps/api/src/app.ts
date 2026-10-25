import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { config } from './config.js';
import { authRoutes } from './routes/auth.routes.js';
import { accountsRoutes } from './routes/accounts.routes.js';
import { digestRoutes } from './routes/digest.routes.js';
import { deliveryRoutes } from './routes/delivery.routes.js';
import { healthRoutes } from './routes/health.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: config.NODE_ENV !== 'test'
  });

  // Enable CORS
  await fastify.register(cors, {
    origin: [config.APP_BASE_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  });

  // Enable Cookies
  await fastify.register(cookie, {
    secret: config.SESSION_SECRET,
    hook: 'onRequest'
  });

  // Register application routes
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(accountsRoutes);
  await fastify.register(digestRoutes);
  await fastify.register(deliveryRoutes);

  return fastify;
}
