import {
    defineNuxtModule,
    addPlugin,
    createResolver,
    addImportsDir,
    addRouteMiddleware,
} from '@nuxt/kit';
import { defu } from 'defu';
import { SanctumModuleOptions } from './types';

export default defineNuxtModule<SanctumModuleOptions>({
    meta: {
        name: 'nuxt-auth-sanctum',
        configKey: 'sanctum',
        compatibility: {
            nuxt: '^3.0.0',
        },
    },

    defaults: {
        baseUrl: 'http://localhost:80',
        origin: 'http://localhost:3000',
        userStateKey: 'sanctum.user.identity',
        endpoints: {
            csrf: '/sanctum/csrf-cookie',
            login: '/login',
            logout: '/logout',
            user: '/api/user',
        },
        csrf: {
            cookie: 'XSRF-TOKEN',
            header: 'X-XSRF-TOKEN',
        },
        client: {
            retry: false,
        },
        redirect: {
            keepRequestedRoute: false,
            onLogin: '/',
            onLogout: '/',
            onAuthOnly: '/login',
            onVerifyOnly: '/verify',
            onGuestOnly: '/',
        },
    },

    setup(options, nuxt) {
        const resolver = createResolver(import.meta.url);

        const publicConfig = nuxt.options.runtimeConfig.public;
        const userModuleConfig = publicConfig.sanctum;

        nuxt.options.runtimeConfig.public.sanctum = defu(
            userModuleConfig,
            options
        );

        addImportsDir(resolver.resolve('./runtime/composables'));

        addRouteMiddleware({
            name: 'sanctum:auth',
            path: resolver.resolve('./runtime/middleware/sanctum.auth'),
        });
        addRouteMiddleware({
            name: 'sanctum:guest',
            path: resolver.resolve('./runtime/middleware/sanctum.guest'),
        });

        addPlugin(resolver.resolve('./runtime/plugin'));
    },
});
