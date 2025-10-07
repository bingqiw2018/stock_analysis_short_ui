import {  Component,  OnInit,  ViewChild,  ChangeDetectorRef,  AfterViewInit,  OnChanges,  SimpleChanges} from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpParams } from "@angular/common/http";
import { LayoutService } from "src/app/core/services/layout.service";
import { StockService } from "src/app/core/services/stock.service";
import { environment } from "../../../../environments/environment";
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import * as moment from 'moment';
import {FormGroup, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 
  'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray', 'whitesmoke'
  ];
@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
})
export class CashFlowComponent implements OnInit, AfterViewInit, OnChanges {
  public loading = false;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  
  startDate: string;
  endDate: string;

  // Table
  displayedColumns: string[] = ['code', 'name', 'status', 'price','ratio', 'add_price','in_price','out_price',  'in_date', 'out_date',  'add_date', 'mod_date',  'basic_section_industry', 'basic_section_region'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>
  ) {
    
  }

  ngOnInit() {
    
    this.startDate = moment().subtract(7,'days').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    
    this.queryTrend();  
    this.queryTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      // if("time_type" == propName && this.stock_id){
      //   this.query();
      // }
    }
  }

  ngAfterViewInit(): void {
    
  }
  
  // Table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Table
  queryTable(loading=false): void {
    let url = environment.apiUrls.getKlineCashFlowEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    if(this.startDate && this.endDate){
      let start = moment(this.startDate).format('YYYY-MM-DD');
      let end = moment(this.endDate).format('YYYY-MM-DD');
      httpParams = httpParams.set("range", start+","+end);
    }
    url = root + url;
    if(loading){
      this.loading = true;
    }
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      if(loading){
        this.loading = false;
      }
      
      const stocks = [];
      data.forEach((item)=>{
        item.add_date = moment(item.add_date).format('YYYY-MM-DD');
        item.mod_date = moment(item.mod_date).format('YYYY-MM-DD');
        item.in_date = item.in_time ? moment(item.in_time).format('YYYY-MM-DD') : '';
        item.out_date = item.out_time ? moment(item.out_time).format('YYYY-MM-DD') : '';
        if(item.status == 0){
          item.status = '已关注';
          item.observed_color = COLORS[15];
        }else if(item.status == 1){
          item.status = '已买入';
          item.observed_color = COLORS[1];
        }else if(item.status == -1){
          item.status = '已卖出';
          item.observed_color = COLORS[5];
        }

        if(item.ratio && item.ratio< 0){
          item.color = COLORS[5];
        }else if(item.ratio && item.ratio > 0){
          item.color = COLORS[1];
        }else{
          item.color = COLORS[15];
        }

        let stock_item = this.httpService.parse_stock({'code': item.code, 'name':item.name, 'status':item.status, 'observed_color': item.observed_color, 'price':item.price,  'in_price':item.in_price,'out_price':item.out_price, 'add_price':item.add_price, 'in_date': '入：'+item.in_date, 'out_date': '清：'+item.out_date, 'ratio':item.ratio, 'basic_section_industry':item.basic_section_industry, 'basic_section_region':item.basic_section_region, 'add_date':'关：'+item.add_date, 'mod_date':'更：'+item.mod_date, 'color': item.color});
        stocks.push(stock_item);
      });
      // Assign the data to the data source for the table to render
      this.dataSource = new MatTableDataSource(stocks);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.cdr.markForCheck();
    });
  }

  chartTrend = [];
  chartCategory = [];
  chartTrendTitle = {title:"资金流动跟踪", xAxisTitle: "更新时间"};
  queryTrend(): void {
    let url = environment.apiUrls.getKlineCashFlowEvent;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();

    if(this.startDate && this.endDate){
      let start = moment(this.startDate).format('YYYY-MM-DD');
      let end = moment(this.endDate).format('YYYY-MM-DD');
      httpParams = httpParams.set("range", start+","+end);
    }

    httpParams = httpParams.set("action", "all");

    url = root + url;
    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.loading = false;
      let chartDataOut = {data:[],name:'卖出',type:'line'};
      let chartDataIn = {data:[],name:'买入',type:'line'};

      let category = [];
      data.forEach((el) => {
        chartDataOut.data.push({date: el["mod_date"], value: el["out_observed"]});
        chartDataIn.data.push({date: el["mod_date"], value: el["in_observed"]});
        category.push(el["mod_date"]);
      });
      this.chartTrend = [chartDataOut,chartDataIn];
      this.chartCategory = category;
      this.cdr.markForCheck();
    });
  }

  clickedRows = new Set<any>();
  selectRow(code){
    // this.router.navigate(["observed/detail"], {queryParams:{stock_id: code}});
    const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['observed/detail'], {queryParams:{stock_id: code}}));
    
    window.open(fullUrl, '_blank');
  }

  onSearch(){
    this.queryTrend();  
    this.queryTable(true);
  }
}

