import { AlertService } from './../../services/alert/alert.service';
import { LanguageService } from './../../services/language/language.service';
import { AlertController, ModalController, Platform, NavController } from '@ionic/angular';
import { SharedService } from 'src/app/services/shared/shared.service';
import { DataService } from './../../services/data/data.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { CafeteriaTransferPopupComponent } from 'src/app/cafeteria-transfer-popup/cafeteria-transfer-popup.component';


@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss'],
})
export class MealsComponent implements OnInit {
  mealData: any;
  lunchLimit:any;
  mealCartItems: any;
  type: string;
  individualPatronObj: any;
  FirstName: string;
  LastName: string;
  selectedPatronData: any;
  districtFeaturelist: any;
  patrons: any;
  IntPatronId: any;
  Active: any;
  cartCount: number;
  paymentMethods: any;
  disableFlag = true;
  showTransferIcon:boolean=false;
  iconColSize:number=4;
  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef<any>;

  constructor(private dataService: DataService,
    private sharedService: SharedService,
    private alertController: AlertController,
    private router: Router,
    public languageService: LanguageService,
    private alertService: AlertService,
    private modalController: ModalController,
    private translate: TranslateService,
    private keyboard: Keyboard,
    private platform: Platform,
    private navCtrl: NavController,
  ) { }

  ionViewWillEnter() {
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
    
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    if(this.districtFeaturelist !== null){
      this.lunchLimit = Number(this.districtFeaturelist.PaymentLimits.LunchAcctLimit).toFixed(2);
    }
    
    
  }

