import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { SharedService } from './../../services/shared/shared.service';
import { DataService } from './../../services/data/data.service';
import { ModalController, AlertController, Platform, NavController, PopoverController } from '@ionic/angular';
import { LanguageService } from './../../services/language/language.service';
import { AlertService } from './../../services/alert/alert.service';
import { Component, OnInit, ViewChild, ElementRef, importProvidersFrom } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FundraiserInfoPopUpComponent } from 'src/app/fundraiser-info-pop-up/fundraiser-info-pop-up.component';
import { FundraiserserviceService } from '../fundraiserservice/fundraiserservice.service';
import { AddToCartPopupComponent } from 'src/app/add-to-cart-popup/add-to-cart-popup.component';
import { CustomFieldsComponent } from 'src/app/custom-fields/custom-fields.component';
import { HelppopupComponent } from 'src/app/helppopup/helppopup.component';
import { AuthService } from 'src/app/auth/auth.service';
import { EventService } from 'src/app/serviceEvent/event.service';

@Component({
  selector: 'app-fundraiser-fees',
  templateUrl: './fundraiser-fees.component.html',
  styleUrls: ['./fundraiser-fees.component.scss'],
})
export class FundraiserFeesComponent implements OnInit {
  feesData: any;
  unGroupedFeeList: any;
  groupedFeeList: any;
  selectedFeeType: any = '0';
  feebackup: any;
  filterdata: any;
  searchTextdata: any = '';
  guestCheckoutInfo: any
  cartCount:any=0;
  editmode:any;
  amount:any;
  FundraiserFeesCartItems:any;
  optionalFeesCartItems:any;
  cartItems:any;
  searchText:any;
  constructor(public alertService: AlertService,
    private router: Router,
    public languageService: LanguageService,
    private modalController: ModalController,
    private alertController: AlertController,
    private sharedService: SharedService,
    private dataService: DataService,
    private translate: TranslateService,
    private events: EventService,
    private funsraiserService: FundraiserserviceService,
    private navCtrl: NavController,
    public popoverController: PopoverController,
    private authService: AuthService,

    ) { }

  ionViewWillEnter() {
    this.guestCheckoutInfo = this.funsraiserService.guestCheckoutInfo;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.getFundraiserData(this.guestCheckoutInfo);
    //this.getCartItems()
  }

  ngOnInit() {
  }

  backButton(param: any) {
    sessionStorage.setItem('globals', null);
    localStorage.firstName=JSON.stringify(null);
    localStorage.lastName=JSON.stringify(null);
    this.router.navigate([param]);
  }
  
  getFundraiserData(requestObj: any) {
    let globals: any = JSON.parse(sessionStorage.getItem('globals'));
    sessionStorage.setItem('globals', null);
    this.sharedService.loading.next(true);
    this.dataService.getFundraiserFee(requestObj).subscribe(
      (response: any) => {
        if(response.body.APIStatus === 'Success'){
          if(globals!=null)
          {
            sessionStorage.setItem('globals', JSON.stringify(globals));
              setTimeout(()=>{
                this.getCartItems();
              }, 500)
            // this.sharedService.loading.next(false);
  
          }
          this.sharedService.loading.next(false);
        }
        if(!this.feesData){
          this.feesData = response.body.fundraiserFees;
        }else{
          this.feesData = this.addFeesArray(this.feesData, response.body.fundraiserFees);
          console.log(this.feesData, "update Fees");
        }
        this.feesData = response.body.fundraiserFees;
        
        this.unGroupedFeeList = response.body.fundraiserFees;
        if (this.feesData) {
          this.feesData.forEach(element => {
            element.disabledAttribute = ''
            element.attributeSelected = ''
            element.clikedOnCard = false;
            element.modifiedFeeType='Optional Fee';
            if (element.Attribute) {
              element.Attribute.Options.sort((a, b) => a.Amount - b.Amount);
              var lowest = Number.POSITIVE_INFINITY;
              var tmp;
              for (var i = element.Attribute.Options.length - 1; i >= 0; i--) {
                tmp = element.Attribute.Options[i].Amount;
                if (tmp < lowest) {
                  lowest = tmp;
                }
              }
              element.AmountDue = lowest;

            }
          });
          this.feebackup = this.feesData;
          this.filterdata = this.feesData
         
        }


      }, (error) => {
        this.sharedService.loading.next(false);
        console.log(error)
      })
  }
  
