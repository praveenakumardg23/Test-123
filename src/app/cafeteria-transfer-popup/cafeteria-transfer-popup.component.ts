import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared/shared.service';
@Component({
  selector: 'app-cafeteria-transfer-popup',
  templateUrl: './cafeteria-transfer-popup.component.html',
  styleUrls: ['./cafeteria-transfer-popup.component.scss'],
})
export class CafeteriaTransferPopupComponent implements OnInit {

  @Input() mealsBalanceDetails;
  public patronBalanceList: any = [];
  public selectedPatron: any = [];
  public showtransferForm: boolean;
  public newBalance = 0;
  public checkedTransferMethod: any = "send";
  public switch: number = 0;
  patron1BalanceList: any;
  patron2BalanceList: any;
  isInactive: boolean = false

  constructor(private router: Router,
    private modalController: ModalController,
    private sharedService: SharedService) { }

  ngOnInit() {
    this.patronBalanceList = this.mealsBalanceDetails.filter(element => element.AllowSharingCafeteriabalance);
    console.log(this.patronBalanceList,"check all patron on popup");
    this.patron1BalanceList = this.patron2BalanceList = this.patronBalanceList;
  }

  onPatronSelection(event: any, value: any) {
    this.isInactive = false;
    this.getInActiveStatus(event.detail.value);
    if (value === 1) {
      if (this.isInactive) {
        this.patron2BalanceList = this.patron2BalanceList.filter(element => element.Active);
      } else {
        this.patron2BalanceList = this.patronBalanceList;
      }
    } else {
      if (this.isInactive) {
        this.patron1BalanceList = this.patron1BalanceList.filter(element => element.Active);
      } else {
        this.patron1BalanceList = this.patronBalanceList;
      }
    }
  }

  onProceed(form) {
    this.mealsBalanceDetails.forEach((element: any) => {
      if (element.IntPatronId === form.controls.patron1.value) {
        this.selectedPatron[0] = element;
      }
      if (element.IntPatronId === form.controls.patron2.value) {
        this.selectedPatron[1] = element;
      }
      this.sharedService.selectedPatronsForCafeteriaTransfer = this.selectedPatron;
      this.router.navigate(['/dashboard/cafeteria-balance']);
      this.close();
    })
  }

  close() {
    this.modalController.dismiss();
  }

  getInActiveStatus(value: any) {
    this.mealsBalanceDetails.forEach((element) => {
      if (element.IntPatronId === value) {
        if (!element.Active)
          this.isInactive = true;
      }
    });
  }

}
