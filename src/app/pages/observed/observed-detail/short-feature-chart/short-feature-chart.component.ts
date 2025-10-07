import { EventEmitter, Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { LayoutService } from "src/app/core/services/layout.service";
import { StockService } from "src/app/core/services/stock.service";
import { environment } from "../../../../../environments/environment";
import * as moment from 'moment';
import * as echarts from 'echarts';
import { right } from '@popperjs/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCardModule} from '@angular/material/card';
import {MatNativeDateModule} from '@angular/material/core';
type EChartsOption = echarts.EChartsOption;
const downColor = '#00da3c';
const upColor = '#ec0000';
const macdColor = '#f6bd00';
const signalColor = '#2e88c4';
const rsi1Color = '#2e88c4';
const rsi2Color = '#f6b400';
const rsi3Color = '#cd00f6';
const kColor = '#2e88c4';
const dColor = '#f6b400';
const jColor = '#cd00f6';

@Component({
  selector: 'app-short-feature-chart',
  templateUrl: './short-feature-chart.component.html',
  styleUrls: ['./short-feature-chart.component.css']
})
export class ShortFeatureChartComponent implements OnInit,AfterViewInit,OnChanges{
  @ViewChild("chart2", { static: false }) chart: ChartComponent;
  my_chart;
  @Output() loading = new EventEmitter<any>();
  @Output() filterEvent = new EventEmitter<any>();
  @Input() time_type: string;
  stock_id:string = null;
  curHeight:string;
  curRightSideHeight:string;
  pointSelectorData = [];
  allPointList = [];

  selected: Date | null;
  constructor(private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>) { }

  ngOnInit() {
    this.curHeight ='500px';
    this.curRightSideHeight ='460px';
    
    this.route.queryParams.subscribe((res)=>{
      if(res.stock_id){
        this.stock_id = res.stock_id;   
        this.queryStockRatio10();
        this.queryStockAvgLineLevel();
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {      
      if("time_type" == propName && this.stock_id){
        this.queryStockRatio10();
        this.queryStockAvgLineLevel();
      }
    }
  }

  ngAfterViewInit(): void {
    
  }

  selectedDate:string;

  onDateSelected(event){
    let date = moment(event).format('YYYY-MM-DD');
    this.selectedDate = date;
    this.queryStockRatio10();
  }

  avg_line_level;
  queryStockAvgLineLevel(){
    let url = environment.apiUrls.getStockAvgLineLevel;
    url = url.replace('{stock_code}',this.stock_id);
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    if(!this.time_type) {
      httpParams = httpParams.set("time_type", 'days');
    }else{
      httpParams = httpParams.set("time_type", this.time_type);
    }
    url = root + url;

    this.loading.emit(true);
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.loading.emit(false);
      this.avg_line_level = this.toAvgLineLevel(data.avg_line_level);
      this.filterEvent.emit(this.avg_line_level);
      this.cdr.markForCheck(); 
    });
  }

  toAvgLineLevel(source){
    let result = 'N/A';
    if(source && source.indexOf('Up_Level')>-1){
      result = source.replace('Up_Level','强势');
    }else if(source && source.indexOf('Down_Level')>-1){
      result = source.replace('Down_Level','弱势');
    }
    return result;
  }

  currentValue;
  curMedia;
  curAvg;
  queryStockRatio10(){
    let url = environment.apiUrls.getStockRadio10;
    url = url.replace('{stock_code}',this.stock_id);
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    if(!this.time_type) {
      httpParams = httpParams.set("time_type", 'days');
    }else{
      httpParams = httpParams.set("time_type", this.time_type);
    }

    if(this.selectedDate){
      httpParams = httpParams.set("end_date", this.selectedDate);
    }

    url = root + url;

    this.loading.emit(true);
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.loading.emit(false);
      let chartData = this.parseData(data);

      let point_list = [];
      if(chartData && chartData['data'] && chartData['data']['point_list']){
        point_list = chartData['data']['point_list'];
      };
      this.allPointList = point_list;
      let cur_point = chartData['data']['point_list'][chartData['data']['point_list'].length-1];
      this.currentValue = cur_point['date'];
      this.curAvg = chartData['avg_y'];
      this.curMedia = chartData['media_y'];

      this.pointSelectorData = [];
      if(point_list){
        point_list.forEach(el => {
          this.pointSelectorData.push({
            value: el['date'],
            name: el['date'],
            selected: el['date'] == cur_point['date'] ? 'selected' : ''
          });
        });
      }

      this.init_chart(cur_point, chartData['media_y'], chartData['avg_y']);
      this.cdr.markForCheck(); 
        
    });
  }

  parseData(data):any{
    let result = data['short_features'][0];
    return result;
  }


  init_chart(cur_point, media, avg):void {
    
    let chart_dom = document.getElementById('chart2')!;
    
    if(this.my_chart == null){
      this.my_chart = echarts.init(chart_dom);
    }

    let option: EChartsOption;
    this.my_chart.setOption(
      (option = {
        animation: false,
        legend: [{
          top: 30,
          left: 'start',
          data: ['中位线', '均线', '涨幅'],
          textStyle: {color:'#ffffff'}
        },{
          top: 215,
          left: 'start',
          data: ['成交量','换手率'],
          textStyle: {color:'#ffffff'}
        },{
          top: 355,
          left: 'start',
          data: ['成本'],
          textStyle: {color:'#ffffff'}
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          textStyle: {
            color: '#000'
          },         
          position: function (pos, params, el, elRect, size) {
            let topNum = 20 + pos[1];
            const obj: Record<string, number> = {
              top: topNum,
            };           
            return obj;
          }         
        },
        axisPointer: {
          link: [
            {
              xAxisIndex: 'all'
            }
          ],
          label: {
            backgroundColor: '#777'
          }
        },
        // toolbox: {
        //   feature: {
        //     dataZoom: {
        //       yAxisIndex: false
        //     },
        //     brush: {
        //       type: ['lineX', 'clear']
        //     }
        //   }
        // },
        brush: {
          xAxisIndex: 'all',
          brushLink: 'all',
          outOfBrush: {
            colorAlpha: 0.1
          }
        },
        visualMap: {
          show: false,
          seriesIndex: [4,5,7],
          dimension: 2,
          pieces: [
            {
              value: 1,
              color: downColor
            },
            {
              value: -1,
              color: upColor
            }
          ]
        },
        grid: [
          {
            left: 10,
            right: 50,
            top: 60,
            height: 120
          },
          {
            left: 10,
            right: 50,
            top: 240,
            height: 100
          },
          {
            left: 10,
            right: 50,
            top: 380,
            height: 100
          },
          {
            left: 10,
            right: 50,
            top: 500,
            height: 100
          },
          {
            left: 10,
            right: 50,
            top: 640,
            height: 100
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: cur_point['history_dates'],
            boundaryGap: true,
            axisLine: { 
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              z: 100
            },
            axisLabel: {color: '#ffffff'},
          },
          {
            type: 'category',
            gridIndex: 1,
            data: cur_point['history_dates'],
            boundaryGap: true,
            axisLine: { 
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          },
          {
            type: 'category',
            gridIndex: 2,
            data: cur_point['history_dates'],
            boundaryGap: true,
            axisLine: { 
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          }
        ],
        yAxis: [
          {
            scale: true,
            // splitNumber: 4,
            // splitArea: {
            //   show: true
            // },
            splitLine: {
              lineStyle: {
                color: 'rgba(123, 122, 122, 1)'
              }
            },
            position: 'right',
            offset: 0,
            axisLine: {
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            axisLabel: { show: true , formatter: '{value}', color:'#ffffff',fontWeight:'bolder',fontSize:12},
            name: cur_point['name']+" "+cur_point['date']+" 涨幅指数",
            nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:14, padding:[0, 180, 20, 0]},
            nameGap: 20
          },
          {
            scale: true,
            gridIndex: 1,
            // splitNumber: 4,
            // splitArea: {
            //   show: true
            // },
            splitLine: {
              lineStyle: {
                color: 'rgba(123, 122, 122, 1)'
              }
            },
            axisLabel: { show: true , formatter: '{value}', color:'#ffffff',fontWeight:'bolder',fontSize:12},
            // axisLine: { show: true },
            // axisTick: { show: false },
            // splitLine: { show: false },
            position: 'right',
            offset: 0,
            axisLine: {
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            name: '成交量（万）',
            nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:12, padding:[0, 50, 0, 0]},
            nameGap: 10
          },
          {
            scale: true,
            gridIndex: 2,
            // splitNumber: 4,
            // splitArea: {
            //   show: true
            // },
            splitLine: {
              lineStyle: {
                color: 'rgba(123, 122, 122, 1)'
              }
            },
            axisLabel: { show: true , formatter: '{value}', color:'#ffffff',fontWeight:'bolder',fontSize:12},
            // axisLine: { show: true },
            // axisTick: { show: false },
            // splitLine: { show: false },
            position: 'right',
            offset: 0,
            axisLine: {
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            name: '成本',
            nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:12, padding:[0, 50, 0, 0]},
            nameGap: 10
          }
        ],
        // dataZoom: [
        //   {
        //     type: 'inside',
        //     xAxisIndex: [0, 1, 2, 3, 4, 5, 6, 7],
        //     startValue: zoom_values['startValue'],
        //     endValue: zoom_values['endValue'],
        //   }
        // ],
        series: [
          {
            name: '中位线',
            type: 'line',
            data:media,
          },
          {
            name: '均线',
            type: 'line',
            data: avg,
          },
          {
            name: '涨幅',
            type: 'line',
            data: cur_point['y'],
          },
          {
            name: '成交量',
            type: 'line',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: cur_point['y_volume'],
          },
          {
            name: '换手率',
            type: 'line',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: cur_point['y_hand'],
          },
          {
            name: '成本',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: cur_point['history_prices'],
          }
        ]
      }),
      true
    );
    option && this.my_chart.setOption(option);

    this.my_chart.on('mouseover', function (params) {
      // console.log(params['name']);
  });
  }

  selectionChange(event){
    let cur_point = null;
    for( let key in this.allPointList){
      let item = this.allPointList[key];
      if(item['date'] == event.value){
        cur_point = item;
        break;
      }
    }
    if(cur_point){
      this.currentValue = cur_point['date'];
      this.init_chart(cur_point, this.curMedia, this.curAvg);
    }
  }

  selectHotTrade(value){
    let cur_point = null;
    for( let key in this.allPointList){
      let item = this.allPointList[key];
      if(item['date'] == value){
        cur_point = item;
        break;
      }
    }
    if(cur_point){
      this.currentValue = cur_point['date'];
      this.init_chart(cur_point, this.curMedia, this.curAvg);
    }
  }
}
