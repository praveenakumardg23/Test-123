import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert/alert.service';
import { DataService } from './../data/data.service';
import { AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SharedService } from '../shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from 'src/app/serviceEvent/event.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  languages: any;
  IntLanguageId: any;
  langDir:any;
  modalClass:string = 'directionLTR';
  constructor(
    private alertController: AlertController,
    private sharedService: SharedService,
    private dataService: DataService,
    private translate: TranslateService,
    private alertService: AlertService,
    private event:EventService,
  ) { 
    
  }

  ionViewWillEnter() {
    let globals: any = JSON.parse(sessionStorage.getItem('globals') );
    if (globals != null) {
      this.getLanguagesAfterLogin('init');
    } else {
      this.getLanguages('init');
    }
  }

  getLanguages(data:any) {
    this.sharedService.loading.next(true);
    this.dataService.getLanguages()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.languages = response.body.Languages;
          console.log(this.languages);
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
          if (data == 'load') {
            this.showLangAlert();
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getLanguagesAfterLogin(data:any) {
    this.sharedService.loading.next(true);
    this.dataService.getLanguagesAfterLogin()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
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
          if (data == 'load') {
            this.showLangAlert();
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  displayLanguageAlert() {
    if (this.languages) {
      this.showLangAlert();
    } else {
      let globals: any = JSON.parse(sessionStorage.getItem('globals'));
      if (globals != null) {
        this.getLanguagesAfterLogin('load');
      } else {
        this.getLanguages('load');
      }
    }
  }


  async showLangAlert() {
    const langArray:any = [];
    let selectedLang:any;

    const userInfo = JSON.parse(localStorage.getItem('userInfo') );
    let globals: any = JSON.parse(sessionStorage.getItem('globals') );

    if (globals != null && userInfo!=null) {
      let selectedLangCode:any = parseInt(localStorage.getItem('selectedLangCode') ) ;
      if (selectedLangCode) {
        selectedLang = selectedLangCode;
        
        if(parseInt(selectedLang) === 3){
          this.langDir = 'rtl';
        }else{
          this.langDir = 'ltr';
        }
      } else {
        selectedLang = userInfo.IntLanguageId ;
        if(selectedLang === 3){
          this.langDir = 'rtl';
        }else{
          this.langDir = 'ltr';
        }
        localStorage.setItem('selectedLangCode', selectedLang.toString());
      }
    } else {
     let  selectedLang:any = parseInt(localStorage.getItem('selectedLangCode') ) ;
      if (selectedLang) {
        selectedLang = selectedLang;
        if(selectedLang === 3){
          this.langDir = 'rtl';
        }else{
          this.langDir = 'ltr';
        }
      } else {
        selectedLang = 1;
        localStorage.setItem('selectedLangCode', selectedLang.toString());
      }

    }
    let  newselectedLang:any = parseInt(localStorage.getItem('selectedLangCode') ) ;
    this.languages.forEach((lang:any) => {
      const langObj = {
        name: lang.DisplayName,
        type: 'radio',
        label: lang.DisplayName,
        value: lang.IntLanguageId,
        checked: newselectedLang == lang.IntLanguageId ? true : false
      }
      langArray.push(langObj);
    })

    const alert = await this.alertController.create({
      header: this.translate.instant('language_preference'),
      inputs: langArray,
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: this.translate.instant('Continue'),
          handler: (data) => {
            let globals: any = JSON.parse(sessionStorage.getItem('globals') );
            
            if(globals != null && userInfo != null) {
              this.langChangeAlertConfirm(data)
            }else{
              if (data == 8) {
                localStorage.setItem('selectedLangCode', data);                
                this.translate.use('uz');
                // this.event.publish('langChangeEvent','uz');
                this.langDir ='ltr';
                this.sharedService.languageId.emit(selectedLang);
                let classLi = window.document.getElementById('modalDir')?.classList;
                this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
                if(classLi){
                  classLi.remove("directionRTL");
                  classLi.remove("directionLTR");
                  classLi.add(this.modalClass);
                }
              } else if(data == 2) {
                localStorage.setItem('selectedLangCode', data);
                this.translate.use('es');
                // this.event.publish('langChangeEvent','Esp US');
                this.langDir ='ltr';
                this.sharedService.languageId.emit(selectedLang);
                let classLi = window.document.getElementById('modalDir')?.classList;
                this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
                if(classLi){
                  classLi.remove("directionRTL");
                  classLi.remove("directionLTR");
                  classLi.add(this.modalClass);
                }
              }else if(data == 3) {
                localStorage.setItem('selectedLangCode', data);
                this.translate.use('ar');
                this.langDir ='rtl';
                // this.event.publish('langChangeEvent','ar');
                this.sharedService.languageId.emit(selectedLang);
                let classLi = window.document.getElementById('modalDir')?.classList;
                this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
                if(classLi){
                  classLi.remove("directionRTL");
                  classLi.remove("directionLTR");
                  classLi.add(this.modalClass);
                }
              }else if(data == 4) {
                localStorage.setItem('selectedLangCode', data);
                this.translate.use('ja');
                // this.event.publish('langChangeEvent','js');
                this.sharedService.languageId.emit(selectedLang);
                let classLi = window.document.getElementById('modalDir')?.classList;
                this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
                if(classLi){
                  classLi.remove("directionRTL");
                  classLi.remove("directionLTR");
                  classLi.add(this.modalClass);
                }
                this.langDir ='ltr';
              }else if(data == 5) {
                localStorage.setItem('selectedLangCode', data);
                this.translate.use('ko');
                // this.event.publish('langChangeEvent','ko');
                this.sharedService.languageId.emit(selectedLang);
                this.langDir ='ltr';
                let classLi = window.document.getElementById('modalDir')?.classList;
                this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
                if(classLi){
                  classLi.remove("directionRTL");
                  classLi.remove("directionLTR");
                  classLi.add(this.modalClass);
                }
              }else if(data == 6) {
                localStorage.setItem('selectedLangCode', data);
                this.translate.use('ru');
                // this.event.publish('langChangeEvent','ru');
                this.sharedService.languageId.emit(selectedLang);
                this.langDir ='ltr';
                let classLi = window.document.getElementById('modalDir')?.classList;
                this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
                if(classLi){
                  classLi.remove("directionRTL");
                  classLi.remove("directionLTR");
                  classLi.add(this.modalClass);
                }
              }else if(data == 7) {
                localStorage.setItem('selectedLangCode', data);
                this.translate.use('zh');
                // this.event.publish('langChangeEvent','zh');
                this.sharedService.languageId.emit(selectedLang);
                this.langDir ='ltr';
                let classLi = window.document.getElementById('modalDir')?.classList;
                this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
                if(classLi){
                  classLi.remove("directionRTL");
                  classLi.remove("directionLTR");
                  classLi.add(this.modalClass);
                }
              }else {
                localStorage.setItem('selectedLangCode', data);
                this.translate.use('en');
                this.langDir ='ltr';
                // this.event.publish('langChangeEvent','Eng US');
                this.sharedService.languageId.emit(selectedLang);
                let classLi = window.document.getElementById('modalDir')?.classList;
                this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
                if(classLi){
                  classLi.remove("directionRTL");
                  classLi.remove("directionLTR");
                  classLi.add(this.modalClass);
                }
              }
            }
           
            this.sharedService.loading.next(false);
          }
        }
      ]
    });

    await alert.present();
  }


  async langChangeAlertConfirm(selectedLang:number) {
    let defaultLanguage;
    console.log('selectedLang',selectedLang);
    if (selectedLang === 1) {
      defaultLanguage = 'English(US)';
      this.sharedService.languageId.emit(selectedLang);
      this.langDir ='ltr';
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    } else if(selectedLang === 2){
      defaultLanguage = 'Espanol(US)';
      this.sharedService.languageId.emit(selectedLang);
      this.langDir ='ltr';
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if(selectedLang === 3){
      defaultLanguage = 'Arabic';
      this.sharedService.languageId.emit(selectedLang);
      this.langDir ='rtl';
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if(selectedLang === 4) {
      defaultLanguage = 'Japanese';
      this.sharedService.languageId.emit(selectedLang);
      this.langDir ='ltr';
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if(selectedLang === 5) {
      defaultLanguage = 'Korean';
      this.sharedService.languageId.emit(selectedLang);
      this.langDir ='ltr';
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if(selectedLang === 6) {
      defaultLanguage = 'Russian';
      this.sharedService.languageId.emit(selectedLang);
      this.langDir ='ltr';
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if(selectedLang === 7) {
      defaultLanguage = 'Chinese(Simplified)';
      this.sharedService.languageId.emit(selectedLang);
      this.langDir ='ltr';
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if(selectedLang === 8) {
      defaultLanguage = 'Uzbek';
      this.sharedService.languageId.emit(selectedLang);
      this.langDir ='ltr';
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }
    

    const message = "<p>" + this.translate.instant('change_lang') + defaultLanguage + "</p>" + "<p>" + this.translate.instant('click_yes') + defaultLanguage + this.translate.instant('click_no') + defaultLanguage + this.translate.instant('current_session');
    const alert = await this.alertController.create({
      header: this.translate.instant('confirm')!,
      message: message,
      buttons: [
        {
          text: this.translate.instant('No'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.sharedService.loading.next(false);
            console.log('No');              
            this.sharedService.languageId.emit(selectedLang);  
            this.getSecurityQuestions(selectedLang);       
            if (selectedLang == 8) {
              localStorage.setItem('selectedLangCode', selectedLang.toString());                
              this.translate.use('uz');
              // this.event.publish('langChangeEvent','uz')
              this.sharedService.languageId.emit(selectedLang);
            } else if(selectedLang == 2) {
              localStorage.setItem('selectedLangCode', selectedLang.toString());
              this.translate.use('es');
              // this.event.publish('langChangeEvent','Esp US')
            } else if(selectedLang == 3) {
              localStorage.setItem('selectedLangCode', selectedLang.toString());
              this.translate.use('ar');
              this.langDir ='rtl';
              // this.event.publish('langChangeEvent','Esp US')
            }else if(selectedLang == 4) {
              localStorage.setItem('selectedLangCode', selectedLang.toString());
              this.translate.use('ja');
              // this.event.publish('langChangeEvent','js')
              this.sharedService.languageId.emit(selectedLang);
            }else if(selectedLang == 5) {
              localStorage.setItem('selectedLangCode', selectedLang.toString());
              this.translate.use('ko');
              // this.event.publish('langChangeEvent','ko')
              this.sharedService.languageId.emit(selectedLang);
            }else if(selectedLang == 6) {
              localStorage.setItem('selectedLangCode', selectedLang.toString());
              this.translate.use('ru');
              // this.event.publish('langChangeEvent','ru')
              this.sharedService.languageId.emit(selectedLang);
            }else if(selectedLang == 7) {
              localStorage.setItem('selectedLangCode', selectedLang.toString());
              this.translate.use('zh');
              // this.event.publish('langChangeEvent','zh')
              this.sharedService.languageId.emit(selectedLang);
            }else {
              localStorage.setItem('selectedLangCode', selectedLang.toString());
              this.translate.use('en');
              // this.event.publish('langChangeEvent','Eng US')
              this.langDir ='ltr';
            }    
            // if (selectedLang == 1) {
            //   sessionStorage.setItem('selectedLangCode', selectedLang);
            //   this.translate.use('en');
            //   this.event.publish('langChangeEvent','Eng US')

            //   console.log("checl",this.translate);
            //   //this.getSecurityQuestions();
            // } else {
            //   sessionStorage.setItem('selectedLangCode', selectedLang);
            //   this.translate.use('es');
            //   this.event.publish('langChangeEvent','Esp US')

            //   //this.getSecurityQuestions();
            // }              
          }
        }, {
          text: this.translate.instant('Yes'),
          handler: () => {
            this.sharedService.languageId.emit(selectedLang);
            localStorage.setItem('selectedLangCode', selectedLang.toString());
            this.saveUserInfo(selectedLang)
            // this.getSecurityQuestions();
          }
        }
      ],
      backdropDismiss:false
    });
    await alert.present();
  }

  getSecurityQuestions(IntLanguageId:any) {
    this.sharedService.loading.next(true);
    const payload = {
      "IntLanguageId": IntLanguageId
    }
    this.dataService.getSecurityQuestions(payload).subscribe((response: any) => {
          this.sharedService.loading.next(false);
          this.sharedService.securityQuestionList.next(response.body);
          // this.questionsResponse = response.body;
          // this.questions1 = this.questionsResponse.Questions[0].Question;
          // this.questions2 = this.questionsResponse.Questions[1].Question;
          // this.questions3 = this.questionsResponse.Questions[2].Question;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }


  saveUserInfo(IntLanguageId:any) {
    this.sharedService.loading.next(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') )
    const payload = {
      "IntLanguageId": IntLanguageId,
      "UserName": userInfo.UserName,
      "FirstName": userInfo.FirstName,
      "LastName": userInfo.LastName,
      "Address1": userInfo.Address1,
      "Address2": userInfo.Address2,
      "PostalCode": userInfo.PostalCode,
      "City": userInfo.City,
      "State": userInfo.State,
      "CountryCode": userInfo.CountryCode,
      "PhoneNumber": userInfo.PhoneNumber,
      "SMSNumber": userInfo.SMSNumber
    }   
    this.dataService.updateProfile(payload).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.status == 200 && response.body.APIStatus == 'Success') {
        sessionStorage.removeItem('selectedLangCode');
        userInfo.IntLanguageId = IntLanguageId;
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        if (IntLanguageId == 8) {                
          this.translate.use('uz');
          this.getSecurityQuestions(IntLanguageId);
          this.langDir ='ltr';
        } else if(IntLanguageId == 2) {
          this.translate.use('es');
          this.getSecurityQuestions(IntLanguageId);
          this.langDir ='ltr';
        }else if(IntLanguageId == 3) {
          this.translate.use('ar');
          this.langDir ='rtl';
          this.getSecurityQuestions(IntLanguageId);
        }else if(IntLanguageId == 4) {
          this.translate.use('ja');
          this.getSecurityQuestions(IntLanguageId);
          this.langDir ='ltr';
        }else if(IntLanguageId == 5) {
          this.translate.use('ko');
          this.getSecurityQuestions(IntLanguageId);
          this.langDir ='ltr';
        }else if(IntLanguageId == 6) {
          this.translate.use('ru');
          this.getSecurityQuestions(IntLanguageId);
          this.langDir ='ltr';
        }else if(IntLanguageId == 7) {
          this.translate.use('zh');
          this.getSecurityQuestions(IntLanguageId);
          this.langDir ='ltr';
        }else {
          this.translate.use('en');
          this.getSecurityQuestions(IntLanguageId);
          this.langDir ='ltr';
        }
        let classLi = window.document.getElementById('modalDir')?.classList;
        this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
        if(classLi){
          classLi.remove("directionRTL");
          classLi.remove("directionLTR");
          classLi.add(this.modalClass);
        }
        const currentPath = sessionStorage.getItem('currentPath');
        if (currentPath == '/dashboard/manage-profile') {
          this.sharedService.refreshManageProfile.next(true);
        }
      } else {
        const msg = this.translate.instant('profile_update_unsuccessful');
        this.alertService.failureToast(msg);
      }
    },
      (error) => {
        this.sharedService.loading.next(false);
        console.log(error);
      })
  }

  setLanguage() {
    let selectedLang;
    let setLanguage = sessionStorage.getItem('selectedLangCode');
    if(!setLanguage) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') );
    let globals: any = JSON.parse(sessionStorage.getItem('globals') );

    if (globals != null) {
      let selectedLangCode = sessionStorage.getItem('selectedLangCode');
      if (selectedLangCode) {
        selectedLang = selectedLangCode;
       
      } else {
        selectedLang = (userInfo && userInfo.IntLanguageId);
      
      }
      
    } else {
      selectedLang = localStorage.getItem('selectedLangCode');
    }
    this.sharedService.languageId.emit(selectedLang);
    if (selectedLang == 8) {               
      this.translate.use('uz');
      this.langDir ='ltr';
    } else if(selectedLang == 2) {
      this.translate.use('es');
      this.langDir ='ltr';
    } else if(selectedLang == 3) {
      this.translate.use('ar');
      this.langDir ='rtl';
    }else if(selectedLang == 4) {
      this.translate.use('ja');
      this.langDir ='ltr';
    }else if(selectedLang == 5) {
      this.translate.use('ko');
      this.langDir ='ltr';
    }else if(selectedLang == 6) {
      this.translate.use('ru');
      this.langDir ='ltr';
    }else if(selectedLang == 7) {
      this.translate.use('zh');
      this.langDir ='ltr';
    }else {
      this.translate.use('en');
      this.langDir ='ltr';
    }
    let classLi = window.document.getElementById('modalDir')?.classList;
    this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
    if(classLi){
      classLi.remove("directionRTL");
      classLi.remove("directionLTR");
      classLi.add(this.modalClass);
    }
  }
  }
}
