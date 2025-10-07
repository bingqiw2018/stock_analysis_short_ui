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

function calculateKline(data){
  let result = [];
  for(let i=0; i<data.length; i++){
    result.push({value:[data[i].slice(0,5)]});
  }

  return data;
}

function calculateMA(dayCount: number, data: []) {
  var result = [];
  for (var i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) {
      result.push('-');
      continue;
    }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) {
      let num:string = data[i - j][1];
      sum += parseFloat(num);
    }
    result.push(+(sum / dayCount).toFixed(3));
  }
  return result;
}

function calculateIndex(index, data:[]) {
  var result = [];
  for (var i = 0, len = data.length; i < len; i++) {
    let flag = parseFloat(data[i][index])<0 ? 1 : -1;
    if(0 == index){
      flag = 3;
    }else if(1 == index){
      flag = 2;
    }
    
    result.push([i, data[i][index], flag]);
  }
  return result;
}

@Component({
  selector: 'app-observed-chart',
  templateUrl: './observed-chart.component.html',
  styleUrls: ['./observed-chart.component.css']
})
export class ObservedChartComponent implements OnInit,AfterViewInit,OnChanges{
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  my_chart;
  @Output() loading = new EventEmitter<any>();
  @Output() cur_chips = new EventEmitter<any>();
  
  stock_id:string = null;
  stock_cashflow_days = [];
  stock_cashflow_markpoints = [];
  
  @Input() time_type: string;

