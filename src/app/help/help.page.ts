import { NgForm } from '@angular/forms';
import { SharedService } from 'src/app/services/shared/shared.service';
import { HttpClient } from '@angular/common/http';
import { ModalController, AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  helpPrimaryQuestions: any;
  fullPrimaryQuestionsData: any;
  isHelpPrimaryQuestionsPage = true;
  isArticlePage = false;
  isSubjectPage = false;
  isTicketForm = false;
  isFirstScenario = false;
  selectedPrimaryQuestionHelpArticle: any;
  articleSubjects: any;
  selectedArticle: any;
  selectedSubjectArticle: any;
  searchText: any;

  actionSheetOptions: any = {
    header: this.translate.instant('Security_Questions_header')
  };

  ArticlesActionSheetOptions: any = {
    header: this.translate.instant('select_item'),
    cssClass: 'question-action-sheet'
  };

  constructor(
    public modalController: ModalController,
    private httpClient: HttpClient,
    private sharedService: SharedService,
    private translate: TranslateService,
    public alertController: AlertController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getHelpPrimaryQuestions();
    this.getArticles();
  }

  onDismiss() {
    this.modalController.dismiss();
  }

  onBackToPrimaryQuestionPage() {
    this.isHelpPrimaryQuestionsPage = true;
    this.isArticlePage = false;
    this.isSubjectPage = false;
    this.isTicketForm = false;
  }

  onRedirectToArticlePage(data) {
    this.selectedSubjectArticle = this.getSelectSubjectValue(this.selectedArticle);
    const obj = {
      'id': data
    }
    this.getHelpArticle(obj, false);
  }

  onBackFromTicketForm() {
    this.isHelpPrimaryQuestionsPage = false;
    this.isArticlePage = true;
    this.isSubjectPage = false;
    this.isTicketForm = false;
  }

  onBackFromArticlePage() {
    this.isHelpPrimaryQuestionsPage = false;
    this.isArticlePage = false;
    this.isSubjectPage = true;
    this.isTicketForm = false;
  }

  onRedirectToTicketForm() {
    this.selectedSubjectArticle = this.getSelectSubjectValue(this.selectedArticle);
    this.isHelpPrimaryQuestionsPage = false;
    this.isArticlePage = false;
    this.isSubjectPage = false;
    this.isTicketForm = true;
  }
  getSelectSubjectValue(selectedSub) {
    const filteredSub = this.articleSubjects.filter((data) => {
      if (data.id == selectedSub) {
        return data;
      }
    })

    return filteredSub[0].question;
  }

  filterQuestions(searchText) {
    this.helpPrimaryQuestions = this.fullPrimaryQuestionsData.filter(function (tag) {
      return tag.question.toLowerCase().indexOf(searchText.toLowerCase()) >= 0;
    });
  }

  onSend(formData: NgForm) {
    const url = 'https://www.billandpay.com/dbs/ajax2.php?sr=1&name=' + encodeURIComponent(formData.value.FirstName) + '&email=' + encodeURIComponent(formData.value.UserName) + '&question=' + encodeURIComponent(this.getSelectSubjectValue(this.selectedArticle)) + '&details=' + encodeURIComponent(formData.value.Description) + '&&pid=8';
    this.sharedService.loading.next(true);
    this.get(url)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body) {
            this.successAlert();
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  successAlert() {
    const alert = this.alertController.create({
      header: this.translate.instant('IS_Success'),
      message: this.translate.instant('support_request_submitted'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('CLOSE'),
          handler: () => {
            this.modalController.dismiss();
          }
        }
      ]
    });

    alert.then((res) => {
      res.present();
    })
  }
  onArticlesDoesNotAnswer() {
    this.isFirstScenario = false;
    this.selectedArticle = '';
    const url = 'https://www.billandpay.com/dbs/ajax2.php?aq=1&q=undefined&pid=8';
    this.sharedService.loading.next(true);
    this.get(url)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.articleSubjects = response.body;
          this.isHelpPrimaryQuestionsPage = false;
          this.isArticlePage = false;
          this.isSubjectPage = true;
          this.isTicketForm = false;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getArticles() {
    const url = 'https://www.billandpay.com/dbs/ajax2.php?aq=1&q=undefined&pid=8';
    this.sharedService.loading.next(true);
    this.get(url)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.articleSubjects = response.body;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getHelpPrimaryQuestions() {
    const url = 'https://www.billandpay.com/dbs/ajax2.php?pq=1&pid=8';
    this.sharedService.loading.next(true);
    this.get(url)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.helpPrimaryQuestions = response.body;
          this.fullPrimaryQuestionsData = response.body;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getHelpArticle(selectedPrimaryQuestion, data) {
    if (data) {
      this.isFirstScenario = data;
    }
    this.selectedArticle = selectedPrimaryQuestion.id;
    this.selectedSubjectArticle = selectedPrimaryQuestion.question;
    const url = 'https://www.billandpay.com/dbs/ajax2.php?p=1&ai=' + selectedPrimaryQuestion.id + '&pid=8';
    this.sharedService.loading.next(true);
    this.get(url)
      .subscribe(
        (response: any) => {
          this.isHelpPrimaryQuestionsPage = false;
          this.isArticlePage = true;
          this.isSubjectPage = false;
          this.isTicketForm = false;
          this.sharedService.loading.next(false);
          this.selectedPrimaryQuestionHelpArticle = response.body;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  get(url: string) {
    this.sharedService.loading.next(true);
    return this.httpClient.get(url, {
      observe: 'response'
    })
      .pipe(
        map(
          (response) => {
            this.sharedService.loading.next(false);
            return response;
          },
          (error) => {
            this.sharedService.loading.next(false);
            return error;
          }
        )
      );
  }
}
