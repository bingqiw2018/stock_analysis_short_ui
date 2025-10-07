import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpParams } from "@angular/common/http";
import { environment } from '../../../../../environments/environment';
import { StockService } from 'src/app/core/services/stock.service';
import * as moment from 'moment';
import { Router } from "@angular/router";

const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 
  'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray', 'whitesmoke'
  ];

@Component({
  selector: 'app-ai-blocks',
  templateUrl: './ai-blocks.component.html',
  styleUrls: ['./ai-blocks.component.css']
})
export class AiBlocksComponent implements OnInit {

  public loadingNew = false;
  public loadingUp = false;
  public loadingDown = false;
  
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public httpService: StockService<any>) {

  }

  ngOnInit() {
    this.queryTableNew();
    this.queryTableUp();
    this.queryTableDown();
  }

  tableCoverageUp = [];
  tableDataUp = [];
  chartPieUp = "chart-pie-up";
  queryTableUp(): void {
    let url = environment.apiUrls.getKlineObservedEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("action", "up_in");

    url = root + url;
    this.loadingUp = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.loadingUp = false;
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
      this.tableCoverageUp = trade_stocks.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
      this.tableDataUp = stocks;
      this.cdr.markForCheck();
    });
  }

  isBullAlignment(source, type){
    let result = 'N/A';
    if(source == 0){
      result = type+"弱";
    }else if(source > 0){
      result = type+"强"+source;
    }
    return result;
  }

  toAvgLineLevel(source, time){
    let result = 'N/A';
    if(source && source.indexOf('Up_Level_')>-1){
      result = time+ '强' + source.replace('Up_Level_','');
    }else if(source && source.indexOf('Down_Level_')>-1){
      result = time+ '弱' + source.replace('Down_Level_','');
    }
    return result;
  }

  tableCoverageNew = [];
  tableDataNew = [];
  chartPieNew = "chart-pie-new";
  queryTableNew(): void {
    let url = environment.apiUrls.getKlineObservedEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("action", "init");
    
    url = root + url;
    this.loadingNew = true;
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
      this.tableCoverageNew = trade_stocks.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
      this.tableDataNew = stocks;
      this.loadingNew = false;
      this.cdr.markForCheck();
    });
  }

  tableCoverageDown = [];
  tableDataDown = [];
  chartPieDown = "chart-pie-down";
  queryTableDown(): void {
    let url = environment.apiUrls.getKlineObservedEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set("action", "down_in");

    url = root + url;
    this.loadingDown = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.loadingDown = false;
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
      this.tableCoverageDown = trade_stocks.sort((el1, el2) => el2['value'] - el1['value']).slice(0,10);
      this.tableDataDown = stocks;
      this.cdr.markForCheck();
    });
  }

  goto(event){
    if(event == 1){
      const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['/observed/new'], {queryParams:{}}));
      window.open(fullUrl, '_blank');
    }else if(event == 2){
      const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['/observed/up'], {queryParams:{}}));
      window.open(fullUrl, '_blank');
    }else if(event == 3){
      const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['/observed/down'], {queryParams:{}}));
      window.open(fullUrl, '_blank');
    }else if(event == 4){
      const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['/observed/cashflow'], {queryParams:{}}));
      window.open(fullUrl, '_blank');
    }else if(event == 5){
      const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['/observed/industry-hot'], {queryParams:{}}));
      window.open(fullUrl, '_blank');
    }else if(event == 6){
      const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['/short/ratio-down'], {queryParams:{}}));
      window.open(fullUrl, '_blank');
    }else if(event == 7){
      const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['/short/avg-line-level'], {queryParams:{}}));
      window.open(fullUrl, '_blank');
    }else if(event == 8){
      const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['/short/bull-alignment'], {queryParams:{}}));
      window.open(fullUrl, '_blank');
    }
    
  }
}
