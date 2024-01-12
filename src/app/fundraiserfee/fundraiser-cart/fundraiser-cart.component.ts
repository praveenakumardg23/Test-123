import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { SharedService } from 'src/app/services/shared/shared.service';
import { AlertService } from '../../services/alert/alert.service';
import { Router } from '@angular/router';
import { LanguageService } from './../../services/language/language.service';
import { UseNewCardPage } from 'src/app/cart/use-new-card/use-new-card.page';
import { CheckoutPage } from 'src/app/cart/checkout/checkout.page';
import { MenuController,PopoverController } from '@ionic/angular';
import { HelppopupComponent } from 'src/app/helppopup/helppopup.component';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-fundraiser-cart',
  templateUrl: './fundraiser-cart.component.html',
  styleUrls: ['./fundraiser-cart.component.scss'],
})
export class FundraiserCartComponent implements OnInit {
  enableNonEditbaleBox:boolean = false;
  newAmount:any;
  enableInput:any;
  public cartItems:any;
  public masterCheck=false;
  public isIndeterminate:boolean = false;
  public cartData:any;
  public TotalAmountDue:any;
  public totalLength:any;
  public selectedPaymentMethodID;
  Email = '';
  CCEmail = '';
  public IntPatronCartId: any;
  selectedCustomeFields = [];
  constructor(
    private dataService: DataService,
    private translate: TranslateService,
    public  languageService: LanguageService,
    private alertController: AlertController,
    private alertService: AlertService,
    private sharedService: SharedService,
    private router: Router,
    private modalController: ModalController,
    public popoverController: PopoverController,
    private authService: AuthService,
    private toastController: ToastController
  
    ) { 
    
  }

  ngOnInit() {
    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    // });
    // this.getcartItems();
  }

