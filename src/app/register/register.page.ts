import { Component, OnInit } from '@angular/core';
import { TabHeaderService } from '../services/tab-header/tab-header.service';
import { DataService } from '../services/data/data.service';
import { Storage } from '@ionic/storage';
import { NgForm } from '@angular/forms';
import { GetLanguagesResponse, RegistrationDetails } from '../services/data/model/registration';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared/shared.service';
import { TermsPage } from '../terms/terms.page';
import { ModalController } from '@ionic/angular';
import { AlertService } from './../services/alert/alert.service';
import { AppConfiguration } from './../app-configuration';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language/language.service';
import { EventService } from '../serviceEvent/event.service';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  languages: any;
  langDir:string;
  states: any;
  modalClass:string;
  countries: any;
  register: RegistrationDetails;
  langResponse: GetLanguagesResponse;
  tabState: any;
  isTermsChecked = false;
  languageId:any;
  selectedCountryCode = 'USA';
  confirmation_url: string;
  emailID: string;
  firstName: string;
  lastName: string;
  selectedLang:any;
  selectedCountry = "United States of America";
  screenName = 'register';
  activeTab: number;
  phoneNumber: number = null;
  cellNumber: number = null;
  maxlengthAdd1:number=75;
  selectedlang:any;
  readonly phoneMask: MaskitoOptions = {
    mask: ['(', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  };
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();
  constructor(private tabHeaderService: TabHeaderService,
    private dataService: DataService,
    private storage: Storage,
    public alertController: AlertController,
    private router: Router,
    private sharedService: SharedService,
    public modalController: ModalController,
    public alertService: AlertService,
    private appConfiguration: AppConfiguration,
    private translate: TranslateService,
    public languageService: LanguageService,
    private event:EventService,
    ) {
    this.confirmation_url = this.appConfiguration.confirmation_url;
    this.register = {
      FirstName: '',
      LastName: '',
      UserName: '',
      Address1: '',
      Address2: '',
      PostalCode: '',
      City: '',
      State: null,
      PhoneNumber: '',
      CellNumber: '',
      IntLanguageId: 1,
      CountryCode: 'USA',
      ConfirmationUrl: this.confirmation_url
    };
    this.event.subscribe('langChangeEvent',data=>{
      this.selectedlang=data;
      })
  }

  ngOnInit() {
    if(localStorage.selectedLangCode)
    {
      console.log("localStorage.selectedLangCode",localStorage.selectedLangCode)
      const selectedLangCode = parseInt(localStorage.selectedLangCode)
      // this.languageId = selectedLangCode;
      // this.selectedlang= localStorage.selectedLangCode==1?'Eng US':'Esp US'
     if(selectedLangCode === 2){
        this.selectedlang = 'Esp US';
      }else if(selectedLangCode === 3){
        this.selectedlang = 'ar';
      }else if(selectedLangCode === 4) {
        this.selectedlang = 'ja';
      }else if(selectedLangCode === 5) {
        this.selectedlang = 'ko';
      }else if(selectedLangCode === 6) {
        this.selectedlang = 'ru';
      }else if(selectedLangCode === 7) {
        this.selectedlang = 'zh';
      }else if(selectedLangCode === 8) {
        this.selectedlang = 'uz';
      }else{
        this.selectedlang = 'Eng US';
      }
      console.log("selectedlang",this.selectedlang)
    }else{
      this.selectedlang = 'Eng US';
    }
    this.getLanguages();
    this.getStates();
    this.getCountry();

    this.tabHeaderService.activeTab.subscribe((tabnum) => {
      this.activeTab = tabnum;
      if (tabnum == 0) {
        this.screenName = 'login';
      } else {
        this.screenName = 'register';
      }
    })
  }

  processemail(text) {
    if(text) {
    this.emailID = text.trim().toString();
    }
  }  
  getLanguages() {
    this.sharedService.loading.next(true);
    this.dataService.getLanguages()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.languages = response.body.Languages;
         
          if(localStorage.selectedLangCode){
            this.languageId =parseInt(localStorage.selectedLangCode);
          }else{
            this.languageId =parseInt(this.languages[0].IntLanguageId);
          }
          console.log("localStorage.selectedLangCode", this.languageId)
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }


  getStates() {
    this.sharedService.loading.next(true);
    this.dataService.getAllStates()
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

  getCountry() {
    this.sharedService.loading.next(true);
    this.dataService.getCountry()
      .subscribe(
        (response: any) => {
          const array = [];
          this.sharedService.loading.next(false);
          this.countries = response.body.Countries;
          const filteredcountries = this.countries.filter((country) => {
            if (country.CountryCode != 'USA') {
              return country;
            } else {
              array.push(country);
            }
          })
          this.countries = array.concat(filteredcountries);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  onLanguageChange(ev) {
    const selectedLang = this.languages.filter((lang) => {
      if (lang.IntLanguageId == ev.target.value) {
        return lang;
      }
    })
    this.selectedLang = selectedLang.DisplayName;
    this.selectedlang = '';
    if (ev.target.value == 8) {
      this.translate.use('uz');
      this.selectedlang = 'uz';
      this.langDir = 'ltr'
      let classLi = document.getElementById('modalDir').classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        console.log(this.modalClass)
      classLi.remove("directionRTL");
  
      classLi.remove("directionLTR");
  
      classLi.add(this.modalClass);
    }else if(ev.target.value == 2) {
      this.translate.use('es');
      this.selectedlang = 'es';
      this.langDir = 'ltr';
      let classLi = document.getElementById('modalDir').classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        console.log(this.modalClass)
      classLi.remove("directionRTL");
  
      classLi.remove("directionLTR");
  
      classLi.add(this.modalClass);
    }else if(ev.target.value == 3) {
      this.translate.use('ar');
      this.selectedlang = 'ar';
      this.langDir = 'rtl';
      let classLi = document.getElementById('modalDir').classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        console.log(this.modalClass)
      classLi.remove("directionRTL");
  
      classLi.remove("directionLTR");
  
      classLi.add(this.modalClass);
    }else if (ev.target.value === 4){
      this.translate.use('ja');
      this.selectedlang = 'ja';
      this.langDir = 'ltr';
      let classLi = document.getElementById('modalDir').classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        console.log(this.modalClass)
      classLi.remove("directionRTL");
  
      classLi.remove("directionLTR");
  
      classLi.add(this.modalClass);
    }else if (ev.target.value === 5){
      this.translate.use('ko');
      this.selectedlang = 'ko';
      this.langDir = 'ltr';
      let classLi = document.getElementById('modalDir').classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        console.log(this.modalClass)
      classLi.remove("directionRTL");
  
      classLi.remove("directionLTR");
  
      classLi.add(this.modalClass);
    }else if (ev.target.value === 6){
      this.translate.use('ru');
      this.selectedlang = 'ru';
      this.langDir = 'ltr';
      let classLi = document.getElementById('modalDir').classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        console.log(this.modalClass)
      classLi.remove("directionRTL");
  
      classLi.remove("directionLTR");
  
      classLi.add(this.modalClass);
    }else if (ev.target.value === 7){
      this.translate.use('zh');
      this.selectedlang = 'zh';
      this.langDir = 'ltr';
      let classLi = document.getElementById('modalDir').classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        console.log(this.modalClass)
      classLi.remove("directionRTL");
  
      classLi.remove("directionLTR");
  
      classLi.add(this.modalClass);
    } else {
      this.translate.use('en');
      this.selectedlang = 'en';
      this.langDir = 'ltr';
      let classLi = document.getElementById('modalDir').classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        console.log(this.modalClass)
      classLi.remove("directionRTL");
  
      classLi.remove("directionLTR");
  
      classLi.add(this.modalClass);
    }
    localStorage.setItem('selectedLangCode', ev.target.value);
  }

  onCountryChange(ev) {
    const selectedCountry = this.countries.filter((country) => {
      if (country.CountryCode == ev.target.value) {
        return country;
      }
    })
    this.selectedCountry = selectedCountry.CountryName;
  }

  async onRegister(formData: NgForm) {
    this.sharedService.loading.next(true);
    let filteredPhoneNumber;
    let filteredCellNumber;
    this.register = formData.value;

    if (formData.value.PhoneNumber) {
      filteredPhoneNumber = formData.value.PhoneNumber.replace(/[^0-9]*/g, '');
    } else {
      filteredPhoneNumber = '';
    }

    if (formData.value.CellNumber) {
      filteredCellNumber = formData.value.CellNumber.replace(/[^0-9]*/g, '');
    } else {
      filteredCellNumber = '';
    }
    
    this.register.ConfirmationUrl = this.confirmation_url;
    this.register.PhoneNumber = filteredPhoneNumber;
    this.register.CellNumber = filteredCellNumber;
    
    if ((filteredPhoneNumber.length == 10 || filteredPhoneNumber.length == 0) && (filteredCellNumber.length == 10 || filteredCellNumber.length == 0)) {
      this.dataService.register(this.register).subscribe((response: any) => {
        this.sharedService.loading.next(false);
        if (response.status == 200 && response.body.APIStatus == 'Success') {
          const m1 = this.translate.instant('thanku_message1');
          const m2 = this.translate.instant('thanku_message2');
          const m3 = this.translate.instant('thanku_message3');
          const m4 = this.translate.instant('forgot_password');
          const m5 = this.translate.instant('thanku_message4');
          const message = m1 + '<strong>' + m2 + '</strong>' + m3 + '"' + m4 + '"' + m5;
          const alert = this.alertController.create({
            header: this.translate.instant('reg_success'),
            message: message,
            backdropDismiss: false,
            buttons: [{
              text: this.translate.instant('return_to_login'),
              handler: () => {
                this.router.navigate(['/login'])
              }
            }
            ]
          });

          alert.then((res) => {
            res.present();
          })
          }else if (response.body.PEProcessingMessages[0] == 'User already exists') {
            // const message = 'The registration was unsuccessful due to -';
            const message = this.translate.instant('register_unsuccessfull');
            this.alertService.failureToast(message);
            // this.alertService.checkPEProcessingMessages(response.body, message);
          }
        //   else {
        //   // const message = 'The registration was unsuccessful due to -';
        //   const message = this.translate.instant('register_unsuccessfull');
        //   this.alertService.checkPEProcessingMessages(response.body, message);
        // }
      },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        })
    } else {
      if (filteredPhoneNumber.length > 0 && filteredPhoneNumber.length < 10) {
        this.sharedService.loading.next(false);
        // const message = "Please enter valid phone number";
        const message = this.translate.instant('ph_valid');
        this.alertService.failureToast(message);
      } else if (filteredCellNumber.length > 0 && filteredCellNumber.length < 10) {
        this.sharedService.loading.next(false);
        // const message = "Please enter valid mobile number";
        const message = this.translate.instant('mb_valid');
        this.alertService.failureToast(message);
      }
    }
  }

  changeTabTo(tabnum) {
    this.tabHeaderService.redirectToPage(tabnum);
    // this.tabHeaderService.activeTab.next(tabnum);
  }
  onReturn() {
    this.router.navigate(['/login']);
  }

  onClearAll(f: NgForm) {
    this.isTermsChecked = false;
    f.reset();
    this.register = {
      FirstName: '',
      LastName: '',
      UserName: '',
      Address1: '',
      Address2: '',
      PostalCode: '',
      City: '',
      State: null,
      PhoneNumber: '',
      CellNumber: '',
      IntLanguageId: 1,
      CountryCode: 'USA',
      ConfirmationUrl: this.confirmation_url
    };
    setTimeout(() => {
      this.languageId = 1;
      this.selectedLang = "English(US)";
      this.selectedCountryCode = 'USA';
      this.selectedCountry = "United States of America";
    })
  }
  async openTermsModal() {
    const modal = await this.modalController.create({
      component: TermsPage,
      componentProps: {
        type: 'terms'
      }
    });
    return await modal.present();
  }
  switchTo(page) {
    this.screenName = page;
    if (this.screenName == 'login') {
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['register']);
    }
  }
  getPostalCodeDetails(postalcode) {
    // if (postalcode.length == 5) {
    //   this.sharedService.loading.next(true);
    //   this.dataService.getPostalCodeDetails(postalcode)
    //     .subscribe(
    //       (response: any) => {
    //         this.sharedService.loading.next(false);
    //       },
    //       (error) => {
    //         this.sharedService.loading.next(false);
    //       }
    //     );
    // }
  }

  onInfo() {
    const alert = this.alertController.create({
      header: this.translate.instant('Information'),
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
  languageChange() {
    this.languageService.displayLanguageAlert();
  }
}
