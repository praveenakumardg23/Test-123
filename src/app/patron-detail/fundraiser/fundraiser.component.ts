import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { SharedService } from './../../services/shared/shared.service';
import { DataService } from './../../services/data/data.service';
import { ModalController, AlertController, Platform, NavController } from '@ionic/angular';
import { LanguageService } from './../../services/language/language.service';
import { AlertService } from './../../services/alert/alert.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FundraiserInfoPopUpComponent } from 'src/app/fundraiser-info-pop-up/fundraiser-info-pop-up.component';
import { AddToCartPopupComponent } from 'src/app/add-to-cart-popup/add-to-cart-popup.component';
import { CustomFieldsComponent } from 'src/app/custom-fields/custom-fields.component';
import { EventService } from 'src/app/serviceEvent/event.service';

// import { FeeOptional} from './../../services/shared/shared.service';

@Component({
  selector: 'app-fundraiser',
  templateUrl: './fundraiser.component.html',
  styleUrls: ['./fundraiser.component.scss'],
})
export class FundraiserComponent implements OnInit {
  patrons: any;
  paymentMethods:any;
  districtFeaturelist:any;
  selectedPatronData:any;
  FirstName:any;
  LastName:any;
  Active:any;
  cartCount:any;
  IntPatronId: any;
  feesDatamain:any;
  selectedFeeType: any = '0';
  feebackup:any;
  filterdata:any;
  searchTextdata: any = '';
  unGroupedFeeList:any;
  groupedFeeList:any;
  noDataFound:any=false;
  editmode:any;
  amount:any;
  searchText:any;
  FundraiserFeesCartItems:any;
  optionalFeesCartItems:any;
  cartItems:any;
  IntSiteId:any;
  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef<any>;
  constructor(
    public alertService: AlertService,
    private router: Router,
    public languageService: LanguageService,
    private modalController: ModalController,
    private alertController: AlertController,
    private sharedService: SharedService,
    private dataService: DataService,
    private datePipe: DatePipe,
    private translate: TranslateService,
    private keyboard: Keyboard,
    private platform: Platform,
    private navCtrl: NavController,
    private events: EventService,) { }
    ionViewWillEnter() {
      this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
      this.selectedPatronData = this.sharedService.getselectPatronWithData();
      const selectedPatron = JSON.parse(localStorage.getItem('selectedPatron'))
      if (this.selectedPatronData && !selectedPatron) {
        localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
      } else {
        this.selectedPatronData = JSON.parse(localStorage.getItem('selectedPatron'));
      }
      this.FirstName = this.selectedPatronData.data.FirstName;
      this.LastName = this.selectedPatronData.data.LastName;
      this.Active = this.selectedPatronData.data.Active;
      this.getUserPatrons();
      this.sharedService.cartCount.subscribe((cartCount) => {
        this.cartCount = cartCount;
      })
    }
  ngOnInit() {
    this.getPaymentMethod();
    this.keyboard.onKeyboardShow().subscribe(() => {
      if (this.platform.is('ios') && (this.router.url == '/dashboard/patron-detail/fundraiser')) {
        let mealAlert = document.getElementsByTagName('ion-alert')[0];
        mealAlert.classList.add("custom_movealert");

      }
    });
    this.keyboard.onKeyboardHide().subscribe(() => {
      if (this.platform.is('ios') && (this.router.url == '/dashboard/patron-detail/fundraiser')) {
        let mealAlert = document.getElementsByTagName('ion-alert')[0];
        mealAlert.classList.remove("custom_movealert");

      }
    });
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getUserPatrons()    
   });
  //  this.events.subscribe('updated fields', (data) => {
  //   if(data == true) {
  //     this.getUserPatrons();
  //   }
  // });
  }
  onSelectedStudent(data) {
    console.log(data)
    this.getUserPatrons()
    this.selectedPatronData = {
      "type": data.IntPatronId == "" ? "all" : "individual",
      "data": data
    }
    this.FirstName = this.selectedPatronData.data.FirstName;
    this.LastName = this.selectedPatronData.data.LastName;
    this.Active = this.selectedPatronData.data.Active;
    localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
   // this.getCartItems();
  }
  getPaymentMethod() {
    this.sharedService.loading.next(true);
    this.dataService.getPaymentMethods()
      .subscribe(
        (response: any) => {
          this.paymentMethods = response.body.PaymentMethods.length;

          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }
  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          const allStudentArray = [
            {
              "FirstName": this.translate.instant('All'),
              "LastName": this.translate.instant('Students'),
              "PictureData": "allStudentPicture",
              "IntPatronId": ""
            }
          ]
          this.sharedService.loading.next(false);
          const patrons = response.body.Patrons;

          if (patrons.length > 1) {
            this.patrons = allStudentArray.concat(patrons);
          } else {
            this.patrons = patrons;
          }
          if (this.selectedPatronData.type == 'individual') {
            patrons.forEach((patron, index) => {
              if (patron.IntPatronId == this.selectedPatronData.data.IntPatronId) {
                setTimeout(() => {
                  this.widgetsContent.nativeElement.scrollLeft = ((index + 1) * 50) + 30;
                }, 2000)
              }
            })
          }
          this.getCartItems();
         // this.getPaymentMethods();
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
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
       

          if (this.selectedPatronData && this.selectedPatronData.type == 'individual') {
            this.getFundraiserDataForOne();            
            this.IntPatronId = this.selectedPatronData.data.IntPatronId;
          } else {
            this. getFundraiserDataForAll();
            this.IntPatronId = "";
          }
        }
      )
  }
  getFundraiserDataForOne()
  {  
    let reqObj = {
      "IntSiteId": this.selectedPatronData.data.IntSiteId,
      "IntPatronId": this.selectedPatronData.data.IntPatronId,
    }
    this.sharedService.loading.next(true);

    this.dataService.getFundraiserFeeLoggedInUser(reqObj).subscribe(
      (response:any)=>{
        this.sharedService.loading.next(false);

        let feesData = response;
        console.log('feesData',feesData)
        if(feesData){
          let tempFeeData=[]
          console.log(feesData.Fundraiser)

          if(feesData.body.Fundraiser)
          {
            feesData.body.Fundraiser.forEach(elements => {
              elements.IntPatronId=this.selectedPatronData.data.IntPatronId;

            tempFeeData.push(elements)
            console.log(tempFeeData)

            });
          }
          if(feesData.body.OptionalFees)
          {
            feesData.body.OptionalFees.forEach(elements => {
            elements.IntPatronId=this.selectedPatronData.data.IntPatronId;
            tempFeeData.push(elements)
            });
          }
          this.feesDatamain=tempFeeData;
          this.feebackup = this.feesDatamain;
          this.filterdata = this.feesDatamain

          this.addAdditionalData(this.feesDatamain);
          this.mergeCardData(this.optionalFeesCartItems,this.feesDatamain,this.FundraiserFeesCartItems)

        }else{
          
          this.noDataFound=true;
        }
       
        
      })
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
      FundraiserFeesCartItems.forEach((optionalCartItem) => {
        console.log('')
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
  getFundraiserDataForAll()
  {  
    this.sharedService.loading.next(true);

    this.dataService.getFundraiserFeeLoggedInUserAll().subscribe(
      (response:any)=>{
        this.sharedService.loading.next(false);

        let feesData = response;
        if(feesData){
          this.IntSiteId=feesData.IntSiteId;
          let tempFeeData=[]
         
            if(feesData.body.Fundraiser)
            {
              feesData.body.Fundraiser.forEach(elements => {
              tempFeeData.push(elements)
              });
            }
            if(feesData.body.OptionalFees)
            {
              feesData.body.OptionalFees.forEach(elements => {
              tempFeeData.push(elements)
              });
            }
         
          this.feesDatamain=tempFeeData;
          this.feebackup = this.feesDatamain;
          this.filterdata = this.feesDatamain
          this.addAdditionalData(this.feesDatamain);
          this.mergeCardData(this.optionalFeesCartItems,this.feesDatamain,this.FundraiserFeesCartItems)

          console.log('this.feesDatamain',this.feesDatamain)
        }else{
          this.noDataFound=true;
        }
       
        
      })
  }
 addAdditionalData(data)
 {
  data.forEach(element => {
    element.disabledAttribute = ''
    element.attributeSelected = ''
    element.clikedOnCard = false;
    element.CustomFields=element.CustomFields && element.CustomFields.length > 0 ? element.CustomFields: null,
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
 }
  onSelectedTypeChange() {
    console.log(this.selectedFeeType)
    if (this.selectedFeeType == 0) {
      this.feesDatamain = this.feebackup;
      this.filterdata = this.feesDatamain
      if (this.searchTextdata) {
        const fees = this.filterdata;
        let searchData = this.searchTextdata
        this.feesDatamain = fees.filter(function (fee) {
          return (fee.FeeName.toLowerCase().indexOf(searchData.toLowerCase()) >= 0 );
        });
      }
    }
    if (this.selectedFeeType == 1) {
      this.feesDatamain = this.feebackup.filter((data) => {
        if (data.IsFundraiser !== true) {
          return data;
        }
      })
      console.log(this.feesDatamain)

      this.filterdata = this.feesDatamain
      if (this.searchTextdata) {
        const fees = this.filterdata;
        let searchData = this.searchTextdata
        this.feesDatamain = fees.filter(function (fee) {
          return (fee.FeeName.toLowerCase().indexOf(searchData.toLowerCase()) >= 0 );
        });
      }

    }
    if (this.selectedFeeType == 2) {
      this.feesDatamain = this.feebackup.filter((data) => {
        if (data.IsFundraiser == true) {
          return data;
        }
      })
      this.filterdata = this.feesDatamain
      if (this.searchTextdata) {
        const fees = this.filterdata;
        let searchData = this.searchTextdata
        this.feesDatamain = fees.filter(function (fee) {
          return (fee.FeeName.toLowerCase().indexOf(searchData.toLowerCase()) >= 0 );
        });
      }

    }

  }
  filterFees(data, type) {
    this.searchTextdata = data
    if (data) {
      const fees = this.filterdata;
      this.feesDatamain = fees.filter(function (fee) {
        return (fee.FeeName.toLowerCase().indexOf(data.toLowerCase()) >= 0 );
      });
    }
    else
    {
      this.feesDatamain = this.filterdata;
    }
  }

  async AddFeeInCart(fee) {
    let isDisabled = false;
    let inputValue = null;
     if (fee || fee.CartAmount) {
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
        guestData=result.data;
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
                      return this.saveFeePayments(fee,guestData, customFields);
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
    } else {
      fee.clikedOnCard = true;
    }
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
  saveFeePayments(feeData, guestData,customFields=null) {
    if(guestData.guest.firstname)
    {
      localStorage.firstName=JSON.stringify(guestData.guest.firstname);
      localStorage.lastName=JSON.stringify(guestData.guest.lastname);
    }

    let userId;
        this.patrons.forEach(element => {
      if ('IntUserId' in element)
      {    
        userId=element.IntUserId;
      }
    });
    let obj = {
       "IntSiteId": this.districtFeaturelist.IntSiteId,
       "IntFeeId": feeData.IntFeeId,
       "Active": true,
       "Amount": this.amount,
       "IntPatronCartId": feeData.IntPatronCartId ? feeData.IntPatronCartId : 0,
       "IntFeeAdvanceAttributeId":feeData.selectedAttributeValue ? feeData.selectedAttributeValue :null,
       "CustomFields": (feeData.CustomFields ? feeData.CustomFields : []),
       "FirstName":guestData.guest.firstname?guestData.guest.firstname:null ,
       "LastName":guestData.guest.lastname ? guestData.guest.lastname:null,
       "IntUserId":userId,
       "IntPatronId":guestData.patronForFundraiser?guestData.patronForFundraiser:0
       
     }
     if (customFields != null) {
       obj.CustomFields = customFields;
     }

     this.saveOptionalFeePayment(obj);
 
   }
   saveOptionalFeePayment(obj) {
  
      this.dataService.addFundraiserfeeInCartwithTokan(obj).subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            this.getCartItems();
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
     if(!fee.FirstName)
     {
      if(firstName || lastName && !fee.FirstName)
      {
        fee.FirstName=firstName;
        fee.LastName=lastName;
      }
     }
    // if(firstName || lastName && !fee.FirstName)
    // {
    //   fee.FirstName=firstName;
    //   fee.LastName=lastName;
    // }
    let dropDownData=[]
    if(fee.UserType=='Patron' || fee.UserType=='Both')
    {
      if(fee.UserType=='Both')
      {
        let patronData={
          name:"Guest",
          patronID:0,
        }
        dropDownData.push(patronData);
        let activepatrons = this.patrons.filter((ele:any) => ele.Active === true)
        activepatrons.forEach(element => {
          if(element.IntPatronId !=''  )
          {
            let patronData={
              name:element.FirstName+" "+element.LastName,
              patronID:element.IntPatronId,
            }
            dropDownData.push(patronData)
          }
         
       }); 
      }
      // if(fee.IntPatronId)
      // {  
      //   // dropDownData=[{name:this.selectedPatronData.data.FirstName +" "+this.selectedPatronData.data.LastName,patronID:this.selectedPatronData.data.IntPatronId}]
      //   dropDownData.push({name:this.selectedPatronData.data.FirstName +" "+this.selectedPatronData.data.LastName,patronID:this.selectedPatronData.data.IntPatronId});
      // }
      else
      {
        this.patrons.forEach(element => {
          if(element.IntPatronId !=''  )
          {
            let patronData={
              name:element.FirstName+" "+element.LastName,
              patronID:element.IntPatronId,
            }
            dropDownData.push(patronData)
          }
         
       }); 
      }
      
    }
    else
    {
      if(fee.UserType=='Guest')
      {
        dropDownData=[{name:'Guest',patronID:0}]
      }
    }

    // if(fee.FeeType === 'Fundraiser' || fee.FeeType === 'Default'){
      this.FundraiserFeesCartItems.forEach(element => {
        if(fee['IntFeeId'] === element['IntFeeId']){
          fee['IntPatronId'] = element['IntPatronId']
        }
      });

      this.optionalFeesCartItems.forEach(element =>{
        if(fee['IntFeeId'] === element['IntFeeId']){
          fee['IntPatronId'] = element['IntPatronId']
        }
      })
    // }
    const modal = await this.modalController.create({
      component: AddToCartPopupComponent,
      cssClass: 'add-to-cart-modal',
      componentProps: {
        fee: fee,
        firstName: this.FirstName,
        lastName: this.LastName,
        isDisabled: isDisabled,
        isForGuest:true,
        userDropDown:dropDownData
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
  selectRadioOption(option, fee) {
    if (option) {
      fee.AmountDue = option.Amount;
      fee.attributeSelected = true;
      fee.disabledAttribute = option;
      fee.selectedAttributeValue = option.IntFeeAttributeId;
    }
  }
validationPart()
{
  const districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));

  if (this.selectedPatronData && this.selectedPatronData.type == 'individual') 
  {
   // Fundraiser Fees==patron -Done
   //Optional Fees==Both
  } else {
    //Fundraiser Fees ==Patron/Guest/Both
    //Optional Fees==Guest/Both
  }

  if(districtFeaturelist.FeeSettings.Fundraiser && districtFeaturelist.FeeSettings.AllowGuest)
    {
     //display All
    }
    if(!(districtFeaturelist.FeeSettings.Fundraiser && districtFeaturelist.FeeSettings.AllowGuest))
    {
     //hide All
    }
    if(districtFeaturelist.FeeSettings.Fundraiser && ! districtFeaturelist.FeeSettings.AllowGuest)
    {
      //Fundraisers==patron only
      //Optional Fees !=Guest/Both 
    }
    if(! districtFeaturelist.FeeSettings.Fundraiser &&  districtFeaturelist.FeeSettings.AllowGuest)
    {
      //Fundraisers==hide all
      //Optional==Guest/Both
    }

}
onDisplayLang() {
  this.languageService.displayLanguageAlert();
}
onGotoCart() {
  this.navCtrl.navigateRoot(['/dashboard/cart']);
}
}