  ionViewWillEnter() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.getcartItems();
  }

  getcartItems(){
    this.masterCheck = false;
    this.isIndeterminate = false;
    const payload = {
      CheckMMOStatus: false,
    }
    this.dataService.getCartItemsWithMMOStatus(payload).subscribe(
      (response)=>{
        this.cartData = [];
        this.cartData = response.body;
        this.TotalAmountDue = this.cartData.TotalAmountDue;
        this.groupingFees(this.cartData.Patrons);
        console.log(this.cartData);
        // if(this.cartData)
    })
  }
  
  groupingFees(cartData){
    let feesarray = [];
    cartData.forEach(element => {
      if(element.Fundraiser.length>0){
        element.Fundraiser.forEach(item=>{
          item.FirstNames = item.FirstName +" "+ item.LastName;
          item.feeType = "Fundraiser"
          item.FeeDescription = (item.FeeDescription).replace( /(<([^>]+)>|&nbsp;)/ig, '');
          this.IntPatronCartId = item.IntPatronCartId;
          if(item.Attribute){
            let attr = item.Attribute.Options;
            attr.forEach(option => {
             if(option.IsSelected){
               item.SelectedAttribute = option.IntFeeAttributeId;
             }
            });
          }
          feesarray.push(item);
        })
      }if(element.OptionalFees.length>0){
        element.OptionalFees.forEach(item=>{
          item.FirstNames = item.FirstName +" "+ item.LastName;
          item.FeeDescription = (item.FeeDescription).replace( /(<([^>]+)>|&nbsp;)/ig, '');
          item.feeType = "Optional Fees"
          if(item.Attribute){
            let attr = item.Attribute.Options;
            attr.forEach(option => {
             if(option.IsSelected){
               item.SelectedAttribute = option.IntFeeAttributeId;
             }
            });
          }
          feesarray.push(item);
        })
      }
      this.totalLength = element.OptionalFees.length + element.Fundraiser.length;
    });
    this.cartItems = [];
    let groups = '';
    groups = feesarray.reduce(function(obj, item) {
      obj[item.FirstNames] = obj[item.FirstNames] || [];
      obj[item.FirstNames].push(item);
      return obj;
    }, {});
    this.cartItems = Object.keys(groups).map(function(key) {
      return {
        patronName: key,
        childitems: groups[key],
      };
    });
    console.log(this.cartItems)
  }

  checkMaster() {
    setTimeout(() => {
      this.cartItems.forEach(obj => {
        obj.childitems.forEach(fee =>{
          fee.isChecked = this.masterCheck;
        });
      });
    });
  }

  checkEvent() {
    let totalItems = this.totalLength;
    let checked = 0;
    this.cartItems.forEach(obj => {
      obj.childitems.forEach(fee =>{
        if (fee.isChecked) checked++;
      });
    });
    
    if (checked > 0 && checked < totalItems) {
      //If even one item is checked but not all
      this.isIndeterminate = true;
      this.masterCheck = false;
    } else if (checked == totalItems) {
      //If all are checked
      this.masterCheck = true;
      this.isIndeterminate = false;
    } else {
      //If none is checked
      this.isIndeterminate = false;
      this.masterCheck = false;
    }
  }

  warningmsg(type, cartdata) {
    let message;
    if (type == 'deleteSelected') {
      message = this.translate.instant('DeleteSingle')
    } else if (type == 'individualSelected') {
      message = this.translate.instant('DeleteSingle')
    }
    const alert = this.alertController.create({
      header: this.translate.instant('warning_cart_msg'),
      message: message,
      buttons: [
        {
          text: this.translate.instant('No'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: this.translate.instant('yes'),
          handler: () => {
            this.removeCartItems(type, cartdata);
          }
        }
      ]
    });

    alert.then((val) => {
      val.present();
    });
  }

  removeCartItems(type, cartdata) {
    let obj;
    let selectedCartItems
    if (type == 'deleteSelected') {
      const cartItemArray = [];
      cartdata.forEach(cartdata => {
        selectedCartItems = cartdata.childitems.filter((data) => {
          if (data.isChecked) {
            const patronId = { "IntPatronCartId": data.IntPatronCartId };
            cartItemArray.push(patronId);
            return data;
          }
        })
      });
      obj = {
        "CartItems": cartItemArray
      }
    } else if (type == 'individualSelected') {
      obj = {
        "CartItems": [
          { "IntPatronCartId": cartdata.IntPatronCartId }
        ]
      }
    }

    this.dataService.removeCartItems(obj)
      .subscribe(
        (response: any) => {
          const err_msg = response.body.APIStatusReason.slice(0, 10);
          if (response.body.APIStatus == 'Error' && err_msg == 'MMO_ERROR_') {
            this.alertService.failureToast('MMO_ERROR_MSG');
          } else {
            this.totalLength = 0;
            this.getcartItems();
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  async onContinue(cartItems) {
    for(let i = 0; i < cartItems.length; i++) {
      if(cartItems[i].DisableApplyMealBalance === true) {
        cartItems[i].ApplyMealBalance = false;
      }   
    }
   
      const obj = {
        
        "cartData": this.cartData,
        "cartItems": cartItems,
        "Email": this.Email,
        "IntPatronCartId": this.IntPatronCartId
      };
      sessionStorage.setItem('Email', this.Email);
      sessionStorage.setItem('CCEmail', this.CCEmail);
      const modal = await this.modalController.create({
        component: UseNewCardPage,
        componentProps: {
          Data: obj
        }
      });
      modal.onDidDismiss()
        .then((dismissData) => {
          // this.paymentMethods();
          if (dismissData.data) {
            this.cartItems = dismissData.data;
          }
        });
      return await modal.present();
  
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }
  onGotoCart() {
    this.router.navigate(['/fundraiserfee/fundraiser-cart']);
  }
  backButton(param: any) {
    this.router.navigate([param]);
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: HelppopupComponent,
      showBackdrop:false,
      componentProps: {
        showLogout:"true",
      }
    });
    popover.style.cssText = '--min-width: 50px; --max-width: 88px;top: -40%;left :30%';
    return await popover.present();
  }

  backtoLogin(){
    if (this.sharedService.isGuestUser === true) {
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      sessionStorage.removeItem('Email');
      sessionStorage.removeItem('CCEmail');
      }
    this.authService.logout('logout');
  }

  editAmount(id, element){
    console.log(element);  
    console.log(id);  
    if(element.AllowPartial === false && element.VariablePriced === false){
      this.enableNonEditbaleBox = true;
      this.alert('The fee can’t be edited');
    }else{
      this.enableInput = id;
      this.newAmount = element.CartAmount;
    }
   
  }

  saveAmount(id, FeeDetailist){
    console.log(FeeDetailist);
    if(FeeDetailist.AmountDue < this.newAmount && FeeDetailist.AmountDue != 0 ){
      this.newAmount = '';
      this.enableInput = '';
     // alert("The amount shouldn’t exceed the set value");
      this.nonEditableToast('The amount shouldn’t exceed the set value');
     return;
   }else{
     FeeDetailist.CartAmount = this.newAmount;
   }
   if(FeeDetailist.CustomFields){
    this.fetchCustomFields(FeeDetailist.CustomFields);
   }
    
    if(FeeDetailist.feeType === 'Optional Fees'){
          const payloadOptional: any = {
            IntSiteId: this.cartData.Patrons[0].IntSiteId,
            IntPatronId: 0,
            IntUserId: FeeDetailist.IntUserId,
            IntFeeId: FeeDetailist.IntFeeId,
            Active: true,
            Amount: FeeDetailist.CartAmount,
            IntPatronCartId: 0,
            IntFeeAdvanceAttributeId: FeeDetailist.SelectedAttribute ? FeeDetailist.SelectedAttribute: null,
            CustomFields: this.selectedCustomeFields ? this.selectedCustomeFields : [],
            FirstName: FeeDetailist.FirstName,
            LastName: FeeDetailist.LastName,
          };
         this.saveOptionalFeePayment(payloadOptional);
    }else if(FeeDetailist.feeType === 'Fundraiser'){

          const payloadOptional: any = {
            IntSiteId: this.cartData.Patrons[0].IntSiteId,
            IntPatronId: 0,
            IntFeeId: FeeDetailist.IntFeeId,
            Active: true,
            Amount: FeeDetailist.CartAmount,
            IntPatronCartId: 0,
            IntFeeAdvanceAttributeId: FeeDetailist.SelectedAttribute ? FeeDetailist.SelectedAttribute: null,
            CustomFields: this.selectedCustomeFields ? this.selectedCustomeFields : [],
            FirstName: FeeDetailist.FirstName,
            LastName: FeeDetailist.LastName,
          };
        this.saveOptionalFeePayment(payloadOptional);
    }
  }

  fetchCustomFields(data){
    this.selectedCustomeFields = [];
    console.log(data);
    for(let i = 0; i < data.length; i++) {
       if(data[i].UserValue !== "" && data[i].UserValue !== undefined && data[i].UserValue !== null){
        let field = {
          IntFeeCustomFieldId: data[i].IntFeeCustomFieldId,
          FieldValue: data[i].UserValue,
          IntFeeCustomFieldOptionId: null
        }
        this.selectedCustomeFields.push(field);
       }else if(data[i].UserValue === ""){
      let selectedvalue =  data[i].Options.filter((e) =>e.IsSelected === true);
        if(selectedvalue){
          let field = {
            IntFeeCustomFieldId: data[i].IntFeeCustomFieldId,
            FieldValue: data[i].UserValue,
            IntFeeCustomFieldOptionId: selectedvalue[0].IntFeeCustomFieldOptionId
          }
          this.selectedCustomeFields.push(field);
        }
        
       }
    }
  }
  saveOptionalFeePayment(payload) {
    this.dataService.addFundraiserfeeInCartwithTokan(payload).subscribe(
      (response: any) => {
        this.sharedService.loading.next(false);
        if (response.body.APIStatus == 'Success' && response.status == 200) {
          this.newAmount = '';
          this.enableInput = '';
          this.getcartItems();
        } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
          const message = this.translate.instant('contact_support');
          this.alertService.failureToast(message);
        } else {
          const message = this.translate.instant('error_due_to');
          this.alertService.checkPEProcessingMessages(response.body, message);
        }
      },
      (error) => {
        this.sharedService.loading.next(false);
      })
  }

  nonEditableToast(message) {
    const alert = this.alertController.create({
      message: this.translate.instant('Set_Value_Error'),
      buttons:  [this.translate.instant('close')]
    });
    alert.then((res) => {
      res.present();
    });
  }

  alert(message: string) {
    const alert = this.alertController.create({
      message: this.translate.instant('Non_edit'),
      buttons: [this.translate.instant('ok')]
    });

    alert.then((res) => {
      res.present();
    })
  }

  closeInputField(){
    this.enableInput = '';
    this.enableNonEditbaleBox = false;
  }

  focusOutFunction(event)
  {
    event.target.value= Number(event.target.value).toFixed(2);
    
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

}
