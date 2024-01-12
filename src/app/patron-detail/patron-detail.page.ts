import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { EventService } from '../serviceEvent/event.service';

@Component({
  selector: 'app-patron-detail',
  templateUrl: './patron-detail.page.html',
  styleUrls: ['./patron-detail.page.scss'],
})
export class PatronDetailPage implements OnInit {
  tabData = [];
  selectedTab: string
  constructor(
    private router: Router,
    private translate: TranslateService,
    private navCtrl: NavController,
    private events: EventService,
  ) {
   }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.tabData = this.getTabData();
    });
  }

  ionViewDidLoad() {
  }
  ionViewWillEnter() {
    const districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    // const districtFeaturelist = {"IntSiteId":2,"IntDistrictId":4,"DistrictName":"Sulphur","Lunch":true,"LunchSortOrder":20,"LunchActivity":true,"LunchActivitySortOrder":0,"Fees":true,"FeesSortOrder":30,"SourceAccount":false,"SourceAccountSortOrder":10,"Forms":false,"FormsSortOrder":0,"Format":true,"FormatSortOrder":0,"BonusAccount":false,"PaymentMethod":"Both","QuikLunch":true,"QuikLunchRestriction":true,"ARExpireDate":null,"QuikApps":{"HasPortalLicense":true,"EndYear":2020,"ShowEthinicityRace":true}}
    const tabData = this.getTabData();
    if( tabData !==undefined){
      tabData.sort((a, b) => {
        if (a.sortOrder < b.sortOrder) return -1;
        else if (a.sortOrder > b.sortOrder) return 1;
        else return 0;
      });
      const filteredData = tabData.filter((data:any) => {
        if (data.showTab) {
          return data;
        }
      })
      this.selectedTab = filteredData[0].tabValue;
      this.navCtrl.navigateRoot(filteredData[0].route)
      // this.router.navigate([filteredData[0].route]);
      this.tabData = tabData;
    }
    
    // if (districtFeaturelist.Lunch) {
    //   this.selectedTab = 'meals';
    //   this.router.navigate(['/dashboard/patron-detail/meals']);
    // } else if (districtFeaturelist.Fees) {
    //   this.selectedTab = 'fees';
    //   this.router.navigate(['/dashboard/patron-detail/fees']);
    // } else if (districtFeaturelist.SourceAccount) {
    //   this.selectedTab = 'fund';
    //   this.router.navigate(['/dashboard/patron-detail/fund']);
    // }
  }


  getTabData() {
    const districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    let FundraiserShow=false
    if( districtFeaturelist !== null){
      if(districtFeaturelist.FeeSettings.Fundraiser || districtFeaturelist.FeeSettings.AllowGuest){
        FundraiserShow=true
      }

      const tabData = [
        {
          "tabValue": "meals",
          "tabTitle": this.translate.instant('Meal'),
          "tabIcon": "restaurant",
          "showTab": districtFeaturelist.Lunch,
          "sortOrder": districtFeaturelist.LunchSortOrder,
          "route": "/dashboard/patron-detail/meals",
          "tabImg1":"../../assets/icon/meal.svg",
          "tabImg2":"../../assets/icon/meal-selected.svg"
        },
        {
          "tabValue": "fees",
          "tabTitle": this.translate.instant('fees'),
          "tabIcon": "pie",
          "showTab": districtFeaturelist.Fees,
          "sortOrder": districtFeaturelist.FeesSortOrder,
          "route": "/dashboard/patron-detail/fees",
          "tabImg1":"../../assets/icon/fees.svg",
          "tabImg2":"../../assets/icon/fees-selected.svg"
        },
        {
          "tabValue": "fund",
          "tabTitle": this.translate.instant('Fund'),
          "tabIcon": "wallet",
          "showTab": districtFeaturelist.SourceAccount,
          "sortOrder": districtFeaturelist.SourceAccountSortOrder,
          "route": "/dashboard/patron-detail/fund",
          "tabImg1":"../../assets/icon/fund.svg",
          "tabImg2":"../../assets/icon/fund-selected.svg"
        },
        {
          "tabValue": "fundraiser",
          "tabTitle": this.translate.instant('Fundraiser'),
          "tabIcon": "logo-usd",
          "showTab": FundraiserShow,
          "sortOrder": districtFeaturelist.FeeSettings.FundraiserSortOrder,
          "route": "/dashboard/patron-detail/fundraiser",
          "tabImg1":"../../assets/icon/fundraiser.svg",
          "tabImg2":"../../assets/icon/fundraiser-selected.svg"
        },
      ]
      if(this.router.url === '/dashboard/patron-detail/fund' || this.router.url === '/dashboard/patron-detail/fees'){
      let route = this.router.url.split("/");
      this.selectedTab =  route[route.length - 1];
      }

      return tabData;
    }else{
      return undefined;
    }
   

    
  }

  selectTab(event:string){
    this.selectedTab = event;
  }
}
