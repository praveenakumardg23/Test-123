import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { LanguageService } from './../services/language/language.service';
import { SharedService } from '../services/shared/shared.service';
import { DataService } from '../services/data/data.service';
import { AlertService } from '../services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-auto-replenishment',
  templateUrl: './auto-replenishment.page.html',
  styleUrls: ['./auto-replenishment.page.scss'],
})
export class AutoReplenishmentPage implements OnInit {
  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef<any>;
  sliderOne: any;
  cartCount: number;
  patrons: any;
  selectedPatronData: any;
  FirstName: string;
  LastName: string;
  Active: any;
  districtFeature: any;
  subscribers: any = {};
  isIndividualPatron;
  selected:any ='';
  IntPatronId = '';
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1
  };
  data;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  
  constructor(
    private router: Router,
    public languageService: LanguageService,
    private sharedService: SharedService,
    private dataService: DataService,
    private alertService: AlertService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private navCtrl: NavController

  ) {
    this.sliderOne =
    {
      isBeginningSlide: true,
      isEndSlide: false,
    }
  }

  ngOnInit() {
    this.districtFeature = JSON.parse(localStorage.getItem('districtFeaturelist'));
    // this.isIndividualPatron = JSON.parse(localStorage.getItem('selectedPatron'));
    this.isIndividualPatron = this.sharedService.getDashboardAR();
    this.subscribers.getSelectedAR = this.sharedService.getSelectedAR().subscribe((data) => {
      this.isIndividualPatron = data;
    });
    if (this.isIndividualPatron && this.isIndividualPatron.ARType === 'autoreplenishment') {
      this.selected = 'Meal';
    } else if (this.isIndividualPatron && this.isIndividualPatron.ARType !== 'autoreplenishment') {
      this.selected = this.isIndividualPatron.ARType;
    } else if (this.districtFeature.Lunch === false) {
      this.selected = 'FundAccount';
    } else {
      this.selected = 'Meal';
    }
  }

  //   //Move to Next slide
  // slideNext(object, slideView) {
  //   slideView.slideNext(500).then(() => {
  //     this.checkIfNavDisabled(object, slideView);
  //   });
  // }

  // //Move to previous slide
  // slidePrev(object, slideView) {
  //   slideView.slidePrev(500).then(() => {
  //     this.checkIfNavDisabled(object, slideView);
  //   });;
  // }

  // SlideDidChange(object, slideView) {
  //   this.checkIfNavDisabled(object, slideView);
  // }

  // //Call methods to check if slide is first or last to enable disbale navigation  
  // checkIfNavDisabled(object, slideView) {
  //   this.checkisBeginning(object, slideView);
  //   this.checkisEnd(object, slideView);
  // }


  // checkisBeginning(object, slideView) {
  //   slideView.isBeginning().then((istrue) => {
  //     object.isBeginningSlide = istrue;
  //   });
  // }
  // checkisEnd(object, slideView) {
  //   slideView.isEnd().then((istrue) => {
  //     object.isEndSlide = istrue;
  //   });
  // }

  onBack() {
    const previousPath = sessionStorage.getItem('previousPath');
    // this.navCtrl.navigateBack(previousPath);
    const mealPath = '/dashboard/patron-detail/meals';
    const fundPath = '/dashboard/patron-detail/fund';

    const ARType = this.route.snapshot.queryParams['type'];
    if (ARType == 'meal') {
      this.navCtrl.navigateBack(mealPath);
    } else if (ARType == 'fund') {
      this.router.navigate([fundPath])
      // this.navCtrl.navigateBack(fundPath);
    } else {
      this.navCtrl.navigateBack(previousPath);
    }
    // this.router.navigate([previousPath])
  }

  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          const allStudentArray = [
            {
              "FirstName": this.translate.instant('All'),
              "LastName": this.translate.instant('Students'),
              "PictureData": "allStudentPicture",
              "IntPatronId": ""
            }
          ]
          this.sharedService.loading.next(false);
          // const patrons = response.body.Patrons;
          const patrons = response.body.Patrons.filter(item => {
            return (item.Active === true);
          });
          if (patrons.length == 1) {
            this.patrons = patrons;
            this.IntPatronId = patrons[0].IntPatronId;
            this.selectedPatronData = {
              "type": "individual",
              "data": patrons[0]
            }
            localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
          } else {
            this.patrons = allStudentArray.concat(patrons);
          }
          if (this.selectedPatronData.type == 'individual') {
            patrons.forEach((patron, index) => {
              if (patron.IntPatronId == this.selectedPatronData.data.IntPatronId) {
                setTimeout(() => {
                  this.widgetsContent.nativeElement.scrollLeft = ((index + 1) *50) + 30;
                },2000)
              }
            })            
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  onSelectedStudent(data, index) {
    this.data = {
      "ARType": '',
      "PatronDetails": data.IntPatronId,
      "patronIndex": index

    }
    this.sharedService.setDashboardAR(this.data);
    this.sharedService.setSelectedAR(this.data);
    this.selectedPatronData = {
      "type": (data.IntPatronId == "" || !data.IntPatronId) ? "all" : "individual",
      "data": data
    }
    this.FirstName = this.selectedPatronData.data.FirstName;
    this.LastName = this.selectedPatronData.data.LastName;
    this.Active = this.selectedPatronData.data.Active;
    this.IntPatronId = this.selectedPatronData.data.IntPatronId ? this.selectedPatronData.data.IntPatronId : '';
    localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
  }



  ionViewWillEnter() {
    const ARType = this.route.snapshot.queryParams['type'];
    const selectedPatron = JSON.parse(localStorage.getItem('selectedPatron'));
    if (selectedPatron) {
      if (ARType == 'meal') {
        this.selected = 'Meal';
        this.onSelectedStudent(selectedPatron.data, (selectedPatron.type == 'all' ? null : 1))
      } else if (ARType == 'fund') {
        this.selected = 'FundAccount'
        this.onSelectedStudent(selectedPatron.data, (selectedPatron.type == 'all' ? null : 1))
      } else {
        this.selected = 'Meal';
        // const selectedPatron = {
        //   "type": "all",
        //   "data": {
        //     "FirstName": "All",
        //     "LastName": "Students",
        //     "PictureData": "allStudentPicture",
        //     "IntPatronId": ""
        //   }
        // }
        this.onSelectedStudent(selectedPatron.data, null)
      }
    }

    this.getUserPatrons();
    // this.districtFeature = JSON.parse(localStorage.getItem('districtFeaturelist'));
    // // this.isIndividualPatron = JSON.parse(localStorage.getItem('selectedPatron'));
    // this.isIndividualPatron = this.sharedService.getDashboardAR();
    // this.subscribers.getSelectedAR = this.sharedService.getSelectedAR().subscribe((data) => {
    //   this.isIndividualPatron = data;
    // });
    // if (this.isIndividualPatron && this.isIndividualPatron.ARType === 'autoreplenishment') {
    //   this.selected = 'Meal';
    // } else if (this.isIndividualPatron && this.isIndividualPatron.ARType !== 'autoreplenishment') {
    //   this.selected = this.isIndividualPatron.ARType;
    // } else if (this.districtFeature.Lunch === false) {
    //   this.selected = 'FundAccount';
    // } else {
    //   this.selected = 'Meal';
    // }
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
  }

  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  onLangChange() {
    this.languageService.displayLanguageAlert();
  }

  onARSelection(event) {
    this.selected = event.target.value;
    const selectedAR = {
      "ARType": event.target.value,
      "PatronDetails": ''

    }
    this.sharedService.setSelectedAR(selectedAR);
  }

  infoAlert() {
    let message: string;
    let header: string;
    message = this.translate.instant('AR_Instruction')
    header = this.translate.instant('AR_Instruction_title');
    this.alertService.infoAlertNotification(message, header);
  }

}
