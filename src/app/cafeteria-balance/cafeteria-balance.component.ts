import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../services/alert/alert.service';
import { DataService } from '../services/data/data.service';
import { FormGroup, NgForm } from '@angular/forms';
import { SharedService } from '../services/shared/shared.service';

@Component({
  selector: 'app-cafeteria-balance',
  templateUrl: './cafeteria-balance.component.html',
  styleUrls: ['./cafeteria-balance.component.scss'],
})
export class CafeteriaBalanceComponent implements OnInit {
  cartCount: number;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  selectedPatron: any = [];
  mealTransfer: any;
  patronTransferBalance: any;
  checkedTransferMethod: any = "send";
  patron1BalanceList: any;
  patron2BalanceList: any;
  patron1FullName: any;
  patron2FullName: any;
  patron1CurrentBalance: any;
  patron2CurrentBalance: any;
  patron1NewBalance: any;
  patron2NewBalance: any;
  amountToTransfer: any = 0;
  transferAmountFlag: boolean;
  arrowDown: boolean = true;
  applyTerms: boolean = false;
  disableFormByTerms: boolean = true;
  disableFormByTransferAmount: boolean = false;
  disableSendStatus: boolean = false;
  disableReceiveStatus: boolean = false;
  patronTo: string = "";
  patronFrom: string = "";
  isApplyTermsTouched: boolean = false;

  constructor(private router: Router,
    private dataService: DataService,
    private alertService: AlertService,
    private translate: TranslateService,
    private sharedService: SharedService) {
  }

  ngOnInit() {
    this.selectedPatron = this.sharedService.selectedPatronsForCafeteriaTransfer;
    this.getDefaulsValues();
    this.getSendReceiveStatus();
  }

  ionViewWillEnter(){
    this.selectedPatron = this.sharedService.selectedPatronsForCafeteriaTransfer;
    this.getDefaulsValues();
    this.getSendReceiveStatus();
    this.amountToTransfer = 0;
  }


  getDefaulsValues() {
    console.log(this.selectedPatron, "check patron in main");
    this.patron1FullName = this.selectedPatron[0].FirstName + " " + this.selectedPatron[0].LastName;
    this.patron2FullName = this.selectedPatron[1].FirstName + " " + this.selectedPatron[1].LastName;
    this.patron1CurrentBalance = Number(this.selectedPatron[0].PatronAccountBalance).toFixed(2);
    this.patron2CurrentBalance = Number(this.selectedPatron[1].PatronAccountBalance).toFixed(2);
    this.patron1NewBalance = this.patron1CurrentBalance;
    this.patron2NewBalance = this.patron2CurrentBalance;
  }

  onInputAmountTransfer(transferBalance?: any) {
    transferBalance = Number(transferBalance);
    if (this.arrowDown) {
      if (transferBalance <= this.patron1CurrentBalance) {
        this.patron1NewBalance = (Number(this.patron1CurrentBalance) - Number(transferBalance)).toFixed(2);
        this.patron2NewBalance = (Number(this.patron2CurrentBalance) + Number(transferBalance)).toFixed(2);
        this.transferAmountFlag = false;
        this.disableFormByTransferAmount = false;
        this.amountToTransfer = transferBalance;
      }
      else {
        this.transferAmountFlag = true;
        this.disableFormByTransferAmount = true;
      }
    }
    else {
      if (transferBalance <= this.patron2CurrentBalance) {
        this.patron2NewBalance = (Number(this.patron2CurrentBalance) - Number(transferBalance)).toFixed(2);
        this.patron1NewBalance = (Number(this.patron1CurrentBalance) + Number(transferBalance)).toFixed(2);
        this.transferAmountFlag = false;
        this.disableFormByTransferAmount = false;
        this.amountToTransfer = transferBalance;
      }
      else {
        this.transferAmountFlag = true;
        this.disableFormByTransferAmount = true;
      }
    }
  }

  onKeyUp(event: any) {

    const MY_REGEXP = /^[0-9]*(\.[0-9]{0,2})?$/;
    let newValue = event.target.value;
    let regExp = new RegExp(MY_REGEXP);

    if (!regExp.test(newValue)) {
      event.target.value = newValue.slice(0, -1);
    }  
    this.amountToTransfer = event.target.value;
    if(!(event.target.value.charAt(event.target.value.length - 1) === ".")){
      this.onInputAmountTransfer(this.amountToTransfer);
    }
  }

  selectRadioOption(event: any, val?: any) {
    if (event.detail.value) {
      this.arrowDown = true;
    } else {
      this.arrowDown = false;
    }
    this.onInputAmountTransfer(this.amountToTransfer);
  }

  onSelectApplyTerms(event: any) {
    this.isApplyTermsTouched = true;
    if (event.detail.checked === true) {
      this.applyTerms = true;
      this.disableFormByTerms = false;
    } else {
      this.applyTerms = false;
      this.disableFormByTerms = true
    }
  }

  onBack() {
    this.router.navigate(['/dashboard/patron-detail/meals']);
  }

  onMealTransfer(form) {
    this.patronFrom = this.arrowDown ? this.selectedPatron[0].IntPatronId : this.selectedPatron[1].IntPatronId;
    this.patronTo = this.arrowDown ? this.selectedPatron[1].IntPatronId : this.selectedPatron[0].IntPatronId;
    let transferredToPatronId = this.arrowDown ? this.selectedPatron[1].PatronId : this.selectedPatron[0].PatronId;
    let toPatronName = this.arrowDown ? this.patron2FullName : this.patron1FullName;
    let payload: any = {
      "IntSiteId": this.selectedPatron[0].IntSiteId,
      "FromIntPatronId": this.patronFrom,
      "ToIntPatronId": this.patronTo,
      "Amount": this.amountToTransfer
    };
    this.dataService.transferMealAccountBal(payload).subscribe(
      (response: any) => {
        if (response.body.APIStatus == 'Success') {
          let message = "$" + this.amountToTransfer + " " + this.translate.instant('IS_Transfer_Successfull') + " " + toPatronName +"("+transferredToPatronId+")";
          this.alertService.successAlert(message);
          this.onBack();
        } else if (response.body.APIStatus == 'Error') {
          const message = this.translate.instant('Transfer_failure');
          this.alertService.failureMealTransferAlert(message);
          this.onBack();
        }
      },
      (error) => {
        console.log(error);
      });
  }

  getSendReceiveStatus() {
    if (!this.selectedPatron[1].Active) {
      this.disableSendStatus = true;
      this.disableReceiveStatus = false;
      this.arrowDown = false;
    }

    if (!this.selectedPatron[0].Active) {
      this.disableReceiveStatus = true;
      this.disableSendStatus = false;
      this.arrowDown = true;
    }
  }

  showAlertToastrforFirstPatron(){
    if(this.disableSendStatus){
      let message = this.translate.instant('Restrict_To_Inactive_Patron');
      this.alertService.failureToast(message);
    }
  }
  showAlertToastrSecondPatron(){
    if(this.disableReceiveStatus){
      let message = this.translate.instant('Restrict_To_Inactive_Patron');
      this.alertService.failureToast(message);
    }
  }
}
