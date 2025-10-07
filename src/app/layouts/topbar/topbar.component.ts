import { Component, OnInit, Output, EventEmitter, Inject, ChangeDetectorRef} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { AuthfakeauthenticationService } from "../../core/services/authfake.service";
import { environment } from "../../../environments/environment";
import { CookieService } from "ngx-cookie-service";
import { LanguageService } from "../../core/services/language.service";
import { TranslateService } from "@ngx-translate/core";
import { HttpParams } from '@angular/common/http';
import { StockService } from "src/app/core/services/stock.service";

export interface Stock {
  code: string;
  name: string;
  type: string;
  start: string;
  end: string;
  high: string;
  low: string;
  ratio: number;
  price: string;
  end_volume: string;
  end_price: string;
  range: string;
  hand_ratio: string;
  date: string;
  color: string;
}

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})

/**
 * Topbar component
 */
export class TopbarComponent implements OnInit {
  element: any;
  cookieValue: any;
  flagvalue: any;
  countryName: any;
  valueset: any;

  stocks: any = [    
  ];
  stocks_source: any = [];
  curStock: any = "";
  constructor(
    private cdr: ChangeDetectorRef,
    public httpService: StockService<any>,
    @Inject(DOCUMENT) private document: any,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
    public languageService: LanguageService,
    public translate: TranslateService,
    public _cookiesService: CookieService
  ) {}

  listLang: any = [
    { text: "China", flag: "assets/images/flags/us.jpg", lang: "ch" },
    { text: "English", flag: "assets/images/flags/us.jpg", lang: "en" },
    { text: "Spanish", flag: "assets/images/flags/spain.jpg", lang: "es" },
    { text: "German", flag: "assets/images/flags/germany.jpg", lang: "de" },
    { text: "Italian", flag: "assets/images/flags/italy.jpg", lang: "it" },
    { text: "Russian", flag: "assets/images/flags/russia.jpg", lang: "ru" },
  ];

  openMobileMenu: boolean;

  @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();

  user: any;

  ngOnInit() {
    this.openMobileMenu = false;
    this.element = document.documentElement;

    this.cookieValue = this._cookiesService.get("lang");
    const val = this.listLang.filter((x) => x.lang === this.cookieValue);
    this.countryName = val.map((element) => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) {
        this.valueset = "assets/images/flags/us.jpg";
      }
    } else {
      this.flagvalue = val.map((element) => element.flag);
    }
    // this.query();
    this.user = this.authService.getAuthFromLocalStorage().user;
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  /**
   * Toggles the right sidebar
   */
  toggleRightSidebar() {
    this.settingsButtonClicked.emit();
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    // event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Logout the user
   */
  logout() {
    if (environment.defaultauth === "firebase") {
      this.authService.logout();
    } else {
      this.authFackservice.logout();
    }
    this.router.navigate(["/account/login"]);
  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle("fullscreen-enable");
    if (
      !document.fullscreenElement &&
      !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement
    ) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  onChange(event) {
    let matched = this.stocks_source.filter(el => el.name.indexOf(this.curStock)>-1);
    
    if(matched.length<5){
      this.stocks = matched;
    }else{
      this.stocks = [];
    }
  }

  onInput(event) {
    this.stocks.forEach((element) => {
      if (element.name == this.curStock) {
        // this.router.navigate(["observed/detail"], {queryParams:{stock_id: element.code}});
        window.open("#observed/detail?"+"stock_id="+element.code);
      }
    });
  }

  query(){
    let url = environment.apiUrls.getStocks;
    const root = environment.apiRoot;
    const httpParams = new HttpParams()
    url = root + url;
    const sb = this.httpService.get<any>(url, httpParams).subscribe((data) => {
      this.stocks_source = [];
      this.stocks = [];
      if(data && data['stocks']){
        data['stocks'].forEach(el => el['name']= '('+el['code']+')'+el['name'])
        this.stocks_source = data['stocks'];
      }else{
      }
      this.cdr.markForCheck();
    });
  }
}
