import { SharedService } from './../services/shared/shared.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { TabHeaderService } from '../services/tab-header/tab-header.service';
import { NgForm } from '@angular/forms';
import { DataService } from '../services/data/data.service';
import { AlertService } from './../services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  activate;
  public type = 'password';
  public showPass = false;
  constructor(
    private tabHeaderService: TabHeaderService,
    private dataService: DataService,
    public alertController: AlertController,
    private router: Router,
    private sharedService: SharedService,
    public alertService: AlertService,
    private translate: TranslateService) {
    this.activate = {
      UserName: '',
      Code: '',
      Password: '',
    };
  }

  ngOnInit() {
    console.log(localStorage.getItem('activationCode'));
    this.activate.Code = JSON.parse(localStorage.getItem('activationCode'));
  }

  ionViewWillEnter() {
    this.activate = {
      UserName: '',
      Code: '',
      Password: '',
    };
    this.activate.Code = JSON.parse(localStorage.getItem('activationCode'));
  }
  changeTabTo(tabnum) {
    this.tabHeaderService.redirectToPage(tabnum);
  }

  onClearAll(f: NgForm) {
    f.resetForm();
  }

  processemail(text) {
    if (text) {
      this.activate.UserName = text.trim().toString();
    }
  }

  onResetPassword(data: NgForm) {
    this.activate.UserName = data.value.UserName;
    this.activate.Password = data.value.Password;
    this.sharedService.loading.next(true);

    this.dataService.accountActivate(this.activate).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.APIStatus == "Success" || response.statusText === 'RESET_PWD' || response.statusText === 'RESET_PWD_NEWUSER') {
        data.reset();
        const alert = this.alertController.create({
          header: this.translate.instant('Success'),
          message: this.translate.instant('success_msg'),
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
      } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
        const message = this.translate.instant('reset_password');
        this.alertService.failureToast(message);
      } else {
        if (response.body.PEProcessingMessages.length === 1) {
          let str1 = new String(response.body.PEReasonPhrase);
          let index = str1.indexOf('expired');
          if (index > 0) {
            const message = this.translate.instant('error_due_to');
            const expiryLinkMsg = this.translate.instant('recovery_password_expirylink')
            this.alertService.failureToast(message + ' - ' + expiryLinkMsg);
          } else {
            const message = this.translate.instant('error_due_to');
            this.alertService.checkPEProcessingMessages(response.body, message);
          }
        }
      }
    },
      (error) => {
        this.sharedService.loading.next(false);
      }
    );
  }
  showPassword() {
    this.showPass = !this.showPass;
    if (this.showPass) {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }
  onReturn() {
    this.router.navigate(['/login']);
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
