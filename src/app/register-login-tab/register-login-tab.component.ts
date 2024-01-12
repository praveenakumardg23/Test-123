import { LanguageService } from './../services/language/language.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from './../auth/auth.service';
import { IonContent, AlertController,PopoverController } from '@ionic/angular';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { TabHeaderService } from '../services/tab-header/tab-header.service';
import { SharedService } from '../services/shared/shared.service';
import { EventService } from '../serviceEvent/event.service';
import { HelppopupComponent } from '../helppopup/helppopup.component';
@Component({
  selector: 'app-register-login-tab',
  templateUrl: './register-login-tab.component.html',
  styleUrls: ['./register-login-tab.component.scss'],
})
export class RegisterLoginTabComponent implements OnInit {
  @ViewChild(IonContent, { read: IonContent, static: false }) myContent: IonContent;
  screenName = 'login';
  activeTab: number;
  phase: string;
  languages = [{ DisplayName: 'English' }, { DisplayName: 'Espanol' }]
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    setWrapperSize: false,
    autoHeight: true
  };
  selectedlang:any;
  @ViewChild('slides', { static: true }) slides;
  constructor(
    private router: Router,
    private tabHeaderService: TabHeaderService,
    public alertController: AlertController,
    private authService: AuthService,
    private sharedService: SharedService,
    public languageService: LanguageService,
    private event:EventService,
    public popoverController: PopoverController) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
      }

      if (event instanceof NavigationEnd) {
        this.updateTab(event);
      }
    })
    // this.event.subscribe('langChangeEvent',data=>{
    // this.selectedlang=data;
    // })
  }

  ngOnInit() {
    if(localStorage.selectedLangCode)
    {
      this.selectedlang= localStorage.selectedLangCode==1?'Eng US':'Esp US)'
    }
    this.sharedService.appPhase.next('register');
    this.sharedService.appPhase.subscribe((phase) => {
      this.phase = phase;
    })
    this.tabHeaderService.activeTab.subscribe((tabnum) => {
      this.activeTab = tabnum;
      if (tabnum == 0) {
        this.screenName = 'login';
      } else {
        this.screenName = 'register';
      }
    })
  }
  async presentPopover() {
    const popover = await this.popoverController.create({
      component: HelppopupComponent,
      showBackdrop:false,
    });
    popover.style.cssText = '--min-width: 50px; --max-width: 80px;top: -40%;left :30%';
    return await popover.present();
  }
  updateTab(event) {

    if (event.url == '/login') {
      this.screenName = 'login';
      this.tabHeaderService.activeTab.next(0);
    } else if (event.url == '/register') {
      this.tabHeaderService.activeTab.next(1);
      this.screenName = 'register';
    } else if (event.url == '/reset-password') {
      this.tabHeaderService.activeTab.next(2);
      this.screenName = 'register';
    } else if (event.url == '/security-questions') {
      this.tabHeaderService.activeTab.next(3);
      this.screenName = 'register';
    } else if (event.url == '/manage-patrons') {
      this.tabHeaderService.activeTab.next(4);
      this.screenName = 'register';
    } else if (event.url == '/manage-payment-methods') {
      this.tabHeaderService.activeTab.next(5);
      this.screenName = 'register';
    } else if (event.url == '/notifications') {
      this.tabHeaderService.activeTab.next(6);
      this.screenName = 'register';
    }
  }

  switchTo(page) {
    this.screenName = page;
    if (this.screenName == 'login') {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['register']);
    }
  }


  languageChange() {
    this.languageService.displayLanguageAlert();
  }

  onLogout() {
    this.authService.logout('logout');
  }

}
