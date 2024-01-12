
import { AppConfiguration } from './../app-configuration';
import { DataService } from './../services/data/data.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared/shared.service';
import { ToastController, AlertController, Platform } from '@ionic/angular';
import { AlertService } from './../services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language/language.service';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  public showPass = false;
  // ConfirmationCode:any;
  public type = 'password';
  modalClass:string;
  selectedLang = {
    IntLanguageId : null
  }
  languages: any;
  Username
  resetPasswordPage = true;
  confirmation_url: string;

  constructor(
    private router: Router,
    private dataService: DataService,
    private sharedService: SharedService,
    public toastController: ToastController,
    private appConfiguration: AppConfiguration,
    public alertService: AlertService,
    private alertController: AlertController,
    private translate: TranslateService,
    public languageService: LanguageService,
    private storage: Storage,
    private nativeStorage: NativeStorage,
    private platform: Platform
    ) { 
      this.confirmation_url = this.appConfiguration.confirmation_url;
    }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getLanguages();
  }

  showPassword() {
    this.showPass = !this.showPass;
    if (this.showPass) {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }
  processemail(text) {
    if (text) {
      this.Username = text.trim().toString();
    }
  }
  redirectTo(status) {
    if (status) {
      this.router.navigate(['/login']);
    } else {
      this.resetPasswordPage = true;
    }
  }

  resetPreference(preference, formData: NgForm) {
    if (preference == 'email') {
      this.recoverPassword(formData.value);
    } else {
      this.onRecoverPasswordBySMS(preference, formData);
    }
  }

  recoverPassword(data) {
    const reqObj = {
      "username": data.username,
      "confirmationUrl": this.appConfiguration.recoverPasswordConfirmationUrl
    }
    this.dataService.RecoverPassword(reqObj).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.statusText == "OK" && response.status == 200) {
        const alert = this.alertController.create({
          header: '',
          message: this.translate.instant('pass_recovery_link'),
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
      } else {
        this.alertService.failureToast(response.statusText);
      }

    },
      (error) => {
        this.sharedService.loading.next(false);
        if (error.status == 406) {
          this.alertService.failureToast(error.statusText);
          console.log(error);
        }
      }
    )
  }

  validatePhoneNumber(buttonValue, formData: NgForm) {
    const obj = {
      "username": formData.value.username,
      "ConfirmationUrl": this.confirmation_url
    }
    this.dataService.ValidatePhoneNumber(obj).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.HasMobileNumber || response.body.HasPhoneNumber) {
        this.onRecoverPasswordBySMS(buttonValue, formData);
      } else {
        this.alertService.failureToast(this.translate.instant('failure_toast'));
      }
    },
      (error) => {
        this.sharedService.loading.next(false);
        console.log(error);
      })
  }

  onRecoverPasswordBySMS(buttonValue, formData: NgForm) {
    if (buttonValue == 'alreadyHaveTextCode') {
      this.resetPasswordPage = false;
    } else {
      formData.value.ConfirmationUrl = this.appConfiguration.confirmation_url;
      this.dataService.RecoverPasswordBySMS(formData.value).subscribe((response: any) => {
        this.sharedService.loading.next(false);
        if (response.statusText == "OK" && response.status == 200) {
          this.resetPasswordPage = false;
        } else {
          const message = this.translate.instant('error_due_to');
          this.alertService.checkPEProcessingMessages(response.body, message);
        }
      },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        })
    }
  }

  onLanguageChange(ev) {
    if (this.languages) {
      const selectedLang = this.languages.filter((lang) => {
        if (lang.IntLanguageId == ev.target.value) {
          return lang;
        }
      })
    }
    if (ev.target.value == 8) {
      this.translate.use('uz');
      this.languageService.langDir ='ltr';
    }else if(ev.target.value == 2) {
      this.translate.use('es');
      this.languageService.langDir ='ltr';
    }else if(ev.target.value == 3) {
      this.translate.use('ar');
      this.languageService.langDir ='rtl';
    }else if (ev.target.value === 4){
      this.translate.use('ja');
      this.languageService.langDir ='ltr';
    }else if (ev.target.value === 5){
      this.translate.use('ko');
      this.languageService.langDir ='ltr';
    }else if (ev.target.value === 6){
      this.translate.use('ru');
      this.languageService.langDir ='ltr';
    }else if (ev.target.value === 7){
      this.translate.use('zh');
      this.languageService.langDir ='ltr';
    } else {
      this.languageService.langDir ='ltr';
      this.translate.use('en');
    }
    let classLi = document.getElementById('modalDir').classList;
                this.modalClass = (this.languageService.langDir === "rtl")? 'directionRTL':'directionLTR';
                  console.log(this.modalClass)
                classLi.remove("directionRTL");
            
                classLi.remove("directionLTR");
            
                classLi.add(this.modalClass);
    localStorage.setItem('selectedLangCode', ev.target.value);
  }

  getLanguages() {
    this.sharedService.loading.next(true);
    this.dataService.getLanguages()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          console.log(localStorage.getItem('selectedLangCode'));
          this.selectedLang.IntLanguageId = Number(localStorage.getItem('selectedLangCode'))
          this.languages = response.body.Languages;
          if(this.selectedLang.IntLanguageId != 0 && this.selectedLang.IntLanguageId != 1){
            this.selectedLang.IntLanguageId =parseInt(localStorage.selectedLangCode);
          }else{
            this.selectedLang.IntLanguageId =parseInt(this.languages[0].IntLanguageId);
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }


  changePasswordBySMS(formData: NgForm) {
    this.sharedService.loading.next(true);
    const reqObject = formData.value;
    this.dataService.ChangePasswordBySMS(reqObject).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if ((response.statusText == 'OK' || response.statusText == "RESET_PWD" || response.statusText == "RESET_PWD_NEWUSER") && response.status == 200) {
        if (this.platform.is('ios')){
          const data = "true" 
          this.storage.set('iosBiometricRemoved', data);
          this.storage.remove('fingerAuthToken');  
        } else if(this.platform.is('android')){
          this.nativeStorage.remove('fingerAuthToken');
          localStorage.setItem('isBiometricRemoved',"true");   
        }
        const alert = this.alertController.create({
          header: this.translate.instant('Success'),
          message: this.translate.instant('success_msg'),
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
      } else {
        const message = 'Error'
        this.alertService.checkPEProcessingMessages(response.body, message);
      }
    },
      (error) => {
        if (error.status == 406) {
          this.alertService.failureToast(this.translate.instant('error_status'))
          // this.alertService.failureToast('Entered verification code is invalid');
        }
        this.sharedService.loading.next(false);
        console.log(error);
      })
  }

  info() {
    const alert = this.alertController.create({
      header: '',
      message: this.translate.instant('password_condition'),
      cssClass: 'helpCss',
      buttons: [{
        text: this.translate.instant('ok'),
      }]
    });
    alert.then((res) => {
      res.present();
    })
  }
}
