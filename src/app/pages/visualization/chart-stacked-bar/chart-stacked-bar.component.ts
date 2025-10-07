import { Component, OnInit, OnChanges, SimpleChanges, Input} from '@angular/core';
import * as echarts from "echarts";
import * as moment from 'moment';
import { LayoutService } from "src/app/core/services/layout.service";
@Component({
  selector: 'app-chart-stacked-bar',
  templateUrl: './chart-stacked-bar.component.html',
  styleUrls: ['./chart-stacked-bar.component.css']
})
export class ChartStackedBarComponent implements OnInit, OnChanges {
  chartObj;
  @Input() chartData = [];
  @Input() chartCategory = [];
  @Input() chartTitle = {};
  constructor(private layoutService: LayoutService<any>,) { }

  ngOnInit() {
    let chart_dom = document.getElementById('chart_stacked_bar_template')!;
    chart_dom.style.height = this.layoutService.getHeight(220) ;
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if("chartData" == propName && this.chartData && this.chartData.length>0){
        this.initChart();
      }
    }
  }

  initChart(): void {

    let chart_dom = document.getElementById("chart_stacked_bar_template")!;
    if (this.chartObj == null) {
      this.chartObj = echarts.init(chart_dom);
    }

    let series = [];
    let legendTitle = [];
    this.chartData.forEach((el) => {
      let days = [];
      let values = [];
      let avgValue = 0;

      let serie = {
        name: el['name'],
        type: el['type'],
        label: {show: true, fontSize:'12px', color:'#ffffff', fontWeight:'bold'},
        tooltip: {
          valueFormatter: function (value) {
            return (value as number) + "";
          },
        },
        data: values,
      };
      
      legendTitle.push(el['name']);
      series.push(serie);

      el.data.forEach(sub_el=>{
          days.push(sub_el["date"]);
          values.push(sub_el["value"]);
          avgValue = (avgValue + sub_el["value"])/2;
        });

    });
    
    // let category = ["初始关注"];
    // let formatter: string = "";
    // for (let i = 0; i < category.length; i++) {
    //   formatter = formatter + "{a" + i + "}：{c" + i + "}  %<br/>";
    // }

    let zoomStart = 0;
    let zoomLimit = 60;
    // if (days.length<zoomLimit){
    //   let gapLen = zoomLimit - days.length;
    //   let startDay = days[0];
    //   for(let i=0; i<gapLen; i++){
    //     days.unshift(moment(startDay).subtract(i+1, 'days').format('YYYY-MM-DD'));
    //     values.unshift(0);
    //   }
    // }
    
    let startPercent = 0;
    let maxSizeCategory = 20;
    if(this.chartCategory.length>zoomLimit){
      startPercent = Math.round((1 - maxSizeCategory / this.chartCategory.length)*100);
    }

    // let intervals = Math.round(avgValue / 5);
    let intervals = 50;

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
        trigger: "axis",
        axisPointer: {
          type: "cross",
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
      legend: {
        data: legendTitle,
        textStyle: { color: "#ffffff" ,fontSize:'12px', fontWeight:'bolder'},
      },
      xAxis: [
        {
          type: "category",
          name: this.chartTitle['xAxisTitle'],
          nameLocation: "end",
          nameTextStyle: {
            verticalAlign: "top",
            lineHeight: 60,
            fontSize: 12,
            color:'#ffffff',
            fontWeight: 'bolder'
          },
          nameGap: -30,
          axisLine: {
            lineStyle: {
              color: "#ffffff"
            }
          },
          axisLabel: {
            show: true,
            fontSize: 12,
            rotate: 30
          },
          data: this.chartCategory,
          axisPointer: {
            type: "shadow",
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          name: '数量',
          nameTextStyle: {
            fontSize: 12,
            color:'#ffffff',
            fontWeight: 'bolder'
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ffffff',
              fontSize: 12
            }
          },
          axisLabel: {
            show: true,
            fontSize: 12
          },
          min: 0,
          // max: Math.round(avgValue),
          // interval: intervals,
          position: "right",
        },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          start: startPercent,
          end: 100,
        },
      ],
      grid: {
        left: 10,
        right: 10,
        bottom: 5,
        containLabel: true
      },
      series: series
    };

    option && this.chartObj.setOption(option);
  }
}
