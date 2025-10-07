import {  Component,  OnInit,  ViewChild,  ChangeDetectorRef,  AfterViewInit,  OnChanges,  SimpleChanges} from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { Router,ActivatedRoute } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { LayoutService } from "src/app/core/services/layout.service";
import { StockService } from "src/app/core/services/stock.service";
import * as echarts from "echarts";
import { environment } from "../../../../environments/environment";
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import * as moment from 'moment';

const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 
  'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray', 'whitesmoke'
  ];
@Component({
  selector: 'app-observed-up',
  templateUrl: './observed-up.component.html',
  styleUrls: ['./observed-up.component.css']
})
export class ObservedUpComponent implements OnInit, AfterViewInit, OnChanges {
  public loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>
  ) {
    
  }

  ngOnInit() {
    this.queryTrend();  
    this.queryTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      // if("time_type" == propName && this.stock_id){
      //   this.query();
      // }
    }
  }

  ngAfterViewInit(): void {
    
  }
  
  // Table
  changeTableData(event):void {
    const trade_stocks = [];
    const trade_stocks_map: Map<string, any> = new Map();
    let stocks = event;
    stocks.forEach(item => {
      if(trade_stocks_map.has(item.basic_section_industry)){
        trade_stocks_map.get(item.basic_section_industry)['value'] += 1;
      }else{
        trade_stocks_map.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
        trade_stocks.push(trade_stocks_map.get(item.basic_section_industry));
      }
    });
    this.tableCoverage = trade_stocks.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
  }

  isBullAlignment(source, type){
    let result = 'N/A';
    if(source == 0){
      result = type+"弱";
    }else if(source > 0){
      result = type + "强"+  (source<10?source.toString().padStart(2,'0'): source);
    }
    return result;
  }

  toAvgLineLevel(source, time){
    let result = 'N/A';
    if(source && source.indexOf('Up_Level_')>-1){
      source = source.replace('Up_Level_','');
      source = (source<10?source.toString().padStart(2,'0'): source);
      result = time+ '强' + source;
    }else if(source && source.indexOf('Down_Level_')>-1){
      source = source.replace('Down_Level_','');
      source = (source<10?source.toString().padStart(2,'0'): source);
      result = time+ '弱' + source;
    }
    return result;
  }

  tableData = [];
  tableCoverage = [];

  displayedColumns = [
    'name', 
    'add_price', 
    'in_price', 
    'price', 
    'ratio', 
    'avg_line_level_day', 
    'bull_alignment_day', 
    'avg_line_level_week',  
    'bull_alignment_week',  
    'basic_section_industry', 
    'basic_section_region', 
    'in_time',  
    'add_date', 
    'mod_date'];

  queryTable(): void {
    let url = environment.apiUrls.getKlineObservedEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("action", "up_in");

    url = root + url;
    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.loading = false;
      const stocks = [];
      const trade_stocks = [];
      const trade_stocks_map: Map<string, any> = new Map();
      
      data.forEach((item)=>{
        item.add_date = moment(item.add_date).format('YYYY-MM-DD');
        item.mod_date = moment(item.mod_date).format('YYYY-MM-DD');
        item.in_time = moment(item.in_time).format('YYYY-MM-DD');
        if(item.ratio && item.ratio< 0){
          item.color = COLORS[5];
        }else if(item.ratio && item.ratio > 0){
          item.color = COLORS[1];
        }else{
          item.color = COLORS[15];
        }
        stocks.push({
          'code': item.code, 
          'name':item.name, 
          'price':item.price, 
          'in_price':item.in_price,
          'add_price':item.add_price, 
          'ratio':item.ratio, 
          'basic_section_industry':item.basic_section_industry, 
          'basic_section_region':item.basic_section_region,
          'add_date':"关："+item.add_date, 
          'mod_date':"新："+item.mod_date, 
          'in_time':"入："+item.in_time, 
          'avg_line_level_day':this.toAvgLineLevel(item.avg_line_level_day, '日'),
          'avg_line_level_week':this.toAvgLineLevel(item.avg_line_level_week, '周'),
          'bull_alignment_day':this.isBullAlignment(item.bulling_day, '日'),
          'bull_alignment_week':this.isBullAlignment(item.bulling_week, '周'),
          'color': item.color});
        if(trade_stocks_map.has(item.basic_section_industry)){
          trade_stocks_map.get(item.basic_section_industry)['value'] += 1;
        }else{
          trade_stocks_map.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
          trade_stocks.push(trade_stocks_map.get(item.basic_section_industry));
        }
      });
      // Assign the data to the data source for the table to render
      this.tableCoverage = trade_stocks.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
      this.tableData = stocks;
      this.cdr.markForCheck();
    });
  }

  chartTrend = [];
  chartTrendTitle = {title:"上涨标的", xAxisTitle: "买入时间"};
  queryTrend(): void {
    let url = environment.apiUrls.getKlineObservedEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("action", "up_trend");

    url = root + url;
    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      // this.loading = false;
      let chartData = [];
      data.forEach((el) => {
        chartData.push({date: el["in_time"], value: el["up_observed"]});
      });
      this.chartTrend = chartData;

      // this.init_chart(data);
      this.cdr.markForCheck();
    });
  }
}