import { SharedService } from './../../services/shared/shared.service';
import { ModalController, NavParams } from '@ionic/angular';
import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent implements OnInit {
  @Input() userMessage: string;
  selectedMessage: any;
  deleteButtonEnable = false;
  constructor(
    private modalController: ModalController,
    navParams: NavParams,
    private element: ElementRef,
    private sharedService: SharedService
  ) {
    this.selectedMessage = navParams.get('userMessage');
  }

  ngOnInit() {
    this._enableDynamicHyperlinks();
    if (this.selectedMessage.Priority == 0 && this.selectedMessage.ReadDate == null) {
      this.markAsRead(this.selectedMessage);
    }
  }

  onDismiss(selectedMessage) {
    if(selectedMessage && selectedMessage.Displayonlogin === true ){
      this.markAsRead(selectedMessage);
    }
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  private _enableDynamicHyperlinks(): void {
    setTimeout(() => {
      const urls: any = this.element.nativeElement.querySelectorAll('a');
      urls.forEach((url) => {
        url.addEventListener('click', (event) => {
          event.preventDefault();
          this.sharedService.openUrl(event.target.href);
        }, false);
      });
    }, 2000);
  }

  onDelete(data) {
    this.sharedService.updateUserMessages('deleteonemessage', data)
    .subscribe(
      (response: any) => {
        this.sharedService.loading.next(false);
        if(response.body.APIStatus == 'Success') {
          this.modalController.dismiss({
            'dismissed': true
          });
        }
      },
      (error) => {
        this.sharedService.loading.next(false);
        console.log(error);
      }
    );   
  }

  markAsRead(data) {
    this.sharedService.updateUserMessages('markasread', data)
    .subscribe(
      (response: any) => {
        this.sharedService.loading.next(false);
        if(response.body.APIStatus == 'Success') {
          // this.modalController.dismiss({
          //   'dismissed': true
          // });
          this.deleteButtonEnable = true;
        }
      },
      (error) => {
        this.sharedService.loading.next(false);
        console.log(error);
      }
    );
  }
}
