import { Injectable } from '@angular/core';

import { getFirebaseBackend } from '../../authUtils';

import { User } from '../models/auth.models';
import { Router } from '@angular/router';
import { AuthHTTPService } from './auth-http';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {

    user: User;

    // public fields
    private unsubscribe: Subscription[] = [];
    private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

    currentUser$: Observable<UserModel>;
    isLoading$: Observable<boolean>;
    currentUserSubject: BehaviorSubject<UserModel>;
    isLoadingSubject: BehaviorSubject<boolean>;

    constructor(private router: Router, private authHttpService: AuthHTTPService) {
        // console.log("Logger Auth ","Init auth service");
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
        this.currentUserSubject = new BehaviorSubject<UserModel>(undefined);
        // this.currentUserSubject = new BehaviorSubject<UserModel>({fullname:"Bingqi Wang"});
        this.currentUser$ = this.currentUserSubject.asObservable();
        this.isLoading$ = this.isLoadingSubject.asObservable();
        const subscr = this.getUserByToken().subscribe();
        this.unsubscribe.push(subscr);
    }

    getUserByToken(): Observable<UserModel> {
        const auth = this.getAuthFromLocalStorage();
        if (!auth || !auth.accessToken) {
          this.logout();
          return of(undefined);
        }
        this.isLoadingSubject.next(true);
        return this.authHttpService.getUserByToken(auth.accessToken).pipe(
          map((user: UserModel) => {
            if (user) {
              this.currentUserSubject = new BehaviorSubject<UserModel>(user);
            } else {
              this.logout();
            }
            return user;
          }), catchError(err => {
            if( err.status === 401 ){
              this.logout();
            }
            return of(undefined);
          }),
          finalize(() => this.isLoadingSubject.next(false))
        );
        return of();
    }

    getAuthFromLocalStorage(): AuthModel {
        try {
          const authData = JSON.parse(
            localStorage.getItem(this.authLocalStorageToken)
          );
          return authData;
        } catch (error) {
          console.error(error);
          return undefined;
        }
    }

    private setAuthFromLocalStorage(auth: AuthModel): boolean {
        // store auth accessToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
        if (auth && auth.accessToken) {
          // console.log('Access Token:' + JSON.stringify(auth));
          localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
          return true;
        }
        return false;
    }

    /**
     * Returns the current user
     */
    public currentUser(): User {
        return getFirebaseBackend().getAuthenticatedUser();
    }

    // /**
    //  * Performs the auth
    //  * @param email email of user
    //  * @param password password of user
    //  */
    // login(email: string, password: string) {
    //     return getFirebaseBackend().loginUser(email, password).then((response: any) => {
    //         const user = response;
    //         return user;
    //     });
    // }

    login(username: string, password: string): Observable<UserModel> {
        this.isLoadingSubject.next(true);
        return this.authHttpService.login(username, password).pipe(
          map((auth: AuthModel) => {
            const result = this.setAuthFromLocalStorage(auth);
            return result;
          }),
          switchMap(() => this.getUserByToken()),
          catchError((err) => {
            console.error('err', err);
            return of(undefined);
          }),
          finalize(() => this.isLoadingSubject.next(false))
        );
    }
    /**
     * Performs the register
     * @param email email
     * @param password password
     */
    register(email: string, password: string) {
        return getFirebaseBackend().registerUser(email, password).then((response: any) => {
            const user = response;
            return user;
        });
    }

    /**
     * Reset password
     * @param email email
     */
    resetPassword(email: string) {
        return getFirebaseBackend().forgetPassword(email).then((response: any) => {
            const message = response.data;
            return message;
        });
    }

    /**
     * Logout the user
     */
    logout() {
        // logout the user
        localStorage.removeItem(this.authLocalStorageToken);
        this.router.navigate(['/account/auth/login'], {
          queryParams: {},
        });
    }
}

