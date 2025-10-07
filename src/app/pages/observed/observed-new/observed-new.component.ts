import {  Component,  OnInit,  ChangeDetectorRef,  AfterViewInit,  OnChanges,  SimpleChanges} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { LayoutService } from "src/app/core/services/layout.service";
import { StockService } from "src/app/core/services/stock.service";
import { environment } from "../../../../environments/environment";
import * as moment from 'moment';

@Component({
  selector: "app-observed-new",
  templateUrl: "./observed-new.component.html",
  styleUrls: ["./observed-new.component.css"],
})
export class ObservedNewComponent implements OnInit, AfterViewInit, OnChanges {
  public loading = false;
  public isMobile: boolean;
  public classLeft:string;
  public classRight:string;
  chartStyle = {};
  constructor(
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>
  ) {
  }

  ngOnInit() {
    this.queryTrend();  
    this.queryTable();

    this.isMobile = this.layoutService.isMobile();
    if(this.isMobile){
      this.classLeft = "col-xl-3";
      this.classRight = "col-xl-9";
    }else{
      this.classLeft = "col-xl-9";
      this.classRight = "col-xl-3";
    }
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
    httpParams = httpParams.set("action", "init");
    
    url = root + url;
    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      
      const stocks = [];
      const trade_stocks = [];
      const trade_stocks_map: Map<string, any> = new Map();
      
      data.forEach((item)=>{
        item.add_date = moment(item.add_date).format('YYYY-MM-DD');
        item.mod_date = moment(item.mod_date).format('YYYY-MM-DD');
        
        if(item.ratio && item.ratio< 0){
          item.color = environment.color[5];
        }else if(item.ratio && item.ratio > 0){
          item.color = environment.color[1];
        }else{
          item.color = environment.color[15];
        }
        
        stocks.push({'code': item.code, 'name':item.name, 'price':item.price, 'add_price':item.add_price,'ratio':item.ratio, 'basic_section_industry':item.basic_section_industry, 'basic_section_region':item.basic_section_region, 'add_date':"关："+item.add_date, 'mod_date':"新："+item.mod_date, 'color': item.color});
        
        if(trade_stocks_map.has(item.basic_section_industry)){
          trade_stocks_map.get(item.basic_section_industry)['value'] += 1;
        }else{
          trade_stocks_map.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
          trade_stocks.push(trade_stocks_map.get(item.basic_section_industry));
        }
      });
      this.tableCoverage = trade_stocks.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
      this.tableData = stocks;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  chartTrend = [];
  chartTrendTitle = {title:"加入关注", xAxisTitle: "关注时间"};
  queryTrend(): void {
    let url = environment.apiUrls.getKlineObservedEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("action", "trend");

    url = root + url;
    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      // this.loading = false;
      let chartData = [];
      data.forEach((el) => {
        chartData.push({date: el["add_date"], value: el["new_observed"]});
      });
      this.chartTrend = chartData;
      this.cdr.markForCheck();
    });
  }
}
