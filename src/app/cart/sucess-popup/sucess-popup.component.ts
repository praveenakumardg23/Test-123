import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/language/language.service';

@Component({
  selector: 'app-sucess-popup',
  templateUrl: './sucess-popup.component.html',
  styleUrls: ['./sucess-popup.component.css']
})
export class SucessPopupComponent implements OnInit {
amountDue: any;
  CartItems:any;
  @Input() fee: any;
  constructor(private modalController: ModalController,
    public languageService: LanguageService,
              navParams: NavParams,
              private router: Router) {
                // this.amountDue = navParams.get('Data').Amountdue;
                this.CartItems =  navParams.data.removableCartItems;
              }

  ngOnInit() {
    console.log("languageService", this.languageService)
  }


  onDismiss(param: any) {
    this.modalController.dismiss()
      .then((data) => {
      });
    this.router.navigate([param]);
  }
  sendEmail(param: any) {
    this.modalController.dismiss();
    this.router.navigate([param]);
  }

  closePopup(){
    this.modalController.dismiss({data:'close', role:"ok"})
  }
}
