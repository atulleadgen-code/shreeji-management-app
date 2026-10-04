import { PrismaClient } from '@prisma/client';

function getRuntimeDatabaseUrl() {
	const configuredUrl = process.env.DATABASE_URL?.trim();
	if (!configuredUrl) {
		return undefined;
	}

	const parsedUrl = new URL(configuredUrl);
	if (parsedUrl.port !== '6543' || parsedUrl.searchParams.get('pgbouncer') === 'true') {
		return configuredUrl;
	}

	parsedUrl.searchParams.set('pgbouncer', 'true');
	return parsedUrl.toString();
}

const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

export const prisma = runtimeDatabaseUrl
	? new PrismaClient({ datasources: { db: { url: runtimeDatabaseUrl } } })
	: new PrismaClient();

export * from '@prisma/client';
