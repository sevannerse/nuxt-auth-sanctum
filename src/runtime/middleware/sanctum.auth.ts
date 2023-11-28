import {
    defineNuxtRouteMiddleware,
    navigateTo,
    useRuntimeConfig,
    createError,
} from '#app';
import { RouteLocationRaw } from 'vue-router';
import { useSanctumUser } from '../composables/useSanctumUser';
import { SanctumModuleOptions } from '~/src/types';

export default defineNuxtRouteMiddleware((to) => {
    const user = useSanctumUser();
    const options = useRuntimeConfig().public.sanctum as SanctumModuleOptions;

    const isAuthenticated = user.value !== null;

    const isVerified = user.value.email_verified_at !== null;

    if (isAuthenticated === true && isVerified === true) {
        return;
    }

    const determineEndpoint = (): string | false => {
        if (isAuthenticated === false) {
            return options.redirect.onAuthOnly;
        }

        if (isVerified === false) {
            return options.redirect.onVerifyOnly;
        }

        return false;
    }

    const endpoint = determineEndpoint();

    if (endpoint === false) {
        throw createError({ statusCode: 403 });
    }

    const redirect: RouteLocationRaw = { path: endpoint };

    if (options.redirect.keepRequestedRoute) {
        redirect.query = { redirect: to.fullPath };
    }

    return navigateTo(redirect, { replace: true });
});
