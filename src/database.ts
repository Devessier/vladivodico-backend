import { Pool } from 'pg';

export default class Database extends Pool {
    constructor() {
        const {
            DATABASE_USER,
            DATABASE_HOST,
            DATABASE_PASSWORD,
            DATABASE_NAME,
            DATABASE_PORT,
        } = process.env;

        super({
            user: DATABASE_USER,
            host: DATABASE_HOST,
            password: DATABASE_PASSWORD,
            port: Number(DATABASE_PORT),
            database: DATABASE_NAME,
        });
    }
}