  ngOnInit() {
    this.getPaymentMethod();
    this.keyboard.onKeyboardShow().subscribe(() => {
      if (this.platform.is('ios') && (this.router.url == '/dashboard/patron-detail/meals')) {
        let mealAlert = document.getElementsByTagName('ion-alert')[0];
        mealAlert.classList.add("custom_movealert");

      }
    });
    this.keyboard.onKeyboardHide().subscribe(() => {
      if (this.platform.is('ios') && (this.router.url == '/dashboard/patron-detail/meals')) {
        let mealAlert = document.getElementsByTagName('ion-alert')[0];
        mealAlert.classList.remove("custom_movealert");

      }
    });
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
       this.getUserPatrons()    
    });
  }
  onGotoMealAccountReport() {
    localStorage.setItem("VMH", "2");

  }
  onSelectedStudent(data) {
    this.selectedPatronData = {
      "type": data.IntPatronId == "" ? "all" : "individual",
      "data": data
    }
    this.FirstName = this.selectedPatronData.data.FirstName;
    this.LastName = this.selectedPatronData.data.LastName;
    this.Active = this.selectedPatronData.data.Active;
    localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
    this.getCartItems();
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
          const activePatrons = patrons.filter((patron) => {
            if (patron.Active == true) {
              return patron;
            }
          })
          if(activePatrons.length > 0) {
            this.disableFlag = false;
          } else {
            this.disableFlag = true;
          }
          if (patrons.length > 1) {
            this.patrons = allStudentArray.concat(patrons);
          } else {
            this.patrons = patrons;
          }
          if (this.selectedPatronData && this.selectedPatronData.type == 'individual') {
            patrons.forEach((patron, index) => {
              if (patron.IntPatronId == this.selectedPatronData.data.IntPatronId) {
                setTimeout(() => {
                  if (this.widgetsContent) {
                    this.widgetsContent.nativeElement.scrollLeft = ((index + 1) * 50) + 30;
                  }
                }, 2000)
              }
            })
          }
          this.getCartItems();

        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }
  /** get cart items */
  getCartItems() {
    this.sharedService.loading.next(true);
    this.dataService.getCartItems()
      .subscribe(
        (response: any) => {
          this.sharedService.getCartCount(response);
          this.sharedService.loading.next(false);
          const cartItems = response.body.Patrons;
          const mealPaymentsModifiedArray = [];
          cartItems.forEach((cartItem) => {
            cartItem.MealPayments.forEach((MealPayment) => {
              const obj = {
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "IntUserId": cartItem.IntUserId,
                "IntPatronCartId": MealPayment.IntPatronCartId,
                "IntAccountId": MealPayment.IntAccountId,
                "AccountName": MealPayment.AccountName,
                "IsPaid": MealPayment.IsPaid,
                "CartAmount": MealPayment.CartAmount,
                "IsPreorder": MealPayment.IsPreorder
              }
              mealPaymentsModifiedArray.push(obj);

            })

          })

          this.mealCartItems = mealPaymentsModifiedArray;

          if (this.selectedPatronData && this.selectedPatronData.type == 'individual') {
            this.getIndividualMealData();
            this.IntPatronId = this.selectedPatronData.data.IntPatronId;
          } else {
            this.getMealData();
            this.IntPatronId = "";
          }
        }
      )
  }

  // getPatronStatus(IntPatronId) {
  //   const patrons = this.patrons.shift();
  //     const filterredPatron = patrons.filter((patron) => {
  //       if (patron.IntPatronId == IntPatronId) {
  //         return patron;
  //       }
  //     })
  //     return filterredPatron[0].Active;
  // }

  getPatronStatus(IntPatronId) {
    if (IntPatronId != '') {
      const filterredPatron = this.patrons.filter((patron) => {
        if (patron.IntPatronId == IntPatronId) {
          return patron;
        }
      })

      return filterredPatron[0].Active;
    } else {
      return true;
    }

  }

  mealDataModifiedArray:any = []
  
  /** get all patrons meal balances */
  getMealData() {
    this.sharedService.loading.next(true);
    const mealDataModifiedArray = []
    this.dataService.getUserPatronBalances()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          const mealData = response.body.UserPatronDetail;
          mealData.forEach((meal) => {
            const modifiedData = this.modifyData(meal);
            mealDataModifiedArray.push(modifiedData);
          })
          this.mealDataModifiedArray = mealDataModifiedArray;
          if(this.districtFeaturelist !== null){
            this.showTransferIcon = this.districtFeaturelist.ShareCafeteriaBalanceSw && this.checkForShowTransfer();
          }
          
          if(this.showTransferIcon){
            this.iconColSize=3;
          }
          this.mergeMealAndCart(mealDataModifiedArray, this.mealCartItems);
        })
  }

  /** get individual patron meal balances */
  getIndividualMealData() {
    let obj = {
      "IntSiteId": this.selectedPatronData.data.IntSiteId,
      "IntPatronId": this.selectedPatronData.data.IntPatronId,
    }
    this.sharedService.loading.next(true);
    this.dataService.getPatronAccountBalances(obj)
      .subscribe(
        (response: any) => {
          const modifiedData = this.modifyData(response.body);

          this.mergeIndividualMealAndCart(modifiedData, this.mealCartItems);
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  /** merging cart data and individual patron balances for meal */
  mergeIndividualMealAndCart(meal, cartData) {

    const filteredCartItem = cartData.filter((cartItem) => {
      if (meal.PatronIntAccountId == cartItem.IntAccountId && meal.IntPatronId == cartItem.IntPatronId && !cartItem.IsPreorder) {
        return cartItem;
      }
    })

    if (filteredCartItem.length > 0) {
      meal.CartAmount = filteredCartItem[0].CartAmount;
      meal.IntPatronCartId = filteredCartItem[0].IntPatronCartId;
    }
    meal.FirstName = this.FirstName;
    meal.LastName = this.LastName;
    meal.Active = this.Active;
    this.mealData = [meal];
  }

  modifyData(meal) {
    const obj = {
      "IntSiteId": meal.IntSiteId,
      "IntUserId": meal.IntUserId,
      "IntPatronId": meal.IntPatronId,
      "isPatronActive": this.getPatronStatus(meal.IntPatronId),
      "IntDistrictId": meal.IntDistrictId,
      "DistrictName": meal.DistrictName,
      "IntSchoolId": meal.IntSchoolId,
      "SchoolName": meal.SchoolName,
      "PatronId": meal.PatronId,
      "FirstName": meal.FirstName,
      "MiddleName": meal.MiddleName,
      "LastName": meal.LastName,
      "Active": meal.Active,
      "PatronIntAccountId": null,
      "PatronAccountType": '',
      "PatronAccountBalance": '',
      "BonusIntAccountId": null,
      "BonusAccountType": '',
      "BonusAccountBalance": null,
      "Pre_OrderIntAccountId": null,
      "Pre_OrderAccountType": '',
      "Pre_OrderAccountBalance": null,
      "AllowSharingCafeteriabalance" : meal.AllowSharingCafeteriaBalanceSw
    }

    const patronAccountData = meal.PatronAccountBalances.filter((data) => {
      if (data.AccountType == 'Patron' || data.AccountType == 'PatronSchool') {
        return data;
      }
    })

    const bonusAccountData = meal.PatronAccountBalances.filter((data) => {
      if (data.AccountType == 'Bonus') {
        return data;
      }
    })

    const pre_OrderAccountData = meal.PatronAccountBalances.filter((data) => {
      if (data.AccountType == 'Preorder') {
        return data;
      }
    })

    if (patronAccountData.length > 0) {
      obj.PatronIntAccountId = patronAccountData[0].IntAccountId;
      obj.PatronAccountType = patronAccountData[0].AccountType;
      obj.PatronAccountBalance = patronAccountData[0].AccountBalance;
    }
    if (bonusAccountData.length > 0) {
      obj.BonusIntAccountId = bonusAccountData[0].IntAccountId;
      obj.BonusAccountType = bonusAccountData[0].AccountType;
      obj.BonusAccountBalance = bonusAccountData[0].AccountBalance;
    }
    if (pre_OrderAccountData.length > 0) {
      obj.Pre_OrderIntAccountId = pre_OrderAccountData[0].IntAccountId;
      obj.Pre_OrderAccountType = pre_OrderAccountData[0].AccountType;
      obj.Pre_OrderAccountBalance = pre_OrderAccountData[0].AccountBalance;
    }
    return obj;
  }

  /** merging cart data and user patron balances for meal */
  mergeMealAndCart(mealData, cartData) {
    mealData.forEach((meal) => {
      const filteredCartItem = cartData.filter((cartItem) => {
        if (meal.PatronIntAccountId == cartItem.IntAccountId && meal.IntPatronId == cartItem.IntPatronId && !cartItem.IsPreorder) {
          return cartItem;
        }
      })

      if (filteredCartItem.length > 0) {
        meal.CartAmount = filteredCartItem[0].CartAmount;
        meal.IntPatronCartId = filteredCartItem[0].IntPatronCartId;
      }
    })
    this.mealData = mealData;
  }

  /** show popup on click of edit/add icons */
  async presentAlertConfirm(type, mealData) {

    const message = '<ion-grid><ion-row><ion-col size="6" class="header">' + this.translate.instant('Name') + '</ion-col><ion-col size="6" class="header">' + this.translate.instant('Balance') + '</ion-col></ion-row><ion-row><ion-col size="6">' + mealData.FirstName + " " + mealData.LastName + '</ion-col><ion-col size="6"> $' + mealData.PatronAccountBalance.toFixed(2) + '</ion-col></ion-row></ion-grid>'
    const alert = await this.alertController.create({
      message: message,
      cssClass: 'meal-popup-wrapper',
      inputs: [{
        name: 'amount',
        type: 'number',
        min: 0,
        value: mealData.CartAmount ? mealData.CartAmount.toFixed(2) : null,
        placeholder: this.translate.instant('amount')
      }],
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: this.translate.instant('IS_Add_to_Cart'),
          cssClass: 'AlertBtn',
          handler: (data:any) => {
            var valid = !isNaN(data.amount);
            if (data.amount == '' || data.amount == 0 || !valid || data.amount.length > 15) {
              this.alertService.failureToast('Please enter valid amount');
              return false;
            } else {
              this.saveMealPayments(data.amount, mealData);
              return true;
            }

          }
        }
      ]
    });

    await alert.present();
  }

  /** save meal payments */
  saveMealPayments(amount, selectedMealData) {
    this.sharedService.loading.next(true);
    const obj = {
      "IntSiteId": selectedMealData.IntSiteId,
      "IntPatronId": selectedMealData.IntPatronId,
      "IntUserId": selectedMealData.IntUserId,
      "Active": selectedMealData.Active,
      "IntAccountId": selectedMealData.PatronIntAccountId,
      "Amount": amount,
      "IntPatronCartId": selectedMealData.IntPatronCartId
    }


    this.dataService.saveMealPayments(obj).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.APIStatus == 'Success' && response.status == 200) {
        this.getCartItems();
      } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
        const message = this.translate.instant('contact_support');
        this.alertService.failureToast(message);
      } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'PAYMENT_LIMIT_ERROR') {
        const message = this.translate.instant('mealError_1') + ' ' + '$' + ' ' + this.lunchLimit + ' ' + this.translate.instant('mealError_2');
        this.alertService.failureToast(message);
      }
       else {
        const message = this.translate.instant('error_due_to');
        this.alertService.checkPEProcessingMessages(response.body, message);
      }
    },
      (error) => {
        this.sharedService.loading.next(false);
        console.log(error);
      })
  }

  onGotoCart() {
    this.navCtrl.navigateRoot('/dashboard/cart');
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }


  async openCafeteriaTransferPopup() {
    const modal = await this.modalController.create({
      component: CafeteriaTransferPopupComponent,
      cssClass: 'cafeteria-transfer-modal',
      componentProps: {
        mealsBalanceDetails: this.mealDataModifiedArray
      }
      
    // [routerLink]="['/dashboard/cafeteria-balance']"
    });

    await modal.present();
    return modal;
  }
  
  checkForShowTransfer(){
    let check1:boolean=false;
    let count:any=0;
    // console.log(this.mealDataModifiedArray,"array of patron");
    if(this.mealDataModifiedArray.length <2){
      return false;
    }
    else{
      for(let i=0;i<this.mealDataModifiedArray.length;i++){
        if(this.mealDataModifiedArray[i].Active && this.mealDataModifiedArray[i].AllowSharingCafeteriabalance){
          check1 = true;
        }
        if(this.mealDataModifiedArray[i].AllowSharingCafeteriabalance){
          count = count + 1;
        }
        if(count>1 && check1){
          return true;
        }
      }
    }
    return false;
  }

}
