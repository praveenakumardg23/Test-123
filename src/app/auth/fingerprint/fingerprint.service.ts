import { DataService } from './../../services/data/data.service';
import { AlertController, Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
// import { AndroidFingerprintAuth } from '@ionic-native/android-fingerprint-auth/ngx';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { TabHeaderService } from 'src/app/services/tab-header/tab-header.service';
import { TouchID } from '@awesome-cordova-plugins/touch-id/ngx';
import { SharedService } from 'src/app/services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Keychain } from '@awesome-cordova-plugins/keychain/ngx';
import {FingerprintAIO} from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { BiometricWrapper } from '@awesome-cordova-plugins/biometric-wrapper/ngx';

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {

  constructor(
    private fp: FingerprintAIO,
    private biometricWrapper: BiometricWrapper,
    private alertController: AlertController,
    private router: Router,
    private storage: Storage,
    private dataService: DataService,
    private tabHeaderService: TabHeaderService,
    private platform: Platform,
    private touchId: TouchID,
    private sharedService: SharedService,
    private translate: TranslateService,
    private nativeStorage: NativeStorage,
    private keychain: Keychain
  ) { }

  fingerPrintForAndroid(payload, token, response) {
    this.fp.isAvailable().then((res: any) => {
      console.log(res);
      // const serviceName = (res === "face") ? "face" : "biometric";
        if (res == 'biometric') {
          this.fingerPrintEnablePopUp(payload, response); 
        }else if(res == 'face'){
          this.fingerPrintEnablePopUp(payload, response);
        }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  encrypt(payload, response) {
    this.fp.show(payload.password).then((success: any) => {
      // Fingerprint/Face was successfully verified
      this.nativeStorage.setItem('fingerAuthToken', {biometric: payload.password})
      .then(
      () => console.log('Stored item!',),
      error => console.error('Error storing item', error)
      );
      this.displayAlert(this.translate.instant('enabled_successfully'), response);
         console.log(success);
      }).catch((error: any) => {
          // Fingerprint/Face was not successfully verified
          console.log(error.message);
      });
  }

  decrypt(username, token) {
    this.fp.show(token).then((success: any) => {
      // Fingerprint/Face was successfully verified
      const payload = {
        username: username,
        password: token
      }
      // this.login(payload);
      
      this.dataService.login(payload).subscribe((response: any) => {
        console.log("response", response);
        this.sharedService.loading.next(false);
        if (response.body.APIStatus === 'Success') {
          this.sharedService.firstLogin = true;
          sessionStorage.setItem('globals', JSON.stringify(response.body));
          sessionStorage.setItem('nextStep', JSON.stringify(response.body.NextStep));
        }else if(response.body.PEProcessingMessages[0]==="Invalid Username or Password"){
          const alert = this.alertController.create({
            message: this.translate.instant('fingerprint_reset'),
            backdropDismiss: false,
            buttons: [{
              text: this.translate.instant('ok'),
              handler: () => {
                this.nativeStorage.remove('fingerAuthToken');
                localStorage.setItem('isBiometricRemoved',"true");
              }
            }]
          });
          alert.then((res) => {
            res.present();
          })
         
        }else if(response.body.PEProcessingMessages[0].trim()==='Password has expired'){
          const msg = this.translate.instant('expired_password');
          this.warningMessageAlert(msg);
        }
        this.redirectTo(response);
      })
     console.log(success);
  }).catch((error: any) => {
      // Fingerprint/Face was not successfully verified
     console.log(error.message);
});
   
  }


  async fingerPrintEnablePopUp(payload,  response) {
    const alert = await this.alertController.create({
      header: this.translate.instant('Setup_Fingerprint'),
      message: this.translate.instant('Enable_your_fingerprint'),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {           
          }
        }, {
          text: this.translate.instant('ENABLE'),
          handler: () => {
            if (this.platform.is('android')) {
              this.encrypt(payload, response);
            } else if (this.platform.is('ios')) {
              const key = '26682558' + payload.username;
              this.toEnablefaceID(payload, key);
              this.storage.set('fingerAuthToken', payload.password);
              // this.touchId.save(key, payload.password, true)
              //   .then((res: any) => {
              //    // this.storage.set('fingerAuthToken', key);
              //     this.displayAlert('Enabled successfully', response);
              //   })
              //   .catch((error: any) => {
              //     console.error(error)
              //   });
            }
          }
        }
      ]
    });

    await alert.present();
  }


  fingerPrintForiOS(payload, token, response) {
    // this.faio.isAvailable().then((res: any) => {
    //   console.log(res);
    //   const serviceName = (res === "face") ? "Face ID" : "Touch ID";
    //     if (serviceName == 'Touch ID') {
    //       const key = '26682558' + payload.username;
    //       this.touchId.has(key)
    //         .then((response) => {             
    //           this.verify(payload.username, key)
    //         })
    //         .catch((error: any) => {
    //           console.error(error)
    //           this.fingerPrintEnablePopUp(payload, response);
    //         });
    //     }else if(serviceName == 'Face ID'){
    //       const key = '26682558' + payload.username;
    //       this.fingerPrintEnablePopUp(payload, response);
    //     }
    // }).catch((error: any) => {
    //   console.error(error)
    // });
    this.touchId.isAvailable()
      .then((res: any) => {       
        const serviceName = (res === "face") ? "Face ID" : "Touch ID";
        if (serviceName == 'Touch ID') {
          const key = '26682558' + payload.username;
          this.keychain.get(key)
            .then((response) => {             
              this.verify(payload.username, key)
            })
            .catch((error: any) => {
              console.error(error)
              this.fingerPrintEnablePopUp(payload, response);
            });
        }else if(serviceName == 'Face ID'){
                const key = '26682558' + payload.username;
                this.fingerPrintEnablePopUp(payload, response);
              }
      })
      .catch((error: any) => {
        console.error(error)
      });
  }

  toEnablefaceID(payload, key){
    this.fp.show({
      cancelButtonTitle: 'Cancel',
      description: "Use Pin",
      disableBackup: false,
      title: '',
      fallbackButtonTitle: 'FB Back Button',
      subtitle: 'This SubTitle',
      
    })
      .then((result: any) => {
        console.log(result);
        if(result === "Success"){
          this.displayAlert(this.translate.instant('enabled_successfully'), '');
        }
      })
      .catch((error: any) => {
        console.log(error)
        alert("Match not found!");
      });
  }

  verifyIOS(username, key){

    this.fp.show({
      cancelButtonTitle: 'Cancel',
      description: "Use Pin",
      disableBackup: false,
      title: '',
      fallbackButtonTitle: 'FB Back Button',
      subtitle: 'This SubTitle',
      
    })
      .then((result: any) => {
        console.log(result);
        if(result === "Success"){
          const payload = {
            username: username,
            password: key
          }
          this.dataService.login(payload).subscribe((response: any) => {
            this.sharedService.loading.next(false);
            if (response.body.APIStatus === 'Success') {
              this.sharedService.firstLogin = true;
              sessionStorage.setItem('globals', JSON.stringify(response.body));
              sessionStorage.setItem('nextStep', JSON.stringify(response.body.NextStep));
            }else if(response.body.APIStatus === 'Error'){
              const data = "true" 
              this.storage.set('iosBiometricRemoved', data);
              const msg = this.translate.instant('expired_password');
              this.warningMessageAlert(msg);  
            }
            this.redirectTo(response);
          })

        }
      })
      .catch((error: any) => {
        console.log(error)
        
        alert("Match not found!");
      });

   
    
  }

  verify(username, key) {
    this.touchId.verifyFingerprint('Scan your fingerprint please')
      .then(
        (password) => {
          const payload = {
            username: username,
            password: password
          }
          console.log(password);
          this.dataService.login(payload).subscribe((response: any) => {
            this.sharedService.loading.next(false);
            if (response.body.APIStatus === 'Success') {
              sessionStorage.setItem('globals', JSON.stringify(response.body));
              sessionStorage.setItem('nextStep', JSON.stringify(response.body.NextStep));
            }else if(response.body.APIStatus === 'Error'){
              const alert = this.alertController.create({
                // header: this.translate.instant('IS_Success'),
                message: this.translate.instant('fingerprint_reset'),
                buttons: [{
                  text: this.translate.instant('ok'),
                  handler: () => {
                    this.storage.remove('username');
                    this.storage.remove('fingerAuthToken');
                  }
                }]
              });
              alert.then((res) => {
                res.present();
              })
            }
            this.redirectTo(response);
          })
        },
        (err) => {
          console.error('Error', err)
        }
      );
  }

  redirectTo(response) {
    if (response.status == 200) {
      if (response.body.NextStep === 'SecurityQ&A') {
        this.sharedService.appPhase.next('registrationPhase');
        this.router.navigate(['/security-questions'], { replaceUrl: true });
      }
      else if (response.body.NextStep === 'AddStudent/Staff') {
        this.sharedService.appPhase.next('registrationPhase');
        this.router.navigate(['/manage-patrons']);
      }
      else if (response.body.NextStep === 'AddPayment') {
        this.sharedService.appPhase.next('registrationPhase');
        this.router.navigate(['/manage-payment-methods']);
      }
      else if (response.body.NextStep === 'SetupNotifications') {
        this.sharedService.appPhase.next('registrationPhase');
        this.router.navigate(['/notifications']);
      }
      else if (!response.body.NextStep) {
        this.sharedService.appPhase.next('dashboard');
        this.router.navigate(['/dashboard'], { replaceUrl: true });//After dashboard is done it should navigate to dashboard page
      }
    }
  }


  login(payload) {
    this.sharedService.loading.next(true);
    this.dataService.login(payload).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.APIStatus === 'Success') {
        sessionStorage.setItem('globals', JSON.stringify(response.body));
        sessionStorage.setItem('nextStep', JSON.stringify(response.body.NextStep));
      }
      this.redirectTo(response);
    })
  }

  displayAlert(message, response) {
    localStorage.removeItem('isBiometricRemoved');
    const alert = this.alertController.create({
      header: this.translate.instant('IS_Success'),
      message: message,
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          if (message == 'Enabled successfully') {
            // this.redirectTo(response);
          }
        }
      }]
    });
    alert.then((res) => {
      res.present();
    })
  }

  warningMessageAlert(message){
    const alert = this.alertController.create({
      header: this.translate.instant('Information'),
      message: message,
      backdropDismiss: true,
      buttons: [{
        text: this.translate.instant('reset_password_btn_text'),
        handler: () => {
          this.tabHeaderService.activeTab.next(10);
          this.router.navigate(['/forgot-password']);
        }
      }]
    });

    alert.then((res) => {
      res.present();
    });
  }

}
