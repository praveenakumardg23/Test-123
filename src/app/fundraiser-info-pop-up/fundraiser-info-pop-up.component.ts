import { Component, OnInit, Input } from '@angular/core';
import{ModalController} from '@ionic/angular';
import { LanguageService } from '../services/language/language.service'; 

//import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FundraiserserviceService } from '../fundraiserfee/fundraiserservice/fundraiserservice.service';
@Component({
  selector: 'app-fundraiser-info-pop-up',
  templateUrl: './fundraiser-info-pop-up.component.html',
  styleUrls: ['./fundraiser-info-pop-up.component.scss'],
})
export class FundraiserInfoPopUpComponent implements OnInit {
  @Input() fee: any;
  documentName:any;
  downloading:any=false;
  isGuestCheckout:boolean=false
  constructor(private ModalController:ModalController,public languageService: LanguageService,private file:File,private fileopener:FileOpener,public fundraiserService:FundraiserserviceService) { }

  ngOnInit() {
    this.isGuestCheckout = (localStorage.getItem('isGuestCheckout') == 'true') ? true : false;
    if(this.fee.Document)
    {
     this.documentName= this.fee.FeeName+"."+ this.fee.DocumentName.slice(this.fee.DocumentName.indexOf('.')+1, this.fee.DocumentName.length);
    }
  }
  okButton()
  {
this.ModalController.dismiss();
  }



downloadFile(data)
{
 this.downloading=true
 let fileName=data.FeeName+"."+ data.DocumentName.slice(data.DocumentName.indexOf('.')+1, data.DocumentName.length);
 let extNameformate;
 let imgdata;
 let filepath=this.file.cacheDirectory + 'Attachments/'+fileName;
 if(data.DocumentName.slice(data.DocumentName.indexOf('.')+1, data.DocumentName.length)=='PDF' || data.DocumentName.slice(data.DocumentName.indexOf('.')+1, data.DocumentName.length)=='pdf')
 {
  extNameformate='application/pdf';
  imgdata='data:application/pdf;base64,'+data.Document
 }
 else
 {
  extNameformate="image/jpeg";
  imgdata='data:image/jpeg;base64,'+data.Document;

 }
  let realData = imgdata.split(",")[1];
    let blob = this.b64toBlob(realData, extNameformate);

    this.file.checkDir(this.file.cacheDirectory, 'Attachments')
        .then(result => {
          this.file.writeFile(this.file.cacheDirectory + 'Attachments/',fileName, blob,{replace:true}).then(response => {
            this.downloading=false;
            this.fileopener.open(filepath, extNameformate)
            .then(() => {
              
            })
            .catch(e => console.log('Error opening file', e));
          }).catch(err => {
            this.downloading=false;
          })
        })
        .catch(err => {
          this.file.createDir(this.file.cacheDirectory, 'Attachments', false).then(result => {
            this.file.writeFile(this.file.cacheDirectory + 'Attachments/',fileName, blob,{replace:true}).then(response => {
              this.downloading=false;
              this.fileopener.open(filepath, extNameformate)
              .then(() => console.log('File is opened'))
              .catch(e => console.log('Error opening file', e));
            }).catch(err => {
              this.downloading=false;

            })
          }).catch (err=>{this.downloading=false;
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

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
}
