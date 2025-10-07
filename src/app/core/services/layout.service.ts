import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class LayoutService<T> {
  constructor() { 
  }

  isMobile():boolean{
    let width = window.innerWidth;
    return width < 520 ? true : false;
  }

  getGapHeight(gapValue):string{
    let height = (window.innerHeight - gapValue) + 'px';
    return height;
  }

  getGapWidth(gapValue):string{
    let width = (window.innerWidth - gapValue) + 'px';
    return width;
  }

  getHeight(value):string{
    let height = value + 'px';
    return height;
  }

  getWidth(value):string{
    let width = value + 'px';
    return width;
  }

  getPercentHeight(percent):string{
    let height = (window.innerHeight * percent/100) + 'px';
    return height;
  }

  getPercentWidth(percent):string{
    let width = (window.innerWidth * percent)/100 + 'px';
    return width;
  }

}
