import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { RatioDownComponent } from './ratio-down/ratio-down.component';
import { AvgLineLevelComponent } from './avg-line-level/avg-line-level.component';
import { BullAlignmentComponent } from './bull-alignment/bull-alignment.component';
const routes: Routes = [
  {
     path:"ratio-down",
     component: RatioDownComponent
  },
  {
     path:"avg-line-level",
     component: AvgLineLevelComponent
  },
  {
     path:"bull-alignment",
     component: BullAlignmentComponent
  },
];

export const ShortRoutingModule = RouterModule.forChild(routes);
