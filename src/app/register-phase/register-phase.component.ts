import { AppConfiguration } from './../app-configuration';
import { LanguageService } from './../services/language/language.service';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../services/data/data.service';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register-phase',
  templateUrl: './register-phase.component.html',
  styleUrls: ['./register-phase.component.scss'],
})
export class RegisterPhaseComponent implements OnInit {
  appversion : string[];
  constructor(
    private sharedService: SharedService,
    public languageService: LanguageService,
    private dataService: DataService,
    private appConfiguration: AppConfiguration,
    private platform: Platform,
    private alertController: AlertController,
    private router: Router,
    private translate: TranslateService ) {
      this.appversion = (this.appConfiguration.app_version).split(".");  
     }

  ngOnInit() {
    this.sharedService.appPhase.next('registrationPhase');
  }

  ionViewWillEnter() {
    // this.getVersion();
    this.languageService.setLanguage();
  }

  // getVersion() {
  //   this.sharedService.loading.next(true);
  //   let updateVersion;
  //   let url;
  //   this.dataService.getVersion()
  //     .subscribe(
  //       (response: any) => {
  //         this.sharedService.loading.next(false);  
  //       if (this.platform.is('android')) {
  //         updateVersion = (response.body.Android).split(".");
  //          url="https://play.google.com/store/apps/details?id=com.ionicframework.payschools586559&hl=en.reload";  
          
  //        } else {
  //         updateVersion = (response.body.IOS).split(".");
  //          url="https://apps.apple.com/us/app/payschools-mobile/id1159646335?ls=1.reload";                    
  //         }
  //         if(this.appversion[0] != updateVersion[0] || this.appversion[1] != updateVersion[1]){
  //           const alert = this.alertController.create({
  //             header: this.translate.instant('update_head'),
  //             message: this.translate.instant('mandatory_content'),
  //             buttons: [
  //               {
  //                 text: 'UPDATE',
  //                 role: 'update',
  //                 cssClass: 'primary',
  //                 handler: (blah) => {
  //                   window.open(url, '_blank'); 
  //                 }
  //               }
  //             ],
  //             backdropDismiss: false              
  //           });
  //           alert.then((val) => {
  //             val.present();
  //           });        
                 
  //         }
  //       },
  //       (error) => {
  //         this.sharedService.loading.next(false);
  //       }
  //     );
  // }
}
