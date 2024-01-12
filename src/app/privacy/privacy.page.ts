import { SharedService } from 'src/app/services/shared/shared.service';
import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, LoadingController } from '@ionic/angular';
import { DocumentViewer, DocumentViewerOptions } from '@awesome-cordova-plugins/document-viewer/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage implements OnInit {
  loadSpinner: any;
  selectedLangId = 1;
  constructor(public modalController: ModalController,
    private document: DocumentViewer,
    private transfer: FileTransfer,
    private file: File,
    private platform: Platform,
    public loadingController: LoadingController,
    private translate: TranslateService,
    private sharedService: SharedService) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let selectedLang;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let globals: any = JSON.parse(sessionStorage.getItem('globals'));

    if (globals != null) {
      let selectedLangCode = sessionStorage.getItem('selectedLangCode');
      if (selectedLangCode) {
        selectedLang = selectedLangCode;
      } else {
        selectedLang = userInfo.IntLanguageId;
      }
    } else {
      selectedLang = localStorage.getItem('selectedLangCode');
      if (selectedLang) {
        selectedLang = selectedLang;
      } else {
        selectedLang = '1';
        localStorage.setItem('selectedLangCode', selectedLang);
      }
    }
    this.selectedLangId = selectedLang;
  }


  onDismiss() {
    this.modalController.dismiss();
  }

  openLocalPdf() {
    let filePath = this.file.applicationDirectory + 'www/assets/pdf';
    if (this.platform.is('android')) {
      // this.presentLoadingWithOptions();
      let path = null;
      path = this.file.dataDirectory;
      const fileTransfer = this.transfer.create();
      let url;
      if (this.selectedLangId == 2) {
        url = 'http://www.payschools.com/wp-content/uploads/2020/03/PrivacyPolicy-es-US.pdf';
      } else {
        url = 'http://www.payschools.com/wp-content/uploads/2020/03/PrivacyPolicy-en-US.pdf';
      }
      // fileTransfer.download(url, path + 'Payschools-Privacy-Policy.pdf')
      //   .then(entry => {
      //     this.loadSpinner.dismiss();
      //     let url = entry.toURL();
      //     this.document.viewDocument(url, 'application/pdf', {});
      //   })
      //   .catch(error => {
      //     this.loadSpinner.dismiss();
      //   });
      this.sharedService.openSystemBrowser(url);
    } else {
      const options: DocumentViewerOptions = {
        title: this.translate.instant('privacy_policy'),
        openWith: { enabled: true }
      }
      if(this.selectedLangId == 2){
        this.document.viewDocument(`${filePath}/PrivacyPolicy-es-US.pdf`, 'application/pdf', options)
      }else{
        this.document.viewDocument(`${filePath}/PrivacyPolicy-en-US.pdf`, 'application/pdf', options)
      }
    }
  }

  async presentLoadingWithOptions() {
    this.loadSpinner = await this.loadingController.create({
      spinner: 'lines',
      message: this.translate.instant('please_wait'),
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await this.loadSpinner.present();
  }
}
