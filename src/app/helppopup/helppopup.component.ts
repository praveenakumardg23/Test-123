import { Component, Input, OnInit, } from '@angular/core';
import { ModalController,PopoverController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { HelpPage } from './../help/help.page';
import { SharedService } from '../services/shared/shared.service';

@Component({
  selector: 'app-helppopup',
  templateUrl: './helppopup.component.html',
  styleUrls: ['./helppopup.component.scss'],
})
export class HelppopupComponent implements OnInit {
@Input() showLogout:any;
  constructor(public modalController: ModalController,
              public popover: PopoverController,
              private authService: AuthService,
              private sharedService: SharedService
    ) { }

  ngOnInit() {}
  async DismissClick()
  {
    this.popover.dismiss();
    const modal = await this.modalController.create({
      component: HelpPage
    });
    return await modal.present();
  }
  logout() {
    this.popover.dismiss();
    if (this.sharedService.isGuestUser === true) {
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      sessionStorage.removeItem('Email');
      sessionStorage.removeItem('CCEmail');
      }
    this.authService.logout('logout');

  }
}
