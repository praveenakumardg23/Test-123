import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

    canActivate(
        route: ActivatedRouteSnapshot,
        router: RouterStateSnapshot
    ): boolean | Promise<boolean> | Observable<boolean> {
        return true;
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> | Observable<boolean> {
        const globals = JSON.parse(sessionStorage.getItem('globals'));
        if (state.url == '/login' && globals) {
            return false;
        } else if((state.url == '/dashboard' || state.url == '/dashboard/home') && !globals) {
            return false;
        } else {
            return true;
        }   
    }
}