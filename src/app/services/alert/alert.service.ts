import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  loadSpinner: any;
  constructor(public alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private translate: TranslateService,
    private loadingController: LoadingController
  ) { }

  successAlert(message) {
    const alert = this.alertController.create({
      header: this.translate.instant('IS_Success'),
      message: message,
      buttons: [this.translate.instant('ok')]
    });

    alert.then((res) => {
      res.present();
    })
  }

  failureAlert(message) {
    const alert = this.alertController.create({
      header: this.translate.instant('AR_Error'),
      message: message,
      buttons:  [this.translate.instant('ok')]
    });
    alert.then((res) => {
      res.present();
    })
  }

  successToast(message) {
    const alert = this.alertController.create({
      message: message,
      buttons:  [this.translate.instant('ok')]
    });
    alert.then((res) => {
      res.present();
    })
  }

  infoAlert(message) {
    const alert = this.alertController.create({
      header: this.translate.instant('Information'),
      message: message,
      buttons: [this.translate.instant('ok')]
    });

    alert.then((res) => {
      res.present();
    })
  }

  
  infoAlertNotification(message , header) {
    const alert = this.alertController.create({
      header: header,
      message: message,
      buttons: [this.translate.instant('ok')]
    });

    alert.then((res) => {
      res.present();
    })
  }

  failureToast(message,header?:any) {
    const alert = this.alertController.create({
      message: message,
      buttons:  [this.translate.instant('ok')]
    });
    alert.then((res) => {
      res.present();
    })
  }

  failureMealTransferAlert(message) {
    const alert = this.alertController.create({
      header: this.translate.instant('Failure'),
      message: message,
      buttons:  [this.translate.instant('ok')]
    });
    alert.then((res) => {
      res.present();
    })
  }

  fundraiserFailureToast(message) {
    const alert = this.alertController.create({
      message: this.translate.instant('Error')+" "+ message,
      buttons: [this.translate.instant('close')]
    });

    alert.then((res) => {
      res.present();
    })
  }

  fundraiserDistrictErrorToast() {
    const alert = this.alertController.create({
      message: this.translate.instant('disable_district_error'),
      buttons:  [this.translate.instant('close')]
    });
    alert.then((res) => {
      res.present();
    })
  }

  alert(header: string, message: string) {
    const alert = this.alertController.create({
      header: header,
      message: message,
      buttons: [this.translate.instant('ok')]
    });

    alert.then((res) => {
      res.present();
    })
  }

  checkPEProcessingMessages(response, message) {
    if (response.PEProcessingMessages) {
      if (response.PEProcessingMessages.length === 1) {
        this.failureToast( message + ' - ' + response.PEProcessingMessages[0]);
      }
      else {
        let errormessage = message + ' - ' + response.PEProcessingMessages.toString();
        // for (var i = 0; i < response.PEProcessingMessages.length; i++) {
        //   errormessage += response.PEProcessingMessages[i] + ", ";
        // }
        this.failureToast(errormessage)
      }
    } else if (response.PEProcessingMessages === '' || response.PEProcessingMessages === null) {
      this.failureToast(this.translate.instant(response.APIStatusReason));
    }
  }

  // disclosureAlert(){
    
  //   const alert = this.alertController.create({
  //     header: this.translate.instant('DISCLOSURE_HEADING'),
  //     message:  this.translate.instant('DISCLOSURE_CONTENT'),
  //     buttons: [
  //       {
  //         text: this.translate.instant('SHARE_MEAL_BENEFIT'),
  //         cssClass: 'secondary',
  //         handler: () => {
  //           this.router.navigate(['/manage-payment-methods'])
  //         }
  //       },{
  //         text: this.translate.instant('ADD_FEE_TO_CART_WITHOUT_SHARING'),
  //         handler: () => {
  //           this.checkForForceAssignedFee(feeData, type)
  //         }
  //       }
  //     ]
  //   });

  //   alert.then((res) => {
  //     res.present();
  //     console.log(res);
  //   })
  // }

  warningAlert(page) {
    const alert = this.alertController.create({
      header: this.translate.instant('confirm_header'),
      message:  this.translate.instant('warning_message'),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: this.translate.instant('Continue'),
          handler: () => {
            if (page == 'paymentpage') {
              this.router.navigate(['/notifications'])
            } else if (page == 'addstudentpage') {
              this.router.navigate(['/manage-payment-methods'])
            } else {

            }
          }
        }
      ]
    });

    alert.then((val) => {
      val.present();
    });
  }



  async cartLoader() {
    this.loadSpinner = await this.loadingController.create({
      spinner: 'lines',
      message: this.translate.instant('avd_dup_msg'),
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await this.loadSpinner.present();
  }

  cartLoaderDismiss() {
    this.loadSpinner.dismiss();
  }

}
