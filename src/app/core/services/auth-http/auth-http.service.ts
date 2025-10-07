import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../../environments/environment';
import { AuthModel } from '../../models/auth.model';

const API_USERS_URL = "${environment.apiUrl}/users";

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) { }

  // public methods
  login(username: string, password: string): Observable<any> {
    const url = environment.apiRoot + environment.apiUrls.userLogin;
    return this.http.post(url, { username, password })
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(API_USERS_URL, user);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_USERS_URL}/forgot-password`, {
      email,
    });
  }

  getUserByToken(token: string): Observable<UserModel> {
    const url = environment.apiRoot + environment.apiUrls.authCheck;
    const httpHeaders = new HttpHeaders({
      Authorization: `JWT ${token}`,
    });
    // console.log('Get user by token:' + token);
    return this.http.get<UserModel>(url, {
      headers: httpHeaders,
    });
  }
}
