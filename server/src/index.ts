import * as path from 'path';

import helmet from '@fastify/helmet';
import * as fastifyStatic from '@fastify/static';
import {ContentSDK} from 'api-sdk';
import fastify from 'fastify';

import {Config} from './config/config';
import {Router} from './router/router';
import {Logger} from './util/logger';

const start = async (): Promise<void> => {
	const webServer = fastify();
	await webServer.register(helmet);

	webServer.register(fastifyStatic, {
		root: path.join(__dirname, '../../public')
	});

	if (!Config.serviceIP) {
		throw new Error('missing service ip');
	}

	const contentSDK = new ContentSDK(Config.serviceIP + ':50051');
	try {
		// await contentSDK.connect();
	} catch (error) {
		Logger.error('index', {error: (error as Error).stack});
	}

	const router = new Router(Config.serviceIP, contentSDK);

	webServer.register(router.applyRoutes.bind(router));

	await webServer.listen({
		host: '::',
		port: Config.port
	});
	Logger.info('index', {info: `web server started on port ${Config.port}`});
};

start();
