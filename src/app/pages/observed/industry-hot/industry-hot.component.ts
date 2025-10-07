import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { Router,ActivatedRoute } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { StockService } from "src/app/core/services/stock.service";
import { LayoutService } from "src/app/core/services/layout.service";
import * as echarts from "echarts";
import { environment } from "../../../../environments/environment";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from "moment";

const COLORS: string[] = [
  "maroon",
  "red",
  "orange",
  "yellow",
  "olive",
  "green",
  "purple",
  "fuchsia",
  "lime",
  "teal",
  "aqua",
  "blue",
  "navy",
  "black",
  "gray",
  "whitesmoke",
];

@Component({
  selector: "app-industry-hot",
  templateUrl: "./industry-hot.component.html",
  styleUrls: ["./industry-hot.component.css"],
})
export class IndustryHotComponent implements OnInit, AfterViewInit, OnChanges {
  // Table
  displayedColumns: string[] = [
    "code",
    "name",
    "price",
    "ratio",
    "in_price",
    "in_date",
    "add_date",
    "mod_date",
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  clickedRows = new Set<any>();

  curHeight:string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      // if("time_type" == propName && this.stock_id){
      //   this.query();
      // }
    }
  }

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.curHeight = this.layoutService.getHeight(255);
    this.query();
    // this.queryTable();
  }
  // Table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  public industryName = '';
  parseTableDataStocks(title, data):void{
    this.industryName = title;
    const stocks = [];
    data.forEach((item) => {
      item.add_date = moment(item.add_date).format("YYYY-MM-DD");
      item.mod_date = moment(item.mod_date).format("YYYY-MM-DD");
      item.in_time = item.in_time ? moment(item.in_time).format("YYYY-MM-DD"): item.in_time;

      if (item.ratio && item.ratio < 0) {
        item.color = COLORS[5];
      } else if (item.ratio && item.ratio > 0) {
        item.color = COLORS[1];
      } else {
        item.color = COLORS[15];
      }

      let stock_item = this.httpService.parse_stock({
        code: item.code,
        name: item.name,
        price: item.price,
        ratio: item.ratio,
        in_price: item.in_price,
        in_date: item.in_time ? "入："+item.in_time:"入： -- -- ",
        add_date: "关："+item.add_date,
        mod_date: "新："+item.mod_date,
        color: item.color,
      });

      stocks.push(stock_item);
    });
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(stocks);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public loading = false;
  public industryStocks = [];
  public industryUpStocks = [];
  query(): void {
    let url = environment.apiUrls.getIndustryStocks;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    url = root + url;
    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.loading = false;
      // this.init_chart(data);
      this.parseTableDataIndustry(data);
      this.parseTableDataStocks(this.industryStocks[0]['title'],this.industryStocks[0]['stocks']);
      this.cdr.markForCheck();
    });
  }

  parseTableDataIndustry(data): void {
    let day_objs = [];
    // console.log(data);
    for (let i = 0; i < data.length; i++) {
      day_objs.push({
        title: data[i]["industry"],
        total: data[i]["count"],
        up_total: data[i]["up_status"]["total"],
        equal_total: data[i]["equal_status"]["total"],
        down_total: data[i]["down_status"]["total"],
        stocks: data[i]["stocks"]
      });
    }
    // console.log(day_objs);
    // let days = data['days'].sort((el1, el2)=> Date.parse(el2) - Date.parse(el1)  );
    this.industryStocks = day_objs
      .sort((el1, el2) => el2["total"] - el1["total"])
      .slice(0, 10);

    this.industryUpStocks = day_objs
      .sort((el1, el2) => el2["up_total"] - el1["up_total"])
      .slice(0, 10);
  }

  my_chart;
  init_chart(data): void {
    let chart_dom = document.getElementById("chart_stock_day_index")!;
    chart_dom.style.height = window.innerHeight - 275 + "px";
    chart_dom.style.width = "100%";
    if (this.my_chart == null) {
      this.my_chart = echarts.init(chart_dom);
    }
    let category = ["股淘", "上证", "沪深300", "中证500", "科创50"];
    let formatter: string = "";
    for (let i = 0; i < category.length; i++) {
      formatter = formatter + "{a" + i + "}：{c" + i + "}  %<br/>";
    }

    let option = {
      title: {
        text: "股淘指数",
      },
      tooltip: {
        trigger: "axis",
        // formatter: formatter,
        valueFormatter: (value) => value + " %",
      },
      legend: {
        data: category,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data["days"],
      },
      yAxis: {
        axisLabel: { show: true, formatter: "{value} %" },
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1, 2, 3, 4],
          start: 70,
          end: 100,
        },
      ],
      series: [
        {
          name: "股淘",
          type: "line",
          stack: "Total",
          data: data["ai_index"],
        },
        {
          name: "上证",
          type: "line",
          stack: "Total",
          data: data["sz_index"],
        },
        {
          name: "沪深300",
          type: "line",
          stack: "Total",
          data: data["hs300"],
        },
        {
          name: "中证500",
          type: "line",
          stack: "Total",
          data: data["zz500"],
        },
        {
          name: "科创50",
          type: "line",
          stack: "Total",
          data: data["kc50"],
        },
      ],
    };
    option && this.my_chart.setOption(option);
  }

  selectRow(code){
    // this.router.navigate(["observed/detail"], {queryParams:{stock_id: code}});
    const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['observed/detail'], {queryParams:{stock_id: code}}));
    window.open(fullUrl, '_blank');
  }

  selectHotTrade(event){
    this.industryStocks.forEach(el=>{
      if(event == el.title){
        let stocks = el.stocks;
        this.parseTableDataStocks(el.title, stocks);
      }
    });
  }

  selectUpTrade(event){
    
    this.industryUpStocks.forEach(el=>{
      if(event == el.title){
        let stocks = el.stocks;
        this.parseTableDataStocks(el.title, stocks);
      }
    });
  }
}
