import { Component, OnInit,  ViewChild,  OnChanges,  SimpleChanges, Input, Output , EventEmitter} from '@angular/core';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { Router, ActivatedRoute } from "@angular/router";
import { StockService } from 'src/app/core/services/stock.service';
@Component({
  selector: 'app-chart-table',
  templateUrl: './chart-table.component.html',
  styleUrls: ['./chart-table.component.css']
})
export class ChartTableComponent implements OnInit, OnChanges {
  @Input() tableData = [];
  @Input() tableStyle = {};
  @Input() displayedColumns: string[] = ['name', 'add_price', 'in_price', 'price', 'ratio', 'basic_section_industry', 'basic_section_region', 'in_time',  'add_date', 'mod_date'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() filterEvent = new EventEmitter<any>();

  @Input() pageTitle = "";

  constructor(private router: Router, public service: StockService<any>) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {

      if("tableData" == propName && this.tableData && this.tableData.length>0){
        this.initChart();
      }
    }
  }

  // Table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    // console.log(this.dataSource.filteredData);
    this.filterEvent.emit(this.dataSource.filteredData);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  initChart(){

    let stocks = [];
    this.tableData.forEach(item => {
      let stock_item = this.service.parse_stock(item);
      stocks.push(stock_item);
    });

    this.dataSource = new MatTableDataSource(stocks);
    this.dataSource.paginator = this.paginator;    
    this.dataSource.sort = this.sort;
  }

  clickedRows = new Set<any>();
  selectRow(code){
    // this.router.navigate(["observed/detail"], {queryParams:{stock_id: code}});
    const fullUrl = '#'+this.router.serializeUrl(this.router.createUrlTree(['observed/detail'], {queryParams:{stock_id: code}}));
    window.open(fullUrl, '_blank');
  }
}
