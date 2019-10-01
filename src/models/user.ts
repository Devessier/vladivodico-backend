import { query, sql } from 'sqliterally';
import { hash } from 'argon2';
import uuid from 'uuid/v4';

import { ModelArgs } from './index';
import { PolicyGetCachedOptions } from '@hapi/catbox';

export interface InternalUser {
    id: number;
    uuid: string;
    username: string;
    email: string;
    password: string;
}

export interface ExternalUser extends Omit<InternalUser, 'id' | 'password'> {}

interface GetUserWithUUIDArgs extends ModelArgs {
    uuid: string;
}

interface GetUserWithUsername extends ModelArgs {
    username: string;
}

interface CreateUserArgs extends ModelArgs {
    username: string;
    email: string;
    password: string;
}

export const enum CreateUserReponse {
    DUPLICATE_INFORMATIONS = 0,
    UNKNOWN_ERROR = 1,
}

export function mapInternalUserToExternalUser({
    uuid,
    username,
    email,
}: InternalUser): ExternalUser {
    return {
        uuid,
        username,
        email,
    };
}

export async function getUserWithUUID({
    db,
    uuid,
}: GetUserWithUUIDArgs): Promise<InternalUser | null> {
    try {
        const command = query.select`*`.from`users`.where`uuid = ${uuid}`;

        const {
            rows: [user],
        } = await db.query(command.build());

        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getUserWithUsername({
    db,
    username,
}: GetUserWithUsername): Promise<InternalUser | null> {
    try {
        const cmd = query.select`*`.from`users`.where`username = ${username}`;

        const {
            rows: [user],
        } = await db.query(cmd.build());

        return user || null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function createUser({
    db,
    username,
    email,
    password,
}: CreateUserArgs): Promise<string | CreateUserReponse> {
    try {
        const id = uuid();

        const cmd = sql`
            INSERT INTO users (
                uuid,
                username,
                email,
                password
            )
            VALUES (
                ${id},
                ${username},
                ${email},
                ${await hash(password)}
            )
        `;

        await db.query(cmd);

        return id;
    } catch (e) {
        // Key duplication
        if (e.code === '23505') {
            return CreateUserReponse.DUPLICATE_INFORMATIONS;
        }
        console.error(e);
        return CreateUserReponse.UNKNOWN_ERROR;
    }
}
