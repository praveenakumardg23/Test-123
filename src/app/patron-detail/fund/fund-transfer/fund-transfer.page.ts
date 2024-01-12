import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared/shared.service';
import { DataService } from 'src/app/services/data/data.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { FundDetails } from 'src/app/services/data/model/fund';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert/alert.service';
import { LanguageService } from 'src/app/services/language/language.service';
@Component({
  selector: 'app-fund-transfer',
  templateUrl: './fund-transfer.page.html',
  styleUrls: ['./fund-transfer.page.scss'],
})
export class FundTransferPage implements OnInit {
  isOther:boolean = false
  allPatronSourceAccounts: any;
  fundTransfer: any;
  selectedPatronFrom: any;
  selectedPatronTo: any;
  patronSourceAccount = [];
  patronSourceAccountBalance = Number('0.00').toFixed(2);
  patronTransferBalance = 0;
  filterdPatronSourceAccounts: any;
  sourceAccount: any;
  targetAccount: any;
  ftTermsChecked: boolean = false;
  isIndividualPatronName:any = '';
  isIndividualPatron: any;
  isIndividualPatronFlag: boolean = false;
  popHeading: any;
  fundContent: any;
  fundContent2;
  fundContent3;
  fundContent4;
  selectedPatronFromID;
  transferAmountFlag: boolean = false;
  isApplyTermsTouched:boolean = false;
  constructor(
    private modalController: ModalController, private fb: FormBuilder,
    private sharedService: SharedService, private translateService: TranslateService,
    private dataService: DataService, private alertService: AlertService,
    public languageService: LanguageService,
  ) { }

  ngOnInit() {
    this.isIndividualPatron = this.sharedService.getFundTransfer();
    if (this.isIndividualPatron && this.isIndividualPatron.PatronDetails) {
      this.selectedPatronFromID = this.isIndividualPatron.PatronDetails;
      this.isIndividualPatronFlag = true;
      
    }
    this.getAllPatronSourceAccounts();
    this.fundTransfer = this.fb.group({
     individualPatron: new FormControl({value: '', disabled: true}, Validators.nullValidator),
     patronFrom: ['', Validators.compose([Validators.required])],
     patronAccount: ['', Validators.compose([Validators.required])],
     patronAccountBalance: new FormControl({value: '', disabled: true}, Validators.required),
     patronTransferBalance: [this.patronTransferBalance, Validators.compose([Validators.required])],
     patronTo: ['', Validators.compose([Validators.required])],
     isCheckedFT: [false, Validators.compose([Validators.required])],
   });
  }

  onKeyUp(event: any) {
    this.isOther= true;
    const MY_REGEXP = /^[0-9]*(\.[0-9]{0,2})?$/;
    let newValue = event.target.value;
    let regExp = new RegExp(MY_REGEXP);

    if (!regExp.test(newValue)) {
      event.target.value = newValue.slice(0, -1);
    }  
    this.patronTransferBalance = event.target.value;
    if(!(event.target.value.charAt(event.target.value.length - 1) === ".")){
      this.onBalanceChange(this.patronTransferBalance);
    }
  }

  onBalanceChange(accountBalance) {
    if (Number(accountBalance) <= Number(this.patronSourceAccountBalance)) {
      this.patronTransferBalance = accountBalance;
      this.transferAmountFlag = false;
    }else {
      this.transferAmountFlag = true;
    }
  }
  getAllPatronSourceAccounts() {

    this.dataService.getAllPatronSourceAccounts()
      .subscribe(
        (response: any) => {
          if (response.body.APIStatus == 'Success') {
             this.allPatronSourceAccounts = response.body.Patrons;
             
             if (this.isIndividualPatron && this.isIndividualPatron.PatronDetails) {
                this.selectedPatronFrom = response.body.Patrons.filter(item => {
                  return (item.IntPatronId === this.selectedPatronFromID);
                });
                this.fundTransfer.get('patronFrom').clearValidators();
                this.fundTransfer.get('patronFrom').updateValueAndValidity();
                this.isIndividualPatronName = this.selectedPatronFrom[0].FirstName+ " " + this.selectedPatronFrom[0].LastName;
                this.patronSourceAccount = this.selectedPatronFrom[0].SourceAccounts;
                this.selectedPatronFrom = this.selectedPatronFrom[0];
             }
          }
        },
        (error) => {
          console.log(error);

        }
      );
  }

  onPatronFromSelection(patron){
    this.selectedPatronFrom = this.fundTransfer.get('patronFrom').value;
    this.patronSourceAccount = this.fundTransfer.get('patronFrom').value.SourceAccounts;
    this.fundTransfer.get('patronAccount').reset();
    this.fundTransfer.get('patronAccount').setValue('');
    const patronAccount = this.fundTransfer.get('patronAccount');
    patronAccount.setValidators([Validators.required]);

    this.fundTransfer.get('patronTo').reset();
    this.fundTransfer.get('patronTo').setValue('');
    const patronTo = this.fundTransfer.get('patronTo');
    patronTo.setValidators([Validators.required]);

    this.fundTransfer.get('patronTransferBalance').setValue('0');
  }

