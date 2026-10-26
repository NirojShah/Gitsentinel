import { Routes } from '@angular/router';
import { SignupComponent } from './app/page/signup/signup';
import { LoginComponent } from './app/page/login/login';
import authGuardRedirection from './app/core/auth-guard/auth-guard';

import { loginGuard } from './app/core/login-guard/login-guard';
import { HomeComponent } from './app/page/home/home';
import { AiConfiguration } from './app/component/ai-configuration/ai-configuration';
import { Profile } from './app/component/profile/profile';
import { NotFoundComponent } from './app/page/not-found/not-found';

export const routes: Routes = [
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard]
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuardRedirection]
    },
    {
        path: 'profile',
        component: Profile,
        canActivate: [authGuardRedirection]
    },
    {
        path: 'ai-configuration',
        component: AiConfiguration,
        canActivate: [authGuardRedirection]
    },
    {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
