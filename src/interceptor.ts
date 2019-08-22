import { NgModule, Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClientModule, HttpHeaders, HttpClient, HTTP_INTERCEPTORS, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http'

import { HttpClientModule, HttpHeaders, HttpClient, HTTP_INTERCEPTORS, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http'
import { Observable, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';

const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  constructor(@Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeoutValue = Number(req.headers.get('timeout')) || this.defaultTimeout;
    return next.handle(req).pipe(timeout(timeoutValue));
  }
}


providers: [
    [{ provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: 30000 }]
  ],
  
Service:
---------

  getData(): Observable<any> {
    return this.httpClient.get('assets/data.json', { headers: new HttpHeaders({ timeout: `{300000}` }) });
  }