  onPatronAccountSelection(event){
    this.fundTransfer.get('patronTo').reset();
    this.fundTransfer.get('patronTo').setValue('');
    const patronTo = this.fundTransfer.get('patronTo');
    patronTo.setValidators([Validators.required]);

    this.fundTransfer.get('patronTransferBalance').setValue('0');
    this.sourceAccount = this.fundTransfer.get('patronAccount').value;
    //this.fundTransfer.get('patronTo').reset();
    this.patronSourceAccountBalance = Number(this.fundTransfer.get('patronAccount').value.Balance).toFixed(2);
    let sourceAccounts = []
    let fundDetails = new FundDetails();
    let filteredPatronData: any;

    this.allPatronSourceAccounts.forEach((items, index) => {
      items.SourceAccounts.forEach((item, index) => {
        if(item.IntFundId == this.sourceAccount.IntFundId && items.IntPatronId !== this.selectedPatronFrom.IntPatronId && items.Active == true){
          fundDetails = new FundDetails();
          fundDetails.FirstName = items.FirstName;
          fundDetails.LastName = items.LastName;
          fundDetails.IntPatronId = items.IntPatronId;
          fundDetails.IntUserId = items.IntUserId;
          fundDetails.IntDistrictId = items.IntDistrictId;
          fundDetails.IntSiteId = items.IntSiteId;
          fundDetails.Active = items.Active;

          fundDetails.IntPatronAccountId = item.IntPatronAccountId;
          fundDetails.IntFundId = item.IntFundId;
          fundDetails.AccountName = item.AccountName;
          fundDetails.Balance = item.Balance;
          sourceAccounts.push(fundDetails)
        }
      });
    });
    this.filterdPatronSourceAccounts = sourceAccounts;
    if(this.filterdPatronSourceAccounts.length == 0 && this.sourceAccount) {
      this.showTransferError();
    }
    if(this.filterdPatronSourceAccounts.length == 0) {
      this.patronSourceAccountBalance = Number('0.00').toFixed(2);
      this.patronTransferBalance = 0;
    }
  }

  showTransferError () {
    const m1 = '<p>' + this.translateService.instant('fund_transfer_error_1') + '</p>' + " " + "'"+this.selectedPatronFrom.FirstName+ " "+ this.selectedPatronFrom.LastName+"'" + " " + '<p>' + this.translateService.instant('fund_transfer_error_2') + '</p>';
    // const m2 =  this.selectedPatronFrom.FirstName + " " + this.selectedPatronFrom.LastName;
    //const m3 = '<p>' + this.translateService.instant('fund_transfer_error_2') + '</p>';
    const m4 = '<p>' + this.translateService.instant('fund_transfer_error_3') + '</p>';
    const m5 = '<p>' + this.translateService.instant('fund_transfer_error_4') + '</p>';
    const m6 = '<p>' + this.translateService.instant('fund_transfer_error_5') + '</p>';
    const message = m1 + m4 + m5 + m6;
    const header = this.translateService.instant('warning');
    this.alertService.alert(header, message);
  }

  onPatronToSelection(patronTo){
    this.selectedPatronTo = this.fundTransfer.get('patronTo').value;
  }

  ftTerms(event){
    this.isApplyTermsTouched = true;
    this.ftTermsChecked = event.detail.checked;
    }

    onFundTransfer(fundTransfer){
      let requestdata = {
        IntSiteId: this.selectedPatronTo.IntSiteId,
        IntUserId: this.selectedPatronTo.IntUserId,
        IntDistrictId: this.selectedPatronTo.IntDistrictId,
        IntFundId: this.selectedPatronTo.IntFundId,
        SourcePatronId:  this.selectedPatronFrom.IntPatronId,
        SourceAccountId: this.sourceAccount.IntPatronAccountId,
        TargetPatronId: this.selectedPatronTo.IntPatronId,
        TargetAccountId: this.selectedPatronTo.IntPatronAccountId,
        TargetAmount: this.patronTransferBalance,
      };
      this.dataService.transferAccountFund(requestdata)
        .subscribe(
          (response: any) => {
            if (response.body.APIStatus == 'Success') {
              this.modalController.dismiss();
              let transferAmount = Number(response.body.TransferAmount).toFixed(2);
              let sourcePatron = response.body.SourcePatron;
              let targetPAtron = response.body.TargetPatron;
              let message = "$"+transferAmount+ " " + this.translateService.instant('IS_Transfer_Successfull') + " " + targetPAtron; 
  
              this.alertService.successAlert(message);
            } else if(response.body.APIStatus == 'Error'){
              this.modalController.dismiss();
              const message = this.translateService.instant(response.body.APIStatusReason);
              this.alertService.failureToast(message);
            }
          },
          (error) => {
            console.log(error);
          }
        );
  
    }

  onDismiss() {
    this.modalController.dismiss();
  }

}
