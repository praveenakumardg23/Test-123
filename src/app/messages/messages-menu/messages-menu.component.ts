import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-messages-menu',
  templateUrl: './messages-menu.component.html',
  styleUrls: ['./messages-menu.component.scss'],
})
export class MessagesMenuComponent implements OnInit {

  constructor(public popoverController: PopoverController) { }

  ngOnInit() { }

  async DismissClick(type) {
    sessionStorage.setItem('selectedMessageMenu', type);
    await this.popoverController.dismiss(type);
  }
}
