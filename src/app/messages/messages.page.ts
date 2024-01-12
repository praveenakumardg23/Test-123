import { Router } from '@angular/router';
import { MessagesMenuComponent } from './messages-menu/messages-menu.component';
import { AlertService } from './../services/alert/alert.service';
import { DataService } from '../services/data/data.service';
import { Component, OnInit, ElementRef } from '@angular/core';
import { SharedService } from '../services/shared/shared.service';
import { AlertController, ModalController, MenuController, PopoverController } from '@ionic/angular';

import { InboxComponent } from './inbox/inbox.component';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './../services/language/language.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagePage implements OnInit {
  displaySearchBar = false;
  userMessages: any;
  allMessages: any;
  messages: any;
  selectedType = "all";
  isIndeterminate: boolean;
  masterCheck: boolean;
  searchText: string;
  criticalMsgArray = [];
  cartCount: number;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  
  ngOnInit() {

  }

  constructor(
    private dataService: DataService,
    private sharedService: SharedService,
    public alertController: AlertController,
    private modalController: ModalController,
    private alertService: AlertService,
    public menuCtrl: MenuController,
    private translate: TranslateService,
    public popoverController: PopoverController,
    private router: Router,
    public languageService: LanguageService) { }

  ionViewWillEnter() {
    this.getUserMessages('init', '');
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
  }

  ionViewDidEnter() {
  }

  ionViewWillLeave() {
    
    sessionStorage.setItem('selectedMessageMenu', 'all');
  }

  ionViewDidLeave() {
  }



  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: MessagesMenuComponent,
      event: ev,
      translucent: true
    });

    popover.onDidDismiss()
      .then((result) => {
        if (result['data']) {
          this.filterMessage(result['data']);
        }
      });
    return await popover.present();
  }

  getUserMessages(type, ev) {
    this.sharedService.loading.next(false);
    const reqObject: any = {};
    reqObject.IncludeAlreadyRead = true;
    reqObject.IncludeInactive = true;
    reqObject.ForceRefresh = true;
    this.masterCheck = false;
    this.isIndeterminate=false;
    this.dataService.getUserMessages(reqObject)
      .subscribe(
        (response: any) => {
          if (type == 'refresh') {
            ev.target.complete();
          }
          this.criticalMsgArray = [];
          this.userMessages = response.body.Messages;
          const unreadMsg = this.userMessages.filter((data) => {
            if (data.ReadDate == null) {
              return data;
            }
          })
          this.sharedService.messageCount.next(unreadMsg.length);
          this.userMessages.forEach((userMessage) => {
            // if (this.masterCheck) {
            //   userMessage.isChecked = true;
            // }
            // else { userMessage.isChecked = false; }
            userMessage.isChecked = false;

            if (userMessage.Priority == 2 && userMessage.ReadDate == null) {
              this.criticalMsgArray.push(userMessage);
            }
          })
          this.allMessages = this.userMessages;
          const selectedMessageMenu = sessionStorage.getItem('selectedMessageMenu');
          if (selectedMessageMenu) {
            this.filterMessage(selectedMessageMenu);
          } else {
            this.filterMessage('all');
          }

          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  filterUserMessages(data) {
    let userMessages = this.allMessages;
    if (this.selectedType == 'read') {
      userMessages = this.userMessages.filter((userMessage) => {
        if (userMessage.ReadDate && userMessage.ActiveSw) {
          return userMessage;
        }
      })
    } else if (this.selectedType == 'unread') {
      userMessages = this.userMessages.filter((userMessage) => {
        if (!userMessage.ReadDate) {
          return userMessage;
        }
      })
    } else if (this.selectedType == 'all') {
      userMessages = this.allMessages.filter((userMessage) => {
        if (userMessage.ActiveSw) {
          return userMessage;
        }
      });
    } else if (this.selectedType == 'trash') {
      userMessages = this.userMessages.filter((userMessage) => {
        if (!userMessage.ActiveSw) {
          return userMessage;
        }
      })
    }
    this.userMessages = userMessages.filter(function (tag) {
      return tag.MessageSubject.toLowerCase().indexOf(data.toLowerCase()) >= 0;
    });
    if (data == "") {
      this.filterMessage(this.selectedType);
    }
  }

  doRefresh(ev) {
    this.getUserMessages('refresh', ev);
  }

  async showMessagePopup(userMessage) {
    const modal = await this.modalController.create({
      component: InboxComponent,
      componentProps: {
        'userMessage': userMessage
      },
      cssClass: 'inbox-content'
    });
    await modal.present();
    modal.onWillDismiss().then((res: any) => {
      if (res.data) {
        if (res.data.dismissed) {
          this.getUserMessages('', '');
        }
      }
    })

    // const alert = this.alertController.create({
    //   header: userMessage.MessageSubject,
    //   message: userMessage.MessageText,
    //   cssClass: 'buttonCss',
    //   inputs: [
    //     {
    //       name: 'markasread',
    //       type: 'checkbox',
    //       label: 'Mark as READ',
    //       value: 'markasread',
    //       handler: (data) => {
    //       }
    //     }
    //   ],
    //   buttons: [
    //     {
    //       text: 'Close',
    //       role: 'cancel'
    //     }, {
    //       text: 'Delete',
    //       cssClass: 'delete-btn',
    //       handler: (data) => {
    //         if (data[0] == 'markasread') {
    //         } else {
    //           return false;
    //         }
    //       }
    //     }
    //   ]
    // });

    // alert.then((res) => {
    //   res.present();
    // })
  }


  filterMessage(type) {
    this.selectedType = type;
    this.userMessages = this.allMessages;
    if (type == 'read') {
      const readMessages = this.userMessages.filter((userMessage) => {
        if (userMessage.ReadDate && userMessage.ActiveSw) {
          return userMessage;
        }
      })
      this.userMessages = readMessages;
    } else if (type == 'unread') {
      const unreadMessages = this.userMessages.filter((userMessage) => {
        if (!userMessage.ReadDate) {
          return userMessage;
        }
      })
      this.userMessages = unreadMessages;
    } else if (type == 'all') {
      this.userMessages = this.allMessages.filter((userMessage) => {
        if (userMessage.ActiveSw) {
          return userMessage;
        }
      });

    } else if (type == 'trash') {
      const trashMessages = this.userMessages.filter((userMessage) => {
        if (!userMessage.ActiveSw) {
          return userMessage;
        }
      })
      this.userMessages = trashMessages;
    }
  }

  onDelete(type: string, userMessage) {
    if (type == 'deleteonemessage') {
      this.sharedService.updateUserMessages(type, userMessage)
        .subscribe(
          (response: any) => {
            this.sharedService.loading.next(false);
            if (response.body.APIStatus == 'Success') {
              this.getUserMessages('', '');
            }
          },
          (error) => {
            this.sharedService.loading.next(false);
            console.log(error);
          }
        );
    } else {
      const priorityMsgUnread = userMessage.filter((data) => {
        if (data.ReadDate == null && data.Priority != 0) {
          return data;
        }
      })

      if (priorityMsgUnread.length > 0) {
        this.alertService.alert(this.translate.instant('warning'), this.translate.instant('warning_msg'))
      } else {
        const checkedData = userMessage.filter((data) => {
          if (data.isChecked) {
            return data;
          }
        })
        this.sharedService.updateUserMessages(type, checkedData)
          .subscribe(
            (response: any) => {
              this.sharedService.loading.next(false);
              if (response.body.APIStatus == 'Success') {
                this.getUserMessages('', '');
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

  async deleteConfirm(type, userMessage) {
    const alert = await this.alertController.create({
      header: this.translate.instant('ME_Delete'),
      message: this.translate.instant('DeleteSingle'),
      buttons: [
        {
          text: this.translate.instant('No'),
          role: 'cancel',
          handler: (blah) => {

          }
        }, {
          text: this.translate.instant('Yes'),
          handler: () => {
            this.onDelete(type, userMessage);
          }
        }
      ]
    });

    await alert.present();
  }

  checkMaster() {
    setTimeout(() => {
      this.userMessages.forEach(obj => {
        obj.isChecked = this.masterCheck;
      });
    });
  }

  checkEvent() {
    const totalItems = this.userMessages.length;
    let checked = 0;
    this.userMessages.map(obj => {
      if (obj.isChecked) checked++;
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

  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }
}



