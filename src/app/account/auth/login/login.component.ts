import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { LanguageService } from 'src/app/core/services/language.service';
import { TranslateService } from "@ngx-translate/core";
import { AuthenticationService } from '../../../core/services/auth.service';
// import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { CookieService } from "ngx-cookie-service";
import { Subscription, Observable } from 'rxjs';
import { UserModel } from '../../../../app/core/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: UntypedFormGroup;
  submitted:any = false;
  error:any = '';
  returnUrl: string;
  
  // set the currenr year
  year: number = new Date().getFullYear();

  private unsubscribe: Subscription[] = [];
  hasError: boolean;
  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: UntypedFormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    private authenticationService: AuthenticationService,
    public translate: TranslateService,
    public languageService: LanguageService,
    public _cookiesService: CookieService
    ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    // reset login status
    // this.authenticationService.logout();
    // get return url from route parameters or default to '/'
    // tslint:disable-next-line: no-string-literal
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    let lang = this._cookiesService.get("lang")
    this.languageService.setLanguage(lang);
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    this.error = '';
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      this.hasError = false;
      
      const loginSubscr = this.authenticationService
        .login(this.f.username.value, this.f.password.value)
        .pipe(first())
        .subscribe((user: UserModel) => {
          if (user) {
            this.router.navigate([this.  returnUrl]);
          } else {
            this.hasError = true;
            this.error = 'error';
          }
        });
      this.unsubscribe.push(loginSubscr);
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  
}
