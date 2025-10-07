import { Component, OnInit, ViewChild, ChangeDetectorRef,AfterViewInit,OnChanges, SimpleChanges, Input } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { LayoutService } from 'src/app/core/services/layout.service';
import { StockService } from 'src/app/core/services/stock.service';
import * as echarts from 'echarts';

@Component({
  selector: 'app-chart-pie',
  templateUrl: './chart-pie.component.html',
  styleUrls: ['./chart-pie.component.css']
})
export class ChartPieComponent implements OnInit, AfterViewInit, OnChanges {
  
  @Input() items: [];
  @Input() pieId:string = 'chart-pie-template';
  @Input() config;
  curHeight:string;
  constructor(private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public layoutService: LayoutService<any>,
    public httpService: StockService<any>) { }

    ngOnChanges(changes: SimpleChanges): void {
      for (const propName in changes) {
        if("items" == propName && this.items.length>0){
          this.initChart();
        }
      }
    }
    
    ngAfterViewInit(): void {
      
    }  
    
    ngOnInit() {
      this.curHeight = this.layoutService.getHeight(200) ;
    }
    
    my_chart_coverage;
    initChart():void{
      let data = this.items;
      let categories = [];
      for(let i=0; i<data.length; i++){
        categories.push(data[i]['name']);
      }

      let chart_dom = document.getElementById(this.pieId)!;
      
      if(this.my_chart_coverage == null){
        this.my_chart_coverage = echarts.init(chart_dom);
      }

      let category = categories;
      let formatter: string = "";
      for(let i=0; i<category.length; i++){
        formatter = formatter + "{a"+i+"}：{c"+i+"}  %<br/>";
      }
  
      let option = {
        title: {
          textStyle: {
            color: "#ffffff",
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'Roboto, sans-serif'
          },
          text: this.config && this.config.title
        },
        tooltip: {
          trigger: 'item'
        },    
        // legend: {        
        //   top: '40',
        //   left: 'center',
        //   textStyle: {
        //     color:'#ffffff', 
        //     fontSize: '14px',
        //     fontWeight: 'bold'
        //   }
        // },       
        grid: {
          left: 5,
          right: 5,
          top: 0,
          bottom: 0,
          containLabel: true
        }, 
        series: [
          {
            // top: '10',
            // bottom: '-20',
            // name: 'Access From',
            type: 'pie',
            radius: ['30%', '70%'],
            avoidLabelOverlap: false,
            // itemStyle: {
            //   borderRadius: 1,
            //   borderColor: '#ffffff',
            //   borderWidth: 0,
            //   fontSize: '18px',
            //   fontWeight: 'bold'
            // },
            label: {
              alignTo: "labelLine",
              // edgeDistance: '10%',
              // showAbove: true,
              show: true,
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold',
              formatter: '{b}:{c}'
            },
            // emphasis: {
            //   label: {
            //     show: true,
            //     fontSize: 14,
            //     fontWeight: 'bold'
            //   }
            // },
            labelLine: {
              show: true,
              length: 10,
              // length2: 30,
              maxSurfaceAngle: 90
            },
            data: data
          }
        ]
      };

      option && this.my_chart_coverage.setOption(option);
    }

}

