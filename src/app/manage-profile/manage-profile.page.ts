import { AppConfiguration } from './../app-configuration';
import { SharedService } from './../services/shared/shared.service';
import { GetLanguagesResponse } from './../services/data/model/registration';
import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '../services/data/data.service';
import { Storage } from '@ionic/storage';
import { NgForm } from '@angular/forms';
import { ProfileDetails } from '../services/data/model/profile';
import { AlertService } from './../services/alert/alert.service';
import { PhoneMaskDirective } from './../directives/phone-mask.directive';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LanguageService } from './../services/language/language.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

@Component({
  selector: 'app-manage-profile',
  templateUrl: './manage-profile.page.html',
  styleUrls: ['./manage-profile.page.scss'],
})
export class ManageProfilePage implements OnInit {

  @ViewChild('f', { static: true }) ngForm: NgForm;
  languages: any;
  states: any;
  countries: any;
  langResponse: GetLanguagesResponse;
  showSecurityQues = false;
  userData: any;
  userEmail: string;
  emailChangeHint = false;
  emailID: string;
  updateButton: boolean;
  formChangesSubscription;
  cartCount: number;
  errormessage;
  oldUserinfo: any;
  modalClass:string;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  readonly phoneMask: MaskitoOptions = {
    mask: ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  };
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();
  constructor(private dataService: DataService,
    private storage: Storage,
    public alertController: AlertController,
    private router: Router,
    private sharedService: SharedService,
    private appConfiguration: AppConfiguration,
    public alertService: AlertService,
    private translate: TranslateService,
    public languageService: LanguageService,
    private fb: FormBuilder,
    private menu: MenuController) {

    this.userData = {
      FirstName: '',
      LastName: '',
      UserName: '',
      Address1: '',
      Address2: '',
      PostalCode: '',
      City: '',
      State: null,
      PhoneNumber: null,
      SMSNumber: null,
      IntLanguageId: '',
      CountryCode: '',
      PreferredComm: 'E',
      UserEmail: '',
      UserText: ''
    };

    this.sharedService.refreshManageProfile.subscribe((status) => {
      if (status) {
        this.getUserInfo('load');
      }
    })
  }



  ngOnInit() {
    this.updateButton = false;

    this.formChangesSubscription = this.ngForm.valueChanges.subscribe((changedObj: any) => {
      const obj = changedObj
      if (changedObj.PhoneNumber) {
        obj.PhoneNumber = changedObj.PhoneNumber.replace(/[^0-9]*/g, '');
      }
      if (changedObj.SMSNumber) {
        obj.SMSNumber = changedObj.SMSNumber.replace(/[^0-9]*/g, '');
      }

      const status = this.getStatus(obj, this.oldUserinfo);
      if (status) {
        this.updateButton = true;
      } else {
        this.updateButton = false;
      }
    })
  }
  processemail(text) {
    if(text) {
    this.userData.UserName = text.trim().toString();
    }
  }
  ionViewWillEnter() {
    this.sharedService.loading.next(true);
    this.getUserInfo('init');
    this.updateButton = false;
    this.getProfileLanguages();
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
  }

  getProfileLanguages() {
    this.sharedService.loading.next(true);
    this.dataService.getProfileLanguages()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          console.log("response", response)
          
          this.languages = response.body.Languages;
          var temp = 0;
          for (var i = 1; i < this.languages.length; i++) {
            for (var j = i; j < this.languages.length; j++) {
              if (this.languages[j].DisplayName < this.languages[i].DisplayName) {
                temp = this.languages[j];
                this.languages[j] = this.languages[i];
                this.languages[i] = temp;
              }
            }
          }
          // console.log("this.languages", this.languages)
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }


