import { Server, Request } from '@hapi/hapi';
import * as CookieScheme from '@hapi/cookie';

import { setupRoutes } from './router';
import Database from './database';
import { getUserWithUUID } from './models/user';

export interface Context {
    db: Database;
}

export interface CookieContent {
    uuid: string;
}

async function app() {
    const db = new Database();

    const PORT = Number(process.env.PORT) || 5000;

    const server = new Server({
        port: PORT,
        host: process.env.HOST || 'localhost',
    });

    server.bind({ db } as Context);

    await server.register(CookieScheme);

    server.auth.strategy('session', 'cookie', {
        cookie: {
            name: 'sid.vladivodico',
            password: process.env.COOKIE_PASSWORD,
            isSecure: false,
            path: '/',
        },
        async validateFunc(request: Request, { uuid }: CookieContent) {
            try {
                const user = await getUserWithUUID({ db, uuid });

                if (user === null) return { valid: false };

                return { valid: true, credentials: user };
            } catch (e) {
                console.error(e);
                return { valid: false };
            }
        },
    });

    server.auth.default('session');

    setupRoutes(server);

    await server.start();

    console.log(`Listening on port ${PORT} 🎉`);
}

app().catch(console.error);
