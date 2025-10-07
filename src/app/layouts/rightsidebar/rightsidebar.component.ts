import { Component, OnInit } from '@angular/core';
import { EventService } from '../../core/services/event.service';
import { StockService } from 'src/app/core/services/stock.service';
import { LAYOUT_WIDTH, SIDEBAR_TYPE, TOPBAR, LAYOUT_MODE } from '../layouts.model';

@Component({
  selector: 'app-rightsidebar',
  templateUrl: './rightsidebar.component.html',
  styleUrls: ['./rightsidebar.component.scss']
})

/**
 * Rightsidebar component
 */
export class RightsidebarComponent implements OnInit {

  isVisible: string;
  attribute: string;

  width: string;
  sidebartype: string;
  mode: string;
  topbar: string;

  constructor(private eventService: EventService,public stockService: StockService<any>) { }

  ngOnInit() {
    this.width = LAYOUT_WIDTH;
    this.sidebartype = SIDEBAR_TYPE;
    this.topbar = TOPBAR;
    this.mode = LAYOUT_MODE;

    /**
     * horizontal-vertical layput set
     */
    this.attribute = document.body.getAttribute('data-layout');
    const vertical = document.getElementById('is-layout');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
    }
    if (this.attribute == 'horizontal') {
      vertical.removeAttribute('checked');
    }

    const live_show_dom = document.getElementById('is-live-show');
    const live_show = this.stockService.get_live_show();
    if(live_show == 'true'){
      live_show_dom.setAttribute('checked', 'true');
    }else{
      live_show_dom.removeAttribute('checked');
    }
    
  }

  /**
   * Hide the sidebar
   */
  public hide() {
    document.body.classList.remove('right-bar-enabled');
  }

  /**
   * Change Topbar
   */
  changeTopbar(topbar: string) {
    this.topbar = topbar;
    this.eventService.broadcast('changeTopbar', topbar);
  }

  changeShow(event){
    this.stockService.set_live_show(event.target.checked);
    window.location.reload();
  }

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout) {
    if (layout.target.checked == true)
      this.eventService.broadcast('changeLayout', 'vertical');
    else
      this.eventService.broadcast('changeLayout', 'horizontal');
  }

  changeWidth(width: string) {
    this.width = width;
    this.eventService.broadcast('changeWidth', width);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

  changeSidebartype(sidebar: string) {
    this.sidebartype = sidebar;
    this.eventService.broadcast('changeSidebartype', sidebar);
  }

  changeMode(themeMode: string) {
    this.mode = themeMode;
    this.eventService.broadcast('changeMode', themeMode);
  }
}
