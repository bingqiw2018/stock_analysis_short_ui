import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { User } from '../models/auth.models';
import { AuthenticationService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserProfileService<T> {
    constructor(private http: HttpClient, private authService: AuthenticationService) { 
    }
    getAll() {
        return this.http.get<User[]>(`/api/login`);
    }

    register(user: User) {
        return this.http.post(`/users/register`, user);
    }
    
    passwordChange<T>(url: string, httpParams: HttpParams): Observable<any>{
        const accessToken = this.authService.getAuthFromLocalStorage().accessToken;
        const httpHeaders = new HttpHeaders({
            Authorization: `JWT ${accessToken}`,
          });

        const options = { params: httpParams, headers:httpHeaders};

        return this.http.get<T>(url, options).pipe(
            map((response: any) => {
                return response;
            }),
            catchError(err => {
                console.error('FIND ITEMS', err);
                return of({ items: [], total: 0 });
            })
        );
    }
}
