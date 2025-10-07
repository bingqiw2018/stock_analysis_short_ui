import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { UIModule } from '../../shared/ui/ui.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { Register2Component } from './register2/register2.component';
import { Recoverpwd2Component } from './recoverpwd2/recoverpwd2.component';
import { NgxLoadingModule } from 'ngx-loading';
import { AuthRoutingModule } from './auth-routing';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { PasswordChangeComponent } from './password-change/password-change.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/core/services/language.service';
@NgModule({
  declarations: [
    LoginComponent, 
    SignupComponent, 
    PasswordresetComponent, 
    PasswordChangeComponent,
    Register2Component, 
    Recoverpwd2Component
  ],
  imports: [
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AlertModule.forRoot(),
    UIModule,
    NgxLoadingModule,
    AuthRoutingModule,
    CarouselModule
  ],
  providers: [LanguageService]
})
export class AuthModule { }
