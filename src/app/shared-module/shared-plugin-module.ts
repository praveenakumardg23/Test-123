import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { DocumentViewer } from '@awesome-cordova-plugins/document-viewer/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [],
  declarations: [],
  providers:[
    AppVersion,
    DocumentViewer,
    FileTransfer,
    File,
    FileOpener
  ]
})
export class SharedPluginModule { }