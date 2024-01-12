import { Component, OnInit } from '@angular/core';
import { ModalController, Platform, LoadingController, } from '@ionic/angular';
import { DocumentViewer, DocumentViewerOptions } from '@awesome-cordova-plugins/document-viewer/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { SharedService } from '../services/shared/shared.service';
import { AppConfiguration } from '../app-configuration';
import { TranslateService } from '@ngx-translate/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage implements OnInit {
  loadSpinner: any;
  selectedLangId = 1;
  // selectedLang: any;
  private terms_url: string
  constructor(public modalController: ModalController,
    private document: DocumentViewer,
    private transfer: FileTransfer,
    private file: File,
    private platform: Platform,
    public loadingController: LoadingController,
    private sharedService: SharedService,
    private appConfiguration: AppConfiguration,
    public translate: TranslateService,
    private fileopener:FileOpener,
  ) {
    this.terms_url = "https://www.govinfo.gov/content/pkg/FR-2016-03-23/pdf/2016-06463.pdf";
    // console.log(this.translate)
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    let selectedLang;
    const userInfo = JSON.parse(localStorage.getItem('userInfo') );
    let globals = JSON.parse(sessionStorage.getItem('globals') );

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
    this.selectedLangId = parseInt(selectedLang);
  }

  onDismiss() {
    this.modalController.dismiss();
  }

  openUrl(url:any) {
    // this.sharedService.openUrl(this.terms_url);
    window.open(url, '_system');
  }

  openLocalPdf() {
    let filePath = this.file.applicationDirectory + 'www/assets/pdf';
    if (this.platform.is('android')) {
      // this.presentLoadingWithOptions();
 
      let url;
      if (this.selectedLangId == 2) {
        let filename='TermsC-es-US.pdf'
        let theMove = this.file.copyFile(filePath, filename, this.file.externalDataDirectory, filename);
        // update the path variable
        this.fileopener.open(this.file.externalDataDirectory + filename, 'application/pdf')
        .then( (openedFile:any) => {
            console.log('File opened', openedFile);
        })
        .catch((e:any) => console.log("Error opening file: " + JSON.stringify(e)));
     
       // url = 'http://www.payschools.com/wp-content/uploads/2020/03/TermsC-es-US.pdf';
      } else {
        let filename='TermsC-en-US.pdf'
        let theMove = this.file.copyFile(filePath, filename, this.file.externalDataDirectory, filename);
        // update the path variable
        this.fileopener.open(this.file.externalDataDirectory + filename, 'application/pdf')
        .then((openedFile:any) => {
            console.log('File opened', openedFile);
        })
        .catch((e:any) => console.log("Error opening file: " + JSON.stringify(e)));
     
      }
      
      // fileTransfer.download(url, path + 'PaySchools-Users-Terms-Conditions.pdf')
      //   .then(entry => {
      //     this.loadSpinner.dismiss();
      //     let url = entry.toURL();
      //     this.document.viewDocument(url, 'application/pdf', {},);
      //   })
      //   .catch(error => {
      //     this.loadSpinner.dismiss();
      //     console.log(error);
      //   });
    } else {
      const options: DocumentViewerOptions = {
        title: this.translate.instant('terms_and_condition'),
        openWith: { enabled: true }
      }
      if (this.selectedLangId == 2) {
        this.document.viewDocument(`${filePath}/TermsC-es-US.pdf`, 'application/pdf', options)
      } else {
        this.document.viewDocument(`${filePath}/TermsC-en-US.pdf`, 'application/pdf', options)
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

