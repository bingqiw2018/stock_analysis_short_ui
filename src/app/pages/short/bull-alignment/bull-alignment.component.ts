import {  Component,  OnInit,  ViewChild,  ChangeDetectorRef,  AfterViewInit, Output, EventEmitter, OnChanges,  SimpleChanges} from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { Router,ActivatedRoute } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { LayoutService } from "src/app/core/services/layout.service";
import { StockService } from "src/app/core/services/stock.service";
import { environment } from "../../../../environments/environment";
import * as moment from 'moment';

const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 
  'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray', 'whitesmoke'
  ];

@Component({
  selector: 'app-bull-alignment',
  templateUrl: './bull-alignment.component.html',
  styleUrls: ['./bull-alignment.component.css']
})
export class BullAlignmentComponent implements OnInit, AfterViewInit, OnChanges {
  public loading = false;
  pie_id_template:string = 'pie_id_template';
  pie_strong_id_template:string = 'pie_strong_id_template';
  pie_week_id_template:string = 'pie_week_id_template';
  config = {title:'强弱分布'}
  configStrong = {title:'多头趋势'}
  configWeek = {title:'弱势分布'}
  pageTitle = "多头趋势";
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>
  ) {
    
  }

  ngOnInit() {
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

    const trade_stocks_strong = [];
    const trade_stocks_map_strong: Map<string, any> = new Map();

    const trade_stocks_week = [];
    const trade_stocks_map_week: Map<string, any> = new Map();

    let stocks = event;
    stocks.forEach(item => {
      if(trade_stocks_map.has(item.basic_section_industry)){
        trade_stocks_map.get(item.basic_section_industry)['value'] += 1;
      }else{
        trade_stocks_map.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
        trade_stocks.push(trade_stocks_map.get(item.basic_section_industry));
      }

      if(item.bulling_week == 1){
        if(trade_stocks_map_strong.has(item.basic_section_industry)){
          trade_stocks_map_strong.get(item.basic_section_industry)['value'] += 1;
        }else{
          trade_stocks_map_strong.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
          trade_stocks_strong.push(trade_stocks_map_strong.get(item.basic_section_industry));
        }
      }else if(item.bulling_week == 0){
        if(trade_stocks_map_week.has(item.basic_section_industry)){
          trade_stocks_map_week.get(item.basic_section_industry)['value'] += 1;
        }else{
          trade_stocks_map_week.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
          trade_stocks_week.push(trade_stocks_map_week.get(item.basic_section_industry));
        }
      }

    });
    // this.tableCoverage = trade_stocks.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
    // this.tableCoverageStrong = trade_stocks_strong.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
    // this.tableCoverageWeek = trade_stocks_week.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
  }

  tableData = [];
  // tableCoverage = [];
  // tableCoverageStrong = [];
  // tableCoverageWeek = [];
  displayedColumns: string[] = [
    'name', 
    // 'code',
    'bull_alignment_day', 
    'bull_alignment_week',  
    'bull_alignment_month',
    'end', 
    'ratio', 
    'basic_section_industry',
    'basic_section_region',
    'bull_alignment_min_15', 
    'bull_alignment_min_60'
  ];
  
  isBullAlignment(source, type){
    let result = 'N/A';
    if(source == 0){
      result = type+"弱";
    }else if(source > 0){
      result = type + "强"+  (source<10?source.toString().padStart(2,'0'): source);
    }
    return result;
  }

  queryTable(): void {
    let url = environment.apiUrls.getBullAlignment;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    // httpParams = httpParams.set("action", "up_in");
    url = root + url;
    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.loading = false;
      const stocks = [];
      const trade_stocks = [];
      const trade_stocks_map: Map<string, any> = new Map();

      const trade_stocks_strong = [];
      const trade_stocks_map_strong: Map<string, any> = new Map();

      const trade_stocks_week = [];
      const trade_stocks_map_week: Map<string, any> = new Map();

      data.forEach((item)=>{
        if(item.ratio && item.ratio< 0){
          item.color = COLORS[5];
        }else if(item.ratio && item.ratio > 0){
          item.color = COLORS[1];
        }else{
          item.color = COLORS[15];
        }

        let stock_obj = {
          'code': item.code, 
          'name':item.name, 
          'end':item.end, 
          'ratio':item.ratio, 
          'bull_alignment_min_15':this.isBullAlignment(item.bulling_min_15, '15分'),
          'bull_alignment_min_60':this.isBullAlignment(item.bulling_min_60, '60分'),
          'bull_alignment_day':this.isBullAlignment(item.bulling_day, '日'),
          'bull_alignment_week':this.isBullAlignment(item.bulling_week, '周'),
          'bull_alignment_month':this.isBullAlignment(item.bulling_month, '月'),
          'basic_section_industry':item.basic_section_industry,
          'basic_section_region':item.basic_section_region,
          'color': item.color};

        stocks.push(stock_obj);
        
        if(trade_stocks_map.has(item.basic_section_industry)){
            trade_stocks_map.get(item.basic_section_industry)['value'] += 1;
        }else{
          trade_stocks_map.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
          trade_stocks.push(trade_stocks_map.get(item.basic_section_industry));
        }

        if(item.bulling_week == 1){
          if(trade_stocks_map_strong.has(item.basic_section_industry)){
            trade_stocks_map_strong.get(item.basic_section_industry)['value'] += 1;
          }else{
            trade_stocks_map_strong.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
            trade_stocks_strong.push(trade_stocks_map_strong.get(item.basic_section_industry));
          }
        }else if(item.bulling_week == 0){
          if(trade_stocks_map_week.has(item.basic_section_industry)){
            trade_stocks_map_week.get(item.basic_section_industry)['value'] += 1;
          }else{
            trade_stocks_map_week.set(item.basic_section_industry, {name:item.basic_section_industry, value: 1});
            trade_stocks_week.push(trade_stocks_map_week.get(item.basic_section_industry));
          }
        }
      });
      // Assign the data to the data source for the table to render
      // this.tableCoverage = trade_stocks.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
      // this.tableCoverageStrong = trade_stocks_strong.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
      // this.tableCoverageWeek = trade_stocks_week.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
      this.tableData = stocks;
      this.cdr.markForCheck();
    });
  }
}
