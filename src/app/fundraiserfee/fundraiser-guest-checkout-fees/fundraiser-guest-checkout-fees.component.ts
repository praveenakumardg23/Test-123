import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data/data.service';
import { LanguageService } from 'src/app/services/language/language.service';
import { SharedService } from 'src/app/services/shared/shared.service';
import { NgForm } from '@angular/forms';
import { AlertService } from 'src/app/services/alert/alert.service';
import { FundraiserserviceService } from '../fundraiserservice/fundraiserservice.service';
import { Router } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { HelppopupComponent } from 'src/app/helppopup/helppopup.component';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-fundraiser-guest-checkout-fees',
  templateUrl: './fundraiser-guest-checkout-fees.component.html',
  styleUrls: ['./fundraiser-guest-checkout-fees.component.scss'],
})
export class FundraiserGuestCheckoutFeesComponent implements OnInit {

  pageHeader: string;
  states: any;
  districts: any;
  selectedDistrict: any;
  selectedSchool: any = 0;
  schools: any;
  State: any;
  selectedState: any = 0;
  disableDistrict: boolean = false;
  disableSchool: boolean = true;
  districtError: boolean = false;

  constructor(private sharedService: SharedService,
    public languageService: LanguageService,
    private translate: TranslateService,
    private fundraiserService: FundraiserserviceService,
    private alertService: AlertService,
    private router: Router,
    private modalController: ModalController,
    public popoverController: PopoverController,
    private authService: AuthService,) { }

  ngOnInit() {
    this.sharedService.isGuestUser = true;
    this.sharedService.appPhase.next('fundraiser');
    this.sharedService.pageHeaderTitle.subscribe((title: string) => {
      this.pageHeader = title;
    })
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.getStates();
  }

  // alertWithReturnToDashboard() {
  //   this.modalController.dismiss();
  //   const alert = this.alertController.create({
  //     header: "Success",
  //     message: "Payment done Successfully",
  //     backdropDismiss: false,
  //     buttons: [{
  //       text : "Print Reciept",
  //       handler: () => {
  //         this.router.navigate(['/fundraiserfee/payment-reciept'])
  //       }
  //     },
  //     {
  //       text : "Send Email Reciept",
  //       handler: () => {
  //       }
  //     }
  //     ]
  //   });
  //   alert.then((res) => {
  //     res.present();
  //   })
  // }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  getStates() {
    let obj: any = [];

    this.states = obj;
    this.sharedService.loading.next(true);
    this.fundraiserService.getDistrictStates()
      .subscribe(
        (response: any) => {
          response.body.States.forEach((element: any) => {
            this, this.states.push(element);
          });
          this.sharedService.loading.next(false);
          this.getDistricts(0);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getDistrictsByStateId(event, form: NgForm) {
    form.form.controls.District.reset();
    form.form.controls.school.reset();
    this.getDistricts(event);
  }

  getDistricts(val) {
    this.disableDistrict = false;
    this.disableSchool = true;
    if (val === 0) {
      val = null;
    }
    const reqObject = { "IntStateId": val, "CheckGuestSettings": true };
    this.sharedService.loading.next(true);
    this.fundraiserService.getDistrictsByState(reqObject).subscribe
      ((response: any) => {
        this.districtError = false;
        this.sharedService.loading.next(false);
        if (response.body.APIStatus === 'Success' && response.body.Districts.length > 0) {
          this.districts = response.body.Districts;
        }
        else {
          let message: string = '';
          if (response.body.APIStatus === 'Error') {
            this.districtError = true;
            if (response.body.APIStatusReason.includes('No districts assigned')) {
              message = 'Selected State has no districts assigned';
            } else {
              message = response.body.APIStatusReason;
            }
          } else {
            if (response.body.Districts == '') {
              message = "Districts are not available for the guests";
              this.districtError = true;
            }
          }
          if (this.districtError) {
            // this.alertService.fundraiserFailureToast(message);
            this.disableDistrict = true;
          }
        }

      },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  showDisableError() {
    if (this.districtError) {
      this.alertService.fundraiserDistrictErrorToast();
    }
  }

  getSchoolsByDistrictId(event?: any, form?: any) {
    this.disableSchool = false;
    if (form) {
      // form.form.controls.school.reset();
      this.selectedSchool=0;
    }
    if (event) {
      this.selectedDistrict = this.districts.filter((item) => item.DistrictName == event);
      if (this.selectedDistrict.length > 0) {
        let reqObject = {
          'IntDistrictId': this.selectedDistrict[0].IntDistrictId,
          "intSiteId": this.selectedDistrict[0].IntSiteId
        }
        this.fundraiserService.getSchoolsByDistrict(reqObject).subscribe(
          (response: any) => {
            this.schools = response.body.School;
            if (response.body.APIStatus === 'Error') {
              this.alertService.fundraiserFailureToast(response.body.APIStatusReason);
              this.disableSchool = true;
            }
          }, (error) => {
            console.log(error);
          }
        )
      }
    }
  }

  onClearAll(form: NgForm) {
    form.reset();
    this.selectedDistrict = '';
    this.selectedSchool = '';
  }

  onContinue(form: NgForm) {
    let reqObj: any = {
      "IntSiteId": this.selectedDistrict[0].IntSiteId,
      "IntDistrictId": this.selectedDistrict[0].IntDistrictId,
      "IntSchoolId": form.value.school
    }
    if (form.value.school === 0) {
      this.fundraiserService.schoolId = 0;
    } else {
      this.fundraiserService.schoolId = undefined;
    }
    this.fundraiserService.guestCheckoutInfo = reqObj;
    // console.log(reqObj,"reqobj")
    this.onReturn('/fundraiserfee/fundraiser-fees');
  }

  onReturn(param: string) {
    this.router.navigate([param]);
  }

  onGotoCart() {
    this.router.navigate(['/fundraiserfee/cart']);
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: HelppopupComponent,
      showBackdrop:false,
      componentProps: {
        showLogout:"true",
      }
    });
    popover.style.cssText = '--min-width: 50px; --max-width: 88px;top: -40%;left :30%';
    return await popover.present();
  }

  backtoLogin(){
    if (this.sharedService.isGuestUser === true) {
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      sessionStorage.removeItem('Email');
      sessionStorage.removeItem('CCEmail');
      }
    this.authService.logout('logout');
  }
}
