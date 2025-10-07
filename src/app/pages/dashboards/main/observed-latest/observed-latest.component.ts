import { Component, OnInit, ViewChild, ChangeDetectorRef,AfterViewInit,OnChanges, SimpleChanges } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { LayoutService } from 'src/app/core/services/layout.service';
import { StockService } from 'src/app/core/services/stock.service';
import * as echarts from 'echarts';
import * as moment from 'moment';
import { environment } from "../../../../../environments/environment";

@Component({
  selector: 'app-observed-latest',
  templateUrl: './observed-latest.component.html',
  styleUrls: ['./observed-latest.component.css']
})
export class ObservedLatestComponent implements OnInit, AfterViewInit, OnChanges {
  public isMobile: boolean;
  public classLeft:string;
  public classRight:string;
  constructor(private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public layoutService: LayoutService<any>,
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
      let chart_dom = document.getElementById('chart_observed_last')!;
      chart_dom.style.height = this.layoutService.getHeight(260);
      // chart_dom.style.width = this.layoutService.getGapWidth(1100);
      
      chart_dom = document.getElementById('chart_observed_last_coverage')!;
      chart_dom.style.height = this.layoutService.getHeight(260);
      // chart_dom.style.width = this.layoutService.getGapWidth(600);
      
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
    query():void{
      let url = environment.apiUrls.getKlineObservedEvent;
      const root = environment.apiRoot;
      let httpParams = new HttpParams();
      httpParams = httpParams.set('action', 'trend');

      url = root + url ;
      this.loading = true;
      const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
        this.loading = false;
        this.init_chart(data);
        this.init_chart_coverage(data);
        this.cdr.markForCheck();
      });
    }
    
    my_chart_coverage;
    public release_coverage = [];
    init_chart_coverage(data):void{
      let new_observed = 0;
      let in_observed = 0;
      
      for(let i=0; i<data.length; i++){
        new_observed += data[i]['new_observed'];
        in_observed += data[i]['in_observed'];
      }

      this.release_coverage = [new_observed, in_observed];

      let chart_dom = document.getElementById('chart_observed_last_coverage')!;
      
      if(this.my_chart_coverage == null){
        this.my_chart_coverage = echarts.init(chart_dom);
      }
      let category = ['初始关注', '已买入', '以出局'];
      let formatter: string = "";
      for(let i=0; i<category.length; i++){
        formatter = formatter + "{a"+i+"}：{c"+i+"}  %<br/>";
      }
  
      let option = {
        // title: {
        //   textStyle: {
        //     color: "#ffffff",
        //     fontSize: '16px',
        //     // fontWeight: 'bold',
        //     fontFamily: 'Roboto, sans-serif'
        //   },
        //   text: '标的比例'
        // },
        tooltip: {
          trigger: 'item'
        },    
        legend: {          
          left: 'center',
          textStyle: {color:'#ffffff', fontSize:12}
        },        
        series: [
          {
            top: '15',
            bottom: '-20',
            // name: 'Access From',
            type: 'pie',
            radius: ['30%', '70%'],
            // avoidLabelOverlap: false,
            // itemStyle: {
            //   borderRadius: 1,
            //   borderColor: '#fff',
            //   borderWidth: 1
            // },
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              color: '#ffffff',
              // position: 'outter',
              formatter(param) {
                // correct the percentage
                // return param.name +':'+ param.value ;
                return param.value ;
              }
            },
            // emphasis: {
            //   label: {
            //     show: true,
            //     fontSize: 16,
            //     fontWeight: 'bold'
            //   }
            // },
            labelLine: {
              show: true
            },
            data: [
              { value: this.release_coverage[0], name: '初始关注' },
              { value: this.release_coverage[1], name: '已买入' }
            ]
          }
        ]
      };

      option && this.my_chart_coverage.setOption(option);
    }

    my_chart;
    init_chart(data):void {
      let days = [];
      let new_observed = [];
      let in_observed = [];
      let avgValue = 0;
      data.forEach(el => {
        days.push(el['add_date']);
        new_observed.push(el['new_observed']);
        in_observed.push(el['in_observed']);
        let avgValue1 = (avgValue + el["new_observed"])/2;
        let avgValue2 = (avgValue + el["in_observed"])/2;
        avgValue = avgValue1 > avgValue2 ? avgValue1 : avgValue2;
      });
      let chart_dom = document.getElementById('chart_observed_last')!;
      // chart_dom.style.height = this.layoutService.getGapHeight(845);
      // chart_dom.style.width = this.layoutService.getGapWidth(575);
      if(this.my_chart == null){
        this.my_chart = echarts.init(chart_dom);
      }
      let category = ['初始关注', '已买入'];
      let formatter: string = "";
      for(let i=0; i<category.length; i++){
        formatter = formatter + "{a"+i+"}：{c"+i+"}  %<br/>";
      }
      
      let zoomStart = 0;
      let zoomLimit = 10;
      if (days.length<zoomLimit){
        let gapLen = zoomLimit - days.length;
        let startDay = days[0];
        for(let i=0; i<gapLen; i++){
          days.unshift(moment(startDay).subtract(i+1, 'days').format('YYYY-MM-DD'));
          new_observed.unshift(0);
          in_observed.unshift(0);
        }
      }
      
      if(days.length>zoomLimit){
        days = days.slice(days.length - 10, days.length);
        new_observed = new_observed.slice(new_observed.length - 10, new_observed.length);
        in_observed = in_observed.slice(in_observed.length - 10, in_observed.length);
        zoomStart = 30;
      }

      let intervals = Math.round(avgValue / 5);

      let option = {
        // title: {
        //   textStyle: {
        //     color: "#ffffff",
        //     fontSize: '16px',
        //     fontWeight: 400,
        //     fontFamily: 'Roboto, sans-serif'
        //   },
        //   text: '标的趋势'
        // },
        tooltip: {
          trigger: 'item',
          // axisPointer: {
          //   type: 'cross',
          //   crossStyle: {
          //     color: '#999'
          //   }
          // },
          textStyle: {fontSize:12, fontWeight:'bold'},
          // position: function (pos, params, el, elRect, size) {
          //   let topNum = 20 + pos[1];
          //   const obj: Record<string, number> = {
          //     top: topNum,
          //     right: -100
          //   };
          //   return obj;
          // }
        },
        legend: {
          data: category,
          textStyle: {fontSize:12, fontWeight:'bold', color:'#ffffff'}
        },
        xAxis: [
          {
            type: 'category',
            data: days,
            axisPointer: {
              type: 'shadow'
            },
            axisLabel: { show: true , color: '#ffffff', fontSize:10}
          }
        ],
        yAxis: [
          {
            type: 'value',
            // name: 'Precipitation',
            // min: 0,
            // max: 250,
            // interval: 50,
            nameTextStyle: {
              fontSize: 10,
              color:'#ffffff',
              fontWeight: 'bolder'
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#ffffff',
                fontSize: 10
              }
            },
            axisLabel: {
              show: true,
              fontSize: 10
            },
            min: 0,
            max: Math.round(avgValue),
            interval: intervals,
            position: "right",
            splitLine: {
              lineStyle: {
                color: '#ffffff',
                width: 0.5,
              }
            },
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1, 2],
            start: zoomStart,
            end: 100
          }
        ],
        grid: {
          left: 5,
          right: 5,
          bottom: '3%',
        },
        series: [
          {
            name: '初始关注',
            type: 'bar',
            label: {show: true, fontSize:'12px'},
            tooltip: {
              valueFormatter: function (value) {
                return (value as number) + '';
              }
            },
            data: new_observed
          },
          {
            name: '已买入',
            type: 'bar',
            label: {show: true, fontSize:'12px'},
            tooltip: {
              valueFormatter: function (value) {
                return (value as number) + '';
              }
            },
            data: in_observed
          }
        ]
      };

      option && this.my_chart.setOption(option);
    }
}
