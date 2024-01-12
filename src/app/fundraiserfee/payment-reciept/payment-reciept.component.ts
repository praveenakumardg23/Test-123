import { Component, OnInit } from '@angular/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language/language.service';
import { SharedService } from 'src/app/services/shared/shared.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { HelppopupComponent } from 'src/app/helppopup/helppopup.component';

@Component({
  selector: 'app-payment-reciept',
  templateUrl: './payment-reciept.component.html',
  styleUrls: ['./payment-reciept.component.scss'],
})
export class PaymentRecieptComponent implements OnInit {

  pageHeader: string;
  paymentReceipt: any;
  downloading: boolean = false;
  username = '';
  getReceipt = '';
  IntTransactionId: any;
  siteId: any;
  pReceipt: any;
  originalpReceipt: any;
  receiptData: any;
  Subtotal: any;
  Total: any;
  InternetConvenienceFee: any;
  PatronDistrict: any;
  dateAndTime: string = "";
  receiptPayload: any;
  receiptDetails: any;
  ReceiptNumber: any
  groupedFeeList: any;
  isGuestCheckout : boolean=false;

  constructor(private sharedService: SharedService,
    public languageService: LanguageService,
    private translate: TranslateService,
    private file: File,
    private fileOpener: FileOpener,
    private navCtrl: NavController,
    public popoverController: PopoverController,
    private router : Router) { }

  ngOnInit() {
    this.isGuestCheckout = (localStorage.getItem('isGuestCheckout') == 'true')?true:false;
    this.getPaymentReceipt();
    this.sharedService.appPhase.next('Receipt');
    this.sharedService.pageHeaderTitle.subscribe((title: string) => {
      this.pageHeader = title;
    })
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  getPaymentReceipt() {
    let responseData: any = this.sharedService.getReceiptData();
    this.receiptData = responseData.body;
    console.log(this.receiptData);
    console.log(this.receiptData, "AllReceiptData");
    this.receiptDetails = this.receiptData.Details
    this.receiptDetails.forEach((element: any) => {
      element.Amount = element.Amount.toFixed(2);
    });;
    this.groupingfeelist();
    this.originalpReceipt = this.receiptData.ReceiptData;
    if(this.receiptData.InternetConvenienceFee === 0){
      this.InternetConvenienceFee = this.receiptData.TransactionFee.toFixed(2);
    }else{
      this.InternetConvenienceFee = this.receiptData.InternetConvenienceFee.toFixed(2);
    }
    
    this.Subtotal = this.receiptData.Subtotal.toFixed(2);
    this.Total = this.receiptData.Total.toFixed(2);
    this.PatronDistrict = this.receiptData.Details[0].PatronDistrict;
    this.dateAndTime = this.receiptData.Details[0].TransactionDate;
    this.ReceiptNumber = this.receiptData.IntTransactionId;
  }

  groupingfeelist() {
    if (this.receiptDetails.length > 0) {
      let groups = '';

      groups = this.receiptDetails.reduce(function (obj, item) {
        obj[item.FName + " " + item.LName] = obj[item.FName + " " + item.LName] || [];
        obj[item.FName + " " + item.LName].push(item);
        return obj;
      }, {});
      this.groupedFeeList = Object.keys(groups).map(function (key) {
        return { PatronName: key, childitems: groups[key] };
      });
    } else {
    }
    console.log(this.groupedFeeList, "GroupReceipt");
  }

  returnTodashboard() {
    if(this.isGuestCheckout){
      this.router.navigate(['/fundraiserfee/fundraiser-fees'])
    }else{
      // const redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
    this.sharedService.cartCount.next(0);
    this.navCtrl.navigateRoot('/dashboard/home');
    }
  }

  downloadFile() {
    let data:any = this.originalpReceipt;
    this.downloading = true
    let fileName = "Receipt.pdf";
    let extNameformate;
    let imgdata;
    let filepath = this.file.cacheDirectory + 'Attachments/' + fileName;
    extNameformate = 'application/pdf';
    imgdata = 'data:application/pdf;base64,' + data

    let realData = imgdata.split(",")[1];
    let blob = this.b64toBlob(realData, extNameformate);

    this.file.checkDir(this.file.cacheDirectory, 'Attachments')
      .then(result => {
        this.file.writeFile(this.file.cacheDirectory + 'Attachments/', fileName, blob, { replace: true }).then(response => {
          this.downloading = false;
          this.fileOpener.open(filepath, extNameformate)
            .then(() => {

            })
            .catch(e => console.log('Error opening file', e));
        }).catch(err => {
          this.downloading = false;
        })
      })
      .catch(err => {
        this.file.createDir(this.file.cacheDirectory, 'Attachments', false).then(result => {
          this.file.writeFile(this.file.cacheDirectory + 'Attachments/', fileName, blob, { replace: true }).then(response => {
            this.downloading = false;
            this.fileOpener.open(filepath, extNameformate)
              .then(() => console.log('File is opened'))
              .catch(e => console.log('Error opening file', e));
          }).catch(err => {
            this.downloading = false;

          })
        }).catch(err => {
          this.downloading = false;
        })
      });
  }
  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
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

}
