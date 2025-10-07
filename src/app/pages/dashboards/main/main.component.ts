import { Component, OnInit, ViewChild, ChangeDetectorRef,AfterViewInit,OnChanges, SimpleChanges } from '@angular/core';
import { visitorsOptions, popularPostData } from "./index.data";
import { earningLineChart, salesAnalyticsDonutChart, ChatData } from './observed.covered.data';
import { ChartType, ChatMessage } from './observed.covered.model';
import { ChartIndex } from "./index.model";
import { ChartObserved } from './observed.model';
import { ChartComponent } from "ng-apexcharts";
import { jobViewChart, ApplicationChart, ApprovedChart, RejectedChart, emailSentBarChart, vacancyData, receivedTimeChart, recentJobsData} from './observed.data';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { ConfigService } from '../../../core/services/config.service';
import { StockService } from 'src/app/core/services/stock.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import * as echarts from 'echarts';
import { environment } from "../../../../environments/environment";
type EChartsOption = echarts.EChartsOption;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, AfterViewInit, OnChanges {
  
  constructor(private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>) { }
  
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
    }
  }
  
  ngAfterViewInit(): void {
    
  }  
  
  ngOnInit() {
    // let chart_dom = document.getElementById('main-body')!;
    // chart_dom.style.height = this.layoutService.getGapHeight(120);
  }

  
}