  getProfileStates() {
    this.sharedService.loading.next(true);
    this.dataService.getProfileStates()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.states = response.body.States;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getProfileCountry() {
    this.sharedService.loading.next(true);
    this.dataService.getProfileCountry()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.countries = response.body.Countries;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  onProfileSubmit(formData: NgForm) {
    this.updateButton = false;
    if (this.userEmail != formData.value.UserName) {
      const alert = this.alertController.create({
        header: this.translate.instant('email_change'),
        message: this.translate.instant('email_change_alert'),
        inputs: [
          {
            name: 'password',
            type: 'password',
            placeholder: this.translate.instant('enter_password')
          }
        ],
        backdropDismiss: false,
        buttons: [
          {
            text: this.translate.instant('cancel'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              this.updateButton = true;
            }
          }, {
            text: this.translate.instant('ok'),
            handler: (data) => {
              this.emailChangeHint = false;
              const reqObj = {
                UserName: this.userEmail,
                Password: data.password,
                NewEmail: formData.value.UserName,
                LoginUrl: this.appConfiguration.confirmation_url
              };
              this.dataService.changeEmail(reqObj).subscribe(
                (response: any) => {
                  this.emailChangeHint = true;
                  this.sharedService.loading.next(false);
                  if (response.body.APIStatus == 'Success' && response.status == 200) {
                    this.saveUserInfo(formData);

                  } else {
                    const message = this.translate.instant("change_email")
                    this.alertService.failureToast(message);

                    //this.alertService.checkPEProcessingMessages(response.body, message);
                  }
                },
                (error) => {
                  this.emailChangeHint = false;
                  console.log(error);
                }
              )
            }
          }
        ]
      });
      alert.then((val) => {
        val.present();
      });
    } else {
      this.saveUserInfo(formData);
    }
  }

  saveUserInfo(formData: NgForm) {
    let payload: ProfileDetails = formData.value;
    payload.UserName = this.userEmail;
    const filteredPhoneNumber = formData.value.PhoneNumber.replace(/[^0-9]*/g, '');
    const filteredSMSNumber = formData.value.SMSNumber.replace(/[^0-9]*/g, '');
    if ((filteredPhoneNumber.length == 10 || filteredPhoneNumber.length == 0) && (filteredSMSNumber.length == 10 || filteredSMSNumber.length == 0)) {
      this.sharedService.loading.next(true);
      payload.PhoneNumber = filteredPhoneNumber;
      payload.SMSNumber = filteredSMSNumber;
      this.dataService.updateProfile(payload).subscribe((response: any) => {
        this.sharedService.loading.next(false);
        const message = !this.emailChangeHint ? this.translate.instant('profile_successfully_updated1') : this.translate.instant('profile_successfully_updated2')
        if (response.body.APIStatus == 'Success' && response.status == 200) {
          this.updateButton = false;
          this.getUserInfo('load')
          this.alertService.successAlert(message);
        }
        else if (response.body.APIStatus == "Error") {

          if (response.body.PEProcessingMessages) {
            if (response.body.PEProcessingMessages.length === 1) {
              const message = this.translate.instant('updatingprofile_error') + response.body.PEProcessingMessages[0]
              this.alertService.failureToast(message);
            }
            else {
              this.errormessage = this.translate.instant('updatingprofile_error');
              for (var i = 0; i < response.body.PEProcessingMessages.length; i++) {
                this.errormessage += response.body.PEProcessingMessages[i] + ", ";
              }
              const message = this.errormessage.replace(/,\s*$/, "")
              this.alertService.failureToast(message);

            }
          } else if (response.body.PEProcessingMessages === '' || response.body.PEProcessingMessages === null) {
            const message = response.body.APIStatusReason
            this.alertService.failureToast(message);

          }
        }
        // else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
        //   const message = 'This error has been logged. Please contact support if you require further assistance';
        //   this.alertService.failureToast(message);
        // } else {
        //   const message = 'Error due to -';
        //   this.alertService.checkPEProcessingMessages(response.body, message);
        // }
      },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        })
    } else {
      if (filteredPhoneNumber.length > 0 && filteredPhoneNumber.length < 10) {
        this.updateButton = true;
        const message = this.translate.instant('ph_valid');
        this.alertService.failureToast(message);
      } else if (filteredSMSNumber.length > 0 && filteredSMSNumber.length < 10) {
        this.updateButton = true;
        const message = this.translate.instant('mb_valid');
        this.alertService.failureToast(message);
      }
    }
  }

  getUserInfo(data) {
    this.sharedService.loading.next(true);
    this.dataService.getUserInfo()
      .subscribe(
        (response: any) => {
          const oldUserInfo = {
            "IntLanguageId": response.body.IntLanguageId,
            "UserName": response.body.UserName,
            "FirstName": response.body.FirstName,
            "LastName": response.body.LastName,
            "Address1": response.body.Address1,
            "Address2": response.body.Address2,
            "PostalCode": response.body.PostalCode,
            "City": response.body.City,
            "State": response.body.State,
            "CountryCode": response.body.CountryCode,
            "PhoneNumber": response.body.PhoneNumber,
            "SMSNumber": response.body.SMSNumber,
            "PreferredComm": 'E'
          }
          this.oldUserinfo = oldUserInfo;

          if (data == 'init') {
            this.getProfileStates();
            this.getProfileCountry();
            this.userData = response.body;
            this.userData.PreferredComm = 'E';
            this.userEmail = response.body.UserName;
          } else if (data == 'load') {
            const userInfo = response.body;
            delete userInfo.ACHStatus;
            delete userInfo.APIStatus;
            delete userInfo.APIStatusReason;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            this.languageService.setLanguage();
            this.userData = response.body;
            this.userEmail = response.body.UserName;
            this.userData.PreferredComm = 'E';
          }
          const PhoneNumber = response.body.PhoneNumber;
          const SMSNumber = response.body.SMSNumber;
          response.body.PhoneNumber = '';
          response.body.SMSNumber = '';
          setTimeout(() => {
            this.userData.PhoneNumber = PhoneNumber;
            this.userData.SMSNumber = SMSNumber;
            this.sharedService.loading.next(false);
          }, 1000)
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  commChanged(formData: NgForm) {
    this.updateButton = true;
  }

  onToggle() {
    this.showSecurityQues = !this.showSecurityQues;
  }
  onInfo() {
    const alert = this.alertController.create({
      header: this.translate.instant('info'),
      message: this.translate.instant('Information_content'),
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
        }
      }
      ]
    });

    alert.then((res) => {
      res.present();
    })
  }

  onGotoCart(formData: NgForm) {
    const status = this.getStatus(formData.value, this.oldUserinfo);
    if (formData.valid && status) {
      this.changesNotSavedAlert(formData, 'cart', '');
    } else {
      this.router.navigate(['/dashboard/cart']);
    }

  }

  onGotoDashboard(formData: NgForm) {
    const status = this.getStatus(formData.value, this.oldUserinfo);
    if (formData.valid && status) {
      this.changesNotSavedAlert(formData, 'dashboard', '');
      return false;
    } else {
      this.router.navigate([this.redirectToDashboard]);
      return false;
    }
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }

  onMenuClick(formData: NgForm, button) {
    const status = this.getStatus(formData.value, this.oldUserinfo);
    if (formData.valid && status) {
      this.changesNotSavedAlert(formData, 'menu', '');
    }
  }

  getStatus(a, b) {
    const s1 = (a.IntLanguageId == b.IntLanguageId) && (a.UserName == b.UserName) && (a.FirstName == b.FirstName) && (a.LastName == b.LastName)
    const s2 = (a.Address1 == b.Address1) && (a.Address2 == b.Address2) && (a.PostalCode == b.PostalCode) && (a.City == b.City)
    const s3 = (a.State == b.State) && (a.CountryCode == b.CountryCode) && (a.PhoneNumber == b.PhoneNumber) && (a.SMSNumber == b.SMSNumber)

    if (s1 && s2 && s3) {
      return false;
    } else {
      return true;
    }
  }

  changesNotSavedAlert(formData, button, type) {
    const alert = this.alertController.create({
      message: this.translate.instant('warning_main_msg'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          handler: (blah) => {
            if (button == 'menu') {
              this.menu.close();
            }
          }
        }, {
          text: this.translate.instant('Continue'),
          handler: () => {
            if (button == 'cart') {
              this.router.navigate(['/dashboard/cart']);
            } else if(button == 'dashboard') {
              this.router.navigate([this.redirectToDashboard]);
            }
          }
        }]
    });

    alert.then((res) => {
      res.present();
    })
  }

