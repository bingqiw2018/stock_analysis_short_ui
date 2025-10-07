import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObservedDownComponent } from './observed-down/observed-down.component'; 
import { CashFlowComponent } from './cash-flow/cash-flow.component';
import { ObservedNewComponent } from './observed-new/observed-new.component';
import { ObservedDetailComponent } from './observed-detail/observed-detail.component';
import { ObservedUpComponent } from './observed-up/observed-up.component';
import { IndustryHotComponent } from './industry-hot/industry-hot.component';

const routes: Routes = [
  {
   path:"new",
   component: ObservedNewComponent
  },
  {
   path:"up",
   component: ObservedUpComponent
  },
  {
   path:"down",
   component: ObservedDownComponent
  },
  {
    path:"cashflow",
    component: CashFlowComponent
  },
  {
   path:"detail",
   component: ObservedDetailComponent
  },
  {
   path:"industry-hot",
   component: IndustryHotComponent
  }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class JobsRoutingModule {}

export const ObservedRoutingModule = RouterModule.forChild(routes);
