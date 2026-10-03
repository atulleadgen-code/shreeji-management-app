import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const configuredOrigins = (process.env.WEB_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production' && configuredOrigins.length === 0) {
    throw new Error('WEB_ORIGIN must be configured in production.');
  }

  const allowedOrigins = (configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:3000'])
    .map((origin) => {
      const parsedOrigin = new URL(origin);

      if (!['http:', 'https:'].includes(parsedOrigin.protocol) || parsedOrigin.pathname !== '/' || parsedOrigin.search || parsedOrigin.hash) {
        throw new Error('WEB_ORIGIN entries must be HTTP(S) origins without a path.');
      }

      return parsedOrigin.origin;
    });

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 600,
  });
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
