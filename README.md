import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  private keycloak: Keycloak.KeycloakInstance;
  private lastActivityTime: number;

  constructor() {
    this.keycloak = Keycloak({
      url: 'KEYCLOAK_URL',
      realm: 'REALM_NAME',
      clientId: 'CLIENT_ID'
    });
    this.lastActivityTime = Date.now();
    this.init();
    this.setupActivityListener();
  }

  async init(): Promise<void> {
    await this.keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
    });
  }

  getToken(): string {
    return this.keycloak.token;
  }

  refreshToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.keycloak.updateToken(5) // Refresh token every 5 seconds
        .success(() => resolve(this.keycloak.token))
        .error(() => reject('Failed to refresh token'));
    });
  }

  isSessionExpiringSoon(): boolean {
    const sessionExpirationTime = this.keycloak.tokenParsed.exp * 1000;
    const sessionIdleThreshold = 30 * 60 * 1000; // 30 minutes in milliseconds
    const currentTime = Date.now();

    // Check if the user has been active within the last 20 minutes
    const isActiveUser = currentTime - this.lastActivityTime <= 20 * 60 * 1000;

    // If the user is active and the session is expiring soon, return false
    if (isActiveUser && sessionExpirationTime - currentTime <= sessionIdleThreshold) {
      return false;
    }

    // If the user is inactive and the session is expiring soon, return true
    return !isActiveUser && sessionExpirationTime - currentTime <= sessionIdleThreshold;
  }

  private setupActivityListener(): void {
    document.addEventListener('mousemove', () => {
      // Update the last activity time whenever there's mouse movement
      this.lastActivityTime = Date.now();
    });
    document.addEventListener('keydown', () => {
      // Update the last activity time whenever there's a key press
      this.lastActivityTime = Date.now();
    });
  }
}


================

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { KeycloakService } from './keycloak.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private keycloakService: KeycloakService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if the session idle time is less than or equal to 30 minutes
    if (this.keycloakService.isSessionExpiringSoon()) {
      // Refresh the token before proceeding with the HTTP request
      return this.keycloakService.refreshToken().pipe(
        mergeMap(() => {
          // Get the updated token and proceed with the HTTP request
          const token = this.keycloakService.getToken();
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(request);
        })
      );
    } else {
      // If session idle time is greater than 30 minutes, proceed with the HTTP request as usual
      const token = this.keycloakService.getToken();
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(request);
    }
  }
}
================
