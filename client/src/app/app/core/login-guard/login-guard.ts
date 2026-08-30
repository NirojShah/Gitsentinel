import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const loginGuard: CanActivateFn = () => {
    const router = inject(Router);
    const isLoggedIn = localStorage.getItem('token');

    if (isLoggedIn?.length) {
        return router.createUrlTree(['home']);
    }

    return true;
};
