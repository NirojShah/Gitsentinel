import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const isLoggedIn = localStorage.getItem('token');

    if (isLoggedIn?.length) {
        return true;
    }

    return router.createUrlTree(['/login']);
};


export default authGuard