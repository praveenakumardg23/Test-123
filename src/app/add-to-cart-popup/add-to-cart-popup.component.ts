import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FundraiserserviceService } from '../fundraiserfee/fundraiserservice/fundraiserservice.service';
import { AlertService } from './../services/alert/alert.service';
import { FormArray, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
import { LanguageService } from '../services/language/language.service'; 
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-to-cart-popup',
  templateUrl: './add-to-cart-popup.component.html',
  styleUrls: ['./add-to-cart-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddToCartPopupComponent implements OnInit {

  @Input() fee: any;
  @Input() FirstName: string='';
  @Input() LastName: string='';
  @Input() isDisabled: string='';
  @Input() isForGuest: string='';
  @Input() userDropDown: any;
  userDetailsForm: FormGroup;

  days: string = "";
  amountDue: string = "";
  amountPaid: string = "";
  feeType: string = "";
  start_date: any;
  end_date: any;
  class_time: any;
  amountEntered: any;
  amount: any;
  guest:any=[];
  SelectedpatronID:any;
  tempStorage:any;
  clikedOnCard = false;
  selectedAttribute;
  isValueChanged = false;
  isSubmitted:any;
  constructor(public alertService: AlertService,public languageService: LanguageService,public translate: TranslateService,
              private modalController: ModalController, private fb: FormBuilder, public funsraiserService: FundraiserserviceService) {

  }
  ngOnInit(){
    
  }
  ionViewWillEnter() {
    console.log("this.fee", this.fee);
    this.amountDue = this.fee.modifiedFeeType == 'Optional Fee' ? this.fee.AmountDue : this.fee.NetAmount - this.fee.ScheduledAmount - (this.fee.CartAmount ? this.fee.CartAmount : 0);
    this.amountPaid = this.fee.AmountPaid == undefined ? 0 : this.fee.AmountPaid;
    this.feeType = this.fee.modifiedFeeType;

    if (this.fee.selectedAttributeValue) {
      if (this.fee.Attribute.Type === 'Dropdown') {
        this.fee.Attribute.Options.forEach(element => {
          if (element.IntFeeAttributeId === this.fee.selectedAttributeValue) {
            this.selectedAttribute = element;
          }
        });
      }
      this.fee.attributeSelected = true;
  }

    if(this.fee.CartAmount > 0){
      this.amount = Number(this.fee.CartAmount).toFixed(2) 
    }else{
      this.amount=Number(this.amountDue).toFixed(2)
    }
    
    if(this.userDropDown.length > 0)
    {
      this.SelectedpatronID= this.userDropDown.length === 1 || this.fee['IntPatronId'] === undefined ? this.userDropDown[0].patronID : this.fee['IntPatronId'];
      //this.SelectedpatronID= this.SelectedpatronID.patronID;
      // if(this.fee.CartAmount > 0){ 
      //   this.userDropDown.forEach(element => {
      //   if(this.fee.FirstName == element.name.split(' ')[0]){
      //   this.SelectedpatronID= this.fee['IntPatronId']; 
      //   }  
      // });  
      // }
        
      this.SelectedpatronID = this.SelectedpatronID? this.SelectedpatronID: this.userDropDown[0].patronID;
      if(this.SelectedpatronID ==0)
      {
        this.guest.firstname=this.fee.FirstName
        this.guest.lastname=this.fee.LastName
        this.userDetailsForm = this.fb.group({
          firstName: [this.guest.firstname, Validators.compose([Validators.required])],
          lastName: [this.guest.firstname, Validators.compose([Validators.required])],
        });
      }
     else
     {
      this.userDetailsForm=null
     }
    }
    if(!this.isForGuest || this.userDropDown.length > 0)
    {
    if(this.fee.Session){
      const startDate = new Date(this.fee.Session.PeriodStartDateTime);
      const endDate = new Date(this.fee.Session.PeriodEndDateTime);
      this.start_date = (new Date(this.fee.Session.PeriodStartDateTime).getMonth() + 1) + "/" + new Date(this.fee.Session.PeriodStartDateTime).getDate() + "/" +
      new Date(this.fee.Session.PeriodStartDateTime).getFullYear().toString().substr(-2);
      this.end_date = (new Date(this.fee.Session.PeriodEndDateTime).getMonth() + 1) + "/" + new Date(this.fee.Session.PeriodEndDateTime).getDate() + "/" +
      new Date(this.fee.Session.PeriodEndDateTime).getFullYear().toString().substr(-2);
      this.class_time = ("0"+new Date(startDate).getHours()).slice(-2) + ":" + ("0"+new Date(startDate).getMinutes()).slice(-2)
       + " to " + ("0"+new Date(endDate).getHours()).slice(-2) + ":" +
       ("0"+new Date(endDate).getMinutes()).slice(-2);
      
    if (this.fee.Session.SessionCode) {
      if (this.fee.Session.SundaySw)
        this.days = this.days + "Sun ";
      if (this.fee.Session.MondaySw)
        this.days = this.days + "Mon ";
      if (this.fee.Session.TuesdaySw)
        this.days = this.days + "Tue ";
      if (this.fee.Session.WednesdaySw)
        this.days = this.days + "Wed ";
      if (this.fee.Session.ThursdaySw)
        this.days = this.days + "Thu ";
      if (this.fee.Session.FridaySw)
        this.days = this.days + "Fri ";
      if (this.fee.Session.SaturdaySw)
        this.days = this.days + "Sat";
    }
  }
    this.days = this.days.split(" ").join(", ");
    console.log(this.fee)
  }
  else
  {
    this.guest.firstname=this.fee.FirstName
    this.guest.lastname=this.fee.LastName
    this.userDetailsForm = this.fb.group({
      firstName: [this.guest.firstname, Validators.compose([Validators.required])],
      lastName: [this.guest.firstname, Validators.compose([Validators.required])],
    });
  }
 
  }
  keyup(event)
  {

   if(event.target.value.indexOf('.') >= 0)
   {
    if((event.target.value.length-event.target.value.indexOf('.')-1) > 2)
    {
      // event.target.value=Number(event.target.value).toFixed(2)
      var arr = ("" + event.target.value).split(".");
      if (arr.length !== 1 && arr[1].length !== 1){
        event.target.value =  arr[0]+"."+arr[1].substring(0,2);
      } 
    }

   // event.target.value=(Math.round(event.target.value * 100) / 100).toFixed(2);

   }
   
  }
  focusOutFunction(event, val)
  {
    event.target.value= Number(event.target.value).toFixed(2);
    if (!val) {
      this.amount = this.tempStorage;
    }
  }
  focusinFunction(val,AllowPartial){
    if (val == 0 || val == '0.00' || AllowPartial) {
      this.amount = '';
    }
    this.tempStorage = val;
  }
  async addToCart() {
    console.log('this.userDetailsForm',this.userDetailsForm)
    if(this.userDetailsForm)
    {
      if(this.userDetailsForm.invalid && this.isForGuest)
      {
      this.userDetailsForm.markAsTouched;
      return
      }
    }
   
    let response = {
      saveFee: "Success",
      amount: this.amount
    }

    // this.modalController.dismiss({
    //        'response': response,
    //        'guest': this.guest,
    //        'patronForFundraiser': this.SelectedpatronID,
    //       });
    if (this.fee.Attribute && !this.fee.attributeSelected) {
      this.clikedOnCard = true;
      this.fee.attributeSelected = false;
    } else {
      this.modalController.dismiss({
        'response': response,
        'guest':this.guest,
        'patronForFundraiser':this.SelectedpatronID,
      });
    }
    
  }

  close() {
    if ((!this.fee.attributeSelected && !this.clikedOnCard && !this.fee.IntFeeAttributeId )|| (!this.fee.CartAmount && this.fee.attributeSelected )) {
      this.fee.attributeSelected = false;
      if(this.isValueChanged){
        this.fee.selectedAttributeValue = null;
      }
      this.selectedAttribute = null;
    }
    this.modalController.dismiss();
  }

  selectRadioOption(option, fee) {
    let selectedAtt =[];
    fee.Attribute.Options.map((item:any) =>{
      if(item.IntFeeAttributeId === option.detail.value){
        selectedAtt.push(item);
      }
    })
    console.log("selectedAtt", selectedAtt)
    if(fee.selectedAttributeValue === null){
      this.isValueChanged = true;
    }
    if (fee.CartAmount || fee.IntFeeAttributeId) {
      fee.attributeSelected = true;
      fee.selectedAttributeValue = selectedAtt[0].IntFeeAttributeId;
      fee.AmountDue = selectedAtt[0].Amount;
      if(fee.NetAmount === undefined || fee.NetAmount === null || fee.NetAmount === 0 ){
        this.amount = Number(fee.AmountDue).toFixed(2);
      } else {
        this.amount = Number(fee.NetAmount).toFixed(2);
      }
      this.selectedAttribute = selectedAtt;
    } else if (selectedAtt) {
      fee.AmountDue = selectedAtt[0].Amount;
      this.amount = Number(selectedAtt[0].Amount).toFixed(2);
      fee.attributeSelected = true;
      this.fee.attributeSelected = true;
      this.selectedAttribute = selectedAtt;
      this.fee.selectedAttributeValue = selectedAtt[0].IntFeeAttributeId;
      fee.selectedAttributeValue = selectedAtt[0].IntFeeAttributeId;
      console.log('option' + selectedAtt);
    }
  }

  compareWith(o1, o2) {
    return o1.id === o2.id;
  }

  selectOption(option, fee) {
    if(fee.selectedAttributeValue === null){
      this.isValueChanged = true;
    }
    if (fee.CartAmount || fee.IntFeeAttributeId) {
      fee.attributeSelected = true;
      fee.selectedAttributeValue = option.IntFeeAttributeId;
      fee.AmountDue = option.Amount;
      if(fee.NetAmount === undefined || fee.NetAmount === null || fee.NetAmount === 0 ){
        this.amount = Number(fee.AmountDue).toFixed(2);
      } else {
        this.amount = Number(fee.NetAmount).toFixed(2);
      }
      this.selectedAttribute = option;
    } else if (option) {
      fee.AmountDue = option.Amount;
      this.amount = Number(option.Amount).toFixed(2);
      fee.attributeSelected = true;
      this.fee.attributeSelected = true;
      this.selectedAttribute = option;
      this.fee.selectedAttributeValue = option.IntFeeAttributeId;
      fee.selectedAttributeValue = option.IntFeeAttributeId;
      console.log('option' + option);
    }
  }
  onKeyPressEvent(event) {

    let keyCode=event.target.value.substr(event.target.value.length - 1).charCodeAt();
    
    if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122) || keyCode == 32 || keyCode == 46 || keyCode==39 ||keyCode==45) 
    {
     
    }
    else{
      event.target.value=event.target.value.substr(0, event.target.value.length -1)
    }

}
selectUserDropDown(event)
{
  this.SelectedpatronID=event.detail.value;
  if(this.SelectedpatronID ==0)
  {
    this.userDetailsForm = this.fb.group({
      firstName: [this.guest.firstname, Validators.compose([Validators.required])],
      lastName: [this.guest.firstname, Validators.compose([Validators.required])],
    });
  }
  else
  {
    this.userDetailsForm=null
  }
  console.log(event.detail.value)

}



}


