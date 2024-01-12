import { AlertService } from './../services/alert/alert.service';
import { Component, OnInit, SecurityContext } from '@angular/core';
import { TabHeaderService } from '../services/tab-header/tab-header.service';
import { LunchAccountBalance, Notifications } from '../services/data/model/notifications';
import { FormGroup, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../services/data/data.service';
import { ToastController, AlertController, MenuController, IonicSafeString } from '@ionic/angular';
import { SharedService } from '../services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './../auth/auth.service';
import { LanguageService } from './../services/language/language.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  @ViewChild('f', { static: true }) ngForm: NgForm;
  lunchAccountBalance: LunchAccountBalance[] = [];
  balanceRemainder: LunchAccountBalance[] = [];
  daysNotice: LunchAccountBalance[] = [];
  notifications: Notifications;
  currentViewSubscription: any;
  public form: FormGroup;
  updateButton: boolean = true;
  phase: string;
  errormessage = '';
  notificationPreferences: any;
  isNotificationLoaded = false;
  notificationIdArray = [];
  districtFeaturelist: any;
  iSLowMealBalance = true;
  iSLowFundBalance = true;
  isBalanceReminder = true;
  isFundBalanceReminder = true;
  isFeeDue = true;
  isUpcomingPayment = true;
  isOverdueFee = true;
  isMonthlyStatement = true;
  cartCount: number;
  patronSourceAccountLength = 0;
  tabHeaderValues = {
    'screenName': ' '
  };
  iSMealBalance = false
  iSMealDayofMonth = false
  isFeesDaysNotice1 = false
  isFeesDaysNotice12 = false
  isFeesDaysOverDue = false
  isFundBalance = false
  isFundDayofMonth = false
  isMonthlyDayofMonth = false
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');

  constructor(private tabHeaderService: TabHeaderService,
    public toastController: ToastController,
    private sanitizer: DomSanitizer,
    private router: Router,
    private dataService: DataService,
    private sharedService: SharedService,
    private alertService: AlertService,
    private alertController: AlertController,
    private translate: TranslateService,
    public languageService: LanguageService,
    private authService: AuthService,
    private menu: MenuController) {
    this.notifications = {
      AccountBalance: '5',
      FundAccountBalance: '5',
      DayofMonth: 'LastDay',
      FundDayofMonth: 'LastDay',
      DaysNoticeDue: '1',
      DaysNoticePayment: '1',
      DaysOverdueFee: '1',
      DayofMonthStatement: 'LastDay',

      LowMealBalance: false,
      BalanceReminder: false,
      LowFundBalance: false,
      FundBalanceReminder: false,
      FeeDue: false,
      UpcomingPayment: false,
      OverdueFee: false,
      MonthlyStatement: false,


    };
  }

  ngOnInit() {  
    console.log(this.translate)
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist') );
    this.sharedService.appPhase.subscribe((phase) => {
      this.phase = phase;
      if(this.phase== 'registrationPhase'){
        this.sharedService.getUserInformation();
        this.getUserPatrons();          
      }
    })

    this.currentViewSubscription = this.sharedService.reloadingCurrentView.subscribe(
      (data: any) => {
        if (data == 'Notifications') {
          this.router.navigated = false;
          this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
          };
        }
      });


    this.lunchAccountBalance = [
      { "value": '5', "option": "$5.00" },
      { "value": '10', "option": "$10.00" },
      { "value": '15', "option": "$15.00" },
      { "value": '20', "option": "$20.00" },
      { "value": '25', "option": "$25.00" },
      { "value": '50', "option": "$50.00" }
    ];

    this.balanceRemainder = [
      { "value": 'LastDay', "option": 'Last_Day' },
      { "value": '1', "option": '1st'},
      { "value": '2', "option": '2nd'},
      { "value": '3', "option": '3rd'},
      { "value": '4', "option": '4th'},
      { "value": '5', "option": '5th'},
      { "value": '6', "option": '6th'},
      { "value": '7', "option": '7th'},
      { "value": '8', "option": '8th'},
      { "value": '9', "option": '9th'},
      { "value": '10', "option": '10th'},
      { "value": '11', "option": '11th'},
      { "value": '12', "option": '12th'},
      { "value": '13', "option": '13th'},
      { "value": '14', "option": '14th'},
      { "value": '15', "option": '15th'},
      { "value": '16', "option": '16th'},
      { "value": '17', "option": '17th'},
      { "value": '18', "option": '18th'},
      { "value": '19', "option": '19th'},
      { "value": '20', "option": '20th'},
      { "value": '21', "option": '21st'},
      { "value": '22', "option": '22nd'},
      { "value": '23', "option": '23rd'},
      { "value": '24', "option": '24th'},
      { "value": '25', "option": '25th'},
      { "value": '26', "option": '26th'},
      { "value": '27', "option": '27th'},
      { "value": '28', "option": '28th'},
      { "value": '29', "option": '29th'},
      { "value": '30', "option": '30th'},
      { "value": '31', "option": '31st'}
    ];


    this.daysNotice = [
      { "value": '1', "option": "1" },
      { "value": '2', "option": "2" },
      { "value": '3', "option": "3" },
      { "value": '4', "option": "4" },
      { "value": '5', "option": "5" },
      { "value": '6', "option": "6" },
      { "value": '7', "option": "7" },
      { "value": '8', "option": "8" },
      { "value": '9', "option": "9" },
      { "value": '10', "option": "10" }
    ];

    this.getNotificationPreference();
  }
  getPatrons() {

    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {

          if (response.Patrons.length > 0) {
            // this.router.navigate(['/manage-notifications/notifications']);
          }
          else {
            this.router.navigate(['/dashboard/home']);
          }

        },
        (error) => {

          console.log(error);
        }
      )
  }
  onMealBalanceSelection(selectedvalue:any, isfromddchnage:any) {
    if (selectedvalue.detail.value != '5') {
      this.iSMealBalance = false;
      this.updateButton = false;
    }
  }

  onMealDayofMonthSelection(selectedvalue:any, isfromddchnage:any) {
    if (selectedvalue.detail.value != 'LastDay') {
      this.iSMealDayofMonth = false;
      this.updateButton = false;
    }
  }

  onFeesDaysNotice1Selection(selectedvalue:any, isfromddchnage:any) {
    if (selectedvalue.detail.value != '1') {
      this.isFeesDaysNotice1 = false;
      this.updateButton = false;
    }
  }

  onFeesDaysNotice2Selection(selectedvalue:any, isfromddchnage:any) {
    if (selectedvalue.detail.value != '1') {
      this.isFeesDaysNotice12 = false;
      this.updateButton = false;
    }
  }
  onFeesDaysOverDueSelection(selectedvalue:any, isfromddchnage:any) {
    if (selectedvalue.detail.value != '1') {
      this.isFeesDaysOverDue = false;
      this.updateButton = false;
    }

  }
  onFundBalanceSelection(selectedvalue:any, isfromddchnage:any) {
    if (selectedvalue.detail.value != '5') {
      this.isFundBalance = false;
      this.updateButton = false;
    }
  }
  onFundDayofMonthSelection(selectedvalue:any, isfromddchnage:any) {
    if (selectedvalue.detail.value != 'LastDay') {
      this.isFundDayofMonth = false;
      this.updateButton = false;
    }
  }
  onMonthlyDayofMonthSelection(selectedvalue:any, isfromddchnage:any) {
    if (selectedvalue.detail.value != 'LastDay') {
      this.isMonthlyDayofMonth = false;
      this.updateButton = false;
    }
  }

  ionViewWillEnter() {
    this.getNotificationPreference();
    this.getAllPatronSourceAccounts();
    // this.updateButton = true;
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
  }

  changeTabTo(tabnum:number) {
    this.tabHeaderService.redirectToPage(tabnum);
  }

  ResetAll(formData: NgForm) {
    const intNotificationPreferenceId:any = [];

    this.notificationIdArray.forEach((notoficationData:any) => {
      intNotificationPreferenceId.push(notoficationData.IntNotificationPreferenceId);
    })

    const reqObj = {
      "IntSiteId": this.districtFeaturelist.IntSiteId,
      "NotificationIds": intNotificationPreferenceId
    }
    // iSLowMealBalance = true;
    // iSLowFundBalance = true;
    // isBalanceReminder = true;
    // isFundBalanceReminder = true;
    // isFeeDue = true;
    // isUpcomingPayment = true;
    // isOverdueFee = true;
    // isMonthlyStatement = true;
    if (this.notificationIdArray.length > 0) {
      this.dataService.removeNotificationPreference(reqObj)
        .subscribe(
          (response: any) => {

            this.isNotificationLoaded = false;
            this.sharedService.loading.next(false);
            if (response.body.APIStatus == "Success") {

              this.notifications.AccountBalance = '5',
                this.notifications.LowMealBalance = false,
                this.notifications.DayofMonth = 'LastDay',
                this.notifications.BalanceReminder = false,
                this.notifications.FundAccountBalance = '5',
                this.notifications.LowFundBalance = false,
                this.notifications.FundDayofMonth = 'LastDay',
                this.notifications.FundBalanceReminder = false,
                this.notifications.DaysNoticeDue = '1',
                this.notifications.FeeDue = false,
                this.notifications.DaysNoticePayment = '1',
                this.notifications.UpcomingPayment = false,
                this.notifications.DaysOverdueFee = '1',
                this.notifications.OverdueFee = false,
                this.notifications.DayofMonthStatement = 'LastDay',
                this.notifications.MonthlyStatement = false,

                this.alertService.successToast(this.translate.instant('notification_removed'));
              this.isNotificationLoaded = true;
              this.getNotificationPreference();
              // setTimeout(() => {

              // }, 100)
              // setTimeout(() => {
              //   this.isNotificationLoaded = true;
              // }, 200)
            } else {
              const message = this.translate.instant('error_due_to');
              this.alertService.checkPEProcessingMessages(response.body, message);
            }
          },
          (error) => {
            this.sharedService.loading.next(false);
            console.log(error);
          }
        );
    }
    else {
      this.alertService.successToast(this.translate.instant('notification_removed'));
    }
  }
  onBack() {
    this.router.navigate(['/manage-payment-methods']);
  }

  getNotificationPreference() {
    this.notificationIdArray = [];
    this.sharedService.loading.next(true);
    this.dataService.getNotificationPreference()
      .subscribe(
        (response: any) => {
          // this.sharedService.loading.next(false);
          this.iSLowMealBalance = false;
          this.iSLowFundBalance = false;
          this.isBalanceReminder = false;
          this.isFundBalanceReminder = false;
          this.isFeeDue = false;
          this.isUpcomingPayment = false;
          this.isOverdueFee = false;
          this.isMonthlyStatement = false;
          let mergedNotificationPreferences = this.notifications;
          this.notificationPreferences = response.body.NotificationPreferences
          this.notificationPreferences.forEach((notificationPreference) => {
            this.notificationIdArray.push(notificationPreference);
            if (notificationPreference.NotificationType == 'Low Meals Balance') {
              mergedNotificationPreferences.AccountBalance = notificationPreference.TriggerValue;
              mergedNotificationPreferences.LowMealBalance = notificationPreference.ActiveSw;
              this.iSLowMealBalance = true;
            }

            else if (notificationPreference.NotificationType == 'Meals Account Balance Remainder') {
              mergedNotificationPreferences.DayofMonth = notificationPreference.TriggerValue;
              mergedNotificationPreferences.BalanceReminder = notificationPreference.ActiveSw;
              this.iSLowFundBalance = true;
            }

            else if (notificationPreference.NotificationType == 'Low Fund Balance') {
              mergedNotificationPreferences.FundAccountBalance = notificationPreference.TriggerValue;
              mergedNotificationPreferences.LowFundBalance = notificationPreference.ActiveSw;
              this.isBalanceReminder = true;
            }

            else if (notificationPreference.NotificationType == 'Fund Account Balance Remainder') {
              mergedNotificationPreferences.FundDayofMonth = notificationPreference.TriggerValue;
              mergedNotificationPreferences.FundBalanceReminder = notificationPreference.ActiveSw;
              this.isFundBalanceReminder = true;
            }

            else if (notificationPreference.NotificationType == 'Fee Due') {
              mergedNotificationPreferences.DaysNoticeDue = notificationPreference.TriggerValue;
              mergedNotificationPreferences.FeeDue = notificationPreference.ActiveSw;
              this.isFeeDue = true;
            }

            else if (notificationPreference.NotificationType == 'Upcoming Payment') {
              mergedNotificationPreferences.DaysNoticePayment = notificationPreference.TriggerValue;
              mergedNotificationPreferences.UpcomingPayment = notificationPreference.ActiveSw;
              this.isUpcomingPayment = true;
            }

            else if (notificationPreference.NotificationType == 'Overdue Fee') {
              mergedNotificationPreferences.DaysOverdueFee = notificationPreference.TriggerValue;
              mergedNotificationPreferences.OverdueFee = notificationPreference.ActiveSw;
              this.isOverdueFee = true;
            }

            else if (notificationPreference.NotificationType == 'Monthly Statement') {
              mergedNotificationPreferences.DayofMonthStatement = notificationPreference.TriggerValue;
              mergedNotificationPreferences.MonthlyStatement = notificationPreference.ActiveSw;
              this.isMonthlyStatement = true;
            }

          })
          this.notifications = mergedNotificationPreferences;
          this.updateButton = true;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );

    setTimeout(() => {
      this.sharedService.loading.next(false);
      this.isNotificationLoaded = true;
    }, 3000)
  }

  ontoggleActiveSw(ActiveSw:any, TriggerValue:any, NotificationType:any, formData: NgForm) {
    this.updateButton = true

    if (this.isNotificationLoaded) {
      this.sharedService.loading.next(true);
      let next: string = TriggerValue;
      if (ActiveSw.checked) {
        let NotificationPreferences = [];
        let NotificationPreference = {
          IntSiteId: this.districtFeaturelist.IntSiteId,
          NotificationType: NotificationType,
          TriggerValue: TriggerValue,
          EmailSw: true,
          SmsSw: false,
          ActiveSw: ActiveSw.checked
        };
        NotificationPreferences.push(NotificationPreference);

        const NotificationPreferencerequest = { "NotificationPreference": NotificationPreferences };
        this.dataService.addNotificationPreference(JSON.stringify(NotificationPreferencerequest))
          .subscribe(
            (response: any) => {
              // this.updateButton = true;
              this.sharedService.loading.next(false);
              if (response.body.APIStatus == "Success") {

                this.notificationIdArray.push({
                  IntNotificationPreferenceId: response.body.IntNotificationPreferenceId,
                  NotificationType: NotificationType,
                  TriggerValue: TriggerValue,
                  EmailSw: true,
                  SmsSw: false,
                  ActiveSw: ActiveSw.checked
                });
                this.alertService.successToast(this.translate.instant('notification_added'));

              } else {
                const message = this.translate.instant('error_due_to');
                this.alertService.checkPEProcessingMessages(response.body, message);
              }
            },
            (error) => {
              this.sharedService.loading.next(false);
              console.log(error);
            }
          );
      } else {
        const deleteNotificationPreference: any = this.notificationIdArray.filter((notificationPreference:any) => {
          if (notificationPreference.NotificationType == NotificationType) {
            return notificationPreference;
          }
        })
        this.sharedService.loading.next(true);
        const reqObj = {
          "IntSiteId": this.districtFeaturelist.IntSiteId,
          "NotificationIds": [deleteNotificationPreference[0].IntNotificationPreferenceId]
        }
        this.dataService.removeNotificationPreference(reqObj)
          .subscribe(
            (response: any) => {
              if (response.body.APIStatus == "Success") {

                // if (NotificationType == 'Low Meals Balance') {
                //   formData.controls['AccountBalance'].reset();
                // } else if (NotificationType == 'Meals Account Balance Remainder') {
                //   formData.controls['DayofMonth'].reset();
                // } else if (NotificationType == 'Low Fund Balance') {
                //   formData.controls['FundAccountBalance'].reset();
                // } else if (NotificationType == 'Fund Account Balance Remainder') {
                //   formData.controls['FundDayofMonth'].reset();
                // } else if (NotificationType == 'Fee Due') {
                //   formData.controls['DaysNoticeDue'].reset();
                // } else if (NotificationType == 'Upcoming Payment') {
                //   formData.controls['DaysNoticePayment'].reset();
                // } else if (NotificationType == 'Overdue Fee') {
                //   formData.controls['DaysOverdueFee'].reset();
                // } else if (NotificationType == 'Monthly Statement') {
                //   formData.controls['DayofMonthStatement'].reset();
                // }
                this.getNotificationPreference();
                this.notificationIdArray = this.notificationIdArray.filter((notification:any) => {
                  if (notification.NotificationType != NotificationType) {
                    return notification;
                  }
                })
                setTimeout(() => {
                  if (NotificationType == 'Low Meals Balance') {
                    this.notifications.AccountBalance = '5';
                  } else if (NotificationType == 'Meals Account Balance Remainder') {
                    this.notifications.DayofMonth = 'LastDay';
                  } else if (NotificationType == 'Low Fund Balance') {
                    this.notifications.FundAccountBalance = '5';
                  } else if (NotificationType == 'Fund Account Balance Remainder') {
                    this.notifications.FundDayofMonth = 'LastDay';
                  } else if (NotificationType == 'Fee Due') {
                    this.notifications.DaysNoticeDue = '1';
                  } else if (NotificationType == 'Upcoming Payment') {
                    this.notifications.DaysNoticePayment = '1';
                  } else if (NotificationType == 'Overdue Fee') {
                    this.notifications.DaysOverdueFee = '1';
                  } else if (NotificationType == 'Monthly Statement') {
                    this.notifications.DayofMonthStatement = 'LastDay';
                  }
                  this.sharedService.loading.next(false);
                }, 1500)
                this.alertService.successToast(this.translate.instant('notification_removed'));
              } else {
                const message = this.translate.instant('error_due_to');
                this.alertService.checkPEProcessingMessages(response.body, message);
              }
            },
            (error) => {
              this.sharedService.loading.next(false);
              console.log(error);
            }
          );
      }

    }
  }

  updateNotification(f: NgForm) {
    this.updateButton = true;
    if (this.notificationIdArray.length > 0) {

      const reqObj = this.getUpdateNotificationRequestObj(f.value, this.notificationIdArray);
      this.dataService.updateNotificationPreference(reqObj)
        .subscribe(
          (response: any) => {

            this.sharedService.loading.next(false);
            if (response.body.APIStatus == "Success") {
              this.alertService.successToast(this.translate.instant('notification_updated'));
            } else {
              const message = this.translate.instant('error_due_to');
              this.alertService.checkPEProcessingMessages(response.body, message);
            }
          },
          (error) => {
            this.sharedService.loading.next(false);
            console.log(error);
          }
        );
    } else {

      this.alertService.failureToast(this.translate.instant('turn_on'));

    }
  }

  getUpdateNotificationRequestObj(values:any, notificationIdArray:any) {
    notificationIdArray.forEach((notificationPreference:any) => {
      if (notificationPreference.NotificationType == 'Low Meals Balance') {
        notificationPreference.TriggerValue = values.AccountBalance;
        notificationPreference.ActiveSw = values.LowMealBalance;
      }

      else if (notificationPreference.NotificationType == 'Meals Account Balance Remainder') {
        notificationPreference.TriggerValue = values.DayofMonth;
        notificationPreference.ActiveSw = values.BalanceReminder;
      }

      else if (notificationPreference.NotificationType == 'Low Fund Balance') {
        notificationPreference.TriggerValue = values.FundAccountBalance;
        notificationPreference.ActiveSw = values.LowFundBalance;
      }

      else if (notificationPreference.NotificationType == 'Fund Account Balance Remainder') {
        notificationPreference.TriggerValue = values.FundDayofMonth;
        notificationPreference.ActiveSw = values.FundBalanceReminder;
      }

      else if (notificationPreference.NotificationType == 'Fee Due') {
        notificationPreference.TriggerValue = values.DaysNoticeDue;
        notificationPreference.ActiveSw = values.FeeDue;
      }

      else if (notificationPreference.NotificationType == 'Upcoming Payment') {
        notificationPreference.TriggerValue = values.DaysNoticePayment;
        notificationPreference.ActiveSw = values.UpcomingPayment;
      }

      else if (notificationPreference.NotificationType == 'Overdue Fee') {
        notificationPreference.TriggerValue = values.DaysOverdueFee;
        notificationPreference.ActiveSw = values.OverdueFee;
      }

      else if (notificationPreference.NotificationType == 'Monthly Statement') {
        notificationPreference.TriggerValue = values.DayofMonthStatement;
        notificationPreference.ActiveSw = values.MonthlyStatement;
      }
    })

    const reqObj = {
      "IntSiteId": this.districtFeaturelist.IntSiteId,
      "Notifications": notificationIdArray
    }

    return reqObj;
  }

  Continue() {
    const updateStepreqObj = { "IntStepId": 6 };
    this.dataService.updateCurrentStep(updateStepreqObj)
      .subscribe(
        (response: any) => {
          // let message = this.translate.instant('notification_updated');
          // this.alertService.successToast(message);
          //After dashboard is done it should navigate to dashboard page
          const alert = this.alertController.create({
            header: this.translate.instant('Congratulations'),
            message: this.translate.instant('Set_up_is_complete'),
            backdropDismiss: false,
            buttons: [{
              text: this.translate.instant('Go_to_Dashboard'),
              handler: () => {
                this.router.navigate(['/dashboard/home']);
              }
            }
            ]
          });

          alert.then((res) => {
            res.present();
          })
        });
  }

  infoAlert(category:string) {
    let message: any;
    let header: string;
    let message1: string;
    if (category == 'meal') {
      message = this.translate.instant('low_meal_balance');
      console.log("message", message);
      header = this.translate.instant('notify_mealbal');
    } else if (category == 'fund') {
      message = this.translate.instant('low_fund_balance')
      header = this.translate.instant('notify_fndacc');
    } else if (category == 'fees') {
      message = this.translate.instant('fee_due')
      header = this.translate.instant('notify_fee');
    } else if (category == 'statement') {
      message = this.translate.instant('meal_report_notifications')
      header = this.translate.instant('notify_mntlystmt');
    }
    this.alertService.infoAlertNotification(message, header);
  }


  onLangChange() {
    this.languageService.displayLanguageAlert();
  }

  ngOnDestroy() {
  }

  onLogout(formData: NgForm) {
    if (!this.updateButton) {
      this.changesNotSavedAlert(formData, 'logout', '');
    } else {
      this.authService.logout('logout');
    }
  }

  onGotoCart(formData: NgForm) {
    if (!this.updateButton) {
      this.changesNotSavedAlert(formData, 'cart', '');
    } else {
      this.router.navigate(['/dashboard/cart']);
    }
  }

  onGotoDashboard(formData: NgForm) {
    if (!this.updateButton) {
      this.changesNotSavedAlert(formData, 'dashboard', '');
      return false;
    } else {
      this.router.navigate([this.redirectToDashboard]);
      return false;
    }
  }

  onMenuClick(formData: NgForm, button:string) {
    if (!this.updateButton) {
      this.changesNotSavedAlert(formData, 'menu', '');
    }
  }

  changesNotSavedAlert(formData:any, button:string, type:any) {
    const alert = this.alertController.create({
      message: this.translate.instant('changes_not_saved'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          handler: (blah) => {
            if (button == 'menu') {
              this.menu.close();
            }
          }
        }, {
          text: this.translate.instant('Continue'),
          handler: () => {
            if (button == 'skipcontinue') {

            } else if (button == 'cart') {
              this.router.navigate(['/dashboard/cart']);
            } else if (button == 'logout') {
              this.authService.logout('logout');
            } else if (button == 'menu') {

            } else if(button == 'dashboard') {
              this.router.navigate([this.redirectToDashboard]);
            }
          }
        }]
    });

    alert.then((res) => {
      res.present();
    })
  }

  getAllPatronSourceAccounts() {
    this.sharedService.loading.next(true);
    this.dataService.getAllPatronSourceAccounts()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success') {
            this.patronSourceAccountLength = 0;
            const patrons = response.body.Patrons;
            patrons.forEach((patron:any) => {
              this.patronSourceAccountLength = this.patronSourceAccountLength + patron.SourceAccounts.length;
            })
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);

        }
      );
  }

  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.viewUserPatron()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          const viewPatrons = response.body.Patrons;
          if (viewPatrons.length == 0) {
            this.router.navigate(['/dashboard'], { replaceUrl: true });
          }
        }
      )
  }
}
