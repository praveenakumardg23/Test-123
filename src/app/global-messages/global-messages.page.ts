import { Component, OnInit, ElementRef, ɵConsole } from '@angular/core';
import { SharedService } from '../services/shared/shared.service';
import { NavParams, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-global-messages',
  templateUrl: './global-messages.page.html',
  styleUrls: ['./global-messages.page.scss'],
})
export class GlobalMessagesPage implements OnInit {
globalMessage: any;
  constructor(
    private element: ElementRef,
    private sharedService: SharedService,
    navParams: NavParams,
    private translate: TranslateService,
    public modalController: ModalController
  ) { 
    this.globalMessage = navParams.get('globalMessage');
  }

  ngOnInit() {
    this._enableDynamicHyperlinks();
  }

  ionViewWillEnter() {
  }

  private _enableDynamicHyperlinks(): void {
    setTimeout(() => {
      const urls: any = this.element.nativeElement.querySelectorAll('a');
      urls.forEach((url) => {
        url.addEventListener('click', (event) => {
          event.preventDefault();
          this.sharedService.openUrl(event.target.href);
        }, false);
      });
    }, 2000);
  }

  onBack(){
    this.modalController.dismiss();
  }

}
