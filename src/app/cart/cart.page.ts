import { AppConfiguration } from './../app-configuration';
import { AlertService } from './../services/alert/alert.service';
import { CheckoutPage } from './checkout/checkout.page';
import { SharedService } from 'src/app/services/shared/shared.service';
import { DataService } from './../services/data/data.service';
import { Component, OnInit, Input, ElementRef, Attribute } from '@angular/core';
import { LanguageService } from './../services/language/language.service';
import { Router } from '@angular/router';
import { AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UseNewCardPage } from './use-new-card/use-new-card.page';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  private regex9: RegExp = new RegExp(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'Delete','ArrowLeft','ArrowRight'];
  enableNonEditbaleBox:boolean = false;
  newAmount:any;
  enableInput:any;
  assignedFeesCartItems: any;
  optionalFeesCartItems: any;
  sourceAccountCartItems: any;
  fundraisersCartItems: any;
  mealCartItems: any;
  cartItems: any;
  patrons: any;
  cartData: any;
  isIndeterminate: boolean;
  masterCheck: boolean;
  paymentMethods: any;
  isAdjustmentOccurred = false;
  selectedPaymentMethodID: string;
  displayNameArray = [];
  mmoUrl: string;
  disableContinueBtn = false;
  districtFeaturelist: any;
  PatronAccountBalances: any[];
  patronAccountId: any;
  selectedCustomeFields = [];
  constructor(
    private router: Router,
    public languageService: LanguageService,
    private dataService: DataService,
    private sharedService: SharedService,
    private alertController: AlertController,
    private translate: TranslateService,
    private modalController: ModalController,
    private alertService: AlertService,
    private appConfiguration: AppConfiguration,
    private toastController: ToastController,
    private el: ElementRef,
    private storage: Storage,
    private platform: Platform,
  ) { }

  ngOnInit() {
    this.getUserPatrons();
  }

  ionViewWillEnter() {
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    this.selectedPaymentMethodID = '';
    this.getPaymentMethods();
    this.getUserPatrons();
    this.mmoUrl = this.appConfiguration.mmoUrl;
    // this.sharedService.refreshCart.subscribe((refreshCartFlag) => {
    //   if (refreshCartFlag) {
    //     this.getCartItems();
    //   }
    // })
  }

  ionViewWillLeave() {
    localStorage.removeItem('PatronAccountBalances');
  }
  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  onLangChange() {
    this.languageService.displayLanguageAlert();
  }

  /** get all cart items */
  getCartItems() {
    this.masterCheck = false;
    this.isIndeterminate = false;
    this.disableContinueBtn = false;
    this.sharedService.loading.next(true);
    const payload = {
      CheckMMOStatus: true
    };
    this.dataService.getCartItemsWithMMOStatus(payload)
      .subscribe(
        async (response: any) => {
          // if (response.body.APIStatus === 'ERROR_GETTING_MMO_ORDEREXPIRATIONSTATUS') {
          //   this.alertService.failureToast(this.translate.instant('Error_cart_screen_1'));
          // }
          this.displayNameArray = [];
          const cartItems = response.body.Patrons;
          const cartData = response.body;
          const assignedFeesPaymentsModifiedArray = [];
          const optionalFeesPaymentsModifiedArray = [];
          const sourceAccountModifiedArray = [];
          const mealPaymentsModifiedArray = [];
          const fundraisersModifiedArray = [];
          this.isAdjustmentOccurred = response.body.AdjustmentOccurred;
          const promises = cartItems.map(async (cartItem) => {
            cartItem.AssignedFees.forEach((Payment) => {
              const obj = {
                "AllowPartial":Payment.AllowPartial,
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "IntUserId": cartItem.IntUserId,
                "PatronId": this.getPatronId(cartItem.IntPatronId),
                "ItemName": 'Assigned Fee',
                "patronName": this.getPatronName(cartItem.IntPatronId),
                "IntPatronCartId": Payment.IntPatronCartId,
                "IntFeePatronId": Payment.IntFeePatronId,
                "FeeName": Payment.FeeName,
                "FeeCode": Payment.FeeCode,
                "FeeDescription": Payment.FeeDescription.replace(/(<([^>]+)>)/ig, ''),
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
                "CustomFields": Payment.CustomFields,
                "SelectedAttribute": null,
                "VariablePriced": Payment.VariablePriced
              };

              if (Payment.Attribute) {
                const options = Payment.Attribute.Options.filter(e => e.IsSelected);
                if (options.length > 0) {
                  obj.SelectedAttribute = options[0];
                }
              }
              assignedFeesPaymentsModifiedArray.push(obj);
            });

            cartItem.OptionalFees.forEach((Payment) => {
              const obj = {
                "AllowPartial":Payment.AllowPartial,
                'IntSiteId': cartItem.IntSiteId,
                'IntPatronId': cartItem.IntPatronId,
                'PatronId': this.getPatronId(cartItem.IntPatronId),
                'IntUserId': cartItem.IntUserId,
                'ItemName': 'Optional Fee',
                "FirstName":Payment.FirstName,
                "LastName":Payment.LastName,
                'patronName':(cartItem.IntPatronId === 0) ? (Payment.FirstName + ' ' + Payment.LastName) : this.getPatronName(cartItem.IntPatronId),
                'IntPatronCartId': Payment.IntPatronCartId,
                'IntFeePatronId': Payment.IntFeePatronId,
                'IntFeeId': Payment.IntFeeId,
                'FeeName': Payment.FeeName,
                'FeeCode': Payment.FeeCode,
                'FeeDescription': Payment.FeeDescription.replace(/(<([^>]+)>)/ig, ''),
                'IsPaid': Payment.IsPaid,
                'Active': Payment.Active,
                'AmountDue': Payment.AmountDue,
                'AdjustedAmountDue': Payment.AdjustedAmountDue,
                'AdjustmentReason': Payment.AdjustmentReason,
                'AmountPaid': Payment.AmountPaid,
                'CartAmount': Payment.CartAmount,
                'AssignedDate': Payment.AssignedDate,
                'DueDate': Payment.DueDate,
                'AddedCartAmount': Payment.AddedCartAmount,
                'DiscountAmount': Payment.DiscountAmount,
                'Session': Payment.Session,
                'Attribute': Payment.Attribute,
                'CustomFields': Payment.CustomFields,
                'SelectedAttribute': null,
                "VariablePriced": Payment.VariablePriced
              };

              if (Payment.Attribute) {
                const options = Payment.Attribute.Options.filter(e => e.IsSelected);
                if (options.length > 0) {
                  obj.SelectedAttribute = options[0];
                }
              }

              optionalFeesPaymentsModifiedArray.push(obj);
            });

            cartItem.Fundraiser.forEach((Payment) => {
              const obj = {
                "AllowPartial":Payment.AllowPartial,
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "PatronId": this.getPatronId(cartItem.IntPatronId),
                "IntUserId": cartItem.IntUserId,
                "ItemName": "Fundraiser",
                "FirstName":Payment.FirstName,
                "LastName":Payment.LastName,
                "patronName": (cartItem.IntPatronId == 0) ? (Payment.FirstName + " " + Payment.LastName) : this.getPatronName(cartItem.IntPatronId),
                "IntPatronCartId": Payment.IntPatronCartId,
                "IntFeePatronId": Payment.IntFeePatronId,
                "IntFeeId": Payment.IntFeeId,
                "FeeName": Payment.FeeName,
                "FeeCode": Payment.FeeCode,
                "FeeDescription": Payment.FeeDescription.replace(/(<([^>]+)>)/ig, ''),
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
                "Session": Payment.Session,
                "Attribute": Payment.Attribute,
                "CustomFields": Payment.CustomFields,
                "SelectedAttribute": null,
                "VariablePriced": Payment.VariablePriced
              };

              if (Payment.Attribute) {
                const options = Payment.Attribute.Options.filter(e => e.IsSelected);
                if (options.length > 0) {
                  obj.SelectedAttribute = options[0];
                }
              }

              fundraisersModifiedArray.push(obj);
            });

            cartItem.SourceAccountPayments.forEach((Payment) => {
              const obj = {
                "AllowPartial":true,
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "PatronId": this.getPatronId(cartItem.IntPatronId),
                "IntUserId": cartItem.IntUserId,
                "ItemName": 'Fund',
                "FeeName": Payment.FundName,
                "patronName": this.getPatronName(cartItem.IntPatronId),
                "IntPatronCartId": Payment.IntPatronCartId,
                "IntPatronAccountId": Payment.IntPatronAccountId,
                "FundName": Payment.FundName,
                "FeeDescription": Payment.FundName.replace(/(<([^>]+)>)/ig, ''),
                "IsPaid": Payment.IsPaid,
                "Active": Payment.Active,
                "CartAmount": Payment.CartAmount,
                "VariablePriced": Payment.VariablePriced
              };
              sourceAccountModifiedArray.push(obj);
            });
            let PatronAccountBalance =[];
            if(this.platform.is('ios')){
               PatronAccountBalance = JSON.parse(await this.storage.get('PatronAccountBalances'));
            }else{
               PatronAccountBalance = JSON.parse(localStorage.getItem('PatronAccountBalances'));
            }
            

            cartItem.MealPayments.forEach((Payment) => {
              let patronBalance;
              // const balance = patronBalance && patronBalance.PreOrderBalance ? 10: 10;
              if(PatronAccountBalance.length>0){
                for (let i = 0; i < PatronAccountBalance.length; i++) {
                  if (PatronAccountBalance[i].IntPatronId === cartItem.IntPatronId && Payment.IsPreorder) {
                    patronBalance = PatronAccountBalance[i];
                  }
                }
              }
              

              // this.PatronAccountBalances.forEach(element => {
              //   if(element.IntPatronId == cartItem.IntPatronId && Payment.IsPreorder)
              //   patronBalance = element;
              // });
              const obj = {
                "AllowPartial": Payment.IsPreorder ? false : true,
                'IntSiteId': cartItem.IntSiteId,
                'IntPatronId': cartItem.IntPatronId,
                'PatronId': this.getPatronId(cartItem.IntPatronId),
                'IntUserId': cartItem.IntUserId,
                'ItemName': 'Meal',
                'patronName': this.getPatronName(cartItem.IntPatronId),
                'IntPatronCartId': Payment.IntPatronCartId,
                'IntAccountId': Payment.IntAccountId,
                'AccountName': Payment.AccountName,
                'IsPaid': Payment.IsPaid,
                'Active': Payment.Active,
                'CartAmount': Payment.CartAmount,
                'IsPreorder': Payment.IsPreorder,
                'Balance': patronBalance && patronBalance.Balance ? patronBalance.Balance : 0,
                'ApplyMealBalance': false,
                'AppliedBalance': Payment.CartAmount,
                'DisableApplyMealBalance': false,
                "VariablePriced": Payment.VariablePriced
              };
              mealPaymentsModifiedArray.push(obj);
            });

            if (mealPaymentsModifiedArray.length > 1) {
              const patronId = mealPaymentsModifiedArray[0].IntPatronId;
              let samePatron = 0;
              let patronData;
              mealPaymentsModifiedArray.forEach((Payment) => {
                if ((Payment.IntPatronId === samePatron) && !Payment.IsPreorder) {
                  samePatron = Payment.IntPatronId;
                  mealPaymentsModifiedArray.forEach(element => {
                    if ((element.IntPatronId === Payment.IntPatronId) && element.IsPreorder
                          && Math.abs(element.Balance) <= Payment.CartAmount) {
                      element.DisableApplyMealBalance = true;
                    }
                  });
                } else if ((Payment.IntPatronId === samePatron) && Payment.IsPreorder &&
                               Math.abs(Payment.Balance) <= patronData.CartAmount) {
                  samePatron = Payment.IntPatronId;
                  Payment.DisableApplyMealBalance = true;
                } else if (Payment.IntPatronId !== samePatron) {
                  samePatron = Payment.IntPatronId;
                  patronData = Payment;
                }
              });
            }
          });
          // B-09421
          if (response.body.Preorder && !response.body.Preorder.HasValidItems && response.body.RefreshNeeded) {
            this.cartWarnings('refresh&mmoexpire');
          } else if (response.body.RefreshNeeded) {
            this.cartWarnings('refreshneeded');
          } else if (response.body.Preorder && !response.body.Preorder.HasValidItems) {
            this.cartWarnings('mmoexpire');
          }
          await Promise.all(promises);
          this.assignedFeesCartItems = assignedFeesPaymentsModifiedArray;
          this.optionalFeesCartItems = optionalFeesPaymentsModifiedArray;
          this.fundraisersCartItems = fundraisersModifiedArray;
          this.sourceAccountCartItems = sourceAccountModifiedArray;
          this.mealCartItems = mealPaymentsModifiedArray;
          this.cartItems = [...this.assignedFeesCartItems, ...this.optionalFeesCartItems, ...this.sourceAccountCartItems, ...this.mealCartItems, ...this.fundraisersCartItems];
          if (this.cartItems.length === 0) {
            // this.router.navigate(['/dashboard/home']);
            // const redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
            // this.router.navigate([redirectToDashboard]);
          }
          this.cartItems.sort((a, b) => {
            if (a.IntPatronId < b.IntPatronId) { return -1; } else if (a.IntPatronId > b.IntPatronId) { return 1; } else { return 0; }
          });
          this.cartItems.forEach((cartItem, index) => {
            cartItem.isInvalidSpot = false;
            if (this.displayNameArray.length === 0) {
              this.displayNameArray.push(cartItem.IntPatronId);
              cartItem.displayName = true;
            } else {
              const eventDateCheck = this.displayNameArray.indexOf(cartItem.IntPatronId);
              if (eventDateCheck === -1 || cartItem.IntPatronId === 0) {
                this.displayNameArray.push(cartItem.IntPatronId);
                cartItem.displayName = true;
              } else {
                cartItem.displayName = false;
              }
            }
          });

          if (this.cartItems) {
            if (this.cartItems.length > 0) {
              if(this.cartItems.length > 1) {
                this.cartItems.sort((a, b) => a.patronName === b.patronName ? 0 : a.patronName < b.patronName ? -1 : 1);
              }
              this.cartItems[0].displayName = true;
              if(this.cartItems.length > 1) {
                for (let i: any = 1; i < this.cartItems.length; i++) {
                  if (this.cartItems[i].patronName === this.cartItems[i - 1].patronName) {
                    this.cartItems[i].displayName = false;
                  } else {
                    this.cartItems[i].displayName = true;
                  }
                }
              }
            }
          }

          this.cartData = cartData;
          console.log(this.cartItems);
          this.getDisableMealStatus();
          this.sharedService.cartCount.next(this.cartItems.length);
          this.sharedService.loading.next(false);
        }
      );

  }

  applyMealBalance(isChecked, cartItem?) {
    if (isChecked && (cartItem.Balance >= cartItem.CartAmount)) {
      cartItem.CartAmount = 0;
      this.cartData.TotalAmountDue -= cartItem.AppliedBalance;
    } else if (isChecked && (cartItem.Balance < cartItem.CartAmount
      && cartItem.Balance > 0)) {
      cartItem.CartAmount = cartItem.CartAmount - cartItem.Balance;
      this.cartData.TotalAmountDue -= cartItem.Balance;
    } else if (!isChecked) {
      cartItem.CartAmount = cartItem.AppliedBalance;
      if (cartItem.Balance >= cartItem.CartAmount) {
        this.cartData.TotalAmountDue += cartItem.AppliedBalance;
      } else if (cartItem.Balance < cartItem.CartAmount) {
        this.cartData.TotalAmountDue += cartItem.Balance;
      }
    }

    this.applyMealBalanceCart(cartItem);
  }

  onBack() {
    const previousPath = sessionStorage.getItem('previousPath');
    this.router.navigate([previousPath]);
  }

  onInfo(data) {
    let start_date;
    let end_date;
    let class_time;
    if (data.Session != null) {
      start_date = (new Date(data.Session.PeriodStartDateTime).getMonth() + 1) + '/' + new Date(data.Session.PeriodStartDateTime).getDate() + '/' +
        new Date(data.Session.PeriodStartDateTime).getFullYear().toString().substr(-2);
      end_date = (new Date(data.Session.PeriodEndDateTime).getMonth() + 1) + '/' + new Date(data.Session.PeriodEndDateTime).getDate() + '/' +
        new Date(data.Session.PeriodEndDateTime).getFullYear().toString().substr(-2);
      class_time = ('0' + new Date(data.Session.PeriodStartDateTime).getHours()).slice(-2) + ':' + ('0' + new Date(data.Session.PeriodStartDateTime).getMinutes()).slice(-2)
        + ' to ' + ('0' + new Date(data.Session.PeriodEndDateTime).getHours()).slice(-2) + ':' +
        ('0' + new Date(data.Session.PeriodEndDateTime).getMinutes()).slice(-2);
    }
    let days = '';
    if (data.Session && data.Session.SessionCode) {
      if (data.Session.SundaySw) {
        days = days + 'Sun ';
      }
      if (data.Session.MondaySw) {
        days = days + 'Mon ';
      }
      if (data.Session.TuesdaySw) {
        days = days + 'Tue ';
      }
      if (data.Session.WednesdaySw) {
        days = days + 'Wed ';
      }
      if (data.Session.ThursdaySw) {
        days = days + 'Thu ';
      }
      if (data.Session.FridaySw) {
        days = days + 'Fri ';
      }
      if (data.Session.SaturdaySw) {
        days = days + 'Sat';
      }

    }
    let message = '<span>' + this.translate.instant('fee_inf_name') + data.FeeName + '</span><br>';
    // if(data.FeeDescription)
    // {
    message = message + '<span>' + this.translate.instant('fee_description') + data.FeeDescription + '</span><br>';
    // }


    if (data.Session && data.Session.SessionName) {
      message = message + '<span>' + this.translate.instant('session_name') + data.Session.SessionName + '</span><br>';
    }
    if (data.Session && data.Session.SessionCode) {
      message = message + '<span>' + this.translate.instant('session_code') + data.Session.SessionCode + '</span><br>';
    }
    if (data.Session && data.Session.CategoryName) {
      message = message + '<span>' + this.translate.instant('session_category') + data.Session.CategoryName + '</span><br>';
    }
    if (data.Session && data.Session.Location) {
      message = message + '<span>' + this.translate.instant('location') + data.Session.Location + '</span><br>';
    }
    if (data.Session && start_date) {
      message = message + '<span>' + this.translate.instant('start_date') + ' and ' +
                this.translate.instant('end_date') + ': ' + '</span><br>' + start_date + '-' + end_date + '</span><br>';
    }
    if (data.Session && days) {
      message = message + '<span>' + this.translate.instant('class_days') + days.split(' ').join(', ') + '</span><br>';
    }
    if (data.Session && class_time) {
      message = message + '<span>' + this.translate.instant('class_timings') + class_time + '</span><br>';
    }
    this.alertService.alert(this.translate.instant('Fee_Details'), message);
  }

  cartWarnings(type) {
    this.disableContinueBtn = true;
    let message: string;
    let buttons = [];
    const activePatrons = this.patrons.filter(patron => {
      if (patron.Active) {
        return patron;
      }
    });
    const preOrderBtnActiveFlag = activePatrons.length > 0 ? true : false;
    if (type === 'refreshneeded') {
      message = this.translate.instant('cart_warning1');
      buttons = [
        {
          text: 'Close',
          role: 'cancel',
          cssClass: 'preorder-close-btn',
          handler: () => {
          }
        }
      ];
    } else if (type === 'mmoexpire' || type === 'refresh&mmoexpire') {
      if (type === 'mmoexpire') {
        message = this.translate.instant('cart_warning0');
      } else {
        message = this.translate.instant('cart_warning3');
      }
      buttons = (activePatrons.length === 0 || !this.districtFeaturelist.PreOrder) ? [] : [
        {
          text: this.translate.instant('Return_To_Cart'),
          handler: () => {
              this.getCartItems();
          },
        },
        {
          text: this.translate.instant('Pre_Order_Meals'),
          cssClass: preOrderBtnActiveFlag ? '' : 'preorder-btn',
          handler: () => {
            if (preOrderBtnActiveFlag) {
              const globals: any = JSON.parse(sessionStorage.getItem('globals'));
              const url = this.mmoUrl + '?Token=' + globals.ApiKey + '&Env=' + this.appConfiguration.environment;
              this.sharedService.openUrl(url);
              return false;
            } else {
              return false;
            }
          }
        }
      ]
    }
    const alert = this.alertController.create({
      header: this.translate.instant('warning_cart_msg'),
      message: message,
      buttons: buttons,
      cssClass: 'cartwarning'
    });

    alert.then((val) => {
      val.present();
    });
  }
  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.patrons = response.body.Patrons;
          this.PatronAccountBalances = [];
          for (let i = 0; i < this.patrons.length; i++) {
            const data = {
              'IntSiteId': this.patrons[i].IntSiteId,
              'IntPatronId': this.patrons[i].IntPatronId,
              'IntUserId': this.patrons[i].IntUserId
            };
            this.getPatronAccountBalances(data);
          }
          this.getCartItems();
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getPatronAccountBalances(payload) {
    this.dataService.getPatronAccountBalances(payload)
      .subscribe(
        (response: any) => {
          if (response.body.PatronAccountBalances.length > 0) {
            const patronsMealdetails = {
              'IntSiteId': payload.IntSiteId,
              'IntPatronId': payload.IntPatronId,
              'IntUserId': payload.IntUserId,
              'IntAccountId': '',
              'Balance': 0
            };

            for (let j = 0; j < response.body.PatronAccountBalances.length; j++) {
              if (response.body.PatronAccountBalances[j].AccountType === 'Patron' ||
                  response.body.PatronAccountBalances[j].AccountType === 'PatronSchool') {
                patronsMealdetails.Balance = response.body.PatronAccountBalances[j].AccountBalance;
                patronsMealdetails.IntAccountId = response.body.PatronAccountBalances[j].IntAccountId;
              }
            }
            this.PatronAccountBalances.push(patronsMealdetails);
            if(this.platform.is('ios')){
              this.storage.set('PatronAccountBalances', JSON.stringify(this.PatronAccountBalances));
           }else{
            localStorage.setItem('PatronAccountBalances', JSON.stringify(this.PatronAccountBalances));
           }
            
          }
        });
    this.sharedService.refreshCart.subscribe((refreshCartFlag) => {
      if (refreshCartFlag) {
        this.getCartItems();
      }
    });
  }

  getPatronName(IntPatronId) {
    const filterredPatron = this.patrons.filter((patron) => {
      if (patron.IntPatronId === IntPatronId) {
        return patron;
      }
    });

    if (filterredPatron) {
      if (filterredPatron[0]) {
        if (filterredPatron[0].FirstName) {
          return filterredPatron[0].FirstName + ' ' + filterredPatron[0].LastName;
        }
        else{
          return null;
        }
      }
      else{
        return null;
      }
    }else{
      return null;
    }
      
  }

  getPatronId(IntPatronId) {
    const filterredPatron = this.patrons.filter((patron) => {
      if (patron.IntPatronId === IntPatronId) {
        return patron;
      }
    });

    if (filterredPatron) {
      if (filterredPatron[0]) {
        if (filterredPatron[0].IntPatronId) {
          return filterredPatron[0].PatronId;
        }
      }
    }
  }

  removeCartItems(type, cartdata) {
    let obj;
    if (type === 'deleteSelected') {
      const selectedCartItems = cartdata.filter((data) => {
        if (data.isChecked) {
          return data;
        }
      });
      const cartItemArray = [];
      selectedCartItems.forEach(selectedCartItem => {
        const data = { 'IntPatronCartId': selectedCartItem.IntPatronCartId };
        cartItemArray.push(data);
      });
      obj = {
        'CartItems': cartItemArray
      };
    } else if (type === 'individualSelected') {
      obj = {
        'CartItems': [
          { 'IntPatronCartId': cartdata.IntPatronCartId }
        ]
      };
    }

    this.dataService.removeCartItems(obj)
      .subscribe(
        (response: any) => {
          const err_msg = response.body.APIStatusReason.slice(0, 10);
          if (response.body.APIStatus === 'Error' && err_msg === 'MMO_ERROR_') {
            this.alertService.failureToast('MMO_ERROR_MSG');
          } else {
            this.getCartItems();
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }


  warningmsg(type, cartdata) {
    let message;
    if (type === 'deleteSelected') {
      message = this.translate.instant('DeleteSingle');
    } else if (type === 'individualSelected') {
      message = this.translate.instant('DeleteSingle');
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

  checkMaster() {
    setTimeout(() => {
      this.cartItems.forEach(obj => {
        obj.isChecked = this.masterCheck;
      });
    });
  }

  checkEvent() {
    const totalItems = this.cartItems.length;
    let checked = 0;
    this.cartItems.map(obj => {
      if (obj.isChecked) { checked++; }
    });
    if (checked > 0 && checked < totalItems) {
      // If even one item is checked but not all
      this.isIndeterminate = true;
      this.masterCheck = false;
    } else if (checked === totalItems) {
      // If all are checked
      this.masterCheck = true;
      this.isIndeterminate = false;
    } else {
      // If none is checked
      this.isIndeterminate = false;
      this.masterCheck = false;
    }
  }

  getPaymentMethods() {
    this.sharedService.loading.next(true);
    this.dataService.viewPaymentMethods()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          const paymentMethods = response.body.PaymentMethods;

          const withoutDefaultPayment = paymentMethods.filter((paymentMethod) => {
            if (!paymentMethod.Default) {
              return paymentMethod;
            }
          });

          const withDefaultPayment = paymentMethods.filter((paymentMethod) => {
            if (paymentMethod.Default) {
              return paymentMethod;
            }
          });

          if (withDefaultPayment.length > 0) {
            this.selectedPaymentMethodID = withDefaultPayment[0].Valid ? withDefaultPayment[0].PaymentMethodId : '';
          }
          const modifiedPaymentMethods = withDefaultPayment.concat(withoutDefaultPayment);
          const filteredPaymentMethods = modifiedPaymentMethods.filter((modifiedPaymentMethod) => {
            if (modifiedPaymentMethod.Valid) {
              return modifiedPaymentMethod;
            }
          });
          this.paymentMethods = filteredPaymentMethods;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }
  async onContinue(selectedPaymentMethodID, cartItems) {
    for (let i = 0; i < cartItems.length; i++) {
      if (cartItems[i].DisableApplyMealBalance === true) {
        cartItems[i].ApplyMealBalance = false;
      }
    }
    if (selectedPaymentMethodID === '5') {
      const obj = {
        'selectedPaymentMethodID': selectedPaymentMethodID,
        'cartData': this.cartData,
        'cartItems': cartItems
      };
      const modal = await this.modalController.create({
        component: UseNewCardPage,
        componentProps: {
          Data: obj
        }
      });
      modal.onDidDismiss()
        .then((dismissData) => {
          // tslint:disable-next-line:no-unused-expression
          this.paymentMethods;
          if (dismissData.data) {
            this.cartItems = dismissData.data;
          }
        });
      return await modal.present();
    } else {
      if (this.cartData.TotalAmountDue === 0) {
        // const obj = {
        //   "selectedPaymentMethodID": '',
        //   "cartData": this.cartData,
        //   "cartItems": cartItems,
        //   "paymentData": ''
        // }
        // const modal = await this.modalController.create({
        //   component: CheckoutPage,
        //   componentProps: {
        //     Data: obj
        //   }
        // });
        // modal.onDidDismiss()
        //   .then((dismissData) => {
        //     if (dismissData.data) {
        //       this.cartItems = dismissData.data;
        //     }
        //   });
        // return await modal.present();

        const obj = {
          'selectedPaymentMethodID': selectedPaymentMethodID,
          'cartData': this.cartData,
          'cartItems': cartItems,
          'paymentData': this.getSelectedPaymentObj(selectedPaymentMethodID)
        };
        const modal = await this.modalController.create({
          component: CheckoutPage,
          componentProps: {
            Data: obj
          }
        });
        modal.onDidDismiss()
          .then((dismissData) => {
            if (dismissData.data) {
              if (dismissData.data.cartItems) {
                this.cartItems = dismissData.data.cartItems;
              } else if (dismissData.data.removableCartItems) {
                // tslint:disable-next-line:no-shadowed-variable
                const cartItems = dismissData.data.removableCartItems;
                cartItems.forEach(item => {
                  item.isAttributeNotAvailable = true;
                });

                const message = this.translate.instant(dismissData.data.APIStatusReason);
                this.AttributeErrorToast(message, cartItems);
              }
            }
          });
        return await modal.present();
      } else if (selectedPaymentMethodID) {
        const obj = {
          'selectedPaymentMethodID': selectedPaymentMethodID,
          'cartData': this.cartData,
          'cartItems': cartItems,
          'paymentData': this.getSelectedPaymentObj(selectedPaymentMethodID)
        };
        const modal = await this.modalController.create({
          component: CheckoutPage,
          componentProps: {
            Data: obj
          }
        });
        modal.onDidDismiss()
          .then((dismissData) => {
            if (dismissData.data) {
              if (dismissData.data.cartItems) {
                this.cartItems = dismissData.data.cartItems;
              } else if (dismissData.data.removableCartItems) {
                const cartItems = dismissData.data.removableCartItems;
                cartItems.forEach(item => {
                  item.isAttributeNotAvailable = true;
                });
                if (dismissData.data.APIStatusReason === "INVALID_INTFEEADVANCEATTRIBUTEID") {
                  let SubHeader = this.translate.instant('ATTRIBUTE_AVAILABLE');
                  this.openSuccessPopUp(dismissData.data.removableCartItems, SubHeader);
                }else if (dismissData.data.APIStatusReason === "ATTRIBUTE_NOT_AVAILABLE") {
                  let SubHeader = this.translate.instant('ATTRIBUTE_NOT_AVAILABLE2');
                  this.openSuccessPopUp(dismissData.data.removableCartItems, SubHeader);
                }else if (dismissData.data.APIStatusReason === "INVALID_SPOTS") {
                  let SubHeader = this.translate.instant('SPOT_FEE');
                  this.openSuccessPopUp(dismissData.data.removableCartItems, SubHeader);
                }else if (dismissData.data.APIStatusReason === "EXPIRED_END_DATE" || dismissData.data.APIStatusReason === "INVALID_ASSIGNEDFEE") {
                  let SubHeader = this.translate.instant('EXPIRED_END_DATE');
                  this.openSuccessPopUp(dismissData.data.removableCartItems, SubHeader);
                }
              }
            }
          });
        return await modal.present();
      } else {
        // this.alertService.failureToast('')
      }
    }
  }

  async openSuccessPopUp(data, SubHeader){
    
    if(data && data.length > 0){
      data.map((items:any)=>{
        items.CartAmount =Number(items.CartAmount).toFixed(2)
      } )
      let itemsList = ``;
      data.map((item:any)=>{
        if(this.languageService.langDir === 'ltr'){
          itemsList += `<div class="rowDiv">`+ `<p class="FeeItem" >${item.FeeName}</p>`+ `<p class="dollerItem">$</p>`+`<p class="amountItem" >${item.CartAmount}</p>`+`</div>`
        }else{
          itemsList += `<div class="rowDiv">`+ `<p class="FeeItem" >${item.FeeName}</p>`+`<p class="amountItem" >${item.CartAmount}</p>`+ `<p class="dollerItem">$</p>`+`</div>`
        }
        
      });
  
      let message = `${itemsList }`+`<p class="bottomMessage">`+this.translate.instant('close_popUp')+ `</p>` ;
  
      let alert = this.alertController.create({
        header: this.translate.instant('warning_cart_msg1'),
        subHeader:SubHeader,
        message: message ,
        cssClass: 'cartremoveItem',
        buttons: [
        {
          text: this.translate.instant('btn_continue'),
          handler: () => {
            this.getCartItems();
          }
        }
      ]
      });
  
      alert.then((res) => {
        res.present();
      })
    }
    
  }

  getSelectedPaymentObj(selectedPaymentMethodID) {
    const payment = this.paymentMethods.filter((payment) => {
      if (payment.PaymentMethodId === selectedPaymentMethodID) {
        return payment;
      }
    });

    return payment[0];
  }

  applyMealBalanceCart(item) {
    if (this.districtFeaturelist.UsePreOrderBalance === false ||
      item.Balance > 0 || item.ApplyMealBalance === false) {
      return;
    } else {
      const message = this.translate.instant('cart_warning5') + ' ($' + item.Balance.toFixed(2) + ') '
        + this.translate.instant('cart_warning6');
      const alert = this.alertController.create({
        header: this.translate.instant('warning_cart_msg'),
        message: message,
        buttons: [
          {
            text: this.translate.instant('no'),
            cssClass: 'secondary',
            role: 'cancel',
            handler: () => {
              item.ApplyMealBalance = false;
            }
          }, {
            text: this.translate.instant('yes'),
            handler: () => {
              this.addMealItem(item);
            }
          }
        ],
        cssClass: 'cartwarning'
      });

      alert.then((val) => {
        val.present();
      });
    }
  }

  addMealItem(value) {
    const index = this.cartItems.findIndex(x => x.PatronId === value.PatronId);
    const newCartItem = Object.assign({}, value);
    if (index >= 0 && this.cartItems[index].ItemName === 'Meal' && this.cartItems[index].IsPreorder === false) {
      this.removeCartItems('individualSelected', this.cartItems[index]);
      newCartItem.CartAmount = Math.abs(value.Balance);
      this.saveMealPayments(newCartItem);
      // this.cartItems = [...this.cartItems, newCartItem];
    } else {
      newCartItem.CartAmount = Math.abs(value.Balance);
      this.saveMealPayments(newCartItem);
      // this.cartItems = [...this.cartItems, newCartItem];
    }
    this.cartData.TotalAmountDue = 0;
    this.cartItems.forEach(item => {
      this.cartData.TotalAmountDue += item.CartAmount;
    });
    this.sharedService.cartCount.next(this.cartItems.length);
  }

  saveMealPayments(selectedMealData) {
    this.sharedService.loading.next(true);
    const amount = selectedMealData.CartAmount.toString();
    const index = this.PatronAccountBalances.findIndex(x => x.IntPatronId === selectedMealData.IntPatronId);
    const obj = {
      'IntSiteId': selectedMealData.IntSiteId,
      'IntPatronId': selectedMealData.IntPatronId,
      'IntUserId': selectedMealData.IntUserId,
      'Active': true,
      'IntAccountId': this.PatronAccountBalances[index].IntAccountId,
      'Amount': amount,
    };
    this.dataService.saveMealPayments(obj).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.APIStatus === 'Success' && response.status === 200) {
        this.getCartItems();
        selectedMealData.DisableApplyMealBalance = true;
        selectedMealData.ApplyMealBalance = false;
      } else if (response.body.APIStatus === 'Error' && response.body.APIStatusReason === 'ERROR_CONTACT_SUPPORT') {
        const message = this.translate.instant('contact_support');
        this.alertService.failureToast(message);
      } else {
        const message = this.translate.instant('error_due_to');
        this.alertService.checkPEProcessingMessages(response.body, message);
      }
    },
      (error) => {
        this.sharedService.loading.next(false);
        console.log(error);
      });
  }

  /* Meal item with negative
  Balance */

  getDisableMealStatus() {
    for (let i = 0; i < this.cartItems.length; i++) {
      if (this.cartItems[i].DisableApplyMealBalance === true) {
        // this.cartItems[i].ApplyMealBalance = true;
      }
    }
  }

  AttributeErrorToast(message, removableCartItems) {
    const alert = this.alertController.create({
      message: message,
      buttons: [{
      text :this.translate.instant('close'),
      role: 'cancel',
      handler: () => {
        this.removeCartItems('deleteSelected', removableCartItems);
      }}]
    });
    alert.then((res) => {
      res.present();
    });
  }

   editAmount(id, element) {
    console.log(element);
    if(element.AllowPartial === false  && (element.VariablePriced === false || element.VariablePriced === undefined)) {
      this.enableNonEditbaleBox = true;
      this.alert('The fee can’t be edited');
    }else{
      this.enableInput = id;
      this.newAmount = element.CartAmount;
    }
   
  }

  saveAmount(id, FeeDetailist){
    if(FeeDetailist.AmountDue < this.newAmount && FeeDetailist.AmountDue != 0){
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
    if(FeeDetailist.ItemName === 'Assigned Fee'){
        let payloadAssigned = {
          IntSiteId: FeeDetailist.IntSiteId,
          IntPatronId: FeeDetailist.IntPatronId,
          IntUserId: FeeDetailist.IntUserId,
          IntFeePatronId: FeeDetailist.IntFeePatronId,
          Active: true,
          Amount: FeeDetailist.CartAmount,
          IntPatronCartId: FeeDetailist.IntPatronCartId,
          IntFeeAdvanceAttributeId: FeeDetailist.SelectedAttribute ? FeeDetailist.SelectedAttribute.IntFeeAttributeId: null,
          CustomFields: this.selectedCustomeFields ? this.selectedCustomeFields : [],
        };
        this.editSaveAssignedFeePayment(payloadAssigned);
      }
    else if(FeeDetailist.ItemName === 'Fund'){
      const payloadFund: any = {
        IntSiteId: FeeDetailist.IntSiteId,
        IntPatronCartId: FeeDetailist.IntPatronCartId,
        IntPatronId: FeeDetailist.isGuest? 0 : FeeDetailist.IntPatronId,
        IntUserId: FeeDetailist.IntUserId,
        Active: true,
        Amount: FeeDetailist.CartAmount,       
        IntPatronAccountId:FeeDetailist.IntPatronAccountId,
      };
       this.saveFundPayments(payloadFund);
    }
    else if(FeeDetailist.ItemName === 'Meal'){
      const payloadMeal: any = {
        IntSiteId: FeeDetailist.IntSiteId,
        IntPatronCartId: FeeDetailist.IntPatronCartId,
        IntPatronId: FeeDetailist.isGuest? 0 : FeeDetailist.IntPatronId,
        IntUserId: FeeDetailist.IntUserId,
        Active: true,
        Amount: FeeDetailist.CartAmount,
        IntAccountId: FeeDetailist.IntAccountId,
      };

      this.editsaveMealPayments(payloadMeal);
    }
    else if(FeeDetailist.ItemName === 'Optional Fee'){
          const payloadOptional: any = {
            IntSiteId: FeeDetailist.IntSiteId,
            IntPatronId: FeeDetailist.isGuest? 0 : FeeDetailist.IntPatronId,
            IntUserId: FeeDetailist.IntUserId,
            IntFeeId: FeeDetailist.IntFeeId,
            Active: true,
            Amount: FeeDetailist.CartAmount,
            IntPatronCartId: FeeDetailist.IntPatronCartId,
            IntFeeAdvanceAttributeId: FeeDetailist.SelectedAttribute ? FeeDetailist.SelectedAttribute.IntFeeAttributeId: null,
            CustomFields: this.selectedCustomeFields ? this.selectedCustomeFields : [],
            FirstName: FeeDetailist.FirstName ? FeeDetailist.FirstName : '',
            LastName: FeeDetailist.LastName ? FeeDetailist.LastName : '',
            EmailId: FeeDetailist.EmailId
          };
          if(FeeDetailist.IntPatronId === 0){
            this.SaveFundraiseGuestFeePayments(payloadOptional);
          }else{
            this.saveOptionalFeePayment(payloadOptional);
          }
         
    }
    else if(FeeDetailist.ItemName === 'Fundraiser'){
      const payloadOptional: any = {
        IntSiteId: this.cartData.Patrons[0].IntSiteId,
        IntPatronId: FeeDetailist.isGuest? 0 : FeeDetailist.IntPatronId,
        IntUserId: FeeDetailist.IntUserId,
        IntFeeId: FeeDetailist.IntFeeId,
        Active: true,
        Amount: FeeDetailist.CartAmount,
        IntFeeAdvanceAttributeId: FeeDetailist.SelectedAttribute ? FeeDetailist.SelectedAttribute.IntFeeAttributeId: null,
        IntPatronCartId:  FeeDetailist.IntPatronCartId ? FeeDetailist.IntPatronCartId: 0,
        CustomFields: this.selectedCustomeFields ? this.selectedCustomeFields : [],
        FirstName: FeeDetailist.FirstName,
        LastName: FeeDetailist.LastName,
      };
     this.SaveFundraiseGuestFeePayments(payloadOptional);
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

  editsaveMealPayments(payload) {
    this.sharedService.loading.next(true);
        this.dataService.saveMealPayments(payload).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.APIStatus == 'Success' && response.status == 200) {
        this.newAmount = '';
        this.enableInput = '';
        this.getCartItems();
      }
    },
      (error) => {
        this.sharedService.loading.next(false);
        console.log(error);
      })
  }

  editSaveAssignedFeePayment(payload) {
    this.sharedService.loading.next(true);
    this.dataService.saveAssignedFeePayment(payload).subscribe(
      (response: any) => {
        this.sharedService.loading.next(false);
        if (response.body.APIStatus == 'Success' && response.status == 200) {
          this.newAmount = '';
          this.enableInput = '';
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

  saveOptionalFeePayment(payload) {
    this.dataService.saveOptionalFeePayment(payload).subscribe(
      (response: any) => {
        this.sharedService.loading.next(false);
        if (response.body.APIStatus == 'Success' && response.status == 200) {
          this.newAmount = '';
          this.enableInput = '';
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

  saveFundPayments(payload) {
    this.sharedService.loading.next(true);
    this.dataService.SaveSourceAccountPayment(payload).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.APIStatus == 'Success' && response.status == 200) {
        this.newAmount = '';
          this.enableInput = '';
        this.getCartItems();
      }
    }, (error) => {
      this.sharedService.loading.next(false);
      console.log(error);
    })
  }

  SaveFundraiseGuestFeePayments(payload) {
    this.dataService.addFundraiserfeeInCartwithTokan(payload).subscribe(
      (response: any) => {
        this.sharedService.loading.next(false);
        if (response.body.APIStatus == 'Success' && response.status == 200) {
          this.newAmount = '';
          this.enableInput = '';
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
