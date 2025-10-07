import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UIModule } from '../../shared/ui/ui.module';
import { WidgetModule } from '../../shared/widget/widget.module';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxSliderModule } from 'ngx-slider-v2';
// import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { SimplebarAngularModule } from 'simplebar-angular';

// dropzone
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { VisualizationModule } from '../visualization/Visualization.module';
import { ChipsComponent } from '../dashboards/main/chips/chips.component';
import { ObservedDownComponent } from './observed-down/observed-down.component'; 
import { ObservedNewComponent } from './observed-new/observed-new.component';
import { ObservedDetailComponent } from './observed-detail/observed-detail.component';
import { ObservedUpComponent } from './observed-up/observed-up.component';
import { CashFlowComponent } from './cash-flow/cash-flow.component';
import { ObservedChartComponent } from './observed-detail/observed-chart/observed-chart.component';
import { ObservedRoutingModule } from './observed-routing.module';
import { IndustryHotComponent } from './industry-hot/industry-hot.component';
import { ChartStackedBarComponent } from '../visualization/chart-stacked-bar/chart-stacked-bar.component';
import { ShortFeatureChartComponent } from './observed-detail/short-feature-chart/short-feature-chart.component';
import { NgxLoadingModule } from 'ngx-loading';

import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {  MatRippleModule,  MatNativeDateModule,  MAT_DATE_LOCALE, MAT_DATE_FORMATS} from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTreeModule } from '@angular/material/tree';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { Global } from './global';
@NgModule({
  imports: [
    CommonModule,
    NgxImageZoomModule,
    NgApexchartsModule,
    ModalModule,
    PaginationModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    FormsModule,
    BsDropdownModule.forRoot(),
    NgxDropzoneModule,
    ReactiveFormsModule,
    UIModule,
    WidgetModule,
    NgxSliderModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    SimplebarAngularModule,
    NgxLoadingModule,
    VisualizationModule,
    ObservedRoutingModule,
    
    // Material Modules
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatListModule,
    MatSliderModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTabsModule,
    MatTooltipModule,
    MatSidenavModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatGridListModule,
    MatToolbarModule,
    MatBottomSheetModule,
    MatExpansionModule,
    MatDividerModule,
    MatSortModule,
    MatStepperModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDialogModule,
    MatRippleModule,
    MatRadioModule,
    MatTreeModule,
    MatButtonToggleModule
  ],
  declarations: [
    ChipsComponent,
    ObservedChartComponent,
    ObservedDownComponent, 
    ObservedNewComponent, 
    ObservedDetailComponent, 
    CashFlowComponent,
    IndustryHotComponent,
    ObservedUpComponent,
    ChartStackedBarComponent,
    ShortFeatureChartComponent
   ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'zh-CN'},
    {provide: MAT_DATE_FORMATS, useValue: Global.DATE_FORMAT},
  ]
})
export class ObservedModule { }
