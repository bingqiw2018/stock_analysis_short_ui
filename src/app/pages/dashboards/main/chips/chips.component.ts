import { Component, OnInit, ViewChild, ChangeDetectorRef,AfterViewInit,OnChanges, SimpleChanges, Input, Output } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { LayoutService } from 'src/app/core/services/layout.service';
import { StockService } from 'src/app/core/services/stock.service';
import * as echarts from 'echarts';
import { environment } from "../../../../../environments/environment";
import { offset } from '@popperjs/core';
import * as moment from 'moment';
@Component({
  selector: 'app-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.css']
})
export class ChipsComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() chips: any;
  // curHeight:string = (innerHeight-100) + 'px';
  curHeight:string = (560) + 'px';

  constructor(private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>) { }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      
      if("chips" == propName && this.chips){
        this.init_chart();
      }
    }
  }
  
  ngAfterViewInit(): void {
    
  }  
  
  ngOnInit() {
  }

  isJumpLine(yValue, jumpsLine){
    let isJumpLine = false;

    jumpsLine.forEach(el=>{
      if(el.price == yValue){
        isJumpLine = true;
      }
    });
    
    return isJumpLine;
  }

  isMaxLine(yValue, maxValues){
    let isMax = false;

    maxValues.forEach(el=>{
      if(el == yValue){
        isMax = true;
      }
    });
    
    return isMax;
  }

  isMinLine(yValue, minValues){
    let isMin = false;

    minValues.forEach(el=>{
      if(el == yValue){
        isMin = true;
      }
    });
    
    return isMin;
  }

  my_chart;
  init_chart():void {
    
    let chart_dom = document.getElementById('chart_chips')!;
    if(this.my_chart == null){
      this.my_chart = echarts.init(chart_dom);
    }

    let xAxisData = [];
    let yAxisData = [];
    let xValues = this.chips['x'];
    let yValues = this.chips['y'];
    let stockLine = this.chips['store_line'];
    let end = this.chips['end'];
    let max_chips_y = this.chips['max_chips_y'];
    let min_chips_y = this.chips['min_chips_y'];
    let jumps_line = this.chips['jumps_line'];

    let maxValue = 0;
    let avgValue = 0;
    

    xValues.forEach((el) => {
      maxValue = el>maxValue? el: maxValue;
      avgValue = Math.round((avgValue + el)/2);
    });
    // console.log(this.chips);
    // console.log(maxValue);
    // console.log(avgValue);

    let yAxisNumber = 0;
    let endAxisNumber = 0;
    let xIntervals = Math.round(maxValue / 5);
    let yIntervals = Math.round(maxValue / 5);
    let marklines = [];
    let markPoints = [];
    let minValue = 10000;

    
    for (var i = 0; i < xValues.length; i++) {
      let barColor = '#f6b400';
      let yValue = yValues[i];
      let xValue = xValues[i];
      if(yValue>end){
        barColor = '#ffffff';
      }else{
        barColor = '#f6b400';
      }

      if(this.isMaxLine(yValue, max_chips_y)){
        barColor = '#ec0000'
        markPoints.push({ 
          yAxis: i, 
          xAxis: xValue*0.98 , 
          symbol:'circle' , 
          label: {
            show:true, 
            formatter:''+yValue, 
            position: 'bottom',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#ec0000'
          }});
        
      }else if(this.isMinLine(yValue, min_chips_y)){

      }

      
      let fixXValue = xValue>avgValue? (avgValue/maxValue)*xValue: xValue;
      xAxisData.push({value:xValue, itemStyle: {color:barColor}});
      yAxisData.push({value:yValue});

      // if(yValue>18 && yValue<26){
      //   xAxisData.push({value:fixXValue, itemStyle: {color:barColor}});
      //   yAxisData.push({value:yValue});
      // }
      
      if(yValue == stockLine){
        yAxisNumber = i;
      }

      
      let gapValue = Number(Math.abs(end - yValue).toFixed(2));
      if(gapValue < minValue){
        minValue = gapValue;
        endAxisNumber = i;
      }

      if(this.isJumpLine(yValue, jumps_line)){
        marklines.push({
          name:'跳变穴口', 
          yAxis: i, 
          label: {
            // formatter:'{b}\n--------\n'+yValue,
            formatter: '' + yValue,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#00da3c'
          },  
          lineStyle: {
            type: "dashed",
            color: '#00da3c'
          }
        });
      }

    }

    marklines.push({
      name:'今日收盘', 
      yAxis: endAxisNumber, 
      label: {
        // formatter:'{b}\n--------\n'+end,
        formatter: '' + end,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2e88c4'
      },  
      lineStyle: {
        type: "solid",
        color: '#2e88c4'
      }
    });
    
    marklines.push({
      name:'建仓', 
      yAxis: yAxisNumber, 
      label: {
        // formatter:'{b}\n--------\n'+stockLine,
        formatter: '' + stockLine,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#cd00f6'
      },  
      lineStyle: {
        type: "solid",
        color: '#cd00f6'
      }
    });
    
    let option = {
      // title: {
      //   text: 'Bar Animation Delay'
      // },
      // legend: {
      //   data: ['bar']
      // },
      // toolbox: {
      //   // y: 'bottom',
      //   feature: {
      //     magicType: {
      //       type: ['stack']
      //     },
      //     dataView: {},
      //     saveAsImage: {
      //       pixelRatio: 2
      //     }
      //   }
      // },
      // tooltip: {
      //   formatter : '{a}:{b}:{c}:{d}'
      // },
      tooltip: {
        trigger: 'axis',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#cd00f6'
        },
        formatter : '{a}:{b}',
        // axisPointer: {
        //   type: 'cross'
        // },
        // position: function (pos, params, el, elRect, size) {
        //   let topNum = 20 + pos[1];
        //   const obj: Record<string, number> = {
        //     top: topNum,
        //     right: 100
        //   };
        //   return obj;
        // }
      },
      grid:{
        right: 100,
        left: 60,
        top:10,
        bottom:30
      },
      xAxis: {
        // data: xAxisData,
        // splitLine: {
        //   show: false
        // }        
        boundaryGap: true,
        axisLine: { 
          show: true,
          onZero: false,
          lineStyle: {
            color: '#ffffff'
          }
        },
        splitLine: { show: false },
        // min: 0,
        // max: avgValue,
        // interval: Math.round(maxValue/3),
        axisPointer: {
          z: 100
        },
        axisLabel: {color: '#ffffff'},
      },
      yAxis: {
        data: yAxisData,
        // type: 'value',
        // interval: 500,
        // maxInterval: 2,
        splitNumbier: 5,
        position: 'left',
        offset: 0,
        axisLine: {
          show: true,
          onZero: false,
          lineStyle: {
            color: '#ffffff'
          }
        },        
        axisLabel: { show: true , formatter: '{value}', color:'#ffffff',fontWeight:'bolder',fontSize:12},
        nameTextStyle: {color: '#ffffff',fontWeight:'bolder', fontSize:12},
        nameGap: 15
      },
      series: [
        {
          name: '筹码',
          type: 'bar',
          data: xAxisData,
          barWidth: 1,
          emphasis: {
            focus: 'series'
          },
          markPoint: {
            symbolSize:8, 
            itemStyle:{color:'#ec0000'},
            data: markPoints,
          },
          markLine: {
            label: {
              color: "#ffffff", 
              fontWeight: "bolder", 
              fontSize: 12, 
              lineHeight: 14,
            },  
            lineStyle: {
              width:2,
              color: "#ffffff", 
              type: "solid"
            },              
            data: marklines
          },
          // animationDelay: function (idx) {
          //   return idx * 10;
          // }
        }
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: function (idx) {
        return idx * 5;
      }
    };
    option && this.my_chart.setOption(option);  

  }

}
