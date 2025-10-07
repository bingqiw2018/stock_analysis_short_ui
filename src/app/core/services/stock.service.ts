import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class StockService<T> {

  private _errorMessage = new BehaviorSubject<string>('');

  constructor(private http: HttpClient, private authService: AuthenticationService) { 
  }

  put<T>(url: string, httpParams: HttpParams): Observable<any> {
    const accessToken = this.authService.getAuthFromLocalStorage().accessToken;
    const httpHeaders = new HttpHeaders({
        Authorization: `JWT ${accessToken}`,
      });

    
    this._errorMessage.next('');

    const options = {headers:httpHeaders};
    return this.http.put<T>(url, httpParams, options).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(err => {
        console.error('FIND ITEMS', err);
        return of({ error: err.error });
      })
    );
  }

  post<T>(url: string, httpParams: any): Observable<any> {
    const accessToken = this.authService.getAuthFromLocalStorage() ? this.authService.getAuthFromLocalStorage().accessToken : null;

    let options = {};

    if(accessToken){
      const httpHeaders = new HttpHeaders({
        Authorization: `JWT ${accessToken}`,
      });
      options = {headers:httpHeaders};
    }

    this._errorMessage.next('');

    return this.http.post<T>(url, httpParams, options).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(err => {
        console.error('FIND ITEMS', err);
        return of({ error: err.error });
      })
    );
  }

  get<T>(url: string, httpParams: HttpParams): Observable<any> {
    const accessToken = this.authService.getAuthFromLocalStorage().accessToken;
    const httpHeaders = new HttpHeaders({
        Authorization: `JWT ${accessToken}`,
      });

    
    this._errorMessage.next('');

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

  set_live_show(live_show){
    localStorage.setItem('live_show', live_show);
  }

  get_live_show(){
    return localStorage.getItem('live_show');
  }
  
  parse_stock(stock_item){
    let stock = Object.assign({}, stock_item);
    let live_show = localStorage.getItem('live_show');
    if(live_show == 'true'){
      stock['code_title'] = 'XXX'+ stock['code'].substring(3);
      stock['name_title'] = stock['name'].substring(0,2)+'XX';
    }else{
      stock['code_title'] = stock['code'];
      stock['name_title'] = stock['name'];
    }
    return stock;
  }
}
