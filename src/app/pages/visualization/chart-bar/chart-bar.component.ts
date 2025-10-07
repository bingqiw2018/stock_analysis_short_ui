import { Component, OnInit, OnChanges, SimpleChanges, Input} from '@angular/core';
import * as echarts from "echarts";
import * as moment from 'moment';
import { LayoutService } from "src/app/core/services/layout.service";
@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.css']
})
export class ChartBarComponent implements OnInit, OnChanges {
  chartObj;
  @Input() chartData = [];
  @Input() chartTitle = {};
  curHeight:string;
  constructor(private layoutService: LayoutService<any>,) { }

  ngOnInit() {
    this.curHeight = this.layoutService.getHeight(200) ;
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if("chartData" == propName && this.chartData && this.chartData.length>0){
        // console.log(this.chartData.length);
        this.initChart();
      }
    }
  }

  initChart(): void {
    let days = [];
    let values = [];
    let maxValue = 100;
    let avgValue = 0;
    this.chartData.forEach((el) => {
      days.push(el["date"]);
      values.push(el["value"]);
      //maxValue = el["value"]>maxValue? el["value"]: maxValue;
      avgValue = (avgValue + el["value"])/2;
    });
    let chart_dom = document.getElementById("chart_bar_template")!;
    if (this.chartObj == null) {
      this.chartObj = echarts.init(chart_dom);
    }
    let category = ["初始关注"];
    let formatter: string = "";
    for (let i = 0; i < category.length; i++) {
      formatter = formatter + "{a" + i + "}：{c" + i + "}  %<br/>";
    }
    let zoomStart = 0;
    let zoomLimit = 10;
    if (days.length<zoomLimit){
      let gapLen = zoomLimit - days.length;
      let startDay = days[0];
      for(let i=0; i<gapLen; i++){
        days.unshift(moment(startDay).subtract(i+1, 'days').format('YYYY-MM-DD'));
        values.unshift(0);
      }
    }else if(days.length>=zoomLimit && days.length< zoomLimit * 2){
      days = days.slice(0, days.length);
      values = values.slice(0, values.length);
      zoomStart = 0;
    }else if(days.length>=zoomLimit * 2 && days.length< zoomLimit * 3){
      days = days.slice(0, days.length);
      values = values.slice(0, values.length);
      zoomStart = 10;
    }else if(days.length>=zoomLimit * 3 && days.length< zoomLimit * 6){
      days = days.slice(0, days.length);
      values = values.slice(0, values.length);
      zoomStart = 70;
    }else{
      days = days.slice(days.length - zoomLimit * 6, days.length);
      values = values.slice(values.length - zoomLimit * 6, values.length);
      zoomStart = 70;
    }

    let intervals = Math.round(avgValue / 5);

    let option = {
      title: {
        textStyle: {
          color: "#ffffff",
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'Roboto, sans-serif',
          width: '200px'
        },
        text: this.chartTitle['title'],
      },
      tooltip: {
        trigger: "item",
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'Roboto, sans-serif'
      },
      legend: {
        show: true,
        data: category,
        textStyle: { color: "#ffffff" },
      },
      xAxis: [
        {
          type: "category",
          name: this.chartTitle['xAxisTitle'],
          nameLocation: "middle",
          nameTextStyle: {
            lineHeight: 50,
            fontSize: 12,
            color:'#ffffff',
            fontWeight: 'bolder'
          },
          data: days,
          axisPointer: {
            type: "shadow",
          },
          axisLine: {
            lineStyle: {
              color: "#ffffff"
            }
          },
          axisLabel: {
            show: true,
            fontSize: 12
          }
        },
      ],
      yAxis: [
        {
          type: "value",
          name: '数量',
          nameTextStyle: {
            fontSize: 14,
            color:'#ffffff',
            fontWeight: 'bolder'
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ffffff',
              fontSize: 14
            }
          },
          axisLabel: {
            show: true,
            fontSize: 14
          },
          min: 0,
          max: Math.round(avgValue),
          interval: intervals,
          position: "right",
        },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          start: zoomStart,
          end: 100,
        },
      ],
      grid: {
        left: 5,
        right: 5,
        top: 30,
        bottom: 25,
        containLabel: true
      },
      series: [
        {
          // name: "初始关注",
          type: "bar",
          label: {show: true, fontSize: '14px'},
          tooltip: {
            valueFormatter: function (value) {
              return (value as number) + "";
            },
          },
          data: values,
        }
      ],
    };

    option && this.chartObj.setOption(option);
  }
}
