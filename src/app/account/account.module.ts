import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { AuthModule } from './auth/auth.module';
import { NgxLoadingModule } from 'ngx-loading';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AccountRoutingModule,
    NgxLoadingModule,
    AuthModule
  ]
})
export class AccountModule { }
