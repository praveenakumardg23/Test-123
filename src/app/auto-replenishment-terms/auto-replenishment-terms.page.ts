import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-auto-replenishment-terms',
  templateUrl: './auto-replenishment-terms.page.html',
  styleUrls: ['./auto-replenishment-terms.page.scss'],
})
export class AutoReplenishmentTermsPage implements OnInit {
  arTermsChecked;
  constructor(public modalController: ModalController,
              private platform: Platform,
              public loadingController: LoadingController) { }

  ngOnInit() {}

  onDismiss() {
    this.modalController.dismiss();
  }

  isAgree():void {
    // this.isAgreeConfirm.emit(1);
    this.modalController.dismiss(1);
  }

  arTerms(event){
  this.arTermsChecked = event.detail.checked;
  }
}
