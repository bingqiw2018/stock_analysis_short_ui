import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from 'src/app/core/services/language.service';
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie-service";
import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { first } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { UserProfileService } from '../../../core/services/user.service';
import { StockService } from "src/app/core/services/stock.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm: UntypedFormGroup;
  submitted:any = false;
  error:any = '';
  successmsg:any = false;

  // set the currenr year
  year: number = new Date().getFullYear();
  user: any;
  loading:any = false;

  // tslint:disable-next-line: max-line-length
  constructor(
    private formBuilder: UntypedFormBuilder, 
    private route: ActivatedRoute, 
    private router: Router, 
    public httpService: StockService<any>,
    private authService: AuthenticationService,
    public translate: TranslateService,
    public languageService: LanguageService,
    public _cookiesService: CookieService,
    private userService: UserProfileService<any>) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      // email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    let lang = this._cookiesService.get("lang")
    this.languageService.setLanguage(lang);
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;
    this.successmsg = false;
    // stop here if form is invalid
    if (this.f.username.errors || this.f.password.errors) {
      return;
    } else {
      let url = environment.apiUrls.userregister;
      const root = environment.apiRoot;
      // let httpParams = new HttpParams();
      // httpParams = httpParams.set("password", this.f.password.value);
      // httpParams = httpParams.set("username", this.f.username.value);
      let httpParams = {password:this.f.password.value, username: this.f.username.value };
      url = root + url;
      this.loading = true;
      this.httpService.post<any>(url, httpParams).subscribe((data) => {
        this.loading = false;
        if(data.error){
          this.error = data.error;
        }else{
          this.error = '';
          // this.router.navigate(['/']);
          this.successmsg = true;
        }
        
      });
      
    }
  }
}
