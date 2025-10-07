import { Component, OnInit, Inject, ChangeDetectorRef,AfterViewInit,OnChanges, SimpleChanges } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { LayoutService } from 'src/app/core/services/layout.service';
import { StockService } from 'src/app/core/services/stock.service';
import * as echarts from 'echarts';
import { environment } from "../../../../../environments/environment";
import { DOCUMENT } from "@angular/common";
import { LanguageService } from 'src/app/core/services/language.service';
import { TranslateService } from "@ngx-translate/core";
@Component({
  selector: 'app-ai-index',
  templateUrl: './ai-index.component.html',
  styleUrls: ['./ai-index.component.css']
})
export class AiIndexComponent implements OnInit, AfterViewInit, OnChanges {
  public isMobile: boolean;
  public classLeft:string;
  public classRight:string;
  
  constructor(private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: any,
    private layoutService: LayoutService<any>,
    public languageService: LanguageService,
    public translate: TranslateService,
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
      let dom = document.getElementById('chart_stock_day_index');
      dom.style.height = this.layoutService.getHeight(218);
      dom = document.getElementById('last_index_list');
      dom.style.height = this.layoutService.getHeight(236);
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
    public release = [];
    query():void{
      let url = environment.apiUrls.getStockDayIndex;
      const root = environment.apiRoot;
      let httpParams = new HttpParams();
      url = root + url ;
      this.loading = true;
      const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
        this.loading = false;
        this.init_chart(data);
        this.parse_ai_index(data);
        this.cdr.markForCheck();
      });
    }
    
    parse_ai_index(data):void{
      let day_objs = [];
      for(let i=0; i<data['days'].length; i++){
        day_objs.push({id:i, date:data['days'][i], ai_index:data['ai_index'][i], hs300:data['hs300'][i], kc50:data['kc50'][i]});
      }
      // console.log(day_objs);
      // let days = data['days'].sort((el1, el2)=> Date.parse(el2) - Date.parse(el1)  );
      this.release = day_objs.sort((el1, el2)=> el2['id'] - el1['id']  ).slice(0,10);
    }

    zoom_scope(data):number{
      let max_column_size = 10;
      let zs = 0;
      let data_len = data['ai_index'].length;
      if(data_len < max_column_size){
        zs = 0;
      }else{
        zs = Math.round(((data_len-max_column_size)/data_len)*100);
      }
      return zs;
    }

    my_chart;
    init_chart(data):void {
      let chart_dom = document.getElementById('chart_stock_day_index')!;
      if(this.my_chart == null){
        this.my_chart = echarts.init(chart_dom);
      }
      let category = ['股淘', '上证', '沪深300', '中证500', '科创50'];
      let formatter: string = "";
      for(let i=0; i<category.length; i++){
        formatter = formatter + "{a"+i+"}：{c"+i+"}  %<br/>";
      }
      let zoom_scope = this.zoom_scope(data);
      let option = {
        // title: {
        //   textStyle: {
        //     color: "#ffffff",
        //     fontSize: '18px',
        //     fontWeight: 400,
        //     fontFamily: 'Roboto, sans-serif',
        //     width: '200px'
        //   },
        //   text: '指数综合对比'
        // },
        
        // right: 10,
        tooltip: {
          trigger: 'axis',
          textStyle: {fontSize:12, fontWeight:'bold'},
          // formatter: formatter,
          valueFormatter: (value) => value.toFixed(2)+"  %",
          // position: function (pos, params, el, elRect, size) {
          //   let topNum = 20 + pos[1];
          //   const obj: Record<string, number> = {
          //     top: topNum,
          //     right: -150
          //   };
          //   return obj;
          // }
        },
        legend: {
          data: category,         
          width: '100%', 
          textStyle: {fontSize:10, fontWeight:'bold', color:'#ffffff'}
        },
        grid: {
          left: 5,
          right: 5,
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
          data: data['days'],
          axisLabel: { show: true , color: '#ffffff', fontSize:10}
        },
        yAxis: [{
          name:'沪深指数',
          nameTextStyle: {color: '#ffffff', fontSize:10},
          nameGap: 10,
          axisLabel: { show: true , color: '#ffffff', fontSize:10, formatter: '{value}  %'},
          axisLine: {show:true},
          interval: 5,
          position: 'right',
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              color: '#ffffff',
              width: 0.5,
            }
          },
        },{
          name:'股淘指数',
          nameTextStyle: {color: '#ffffff', fontSize:10},
          nameGap: 10,
          axisLabel: { show: true , color: '#6ba0e1', fontSize:10, formatter: '{value}  %'},
          axisLine: {show:true},
          interval: 500,
          position: 'left',
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              width: 0.5,
              color: '#6ba0e1'
            }
          },
        }],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1, 2, 3, 4],
            start: zoom_scope,
            end: 100
          }
        ],
        series: [
          {
            name: '股淘',
            type: 'line',
            yAxisIndex: 1,
            data: data['ai_index']
          },
          {
            name: '上证',
            type: 'line',
            data: data['sz_index']
          },
          {
            name: '沪深300',
            type: 'line',
            data: data['hs300']
          },
          {
            name: '中证500',
            type: 'line',
            data: data['zz500']
          },
          {
            name: '科创50',
            type: 'line',
            data: data['kc50']
          }
        ]
      };
      option && this.my_chart.setOption(option);
    }

}
