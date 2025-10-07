import {  Component,  OnInit,  ViewChild,  ChangeDetectorRef,  AfterViewInit,  OnChanges,  SimpleChanges} from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import {Router, ActivatedRoute } from "@angular/router";
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
  selector: 'app-observed-down',
  templateUrl: './observed-down.component.html',
  styleUrls: ['./observed-down.component.css']
})
export class ObservedDownComponent implements OnInit, AfterViewInit, OnChanges {
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

  tableData = [];
  tableCoverage = [];
  queryTable(): void {
    let url = environment.apiUrls.getKlineObservedEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("action", "down_in");

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
        stocks.push({'code': item.code, 'name':item.name, 'price':item.price, 'in_price':item.in_price,'add_price':item.add_price, 'ratio':item.ratio, 'basic_section_industry':item.basic_section_industry, 'basic_section_region':item.basic_section_region,'add_date':"关："+item.add_date, 'mod_date':"新："+item.mod_date, 'in_time':"入："+item.in_time, 'color': item.color});
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
  chartTrendTitle = {title:"下调标的", xAxisTitle: "买入时间"};
  queryTrend(): void {
    let url = environment.apiUrls.getKlineObservedEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("action", "down_trend");

    url = root + url;
    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      // this.loading = false;
      let chartData = [];
      data.forEach((el) => {
        chartData.push({date: el["in_time"], value: el["down_observed"]});
      });
      this.chartTrend = chartData;
      this.cdr.markForCheck();
    });
  }

}
