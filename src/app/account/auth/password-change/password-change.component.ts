import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from 'src/app/core/services/language.service';
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie-service";
import { HttpParams } from "@angular/common/http";
import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { StockService } from "src/app/core/services/stock.service";
@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css']
})
export class PasswordChangeComponent implements OnInit, AfterViewInit {

  resetForm: UntypedFormGroup;
  submitted:any = false;
  error:any = '';
  success:any = '';
  loading:any = false;

  // set the currenr year
  year: number = new Date().getFullYear();
  user: any;

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: UntypedFormBuilder, 
    private authService: AuthenticationService,
    private route: ActivatedRoute, 
    private router: Router, 
    public httpService: StockService<any>,
    public translate: TranslateService,
    public languageService: LanguageService,
    public _cookiesService: CookieService) { }

  ngOnInit() {

    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required]],
    });

    let lang = this._cookiesService.get("lang")
    this.languageService.setLanguage(lang);
    this.user = this.authService.getAuthFromLocalStorage().user;
  }

  ngAfterViewInit() {
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;
    if (this.f.password.errors) {
      return;
    }

    let url = environment.apiUrls.authCheck;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("password", this.f.password.value);
    httpParams = httpParams.set("username", this.user.username);

    url = root + url;
    this.loading = true;
    this.httpService.put<any>(url, httpParams).subscribe((data) => {
      this.loading = false;
      if(data.error){
        this.error = data.error;
        this.success = '';
      }else{
        this.error = '';
        this.success = data.message;
        // this.router.navigate(['/']);
      }
      
    });
  }

}