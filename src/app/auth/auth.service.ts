import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { SharedService } from '../services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
showSessionExpirePopup = true;
  constructor(
    private router: Router,
    public alertController: AlertController,
    private sharedService: SharedService,
    private translate: TranslateService) { }

  logout(status) {
    let globals: any = JSON.parse(sessionStorage.getItem('globals'));
    sessionStorage.removeItem('globals');
    sessionStorage.removeItem('nextStep');
    sessionStorage.removeItem('headerTitle');
    sessionStorage.removeItem('selectedLangCode');
    localStorage.removeItem('selectedLangCode');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('quikappsAlert3');
    localStorage.removeItem('quikappsAlert2');
    localStorage.removeItem('quikappsAlert1');
    localStorage.removeItem('dashboardRedirectPath');
    // localStorage.removeItem('districtFeaturelist');
    this.sharedService.isGuestUser = false;
    this.router.navigate(['login'],{replaceUrl: true});
    if (status == '401' && this.showSessionExpirePopup && globals) {
      this.showSessionExpirePopup = false;
      const alert = this.alertController.create({
        header: this.translate.instant('session_expired'),
        message: this.translate.instant('Session_Expired_Subheading'),
        buttons: [{
          text: this.translate.instant('ok'),
          handler: () => {
            this.showSessionExpirePopup = true;
          }
        }
        ]
      });

      alert.then((res) => {
        res.present();
      })
    }
    this.sharedService.loading.next(false)
  }
}
