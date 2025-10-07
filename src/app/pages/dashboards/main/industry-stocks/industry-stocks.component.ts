import { Component, OnInit, ViewChild, ChangeDetectorRef,AfterViewInit,OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { StockService } from 'src/app/core/services/stock.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import * as echarts from 'echarts';
import { environment } from "../../../../../environments/environment";

@Component({
  selector: 'app-industry-stocks',
  templateUrl: './industry-stocks.component.html',
  styleUrls: ['./industry-stocks.component.css']
})
export class IndustryStocksComponent implements OnInit, AfterViewInit, OnChanges {
  public isMobile: boolean;
  public classLeft:string;
  public classRight:string;

  constructor(private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>) { }

    ngOnChanges(changes: SimpleChanges): void {
      for (const propName in changes) {
        // if("time_type" == propName && this.stock_id){
        //   this.query();
        // }
      }
    }
    
    ngAfterViewInit(): void {
      
    }  
    
    ngOnInit() {
      let chart_dom = document.getElementById('table-industry-hot-top')!;
      chart_dom.style.height = this.layoutService.getHeight(550);
      chart_dom = document.getElementById('table-industry-up-top')!;
      chart_dom.style.height = this.layoutService.getHeight(550);
      this.query();

      this.isMobile = this.layoutService.isMobile();
      if(this.isMobile){
        this.classLeft = "col-xl-3";
        this.classRight = "col-xl-9";
      }else{
        this.classLeft = "col-xl-9";
        this.classRight = "col-xl-3";
      }
    }
  
    public loading = false;
    public industryStocks = [];
    public industryUpStocks = [];
    query():void{
      let url = environment.apiUrls.getIndustryStocks;
      const root = environment.apiRoot;
      let httpParams = new HttpParams();
      url = root + url ;
      this.loading = true;
      const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
        this.loading = false;
        // this.init_chart(data);
        this.parse_table_data(data);
        this.cdr.markForCheck();
      });
    }
    
    parse_table_data(data):void{
      let day_objs = [];
      // console.log(data);
      for(let i=0; i<data.length; i++){
        
        day_objs.push({
          title:data[i]['industry'], 
          total:data[i]['count'], 
          up_total:data[i]['up_status']['total'], 
          equal_total:data[i]['equal_status']['total'], 
          down_total:data[i]['down_status']['total']
        });
      }
      // console.log(day_objs);
      // let days = data['days'].sort((el1, el2)=> Date.parse(el2) - Date.parse(el1)  );
      this.industryStocks = day_objs.sort((el1, el2)=> el2['total'] - el1['total']  ).slice(0,10);
      this.industryUpStocks = day_objs.sort((el1, el2)=> el2['up_total'] - el1['up_total']  ).slice(0,10);
    }

    my_chart;
    init_chart(data):void {
      let chart_dom = document.getElementById('chart_stock_day_index')!;
      chart_dom.style.height = (window.innerHeight-275)+'px';
      chart_dom.style.width = '100%';
      if(this.my_chart == null){
        this.my_chart = echarts.init(chart_dom);
      }
      let category = ['股淘', '上证', '沪深300', '中证500', '科创50'];
      let formatter: string = "";
      for(let i=0; i<category.length; i++){
        formatter = formatter + "{a"+i+"}：{c"+i+"}  %<br/>";
      }
  
      let option = {
        title: {
          text: '股淘指数'
        },
        tooltip: {
          trigger: 'axis',
          // formatter: formatter,
          valueFormatter: (value) => value+" %"
        },
        legend: {
          data: category
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data['days']
        },
        yAxis: {
          axisLabel: { show: true , formatter: '{value} %'},
        },
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1, 2, 3, 4],
            start: 70,
            end: 100
          }
        ],
        series: [
          {
            name: '股淘',
            type: 'line',
            stack: 'Total',
            data: data['ai_index']
          },
          {
            name: '上证',
            type: 'line',
            stack: 'Total',
            data: data['sz_index']
          },
          {
            name: '沪深300',
            type: 'line',
            stack: 'Total',
            data: data['hs300']
          },
          {
            name: '中证500',
            type: 'line',
            stack: 'Total',
            data: data['zz500']
          },
          {
            name: '科创50',
            type: 'line',
            stack: 'Total',
            data: data['kc50']
          }
        ]
      };
      option && this.my_chart.setOption(option);
    }
}