  addFeesArray(feeData, newFeeArray){
    feeData.forEach((existingFee) => {
      newFeeArray.forEach((newFee) => {
        if (existingFee.IntFeeId == newFee.IntFeeId ) {
          existingFee.CartAmount = newFee.CartAmount? newFee.CartAmount: null ;
          existingFee.AmountPaid = newFee.AmountPaid;
          existingFee.IntPatronCartId = newFee.IntPatronCartId;
          existingFee.AmountDue= existingFee.AmountDue;
          existingFee.FirstName=newFee.FirstName;
          existingFee.LastName=newFee.LastName;
          existingFee.selectedAttributeValue=newFee.selectedAttributeValue;
          if(existingFee.CustomFields){
            existingFee.CustomFields.forEach((customField)=>{
              newFee.CustomFields.forEach(element => {
                if(element.IntFeeCustomFieldId == customField.IntFeeCustomFieldId){
                  customField.UserValue = element.UserValue;
                  customField.Options = element.Options;
                }
              });
            })
          }
          
        }
      })
    });
    return feeData;
  }
  mergeCardData(optionalCartItems, individualOptionalFees,FundraiserFeesCartItems)
  {
    console.log('optionalCartItems',optionalCartItems,'individualOptionalFees',individualOptionalFees,'FundraiserFeesCartItems',FundraiserFeesCartItems)
    individualOptionalFees.forEach((individualOptionalFee) => {
      optionalCartItems.forEach((optionalCartItem) => {
        if (individualOptionalFee.IntFeeId == optionalCartItem.IntFeeId ) {
          individualOptionalFee.CartAmount = optionalCartItem.CartAmount;
          individualOptionalFee.AmountPaid = optionalCartItem.AmountPaid;
          individualOptionalFee.IntPatronCartId = optionalCartItem.IntPatronCartId;
         individualOptionalFee.AmountDue= individualOptionalFee.AmountDue;
         individualOptionalFee.FirstName=optionalCartItem.FirstName;
         individualOptionalFee.LastName=optionalCartItem.LastName;
          // individualOptionalFee.AmountDue= optionalCartItem.CartAmount;
          individualOptionalFee.selectedAttributeValue=optionalCartItem.selectedAttributeValue;
          if(individualOptionalFee.CustomFields){
            individualOptionalFee.CustomFields.forEach((customField)=>{
              optionalCartItem.CustomFields.forEach(element => {
                if(element.IntFeeCustomFieldId == customField.IntFeeCustomFieldId){
                  customField.UserValue = element.UserValue;
                  customField.Options = element.Options;
                }
              });
            })
          }
          
        }
      })
      FundraiserFeesCartItems.forEach((optionalCartItem) => {
        if (individualOptionalFee.IntFeeId == optionalCartItem.IntFeeId) {
          individualOptionalFee.CartAmount = optionalCartItem.CartAmount;
          individualOptionalFee.AmountPaid = optionalCartItem.AmountPaid;
          individualOptionalFee.IntPatronCartId = optionalCartItem.IntPatronCartId;
         individualOptionalFee.AmountDue= individualOptionalFee.AmountDue;
         individualOptionalFee.FirstName=optionalCartItem.FirstName;
         individualOptionalFee.LastName=optionalCartItem.LastName;
          // individualOptionalFee.AmountDue= optionalCartItem.CartAmount;
          individualOptionalFee.selectedAttributeValue=optionalCartItem.selectedAttributeValue
          if(individualOptionalFee.CustomFields){
            individualOptionalFee.CustomFields.forEach((customField)=>{
              optionalCartItem.CustomFields.forEach(element => {
                if(element.IntFeeCustomFieldId == customField.IntFeeCustomFieldId){
                  customField.UserValue = element.UserValue;
                  customField.Options = element.Options;
                }
              });
            })
          }
        }
      })
    });
    console.log(individualOptionalFees)
   
  }
  selectRadioOption(option, fee) {
    if (option) {
      fee.AmountDue = option.Amount;
      fee.attributeSelected = true;
      fee.disabledAttribute = option;
      fee.selectedAttributeValue = option.IntFeeAttributeId;
    }
  }
  onSelectedTypeChange() {
    if (this.selectedFeeType == 0) {
      this.feesData = this.feebackup;
      this.filterdata = this.feesData
      if (this.searchTextdata) {
        const fees = this.filterdata;
        let searchData = this.searchTextdata
        this.feesData = fees.filter(function (fee) {
          return (fee.FeeName.toLowerCase().indexOf(searchData.toLowerCase()) >= 0 );
        });
      }
    }
    if (this.selectedFeeType == 1) {
      this.feesData = this.feebackup.filter((data) => {
        if (data.IsFundraiser !== true) {
          return data;
        }
      })
      this.filterdata = this.feesData
      if (this.searchTextdata) {
        const fees = this.filterdata;
        let searchData = this.searchTextdata
        this.feesData = fees.filter(function (fee) {
          return (fee.FeeName.toLowerCase().indexOf(searchData.toLowerCase()) >= 0 );
        });
      }

    }
    if (this.selectedFeeType == 2) {
      this.feesData = this.feebackup.filter((data) => {
        if (data.IsFundraiser == true) {
          return data;
        }
      })
      this.filterdata = this.feesData
      if (this.searchTextdata) {
        const fees = this.filterdata;
        let searchData = this.searchTextdata
        this.feesData = fees.filter(function (fee) {
          return (fee.FeeName.toLowerCase().indexOf(searchData.toLowerCase()) >= 0 );
        });
      }

    }

  }
  filterFees(data, type) {
    this.searchTextdata = data
    if (data) {
      const fees = this.filterdata;
      this.feesData = fees.filter(function (fee) {
        return (fee.FeeName.toLowerCase().indexOf(data.toLowerCase()) >= 0 );
      });
    }
    else
    {
      this.feesData = this.filterdata;
    }
  }
	async AddFeeInCart(fee) {
    let isDisabled = false;
    let inputValue = null;
    if (fee || fee.CartAmount ) {
      if(fee.CustomFields) {  
        let customTextData=fee.CustomFields.filter(value=> value.Type === "Text Field"  ||  value.Type === "Text Area");
        let CustomOptionData = fee.CustomFields.filter(value=> value.Type =="Checkbox"|| value.Type == "List" || value.Type =='Dropdown' || value.Type =='Radio Button');
        let CustomFieldsText= customTextData.filter(value=> value.UserValue!=null  &&  value.UserValue!="");
        let CustomFieldsOption= [];
        CustomOptionData.forEach((value)=> {
               value.Options.filter( (x) => {
               if(x.IsSelected === true) {
                CustomFieldsOption.push(x)
               }
              })
          });
          console.log(CustomFieldsText, CustomFieldsOption)
      if((CustomFieldsText && CustomFieldsText.length > 0) || (CustomFieldsOption && CustomFieldsOption.length > 0))
      {
        this.editmode=true;
      } else {
        this.editmode=false;
      }
    }
    if (fee.LimitedSpotsAvailable) {
      inputValue = fee.AmountDue;
      isDisabled = true;
    } else if (fee.VariablePricedSw) {
      inputValue = fee.CartAmount ? fee.CartAmount : null;
      isDisabled = false;
    } else if (!fee.VariablePricedSw && !fee.LimitedSpotsAvailable && fee.AmountDue == 0) {
      inputValue = 0;
      isDisabled = true;
    } else if (fee.AllowPartial) {
      inputValue = fee.CartAmount ? fee.CartAmount : (fee.AmountDue - fee.ScheduledAmount)
    } else {
      inputValue = fee.AmountDue;
      isDisabled = true;
    }
    let alert = await this.openAddToCartModal(fee, isDisabled);
    alert.onDidDismiss().then(async result => {
      let guestData;
      if (result.data && result.data.response.saveFee == "Success") {
        this.amount = result.data.response.amount;
        guestData=result.data.guest;
        if (!fee.VariablePricedSw && !fee.LimitedSpotsAvailable && fee.AmountDue == 0) {
          // here - check this if condition
          if (fee.CustomFields && fee.CustomFields.length > 0) {
            let modalRef = await this.openCustomFieldsModal(fee,'cart');
            modalRef.onDidDismiss().then(result => {
              if (result.data && result.data.response) {
                let customFields = result.data.response.customfields;
                this.saveFeePayments(fee,guestData, customFields);
              }
            });
          } else {
            this.saveFeePayments(fee,guestData);
          }
        } else {
          if (this.amount == 0 || this.amount == '' || this.amount.length > 15) {
            this.alertService.failureToast(this.translate.instant('enter_vld_amt1'));
            // return false;
          } else {
            if (fee.LimitedSpotsAvailable) {
              console.log(2);
              if (fee.CustomFields && fee.CustomFields.length > 0) {
                let modalRef = await this.openCustomFieldsModal(fee,'cart');
                modalRef.onDidDismiss().then(result => {
                  if (result.data && result.data.response) {
                    let customFields = result.data.response.customfields;
                    this.spotFeeAlert(fee,guestData, customFields);
                  }
                });
              } else {
                this.spotFeeAlert(fee,guestData);
              }
            } else {
              let conditionCheckFlag;
              if (fee.VariablePricedSw) {
                conditionCheckFlag = (this.amount == 0 || this.amount == '');
              } else {
                conditionCheckFlag = this.amount == '' || this.amount == 0 || this.amount > (fee.AmountDue - fee.ScheduledAmount)
              }
              if (conditionCheckFlag) {
                if (this.amount > (fee.AmountDue - fee.ScheduledAmount)) {
                  this.alertService.failureToast(this.translate.instant('pay_amount'));
                } else {
                  this.alertService.failureToast(this.translate.instant('enter_vld_amt1'));
                }
                // return false;
              } else {
                if (fee.CustomFields && fee.CustomFields.length > 0) {
                  let modalRef = await this.openCustomFieldsModal(fee,'cart');
                  modalRef.onDidDismiss().then(result => {
                    if (result.data && result.data.response) {
                      let customFields = result.data.response.customfields;
                      this.saveFeePayments(fee,guestData, customFields);
                    }
                  });
                } else {
                  this.saveFeePayments(fee,guestData);
                }
              }
            }
          }
        }
      }
      return this.saveFeePayments
    })
    }
    else {
      fee.clikedOnCard = true
    }
  }
  saveFeePayments(feeData, guestData,customFields=null) {
    if(guestData.firstname)
    {
      localStorage.firstName=JSON.stringify(guestData.firstname);
      localStorage.lastName=JSON.stringify(guestData.lastname);
    }

   let obj = {
      "IntSiteId": this.guestCheckoutInfo.IntSiteId,
      "IntPatronId": 0,
      "IntFeeId": feeData.IntFeeId,
      "Active": true,
      "Amount": this.amount,
      "IntPatronCartId": feeData.IntPatronCartId ? feeData.IntPatronCartId : 0,
      "IntFeeAdvanceAttributeId":feeData.selectedAttributeValue,
      "CustomFields": (feeData.CustomFields ? feeData.CustomFields : []),
      "FirstName":guestData.firstname,
      "LastName":guestData.lastname,
      "IntUserId":0
      
    }
    if (customFields != null) {
      obj.CustomFields = customFields;
    }
    this.saveOptionalFeePayment(obj);

  }
  saveOptionalFeePayment(obj) {
    let globals: any = JSON.parse(sessionStorage.getItem('globals'));

    if (globals != null) {
      this.dataService.addFundraiserfeeInCartwithTokan(obj).subscribe(
        (response: any) => {
          // this.sharedService.loading.next(false);
          setTimeout(()=>{
            this.getFundraiserData(this.guestCheckoutInfo);
          },1000)
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            // this.getCartItems();
            // this.getFundraiserData(this.guestCheckoutInfo);
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
    }else
    {
      this.dataService.addFundraiserfeeInCartNoTokan(obj).subscribe(
        (response: any) => {
          // this.sharedService.loading.next(false);
          setTimeout(()=>{
            this.getFundraiserData(this.guestCheckoutInfo);
          },1000)
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            sessionStorage.setItem('globals', JSON.stringify(response.body));
            if(response.body.ApiKey){
              this.sharedService.isGuestUser = true;
            }
            // this.getCartItems();
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
   
  }
  getCartItems() {
    this.dataService.getCartItems()
      .subscribe(
        (response: any) => {
          this.sharedService.getCartCount(response);
          
          this.sharedService.loading.next(false);
          const cartItems = response.body.Patrons;
          // console.log(response.body.Patrons);
          const assignedFeesPaymentsModifiedArray = [];
          const optionalFeesPaymentsModifiedArray = [];
          cartItems.forEach((cartItem) => {
            cartItem.Fundraiser.forEach((Payment) => {
              const obj = {
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "IntUserId": cartItem.IntUserId,
                "IntPatronCartId": Payment.IntPatronCartId,
                "IntFeePatronId": Payment.IntFeePatronId,
                "FeeName": Payment.FeeName,
                "FeeCode": Payment.FeeCode,
                "IntFeeId": Payment.IntFeeId, 
                "FeeDescription": Payment.FeeDescription,
                "FeeType": Payment.FeeType,
                "IsPaid": Payment.IsPaid,
                "Active": Payment.Active,
                "AmountDue": Payment.AmountDue,
                "AdjustedAmountDue": Payment.AdjustedAmountDue,
                "AdjustmentReason": Payment.AdjustmentReason,
                "AmountPaid": Payment.AmountPaid,
                "CartAmount": Payment.CartAmount,
                "AssignedDate": Payment.AssignedDate,
                "DueDate": Payment.DueDate,
                "AddedCartAmount": Payment.AddedCartAmount,
                "DiscountAmount": Payment.DiscountAmount,
                "selectedAttributeValue":Payment.IntFeeAttributeId,
                "FirstName":Payment.FirstName,
                "LastName":Payment.LastName,
                "CustomFields":Payment.CustomFields?Payment.CustomFields:null,
              }
              assignedFeesPaymentsModifiedArray.push(obj);
            })

            cartItem.OptionalFees.forEach((Payment) => {
              const obj = {
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "IntUserId": cartItem.IntUserId,
                "IntPatronCartId": Payment.IntPatronCartId,
                "IntFeePatronId": Payment.IntFeePatronId,
                "IntFeeId": Payment.IntFeeId,
                "FeeName": Payment.FeeName,
                "FeeCode": Payment.FeeCode,
                "FeeDescription": Payment.FeeDescription,
                "FeeType": Payment.FeeType,
                "IsPaid": Payment.IsPaid,
                "Active": Payment.Active,
                "AmountDue": Payment.AmountDue,
                "AdjustedAmountDue": Payment.AdjustedAmountDue,
                "AdjustmentReason": Payment.AdjustmentReason,
                "AmountPaid": Payment.AmountPaid,
                "CartAmount": Payment.CartAmount,
                "AssignedDate": Payment.AssignedDate,
                "DueDate": Payment.DueDate,
                "AddedCartAmount": Payment.AddedCartAmount,
                "DiscountAmount": Payment.DiscountAmount,
                "FirstName":Payment.FirstName,
                "LastName":Payment.LastName,
                "selectedAttributeValue":Payment.IntFeeAttributeId,
                "CustomFields":Payment.CustomFields?Payment.CustomFields:null,
              }
              optionalFeesPaymentsModifiedArray.push(obj);
              // if (Payment.FeeName == 'test_iphone'){
              //   console.log(Payment);
              // }
            })
          })
        
          this.FundraiserFeesCartItems = assignedFeesPaymentsModifiedArray;
          this.optionalFeesCartItems = optionalFeesPaymentsModifiedArray;
          this.cartItems = cartItems;
          this.cartCount=Number(this.FundraiserFeesCartItems.length) + Number(this.optionalFeesCartItems.length);
          this.mergeCardData(this.optionalFeesCartItems,this.feesData,this.FundraiserFeesCartItems)
          //this.cartCount = this.cartItems.length;
         // this.getFundraiserData(this.guestCheckoutInfo);
          // this.optionalFeesCartItems.forEach((item)=>{
          //   if (item.FeeName == 'test_iphone'){
          //     console.log(item);
          //   }
          // })
         
        }
      )
  }
  async spotFeeAlert(feeData,guestData, customFields=null) {
    this.modalController.dismiss();
    const alert = await this.alertController.create({
      header: this.translate.instant('warning'),
      message: this.translate.instant('purchase_limit'),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.AddFeeInCart(feeData);
          }
        },
        {
          text: this.translate.instant('ok'),
          handler: () => {
            if (customFields && customFields.length > 0) {
              this.saveFeePayments(feeData, guestData,customFields);
            } else {
              this.saveFeePayments(feeData,guestData);
            }
          }
        }

      ]
    });

    await alert.present();
  }
  async openCustomFieldsModal(fee,cart?) {
    // console.log(fee);
    const modal = await this.modalController.create({
      component: CustomFieldsComponent,
      cssClass: 'custom-fields-modal',
      componentProps: {
        selectedFees: fee,
        editMode: this.editmode,
        methodId: '',
        buttontype:cart
      }
    });

    await modal.present();
    return modal;
  }
  async openAddToCartModal(fee, isDisabled) {
    let firstName=JSON.parse(localStorage.getItem('firstName'));
    let lastName=JSON.parse(localStorage.getItem('lastName'));
    if(firstName || lastName )
    {
      fee.FirstName=firstName;
      fee.LastName=lastName;
    }
    const modal = await this.modalController.create({
      component: AddToCartPopupComponent,
      cssClass: 'add-to-cart-modal',
      componentProps: {
        fee: fee,
        firstName: "this.FirstName",
        lastName: "this.LastName",
        isDisabled: isDisabled,
        isForGuest:true,
        userDropDown:[],
      }
    });

    await modal.present();
    return modal;
  }
  async OpenInfoPopUp(data) {
    const modal = await this.modalController.create({
      component: FundraiserInfoPopUpComponent,
      cssClass: 'add-to-cart-modal',
      componentProps: {
        fee: data,
      }
    });

    await modal.present();
    return modal;
  }
  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }
  onGotoCart() {
    this.router.navigate(['/fundraiserfee/fundraiser-cart']);
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

}
