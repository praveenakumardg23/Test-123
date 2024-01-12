import { AuthService } from './../auth/auth.service';
import { TabHeaderService } from './../services/tab-header/tab-header.service';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { finalize } from "rxjs/operators";
import { SharedService } from '../services/shared/shared.service';
import { AppConfiguration } from '../app-configuration';

@Injectable()
export class Interceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private storage: Storage,
        private tabHeaderService: TabHeaderService,
        private authService: AuthService,
        private sharedService: SharedService, 
        private appConfiguration: AppConfiguration) {
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token;
        let globals: any = JSON.parse(sessionStorage.getItem('globals'));

        if (globals != null) {
            token = globals.ApiKey;
        } else {
            token = this.appConfiguration.tokenValue;
        }
        
        if(request.body){
            let requestString = JSON.stringify(request.body);
            if(requestString[0] == '"'){
              requestString = requestString.slice(1, -2)
            } else {
              requestString = requestString.slice(0, -1)
            }
            let req = requestString.replace(/[\\]/g,'' )
                       +', "DeviceDetails":'+ JSON.stringify(this.getDeviceDetails()) + '}';
      
          request = request.clone({ body: JSON.parse(req)});
      
          } else {
            let req = '{"DeviceDetails":'+ JSON.stringify(this.getDeviceDetails())+'}';
            request = request.clone({ body:  JSON.parse(req)});
          }
          
        const domainName = request.url;
        if (domainName.slice(0, 26) == 'https://www.billandpay.com') {
            if (!request.headers.has('Content-Type')) {
                request = request.clone({ headers: request.headers.set('Content-Type', 'application/x-www-form-urlencoded') });
            }

            request = request.clone({ headers: request.headers.set('Accept', 'application/x-www-form-urlencoded') });
        } else {

            if (token) {
                request = request.clone({ headers: request.headers.set('Authorization', 'TOKEN ' + token) });
            }

            if (!request.headers.has('Content-Type')) {
                request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
            }

            request = request.clone({ headers: request.headers.set('Accept', 'application/json') });
        }

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                }
                finalize(() => this.sharedService.loading.next(false));
                return event;

            }),
            catchError((error: HttpErrorResponse) => {
                finalize(() => this.sharedService.loading.next(false))
                if (error.status === 401) {
                    this.authService.logout('401')
                }
                return throwError(error);
            }));
    }

    getDeviceDetails(){
        const userAgent = navigator.userAgent;

        const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent.toLowerCase());
        return {
        'Device': isTablet? 'Tablet': 'Mobile',
        'Browser': '',
        'OS': userAgent.split(";")[1],
        'AppVersion': '2022.06.27',
        'BuildVersion': 'PSCM3',
        }
  }
}
