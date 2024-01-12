import { SharedService } from 'src/app/services/shared/shared.service';
import { DataService } from './../services/data/data.service';
import { Router } from '@angular/router';
import { LanguageService } from './../services/language/language.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import xml2js from 'xml2js';

import { LunchRestrictions, LunchRestrictionsDefinitions, ItemGroups, Items } from '../services/data/model/meal';
import { AlertController, MenuController, NavController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { AlertService } from '../services/alert/alert.service';

// import * as xml2js from 'xml2js';

@Component({
  selector: 'app-meal-restrictions',
  templateUrl: './meal-restrictions.page.html',
  styleUrls: ['./meal-restrictions.page.scss'],
})
export class MealRestrictionsPage implements OnInit {
  selectedPatron: any;
  quikLunchRestrictionDefinitions: any;
  quikLunchItems: any;
  allQuikLunchItems: any;
  quikLunchItemGroups: any;
  searchText: string;
  patrons: any;
  FirstName: any;
  LastName: any;
  Active: any;
  selectedPatronData: any;
  restrictionObj = {
    selectedPatron: null
  };
  checkedQlunchItems = [];
  checkedQlunchGroups = [];
  RestrictedALacarte: any;
  DailySpendlimit = "";
  RestrictedBreakFast: any
  RestrictedSecondMealL: any;
  lunchRestrictions;
  lunchDefinitions;
  restricedItemsCode;
  restricedItemsCodeValue;
  restricedGroupsCode;
  restricedGroupsCodeValue;
  lunchRestrictionsDefinitionsitems = [];
  lunchGroups = [];
  lunchItems = [];
  IntPatronId: any;
  cartCount: number;
  displayDailyLimitError: boolean = false;
  showWarningPopup: boolean = false;
  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef<any>;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');

  constructor(
    public languageService: LanguageService,
    private router: Router,
    private dataService: DataService,
    private sharedService: SharedService,
    private alertController: AlertController,
    private translate: TranslateService,
    private menu: MenuController,
    private authService: AuthService,
    private alertService: AlertService,
    private navCtrl: NavController,
    private modalController: ModalController
  ) {
    this.selectedPatron = JSON.parse(localStorage.getItem('selectedPatron'))
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.selectedPatron = JSON.parse(localStorage.getItem('selectedPatron'))
    this.getUserPatrons();
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
    if (this.selectedPatron.type == 'individual') {
      this.onSelectedStudent(this.selectedPatron.data);
    }
    else {
      this.selectedPatron.type == 'all'
      this.selectedPatronData = 'all'
      this.IntPatronId = "";
    }
  }

  onSelectedStudent(data) {

    // this.showWarningPopup = false;
    this.selectedPatronData = 'all'
    this.selectedPatron = {
      "type": data.IntPatronId == "" ? "all" : "individual",
      "data": data
    }
    this.FirstName = this.selectedPatron.data.FirstName;
    this.LastName = this.selectedPatron.data.LastName;
    this.Active = this.selectedPatron.data.Active;
    localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatron));
    if (this.selectedPatron.type == 'individual') {
      this.restrictionObj.selectedPatron = this.selectedPatron.data.IntPatronId;

      this.IntPatronId = this.selectedPatron.data.IntPatronId;
      this.getQuikLunchRestrictionsByPatron();
    }
    else {
      this.selectedPatron.type == 'all'
      this.selectedPatronData = 'all'
      this.IntPatronId = "";
    }
    //this.getUserPatrons();

  }
  onMenuClick() {
    if (this.showWarningPopup == true) {
      this.changesNotSavedAlert('menu', '');
    }
  }



  onGotoCart() {
    if (this.showWarningPopup == true) {
      this.changesNotSavedAlert('cart', '');
    }
    else {
      this.router.navigate(['/dashboard/cart']);
    }
  }

  onGotoDashboard() {
    if (this.showWarningPopup == true) {
      this.changesNotSavedAlert('dashboard', '');
      return false;
    } else {
      this.router.navigate([this.redirectToDashboard]);
      return false;
    }
  }
  onBack(formData: NgForm) {
    if (this.showWarningPopup == true) {
      this.changesNotSavedAlert('Back', '');
    } else {
      const previousPath = sessionStorage.getItem('previousPath');
      this.navCtrl.navigateBack(previousPath);
      // this.router.navigate([previousPath])
    }
  }
  DailySpendingLimitRemove(lunchRestrictionsDefinitionsitem, $event) {

    this.displayDailyLimitError = false
    this.DailySpendlimit = ''
    this.showWarningPopup = true;
    lunchRestrictionsDefinitionsitem.value = ''

  }
  changesNotSavedAlert(button, type) {
    const alert = this.alertController.create({
      message: this.translate.instant('warning_main_msg'),
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
            if (button == 'Back') {
              this.router.navigate(['/dashboard/patron-detail/meals']);
            }
            else if (button == 'cart') {
              this.router.navigate(['/dashboard/cart']);
            }
            else if (button == 'menu') {

            } else if (button == 'dashboard') {
              this.router.navigate([this.redirectToDashboard]);
            }
          }
        }]
    });

    alert.then((res) => {
      res.present();
    })
  }

  getUserPatrons() {

    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          // this.patrons = response.body.Patrons;
          this.sharedService.userPatronsList.next(response.body.Patrons);
          const allStudentArray = [
            {
              "FirstName": this.translate.instant('All'),
              "LastName": this.translate.instant('Students'),
              "PictureData": "allStudentPicture",
              "IntPatronId": "",
              "Active": "true"
            }
          ]
          this.sharedService.loading.next(false);

          // const patrons = response.body.Patrons;
          const patrons = response.body.Patrons.filter(x => x.Active === true);
          this.patrons = patrons;

          if (patrons.length == 1) {
            this.patrons = patrons;
            this.IntPatronId = patrons[0].IntPatronId;
            this.selectedPatron = {
              "type": "individual",
              "data": patrons[0]
            }
            localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatron));
            this.restrictionObj.selectedPatron = patrons[0].IntPatronId;

            this.IntPatronId = patrons[0].IntPatronId;
            this.getQuikLunchRestrictionsByPatron();
          } else {
            this.patrons = allStudentArray.concat(patrons);
          }

          // if (this.patrons.length > 1)
          //   this.patrons = allStudentArray.concat(patrons);
          // if (this.selectedPatron.type == 'individual') {
          //   this.restrictionObj.selectedPatron = this.selectedPatron.data.IntPatronId;

          //   this.IntPatronId = this.selectedPatron.data.IntPatronId;
          //   this.getQuikLunchRestrictionsByPatron();
          // }
          // else {
          //   this.selectedPatron.type == 'all'
          //   this.selectedPatronData = 'all'
          //   this.IntPatronId = "";
          // }
          const selectedPatronData = JSON.parse(localStorage.getItem('selectedPatron'));
          if (selectedPatronData.type == 'individual') {
            patrons.forEach((patron, index) => {
              if (patron.IntPatronId == selectedPatronData.data.IntPatronId) {
                setTimeout(() => {
                  this.widgetsContent.nativeElement.scrollLeft = ((index + 1) * 50) + 30;
                }, 2000)
              }
            })
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }
  getQuikLunchRestrictionDefinitions(QlunchRestrictionsvalue) {
    this.sharedService.loading.next(true);
    const reqObj = {
      "IntSiteId": this.selectedPatron.data.IntSiteId
    };
    this.dataService.getQuikLunchRestrictionDefinitions(reqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          let lunchRestrictions = new LunchRestrictions();
          lunchRestrictions = QlunchRestrictionsvalue;
          this.lunchDefinitions = response.Definitions;
          let lunchRestrictionsDefinitions = new LunchRestrictionsDefinitions();
          if (response.body.APIStatus == "Success") {

            this.quikLunchRestrictionDefinitions = response.body.Definitions;
            this.quikLunchRestrictionDefinitions.forEach((data, index) => {
              lunchRestrictionsDefinitions = new LunchRestrictionsDefinitions();
              lunchRestrictionsDefinitions.IntSiteId = data.IntSiteId
              lunchRestrictionsDefinitions.IntDefinitionId = data.IntDefinitionId
              lunchRestrictionsDefinitions.Code = data.Code
              lunchRestrictionsDefinitions.Active = data.Active
              if (QlunchRestrictionsvalue.length > 0) {
                QlunchRestrictionsvalue.forEach((data1, index1) => {
                  if (data.Code == data1.Code) {

                    if (data.Code === 'DAILY_SPEND_LIMIT') {
                      if (data1.Value != '') {
                        lunchRestrictionsDefinitions.Value = Number(data1.Value).toFixed(2);
                      }
                      else {
                        lunchRestrictionsDefinitions.Value = '';
                      }
                    }
                    else {
                      lunchRestrictionsDefinitions.Value = data1.Value
                    }
                    let modifiedData = data.DefinitionValue.replace(/\\/g, "");
                    lunchRestrictionsDefinitions.DefinitionValue = modifiedData
                    this.parseXML(modifiedData, lunchRestrictionsDefinitions, data.Code);

                  }

                })
              }
              else {
                let modifiedData = data.DefinitionValue.replace(/\\/g, "");
                lunchRestrictionsDefinitions.DefinitionValue = modifiedData

                this.parseXML(modifiedData, lunchRestrictionsDefinitions, data.Code)
              }
              if (data.Code == "RESTRICT_ALACARTE") {
                this.RestrictedALacarte = lunchRestrictionsDefinitions.Value;

              }
              else if (data.Code == "DAILY_SPEND_LIMIT") {
                if (lunchRestrictionsDefinitions.Value === undefined || lunchRestrictionsDefinitions.Value === '') {
                  lunchRestrictionsDefinitions.Value = ''
                  this.DailySpendlimit = ''
                }
                else {
                  this.DailySpendlimit = lunchRestrictionsDefinitions.Value
                }

              }
              else if (data.Code == "RESTRICT_BREAKFAST") {
                this.RestrictedBreakFast = lunchRestrictionsDefinitions.Value;

              }
              else if (data.Code == "RESTRICT_SECOND_MEAL") {
                this.RestrictedSecondMealL = lunchRestrictionsDefinitions.Value;

              }
              this.lunchRestrictionsDefinitionsitems.push(lunchRestrictionsDefinitions);

            })
          } else {

          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getQuikLunchItems(restricedItemsCode, restricedItemsCodeValue) {
    this.lunchItems = [];
    this.quikLunchItems = '';
    this.sharedService.loading.next(true);
    let lunchItems = new Items();
    const reqObj = {
      "IntSiteId": this.selectedPatron.data.IntSiteId,
      "IntPatronId": this.selectedPatron.data.IntPatronId
    };
    this.dataService.getQuikLunchItems(reqObj)
      .subscribe(
        (response: any) => {
          // this.getQuikLunchItemGroups();

          this.sharedService.loading.next(false);
          if (response.body.APIStatus == "Success") {

            let value = [];
            if (restricedItemsCodeValue != undefined) {
              value = restricedItemsCodeValue.split(",");
              this.checkedQlunchItems = [];
              if (value.length > 0) {
                for (let j = 0; j < value.length; j++) {
                  if (value[j] != "")
                    this.checkedQlunchItems.push(value[j])
                }
              }
            }

            this.quikLunchItems = response.body.Items;
            this.allQuikLunchItems = response.body.Items;
            response = response.body
            if (response.Items.length > 0) {
              for (let i = 0; i < response.Items.length; i++) {
                lunchItems = new Items();
                lunchItems.Code = restricedItemsCode;
                lunchItems.restricedItemsCodeValue = restricedItemsCodeValue;
                lunchItems.IntItemId = response.Items[i].IntItemId
                lunchItems.ItemDescription = response.Items[i].ItemDescription
                if (value.length > 0) {
                  for (let j = 0; j < value.length; j++) {

                    if (response.Items[i].IntItemId == value[j]) {

                      lunchItems.Value = true;
                      break;
                    }
                    else {

                      lunchItems.Value = false;
                    }

                  }

                }
                else {

                  lunchItems.Value = restricedItemsCodeValue
                }
                this.lunchItems.push(lunchItems);
              }

            }

          } else {

          }
          this.quikLunchItems = this.lunchItems;
          this.selectedPatronData = 'individual'

        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getQuikLunchItemGroups(restricedGroupsCode, restricedGroupsCodeValue) {
    this.lunchGroups = [];
    this.sharedService.loading.next(true);
    const reqObj = {
      "IntSiteId": this.selectedPatron.data.IntSiteId
    };
    let lunchItemsGroups = new ItemGroups();
    this.dataService.getQuikLunchItemGroups(reqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == "Success") {
            this.quikLunchItemGroups = response.body.ItemGroups;
            let value = [];
            if (restricedGroupsCodeValue != undefined) {
              value = restricedGroupsCodeValue.split(",");

              this.checkedQlunchGroups = [];
              if (value.length > 0) {
                for (let j = 0; j < value.length; j++) {
                  if (value[j] != "")
                    this.checkedQlunchGroups.push(value[j])
                }
              }
            }
            response = response.body;
            if (response.ItemGroups.length > 0) {
              for (let i = 0; i < response.ItemGroups.length; i++) {
                lunchItemsGroups = new ItemGroups();
                lunchItemsGroups.Code = restricedGroupsCode;
                lunchItemsGroups.restricedGroupsCodeValue = restricedGroupsCodeValue;
                lunchItemsGroups.IntItemGroupId = response.ItemGroups[i].IntItemGroupId
                lunchItemsGroups.Name = response.ItemGroups[i].Name
                if (value.length > 0) {
                  for (let j = 0; j < value.length; j++) {
                    if (response.ItemGroups[i].IntItemGroupId == value[j]) {

                      lunchItemsGroups.Value = true;
                      break;
                    }
                    else {

                      lunchItemsGroups.Value = false;
                    }

                  }
                }
                else {

                  lunchItemsGroups.Value = restricedGroupsCodeValue
                }
                this.lunchGroups.push(lunchItemsGroups);

              }
            }


          } else {

          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getQuikLunchRestrictionsByPatron() {
    this.sharedService.loading.next(true);
    let payload = {

      IntSiteId: this.selectedPatron.data.IntSiteId,
      IntPatronId: this.selectedPatron.data.IntPatronId
    };

    this.dataService.getQuikLunchRestrictionsByPatron(payload)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == "Success") {
            response = response.body;
            this.lunchRestrictions = response.LunchRestrictions;
            if (response.LunchRestrictions.length > 0) {

              for (let i = 0; i < response.LunchRestrictions.length; i++) {
                if (response.LunchRestrictions[i].Code === "RESTRICTED_ITEMS") {
                  this.restricedItemsCode = response.LunchRestrictions[i].Code;
                  this.restricedItemsCodeValue = response.LunchRestrictions[i].Value;
                }
                if (response.LunchRestrictions[i].Code === "RESTRICTED_GROUPS") {
                  this.restricedGroupsCode = response.LunchRestrictions[i].Code;
                  this.restricedGroupsCodeValue = response.LunchRestrictions[i].Value;
                }
              }

            }

            this.lunchRestrictionsDefinitionsitems = [];
            this.getQuikLunchRestrictionDefinitions(this.lunchRestrictions)
            this.getQuikLunchItemGroups(this.restricedGroupsCode, this.restricedGroupsCodeValue)
            this.getQuikLunchItems(this.restricedItemsCode, this.restricedItemsCodeValue)



          } else {

          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }



  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  filterUserMessages(data) {
    let allItems = this.lunchItems;
    if (data) {
      this.quikLunchItems = allItems.filter(function (tag) {
        return tag.ItemDescription.toLowerCase().indexOf(data.toLowerCase()) >= 0;
      });
    } else {
      this.quikLunchItems = allItems;
    }



  }

  parseXML(data, lunchRestrictionsDefinitions: any, index) {
    let arr = []
    return new Promise(resolve => {
      var k: string | number,

        parser = new xml2js.Parser(
          {
            trim: true,
            explicitArray: true
          });
      parser.parseString(data, function (err, result) {
        var obj = result.QLR;
        lunchRestrictionsDefinitions.Displayname = obj.$.displayname

        if (obj.DEFAULT_VALUE[0] === "FALSE") {
          lunchRestrictionsDefinitions.DefaultValue = false
          if (lunchRestrictionsDefinitions.Value === '')
            lunchRestrictionsDefinitions.Value = false
        }
        else if (obj.DEFAULT_VALUE[0] === "") {
          lunchRestrictionsDefinitions.DefaultValue = ''
          if (lunchRestrictionsDefinitions.Value === '')
            lunchRestrictionsDefinitions.Value = ''
        }
        lunchRestrictionsDefinitions.DataType = obj.DATA_TYPE[0]
        resolve(arr);
      });
    });

  }

  QuikLunchItemsChange(lunchItem, $event) {

    this.showWarningPopup = true
    if ($event.detail.checked && this.checkedQlunchItems.indexOf(lunchItem.IntItemGroupId) === -1) {
      this.checkedQlunchItems.push(lunchItem.IntItemId.toString())
    }
    else {
      this.checkedQlunchItems.splice(this.checkedQlunchItems.indexOf(lunchItem.IntItemId), 1);
    }

  }
  QuikLunchItemGroupsChange(lunchGroup, $event) {

    this.showWarningPopup = true
    if ($event.detail.checked && this.checkedQlunchGroups.indexOf(lunchGroup.IntItemGroupId) === -1) {
      this.checkedQlunchGroups.push(lunchGroup.IntItemGroupId.toString())
    }
    else {
      this.checkedQlunchGroups.splice(this.checkedQlunchGroups.indexOf(lunchGroup.IntItemGroupId), 1);
    }
  }
  QuikLunchRestrictionDefinitionsChange(lunchRestrictionsDefinitionsitem, $event) {

    this.displayDailyLimitError = false;
    // if ($event === '') {
    //   this.displayDailyLimitError = true;
    // } else {
    //   this.displayDailyLimitError = false;
    // }
    this.showWarningPopup = true
    if (lunchRestrictionsDefinitionsitem.Code === "RESTRICT_ALACARTE") {
      this.RestrictedALacarte = $event.detail.checked;

    }
    else if (lunchRestrictionsDefinitionsitem.Code === "DAILY_SPEND_LIMIT") {
      if ($event === '')
        this.DailySpendlimit = "";
      else
        this.DailySpendlimit = Number($event.target.value).toFixed(2);
      //this.DailySpendlimit = Number($event).toFixed(2);
      // if (Number(this.DailySpendlimit) == 0) {

      // } else if (Number(this.DailySpendlimit) > 99) {

      // } else if (Number(this.DailySpendlimit) > 0 && Number(this.DailySpendlimit) <= 99) {

      // }
      // else {

      //   this.displayDailyLimitError = false;
      // }
    }
    else if (lunchRestrictionsDefinitionsitem.Code === "RESTRICT_BREAKFAST") {
      this.RestrictedBreakFast = $event.detail.checked;

    }
    else if (lunchRestrictionsDefinitionsitem.Code === "RESTRICT_SECOND_MEAL") {
      this.RestrictedSecondMealL = $event.detail.checked;

    }

  }
  submit() {
    if (this.DailySpendlimit != "") {
      if (parseFloat(this.DailySpendlimit) == 0) {
        const alert = this.alertController.create({
          header: this.translate.instant('meal_restriction'),
          message: this.translate.instant("confirm_content") + "\n \n" + this.translate.instant("confirm_content2"),
          buttons: [
            {
              text: this.translate.instant('yes'),
              handler: () => {
                this.setQuikLunchPatronRestrictions()
              }
            },
            {
              text: this.translate.instant('cancel'),
              role: 'cancel',
              handler: () => {

              }
            }
          ]
        });
        alert.then((res) => {
          res.present();
        })

      }
      else if (!(parseFloat(this.DailySpendlimit) < 100)) {
        const alert = this.alertController.create({
          header: this.translate.instant('meal_restriction'),
          message: this.translate.instant("err_msg_1"),
          buttons: [

            {
              text: this.translate.instant('cancel'),
              role: 'cancel',
              handler: () => {

              }
            }
          ]
        });
        alert.then((res) => {
          res.present();
        })
      }
      else if (parseFloat(this.DailySpendlimit) > 0 && parseFloat(this.DailySpendlimit) < 100) {
        this.setQuikLunchPatronRestrictions()

      }
      else {

        this.displayDailyLimitError = false;
      }
    }
    else {
      this.setQuikLunchPatronRestrictions()
    }

  }

  setQuikLunchPatronRestrictions() {

    this.sharedService.loading.next(true);
    let reqObj = {
      "IntSiteId": this.selectedPatron.data.IntSiteId,
      "IntPatronId": this.selectedPatron.data.IntPatronId,
      "PatronRestrictions": [
        {
          "Code": "RESTRICTED_ITEMS",
          "Value": this.checkedQlunchItems.toString(),
          "Active": true
        },
        {
          "Code": "RESTRICT_ALACARTE",
          "Value": this.RestrictedALacarte,
          "Active": true
        },
        {
          "Code": "DAILY_SPEND_LIMIT",
          "Value": this.DailySpendlimit,
          "Active": true
        },
        {
          "Code": "RESTRICT_BREAKFAST",
          "Value": this.RestrictedBreakFast,
          "Active": true
        },
        {
          "Code": "RESTRICT_SECOND_MEAL",
          "Value": this.RestrictedSecondMealL,
          "Active": true
        },
        {
          "Code": "RESTRICTED_GROUPS",
          "Value": this.checkedQlunchGroups.toString(),
          "Active": true
        }
      ]
    }

    this.dataService.setQuikLunchPatronRestrictions(reqObj)
      .subscribe(
        (response: any) => {
          this.displayDailyLimitError = false;
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == "Success") {

            this.searchText = '';
            this.filterUserMessages("")

            const alert = this.alertController.create({
              header: this.translate.instant('IS_Success'),
              message: this.translate.instant("succ_msg_mr"),
              buttons: [

                {
                  text: this.translate.instant('ok'),
                  role: this.translate.instant('cancel'),
                  handler: () => {

                  }
                }
              ]
            });
            alert.then((res) => {
              res.present();
            })
            this.showWarningPopup = false;
            // this.getQuikLunchRestrictionsByPatron();

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
          console.log(error);
        }
      );
  }
  onKeyUp(event: any) {
    const MY_REGEXP = /^[0-9]*(\.[0-9]{0,2})?$/;
    let newValue = event.target.value;
    let regExp = new RegExp(MY_REGEXP);

    if (!regExp.test(newValue)) {
      event.target.value = newValue.slice(0, -1);
    }

  }
  infoAlert() {
    let message: string;
    let header: string;
    message = this.translate.instant('mealrestrictions_info')
    const alert = this.alertController.create({
      header: this.translate.instant('mealrestrictions_header'),
      message: message,
      buttons: [this.translate.instant('ok')]
    });

    alert.then((res) => {
      res.present();
    })
  }

}