  langChange(langId) {
    // if (langId == 2) {
    //   this.translate.use('es');
    // } else {
    //   this.translate.use('en');
    // }
    if (langId == 8) {
      this.translate.use('uz');
      this.languageService.langDir ='ltr';
      localStorage.setItem('selectedLangCode', langId);
    }else if(langId == 2) {
      this.translate.use('es');
      this.languageService.langDir ='ltr';
      localStorage.setItem('selectedLangCode', langId);
    }else if(langId == 3) {
      this.translate.use('ar');
      this.languageService.langDir ='rtl';
      localStorage.setItem('selectedLangCode', langId);
    }else if (langId === 4){
      this.translate.use('ja');
      this.languageService.langDir ='ltr';
      localStorage.setItem('selectedLangCode', langId);
    }else if (langId === 5){
      this.translate.use('ko');
      this.languageService.langDir ='ltr';
      localStorage.setItem('selectedLangCode', langId);
    }else if (langId === 6){
      this.translate.use('ru');
      this.languageService.langDir ='ltr';
      localStorage.setItem('selectedLangCode', langId);
    }else if (langId === 7){
      this.translate.use('zh');
      this.languageService.langDir ='ltr';
      localStorage.setItem('selectedLangCode', langId);
    } else {
      this.translate.use('en');
      this.languageService.langDir ='ltr';
      localStorage.setItem('selectedLangCode', langId);
    }
    let classLi = document.getElementById('modalDir').classList;
    this.modalClass = (this.languageService.langDir === "rtl")? 'directionRTL':'directionLTR';
    classLi.remove("directionRTL");
    classLi.remove("directionLTR");
    classLi.add(this.modalClass);
    sessionStorage.setItem('selectedLangCode', langId);
  }

  ionViewWillLeave() {
    let selectedLangCode = localStorage.getItem('selectedLangCode');
    if(selectedLangCode){
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      this.langChange(selectedLangCode);
    }else{
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      this.langChange(userInfo.IntLanguageId);
    }
    
    
  }
}
