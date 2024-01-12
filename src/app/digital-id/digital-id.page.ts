import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SharedService } from '../services/shared/shared.service';
import { LanguageService } from '../services/language/language.service';
import { DataService } from '../services/data/data.service';
import { Screenshot } from 'awesome-cordova-plugins-screenshot/ngx';
import { AlertService } from './../services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {  Platform } from '@ionic/angular';
import { PreviewAnyFile } from '@awesome-cordova-plugins/preview-any-file/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper';
import html2canvas from 'html2canvas';
import { File } from '@awesome-cordova-plugins/file/ngx';
register();
@Component({
  selector: 'app-digital-id',
  templateUrl: './digital-id.page.html',
  styleUrls: ['./digital-id.page.scss'],
})
export class DigitalIdPage implements OnInit {
  cartCount: number;
  pdfUrl: any;
  selectedPatron: any;
  patrons: any;
  FirstName: any;
  LastName: any;
  IntPatronId: any;
  Active: any;
  SchoolName: any;
  DistrictName: any;
  Homeroom: any;
  selectedPatronData: any;
  Grade: any;
  PatronId: any;
  PictureData: any;
  elementType = 'svg';
  value: any;
  format = 'CODE39';
  lineColor = '#000000';
  width:number = 2;
  height:number = 100;
  displayValue = false;
  fontOptions = '';
  font = 'monospace';
  textAlign = 'center';
  textPosition = 'bottom';
  textMargin = 2;
  fontSize = 20;
  background = '#ffffff';
  margin = 10;
  marginTop = 10;
  marginBottom = 10;
  marginLeft = 10;
  marginRight = 10;
  isDigitalCardDowload = true;
  sliderOne: any;
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1
  };

  get values(): string[] {
    if (this.value) {
      let newvalue;
      newvalue = this.value.toString();
      return newvalue.split('\n');
    }else{
      return null;
    }
  }

  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef<any>;
  @ViewChild('slideWithNav') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  // @ViewChild('slideWithNav', { static: false }) slideWithNav: IonSlides;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');

  constructor(
    private sharedService: SharedService,
    public languageService: LanguageService,
    private dataService: DataService,
    private file:File,
    private screenshot: Screenshot,
    private alertService: AlertService,
    private translate: TranslateService,
    private router: Router,
    private platform: Platform,
    private previewAnyFile: PreviewAnyFile,
    private diagnostic: Diagnostic,
    private androidPermissions: AndroidPermissions
  ) {
    this.sliderOne =
    {
      isBeginningSlide: true,
      isEndSlide: false,
    }
  }

  ngOnInit() {
  }

 

  ionViewWillEnter() {
    this.getUserPatrons();
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
    setTimeout(() => {
      this.swiperReady();
    }, 1000);
    
  }

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
    console.log(this.swiper);
  }
  // Move to previous slide
  slidePrev(object, slideView) {
    this.swiper?.slidePrev();
    this.checkIfNavDisabled(object, slideView);
   
  }

  // Move to Next slide
  slideNext(object, slideView) {
    this.swiper?.slideNext();
    this.checkIfNavDisabled(object, slideView);
  }

  SlideDidChange(object, slideView) {
    slideView.getActiveIndex().then((index: number) => {
      this.IntPatronId = this.patrons[index].IntPatronId;
      this.value = this.patrons[index].PatronId;
      this.patrons.forEach((patron, i) => {
        if (patron.IntPatronId == this.patrons[index].IntPatronId) {
          setTimeout(() => {
            if (this.widgetsContent && index > 0) {
              this.widgetsContent.nativeElement.scrollLeft = ((index + 1) * 50) + 30;
            } else if (this.widgetsContent && index == 0) {
              this.widgetsContent.nativeElement.scrollLeft = 0;
            }
          }, 100);
        }
      });
    });
    this.checkIfNavDisabled(object, slideView);
  }

  // Call methods to check if slide is first or last to enable disable navigation
  checkIfNavDisabled(object, slideView) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }


  checkisBeginning(object, slideView) {
    slideView.isBeginning
  }

  checkisEnd(object, slideView) {
    slideView.isEnd
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          this.sharedService.userPatronsList.next(response.body.Patrons);
          this.sharedService.loading.next(false);
          const patrons = response.body.Patrons.filter(x => x.Active === true);
          this.patrons = patrons;
          this.onSelectedStudent(patrons[0], 0);
          this.selectedPatronData = {
            "type": patrons[0].IntPatronId == "" ? "all" : "individual",
            "data": patrons[0]
          };
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  onSelectedStudent(data, index) {
    this.selectedPatronData = {
      "type": data.IntPatronId == "" ? "all" : "individual",
      "data": data
    };
    this.IntPatronId = this.selectedPatronData.data.IntPatronId;
    this.value = this.selectedPatronData.data.PatronId;
    if(this.swiper) {
      this.swiper?.slideTo(index);
      }
  }

  onDigitalIdDowload() {
    if(this.platform.is('ios')){
      this.takeScreenshot();
    }else{
      this.diagnostic.getExternalStorageAuthorizationStatus()
      .then((state) => {
        if(state === this.diagnostic.permissionStatus.GRANTED){
          this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES, this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]).then((status)  =>{
            if(status.hasPermission){
              this.isDigitalCardDowload = false;
              const idCardName = Math.random()+this.value.toString();
              setTimeout(() => {
                this.screenshot.save('jpg', 100, idCardName).then((res) => {
                  this.isDigitalCardDowload = true;
                  this.alertService.successToast(this.translate.instant('digitalid_success'));
                }, (error) => {
                  this.isDigitalCardDowload = true;
                  this.alertService.failureToast(this.translate.instant('digitalid_failure'))
                  console.log(error);
                });
              }, 300);
            }else{
              this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES, this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
              this.isDigitalCardDowload = false;
              const idCardName = Math.random()+this.value.toString();
              setTimeout(() => {
                this.screenshot.save('jpg', 100, idCardName).then((res) => {
                  this.isDigitalCardDowload = true;
                  this.alertService.successToast(this.translate.instant('digitalid_success'));
                }, (error) => {
                  this.isDigitalCardDowload = true;
                  this.alertService.failureToast(this.translate.instant('digitalid_failure'))
                  console.log(error);
                });
              }, 300);
            }
          });
        }else{
        this.diagnostic.requestExternalStorageAuthorization()
        .then((state) =>{
          this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES, this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]).then((status)  =>{
            console.log("Android Perission status", status);
            if(status.hasPermission){
              this.isDigitalCardDowload = false;
              const idCardName = Math.random()+this.value.toString();
              setTimeout(() => {
                this.screenshot.save('jpg', 100, idCardName).then((res) => {
                  this.isDigitalCardDowload = true;
                  this.alertService.successToast(this.translate.instant('digitalid_success'));
                }, (error) => {
                  this.isDigitalCardDowload = true;
                  this.alertService.failureToast(this.translate.instant('digitalid_failure'))
                  console.log(error);
                });
              }, 300);
            }else{
              this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES, this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
              this.isDigitalCardDowload = false;
              const idCardName = Math.random()+this.value.toString();
              setTimeout(() => {
                this.screenshot.save('jpg', 100, idCardName).then((res) => {
                  this.isDigitalCardDowload = true;
                  this.alertService.successToast(this.translate.instant('digitalid_success'));
                }, (error) => {
                  this.isDigitalCardDowload = true;
                  this.alertService.failureToast(this.translate.instant('digitalid_failure'))
                  console.log(error);
                });
              }, 300);
            }
          }, (err)=>{
            this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_MEDIA_IMAGES, this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
          } )
          
        })
      }
      }).catch(e => console.error(e));
    }
  
   
}

takeScreenshot(){
  this.isDigitalCardDowload = false;
  const idCardName = this.value.toString();
  setTimeout(() => {
    this.screenshot.save('jpg', 100, idCardName).then((res) => {
      this.isDigitalCardDowload = true;
      console.log(res.filePath);
      if (this.platform.is('ios')) {
        this.previewAnyFile.preview(res.filePath)
          .then((preRes: any) => console.log(preRes))
          .catch((preErr: any) => console.error(preErr));
      }
      this.alertService.successToast(this.translate.instant('digitalid_success'));
    }, (error) => {
      this.isDigitalCardDowload = true;
      this.alertService.failureToast(this.translate.instant('digitalid_failure'))
      console.log(error);
    });
  }, 300);
}

}