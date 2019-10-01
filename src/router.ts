import { Server } from '@hapi/hapi';
import Joi from '@hapi/joi';
import {
    createUser,
    CreateUserReponse,
    mapInternalUserToExternalUser,
    InternalUser,
} from './models/user';
import { Context, CookieContent } from './app';

interface SignUpPayload {
    username: string;
    password: string;
    email: string;
}

enum SignUpResponse {
    SUCCESS = 'SUCCESS',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
}

export function setupRoutes(server: Server) {
    server.route([
        {
            method: 'GET',
            path: '/me',
            handler(request) {
                const { credentials } = request.auth;

                if (credentials === null) return null;

                return mapInternalUserToExternalUser(
                    credentials as InternalUser
                );
            },
            options: {
                auth: {
                    mode: 'optional',
                },
                response: {
                    schema: Joi.alternatives([
                        Joi.string().allow(null),
                        Joi.object({
                            uuid: Joi.string()
                                .uuid()
                                .required(),
                            username: Joi.string().required(),
                            email: Joi.string()
                                .email()
                                .required(),
                        }),
                    ]),
                },
            },
        },
        {
            method: 'POST',
            path: '/auth/sign-up',
            async handler(request, h) {
                const {
                    username,
                    email,
                    password,
                } = request.payload as SignUpPayload;

                const { db } = h.context as Context;

                const id = await createUser({
                    db,
                    username,
                    email,
                    password,
                });

                if (typeof id !== 'string') {
                    const statusCode =
                        id === CreateUserReponse.DUPLICATE_INFORMATIONS
                            ? SignUpResponse.INVALID_INPUT
                            : SignUpResponse.UNKNOWN_ERROR;

                    return h.response({ statusCode }).code(400);
                }

                request.cookieAuth.set({ uuid: id } as CookieContent);

                return { id, statusCode: 'SUCCESS' };
            },
            options: {
                validate: {
                    payload: Joi.object({
                        username: Joi.string()
                            .min(1)
                            .max(100)
                            .trim()
                            .required(),
                        email: Joi.string()
                            .email()
                            .trim()
                            .required(),
                        password: Joi.string().min(6),
                    }),
                },
                response: {
                    status: {
                        200: Joi.object({
                            id: Joi.string()
                                .uuid()
                                .required(),
                            statusCode: Joi.string().valid(
                                SignUpResponse.SUCCESS
                            ),
                        }),
                        400: Joi.object({
                            statusCode: Joi.string().valid(
                                ...Object.values(SignUpResponse).filter(
                                    response =>
                                        response !== SignUpResponse.SUCCESS
                                )
                            ),
                        }),
                    },
                },
                auth: {
                    mode: 'try',
                },
            },
        },
    ]);
}