  curHeight:string;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>
    ) { }

  ngOnInit() {
    this.curHeight = '880px';
    this.route.queryParams.subscribe((res)=>{
      if(res.stock_id){
        this.stock_id = res.stock_id;        
        this.queryCashflowbyStockId();
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {      
      if("time_type" == propName && this.stock_id){
        this.query();
      }
    }
  }
  
  ngAfterViewInit(): void {
    
  }

  queryCashflowbyStockId(){
    let url = environment.apiUrls.getKlineCashFlowEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    httpParams = httpParams.set('stock_id', this.stock_id);
    url = root + url;

    this.loading.emit(true);

    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      
      this.stock_cashflow_days = [];
      data.forEach((item)=>{
        // console.log(item);
        item.add_date = moment(item.add_date).format('YYYY-MM-DD');
        item.mod_date = moment(item.mod_date).format('YYYY-MM-DD');
        item.in_date = item.in_time ? moment(item.in_time).format('YYYY-MM-DD') : '';
        item.out_date = item.out_time ? moment(item.out_time).format('YYYY-MM-DD') : '';
        if(item.status == 0){
          item.status = '已关注';
          item.observed_color = environment.color[15];
        }else if(item.status == 1){
          item.status = '已买入';
          item.observed_color = environment.color[1];
        }else if(item.status == -1){
          item.status = '已卖出';
          item.observed_color = environment.color[5];
        }

        if(item.ratio && item.ratio< 0){
          item.color = environment.color[5];
        }else if(item.ratio && item.ratio > 0){
          item.color = environment.color[1];
        }else{
          item.color = environment.color[15];
        }
        
        let mark_point_in = {
          coord: [item.in_date, item.in_price],
          value: item.in_price,
          itemStyle: {
            color: environment.color[0]
          }
        };
        this.stock_cashflow_days.push(mark_point_in);
        let mark_point_out = {
          coord: [item.out_date, item.out_price],
          value: item.out_price,
          itemStyle: {
            color: environment.color[11]
          }
        };
        this.stock_cashflow_days.push(mark_point_out);
        
      });

      this.stock_cashflow_days.sort((el1, el2) => {
        let date1 = moment(el1['coord'][0]).unix();
        let date2 = moment(el2['coord'][0]).unix();
        return (date1 - date2);
      });

      // console.log(this.stock_cashflow_days.map(el=>{return {date: el['coord'][0], value: el['coord'][1]}}));
      // console.log(this.stock_cashflow_days);
      // Assign the data to the data source for the table to render
      this.cdr.markForCheck();
      this.query();
      this.loading.emit(false);
    });
  }

  parseData(data):any{
    let klineDays = data['kl_stock_days'];
    let madcDays = data['macd_kline_obj'];
    let rsiDays = data['rsi_kline_obj'];
    let kdjDays = data['kdj_kline_obj'];
    let chips = data['chips'];
    this.cur_chips.emit(chips);
    // volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
    let result = {volumne:[], klines:[], category:[], macd:[], rsi:[], kdj:[]};
    for(let i=0; i<klineDays.length; i++){
      let endVol = (parseFloat(klineDays[i]['end_volume'])/10000).toFixed(2);
      let endVolFlag = parseFloat(klineDays[i]['start']) > parseFloat(klineDays[i]['end']) ? 1 : -1;
      result['category'].push(klineDays[i]['date']);
      result['klines'].push([klineDays[i]['start'],klineDays[i]['end'],klineDays[i]['low'],klineDays[i]['high'],klineDays[i]['ratio']]);
      result['volumne'].push([i, endVol, endVolFlag]);
      result['macd'].push([madcDays['signal'][i],madcDays['macd'][i],madcDays['hist'][i]]);
      result['rsi'].push([rsiDays['rsi1'][i],rsiDays['rsi2'][i],rsiDays['rsi3'][i]]);
      result['kdj'].push([kdjDays['index_k'][i],kdjDays['index_d'][i],kdjDays['index_j'][i]]);
    }
    
    return result;
  }

  get_mark_point(curTime, days, klines){
    let day1 = moment(curTime).unix();

    let markPoint = {markTime:null, markPrice:null};

    for(let i=0; i<days.length; i++){
      let el = days[i];
      let day2 = moment(el).unix();
      if(day2==day1 && markPoint.markTime==null){
        markPoint.markTime = el;
        markPoint.markPrice = klines[i][3];
      }
    }

    return markPoint;
  }

  create_markpoints(category, klines){
    this.stock_cashflow_markpoints = [];

    for(let i=0; i<this.stock_cashflow_days.length; i++){
      let curTime = this.stock_cashflow_days[i]['coord'][0];
      let dayObj = this.stock_cashflow_days[i];
      let markPoint = this.get_mark_point(curTime, category, klines);

      this.stock_cashflow_markpoints.push({
        coord: [markPoint.markTime, markPoint.markPrice],
        value: dayObj.value,
        itemStyle: dayObj.itemStyle
      });
      
    }

  }

  query():void{
    let url = environment.apiUrls.getStocks;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    this.time_type = this.time_type ? this.time_type: 'days';
    url = root + url + '/'+this.stock_id+'/kline/'+this.time_type;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      let chartData = this.parseData(data);
      this.create_markpoints(chartData['category'],chartData['klines']);
      this.init_chart(chartData);
      this.cdr.markForCheck();
    });
  }

  zoom_scope(data):number{
    let max_column_size = 30;
    let zs = 0;
    let data_len = data['klines'].length;
    if(data_len < max_column_size){
      zs = 0;
    }else{
      zs = Math.round(((max_column_size)/data_len)*100);
      if(zs == 0){
        zs = 90;
      }
    }
    return zs;
  }

  zoom_values(data):any{
    let start = 0;
    let end = data['klines'].length- -1;
    let max_column_size = 30;

    if(end > max_column_size){
      start = end - max_column_size;
    }

    let result = {startValue:start, endValue:end};
    return result;
  }

  init_chart(data):void {
    let chart_dom = document.getElementById('chart1')!;
    let zoom_values = this.zoom_values(data);
    
    if(this.my_chart == null){
      this.my_chart = echarts.init(chart_dom);
    }

    let mark_points = [];
    if(this.time_type == 'days' || this.time_type == 'weeks' || this.time_type == 'months' || this.time_type == 'years'){
      mark_points = this.stock_cashflow_markpoints;
    }

    let option: EChartsOption;
    this.my_chart.setOption(
      (option = {
        animation: false,
        legend: {
          top: 10,
          left: 'start',
          data: ['K线', '5日', '10日', '20日'],
          textStyle: {color:'#ffffff'}
        },
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
          // alwaysShowContent: true,
          formatter: function (params) {
            // console.log(params[0]['seriesName'] +':'+ params[0]['name'], params[0]);
            
            let title = params[0]['seriesName'];
            // console.log(title);
            let date = params[0]['name'];
            let value = params[0]['value'];
            let backgroundColor = params[0]['color'];
            let title_html = '<div style="font-size: 14px; color: #000; font-weight: bold; line-height: 1">'+title+':'+date+'</div>';
            
            let row_html = '';
            if(title == 'K线'){

              let ratio = value[5]+'%';
              row_html += '<div style="margin: 0px 0 0; line-height: 1">'+
                            '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                              '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+backgroundColor+';"></span>'+
                              '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">开盘：</span>'+
                              '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+value[1]+'</span>'+
                              '<div style="clear: both"></div>'+            
                            '</div>'+
                            '<div style="clear: both"></div>'+
                          '</div>';

              row_html += '<div style="margin: 0px 0 0; line-height: 1">'+
                              '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                                '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+backgroundColor+';"></span>'+
                                '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">收盘：</span>'+
                                '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+value[2]+'</span>'+
                                '<div style="clear: both"></div>'+            
                              '</div>'+
                              '<div style="clear: both"></div>'+
                            '</div>';

              row_html += '<div style="margin: 0px 0 0; line-height: 1">'+
                            '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                              '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+backgroundColor+';"></span>'+
                              '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">最低：</span>'+
                              '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+value[3]+'</span>'+
                              '<div style="clear: both"></div>'+            
                            '</div>'+
                            '<div style="clear: both"></div>'+
                          '</div>';

              row_html += '<div style="margin: 0px 0 0; line-height: 1">'+
                            '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                              '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+backgroundColor+';"></span>'+
                              '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">最高：</span>'+
                              '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+value[4]+'</span>'+
                              '<div style="clear: both"></div>'+            
                            '</div>'+
                            '<div style="clear: both"></div>'+
                          '</div>';

              row_html += '<div style="margin: 0px 0 0; line-height: 1"><hr/>'+
                            '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                              '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+backgroundColor+';"></span>'+
                              '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">涨幅：</span>'+
                              '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+ratio+'</span>'+
                              '<div style="clear: both"></div>'+            
                            '</div>'+
                            '<div style="clear: both"></div>'+
                          '</div>';          

            }else if(title == 'DIF'){
              params.forEach(el=>{
                let el_title = '';
                let el_value = el['value'][1];
                let color = '';
                
                if(el['seriesName'].indexOf('DIF')>=0){
                  el_title = 'DIF';
                  color = macdColor;
                }else if(el['seriesName'].indexOf('DEA')>=0){
                  el_title = 'DEA';
                  color = signalColor;
                }else if(el['seriesName'].indexOf('MACD')>=0){
                  el_title = 'MACD';
                  color = el_value > 0 ? upColor: downColor;
                }
                if(el_title){
                  row_html += '<div style="margin: 0px 0 0; line-height: 1">'+
                              '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                                '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+color+';"></span>'+
                                '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">'+el_title+'：</span>'+
                                '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+el_value+'</span>'+
                                '<div style="clear: both"></div>'+            
                              '</div>'+
                              '<div style="clear: both"></div>'+
                            '</div>';
                }
              });
              
            }else if(title == 'RSI_1'){
              params.forEach(el=>{
                if(el['seriesName'].indexOf('RSI')>=0){
                  let el_title = '';
                  let el_value = el['value'][1];
                  let color = '';
                  if(el['seriesName'] == 'RSI_1'){
                    el_title = 'RSI_1';
                    color = rsi1Color;
                  }else if(el['seriesName'] == 'RSI_2'){
                    el_title = 'RSI_2';
                    color = rsi2Color;
                  }else if(el['seriesName'] == 'RSI_3'){
                    el_title = 'RSI_3';
                    color = rsi3Color;
                  }

                  row_html += '<div style="margin: 0px 0 0; line-height: 1">'+
                              '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                                '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+color+';"></span>'+
                                '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">'+el_title+'：</span>'+
                                '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+el_value+'</span>'+
                                '<div style="clear: both"></div>'+            
                              '</div>'+
                              '<div style="clear: both"></div>'+
                            '</div>';
                }
              });
            }else if(title == 'KDJ-K'){
              params.forEach(el=>{
                if(el['seriesName'].indexOf('KDJ')>=0){
                  let el_title = '';
                  let el_value = el['value'][1];
                  let color = '';
                  if(el['seriesName'] == 'KDJ-K'){
                    el_title = 'K';
                    color = kColor;
                  }else if(el['seriesName'] == 'KDJ_D'){
                    el_title = 'D';
                    color = dColor;
                  }else if(el['seriesName'] == 'KDJ_J'){
                    el_title = 'J';
                    color = jColor;
                  }

                  row_html += '<div style="margin: 0px 0 0; line-height: 1">'+
                              '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                                '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+color+';"></span>'+
                                '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">'+el_title+'：</span>'+
                                '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+el_value+'</span>'+
                                '<div style="clear: both"></div>'+            
                              '</div>'+
                              '<div style="clear: both"></div>'+
                            '</div>';
                }
              });
            }else{
              row_html = '<div style="margin: 0px 0 0; line-height: 1">'+
                            '<div style="margin: 0px 0 0; line-height: 1; padding:5px;">'+
                              '<span style="display: inline-block;margin-right: 4px;border-radius: 10px;width: 10px;height: 10px;background-color: '+backgroundColor+';"></span>'+
                              '<span style="font-size: 14px;color: #000;font-weight: 400;margin-left: 2px;">'+title+'：</span>'+
                              '<span style="float: right;margin-left: 20px;font-size: 14px;color: #000;font-weight: 900;">'+value[1]+'</span>'+
                              '<div style="clear: both"></div>'+            
                            '</div>'+
                            '<div style="clear: both"></div>'+
                          '</div>';
            }
            

            let content_html = '<div style="margin: 10px 0 0; line-height: 1">'+row_html+'<div style="clear: both"></div></div>';
            let body_html = '<div style="margin: 0px 0 0; line-height: 1">'+title_html+ '' +content_html +'<div style="clear: both"></div></div>';
            let html = '<div style="margin: 0px 0 0; line-height: 1">'+body_html+'<div style="clear: both"></div></div>';
            return html ;
          },
          position: function (pos, params, el, elRect, size) {
            let topNum = 20 + pos[1];
            const obj: Record<string, number> = {
              top: topNum,
            };
            // obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 0;

            return obj;
          }
          // extraCssText: 'width: 170px'
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
            right: 60,
            top: 50,
            height: 240
          },
          {
            left: 10,
            right: 60,
            top: 340,
            height: 100
          },
          {
            left: 10,
            right: 60,
            top: 480,
            height: 100
          },
          {
            left: 10,
            right: 60,
            top: 620,
            height: 100
          },
          {
            left: 10,
            right: 60,
            top: 760,
            height: 100
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: data['category'],
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
            data: data['category'],
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
            data: data['category'],
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
            gridIndex: 3,
            data: data['category'],
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
            gridIndex: 4,
            data: data['category'],
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
            max: 'dataMax',
          }
        ],
        yAxis: [
          {
            scale: true,
            splitNumber: 10,
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
            name: 'K线趋势',
            nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:12},
            nameGap: 10
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 4,
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
            nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:12},
            nameGap: 10
          },
          {
            scale: true,
            gridIndex: 2,
            splitNumber: 4,
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
            // axisTick: { show: true },
            // splitLine: { show: true },
            position: 'right',
            offset: 0,
            axisLine: {
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            name: 'MACD',
            nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:12},
            nameGap: 10
          },
          {
            scale: true,
            gridIndex: 3,
            splitNumber: 4,
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
            // axisTick: { show: true },
            // splitLine: { show: true },
            position: 'right',
            offset: 0,
            axisLine: {
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            name: 'RSI',
            nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:12},
            nameGap: 10
          },
          {
            scale: true,
            gridIndex: 4,
            splitNumber: 4,
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
            // axisTick: { show: true },
            // splitLine: { show: true },
            position: 'right',
            offset: 0,
            axisLine: {
              show: true,
              onZero: false,
              lineStyle: {
                color: '#ffffff'
              }
            },
            name: 'KDJ',
            nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:12},
            nameGap: 10
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1, 2, 3, 4, 5, 6, 7],
            startValue: zoom_values['startValue'],
            endValue: zoom_values['endValue'],
          }
        ],
        series: [
          {
            name: 'K线',
            type: 'candlestick',
            data: calculateKline(data['klines']),
            itemStyle: {
              color: upColor,
              color0: downColor,
              borderColor: undefined,
              borderColor0: undefined
            },
            markPoint: {
              symbolSize: 50,
              symbolOffset: [0, -10],              
              label: {
                fontWeight:'bold',
                formatter: function (param: any) {
                  return param != null ? param.value.toFixed(2) + '' : '';
                },
                fontSize: 12
              },data: mark_points
            }
          },
          {
            name: '5日',
            type: 'line',
            data: calculateMA(5, data['klines']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              opacity: 1,
              color: '#ffffff',
              width: 2
            }
          },
          {
            name: '10日',
            type: 'line',
            data: calculateMA(10,  data['klines']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              opacity: 1,      
              color: 'rgba(248, 236, 67, 1)',        
              width: 2
            }
          },
          {
            name: '20日',
            type: 'line',
            data: calculateMA(20,  data['klines']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              opacity: 1,
              color: 'rgba(230, 22, 233, 1)',
              width: 2
            }
          },         
          {
            name: '成交量',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: data['volumne']
          },
          {
            name: 'DIF',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: calculateIndex(0,data['macd']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              color: macdColor,
              opacity: 1
            }
          },
          {
            name: 'DEA',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            data: calculateIndex(1,data['macd']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              color: signalColor,
              opacity: 1
            }
          },
          {
            name: 'MACD',
            type: 'bar',
            xAxisIndex: 2,
            yAxisIndex: 2,
            barWidth: 3,
            data: calculateIndex(2,data['macd'])
          },
          {
            name: 'RSI_1',
            type: 'line',
            xAxisIndex: 3,
            yAxisIndex: 3,
            data: calculateIndex(0,data['rsi']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              color: rsi1Color,
              opacity: 1
            }
          },
          {
            name: 'RSI_2',
            type: 'line',
            xAxisIndex: 3,
            yAxisIndex: 3,
            data: calculateIndex(1,data['rsi']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              color: rsi2Color,
              opacity: 1
            }
          },
          {
            name: 'RSI_3',
            type: 'line',
            xAxisIndex: 3,
            yAxisIndex: 3,
            data: calculateIndex(2,data['rsi']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              color: rsi3Color,
              opacity: 1
            }
          },
          {
            name: 'KDJ-K',
            type: 'line',
            xAxisIndex: 4,
            yAxisIndex: 4,
            data: calculateIndex(2,data['kdj']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              color: kColor,
              opacity: 1
            }
          },          
          {
            name: 'KDJ_D',
            type: 'line',
            xAxisIndex: 4,
            yAxisIndex: 4,
            data: calculateIndex(0,data['kdj']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              color: dColor,
              opacity: 1
            }
          },
          {
            name: 'KDJ_J',
            type: 'line',
            xAxisIndex: 4,
            yAxisIndex: 4,
            data: calculateIndex(1,data['kdj']),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              color: jColor,
              opacity: 1
            }
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

}
