import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";
import { LayoutService } from "src/app/core/services/layout.service";
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { StockService } from "src/app/core/services/stock.service";
import { environment } from "../../../../environments/environment";
import { LoaderService } from 'src/app/core/services/loader.service';
@Component({
  selector: 'app-observed-detail',
  templateUrl: './observed-detail.component.html',
  styleUrls: ['./observed-detail.component.css']
})
export class ObservedDetailComponent implements OnInit,AfterViewInit {
  
  thumbImage: string = "https://wittlock.github.io/ngx-image-zoom/assets/thumb.jpg";
  fullImage: string = "https://wittlock.github.io/ngx-image-zoom/assets/fullres.jpg";

  @ViewChild("chart", { static: false }) chart: ChartComponent;
  public loading;
  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private layoutService: LayoutService<any>,
    public httpService: StockService<any>,
    ) {
  }
  onZoomShow(event: any){
  }

  onZoomHide(event: any){
  }

  ngAfterViewInit(): void {
    // this.route.queryParams.subscribe((res)=>{
    //   if(res.stock_id){
    //     this.stock_id = res.stock_id;
    //     this.query();
    //   }
    // });

    // var chipDom = document.getElementById('chip1')!;
    // chipDom.style.height = this.layoutService.getHeight(1520);
    // chipDom.style.overflowY = 'hidden';
    // chipDom.style.paddingTop = '10px';
    
    // // chipDom.style.width = '100%';
    // chipDom = document.getElementById('card1')!;
    // // chipDom.style.height = (window.innerHeight+100)+'px';
    // chipDom.style.height = this.layoutService.getHeight(1490);
    // chipDom.style.width = '100%';
    
  }

  stock_id:string = null;
  cur_stock: any = {};
  chip_peek_location: any = '';
  cur_chips: any;

  query():void{
    let url = environment.apiUrls.getStocks;
    const root = environment.apiRoot;
    let httpParams = new HttpParams();
    // httpParams = httpParams.set('stock_type','');
    url = root + url + '/'+this.stock_id;

    this.loading = true;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      if(data && data['stock']){
        data['stock']['end_price'] = (parseFloat(data['stock']['end_price'])/100000000).toFixed(2);
        data['stock']['total_value'] = (parseFloat(data['stock']['total_value'])/100000000).toFixed(2);
        data['stock']['total_flow_value'] = (parseFloat(data['stock']['total_flow_value'])/100000000).toFixed(2);
        data['stock']['date'] = data['stock']['date'].substring(0,10);
        data['stock']['observed_add_date'] = data['stock']['observed_add_date'] ? data['stock']['observed_add_date'].substring(0,10): ' -- -- ';
        data['stock']['observed_in_time'] = data['stock']['observed_in_time'] ? data['stock']['observed_in_time'].substring(0,10):' -- -- ';
        data['stock']['observed_out_time'] = data['stock']['observed_out_time'] ? data['stock']['observed_out_time'].substring(0,10):' -- -- ';
        data['stock']['observed_in_price'] = data['stock']['observed_in_price'] ? data['stock']['observed_in_price']: ' -- -- ';
        data['stock']['observed_add_price'] = data['stock']['observed_add_price'] ? data['stock']['observed_add_price']:' -- -- ';
        data['stock']['observed_out_price'] = data['stock']['observed_out_price'] ? data['stock']['observed_out_price']:' -- -- ';
        data['stock']['observed_blocks'] = data['stock']['observed_blocks'] ? data['stock']['observed_blocks']:' -- -- ';
        
        if(parseFloat(data['stock']['ratio'])<0){
          data['stock']['ratio_up'] = 'ratio_up_false';
        }else if (parseFloat(data['stock']['ratio'])==0){
          data['stock']['ratio_up'] = 'ratio_up_equal';
        }else{
          data['stock']['ratio_up'] = 'ratio_up_true';
        }

        if(!data['stock']['observed_status']){
          data['stock']['observed_status'] = ' -- -- ';
        }else if(parseFloat(data['stock']['observed_status'])<0){
          data['stock']['observed_status'] = '清仓';
        }else if (parseFloat(data['stock']['ratio'])==0){
          data['stock']['observed_status'] = '观望';
        }else{
          data['stock']['observed_status'] = '买入';
        }
        

        if(!data['stock']['observed_rsi']){
          data['stock']['observed_rsi'] = ' -- -- ';
        }else if(parseFloat(data['stock']['observed_rsi'])<0){
          data['stock']['observed_rsi_up'] = 'ratio_up_false';
          data['stock']['observed_rsi'] = '看跌';
        }else if (parseFloat(data['stock']['ratio'])==0){
          data['stock']['observed_rsi_up'] = 'ratio_up_equal';
          data['stock']['observed_rsi'] = '待定';
        }else{
          data['stock']['observed_rsi_up'] = 'ratio_up_true';
          data['stock']['observed_rsi'] = '看涨';
        }

        if(!data['stock']['observed_kdj']){
          data['stock']['observed_kdj'] = ' -- -- ';
        }else if(parseFloat(data['stock']['observed_kdj'])<0){
          data['stock']['observed_kdj_up'] = 'ratio_up_false';
          data['stock']['observed_kdj'] = '看跌';
        }else if (parseFloat(data['stock']['ratio'])==0){
          data['stock']['observed_kdj_up'] = 'ratio_up_equal';
          data['stock']['observed_kdj'] = '待定';
        }else{
          data['stock']['observed_kdj_up'] = 'ratio_up_true';
          data['stock']['observed_kdj'] = '看涨';
        }
        
        if(!data['stock']['observed_macd']){
          data['stock']['observed_macd'] = ' -- -- ';
        }else if(parseFloat(data['stock']['observed_macd'])<0){
          data['stock']['observed_macd_up'] = 'ratio_up_false';
          data['stock']['observed_macd'] = '看跌';
        }else if (parseFloat(data['stock']['ratio'])==0){
          data['stock']['observed_macd_up'] = 'ratio_up_equal';
          data['stock']['observed_macd'] = '待定';
        }else{
          data['stock']['observed_macd_up'] = 'ratio_up_true';
          data['stock']['observed_macd'] = '看涨';
        }
        
        if(!data['stock']['observed_ratio']){
          data['stock']['observed_ratio'] = ' -- -- ';
        }else if(parseFloat(data['stock']['observed_ratio'])<0){
          data['stock']['observed_ratio_up'] = 'ratio_up_false';
          data['stock']['observed_ratio'] += '%';
        }else if (parseFloat(data['stock']['ratio'])==0){
          data['stock']['observed_ratio_up'] = 'ratio_up_equal';
          data['stock']['observed_ratio'] += '%';
        }else{
          data['stock']['observed_ratio_up'] = 'ratio_up_true';
          data['stock']['observed_ratio'] += '%';
        }

        
        // this.chip_peek_location = url+"/image/chip";
        let stock_item = this.httpService.parse_stock( data['stock']);
        this.cur_stock = stock_item;

      }else{
      }
      // this.loading = false;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((res)=>{
      if(res.stock_id){
        this.stock_id = res.stock_id;
        this.query();
      }
    });
  }

  curStock:string = '';
  onInput(event){
  }

  year_active = '';
  week_active = '';
  month_active = '';
  day_active = 'active';
  min_60_active = '';
  min_15_active = '';
  time_type ;
  onTimeSelector(item){
    if(item == 'year'){
      this.year_active = 'active';
      this.week_active = '';
      this.month_active = '';
      this.day_active = '';
      this.min_60_active = '';
      this.min_15_active = '';
      this.time_type = 'years';
    }else if(item == 'month'){
      this.year_active = '';
      this.week_active = '';
      this.month_active = 'active';
      this.day_active = '';
      this.min_60_active = '';
      this.min_15_active = '';
      this.time_type = 'months';
    }else if(item == 'week'){
      this.year_active = '';
      this.week_active = 'active';
      this.month_active = '';
      this.day_active = '';
      this.min_60_active = '';
      this.min_15_active = '';
      this.time_type = 'weeks';
    }else if(item == 'day'){
      this.year_active = '';
      this.week_active = '';
      this.month_active = '';
      this.day_active = 'active';
      this.min_60_active = '';
      this.min_15_active = '';
      this.time_type = 'days';
    }else if(item == 'min_60'){
      this.year_active = '';
      this.week_active = '';
      this.month_active = '';
      this.day_active = '';
      this.min_60_active = 'active';
      this.min_15_active = '';
      this.time_type = 'min60';
    }else if(item == 'min_15'){
      this.year_active = '';
      this.week_active = '';
      this.month_active = '';
      this.day_active = '';
      this.min_60_active = '';
      this.min_15_active = 'active';
      this.time_type = 'min15';
    }
    // var chipDom = document.getElementById('chip2')!;
    // var url = this.chip_peek_location+"?time_type="+this.time_type;
    // chipDom.setAttribute('src',url);
    this.loading = true;
  }

  changeLoading(event){
    // this.loading = event;
    // console.log(this.loading);
  }

  changeChips(event){
    this.cur_chips = event;
    this.loading = false;
    // console.log(this.loading);
  }

  avg_line_level;
  avg_line_level_class;
  changeAvgLineLevel(event){
    this.avg_line_level = event;
    if(event && event.indexOf('强')>-1){
      this.avg_line_level_class = "avg_line_level_class_up";
    }else if(event && event.indexOf('弱')>-1){
      this.avg_line_level_class = "avg_line_level_class_down";
    }
  }
}
