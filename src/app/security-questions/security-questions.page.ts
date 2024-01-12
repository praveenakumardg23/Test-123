import { AuthService } from './../auth/auth.service';
import { SharedService } from './../services/shared/shared.service';
import { Component, OnInit } from '@angular/core';
import { TabHeaderService } from './../services/tab-header/tab-header.service';
import { DataService } from '../services/data/data.service';
import { SecurityQuestionsDetails } from '../services/data/model/security-questions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AlertService } from './../services/alert/alert.service';
import { LanguageService } from '../services/language/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-security-questions',
  templateUrl: './security-questions.page.html',
  styleUrls: ['./security-questions.page.scss'],
})
export class SecurityQuestionsPage implements OnInit {
  questions1: any;
  questions2: any;
  questions3: any;
  selectedQuestions1: any;
  selectedQuestions2: any;
  selectedQuestions3: any;
  phase: string;
  questionsResponse: SecurityQuestionsDetails;
  errormessage: string;
  public form: any;
  public questionId1: string;
  public questionAnswer1: string;
  public questionId2: string;
  public questionAnswer2: string;
  public questionId3: string;
  public questionAnswer3: string;
  validate: boolean;
  cartCount: number;
  updateButton:boolean;
  formChangesSubscription;
  securityActionSheetOptions: any = {
    header: this.translate.instant('security_head'),
    cssClass:'question-action-sheet'
  };
 
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  
  constructor(
    private tabHeaderService: TabHeaderService,
    private dataService: DataService,
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    public toastController: ToastController,
    private authService: AuthService,
    public alertService: AlertService,
    public languageService: LanguageService,
    private translate: TranslateService) { }

  ngOnInit() {  
    setTimeout(() => {
      console.log(this.languageService.langDir);
      this.languageService.langDir  =this.sharedService.langDir;
    }, 500);
    this.updateButton = true;
    this.sharedService.appPhase.subscribe((phase) => {
      this.phase = phase;
      if(this.phase == 'registrationPhase') {
        this.sharedService.getUserInformation();
      }
    })
    this.sharedService.securityQuestionList.subscribe((sclist : any) => {
      this.securityActionSheetOptions = {
        header: this.translate.instant('security_head'),
        cssClass:'question-action-sheet'
      };
      //this.getSecurityQuestions();
      this.questionsResponse = sclist;
      console.log("test2020",this.questionsResponse);
      this.questions1 = this.questionsResponse.Questions[0].Question;
      this.questions2 = this.questionsResponse.Questions[1].Question;
      this.questions3 = this.questionsResponse.Questions[2].Question;
    })
    this.form = this.fb.group({
      questionId1: [this.questionId1, Validators.compose([Validators.required])],
      questionAnswer1: [this.questionAnswer1, Validators.compose([Validators.required])],
      questionId2: [this.questionId2, Validators.compose([Validators.required])],
      questionAnswer2: [this.questionAnswer2, Validators.compose([Validators.required])],
      questionId3: [this.questionId3, Validators.compose([Validators.required])],
      questionAnswer3: [this.questionAnswer3, Validators.compose([Validators.required])]
    });
     this.getSecurityQuestions();
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
    this.formChangesSubscription = this.form.valueChanges.subscribe((changedObj: any) => {
      this.updateButton = true;
    })
  }
  changeTabTo(tabnum) {
    this.tabHeaderService.redirectToPage(tabnum);
  }

  getSecurityQuestions() {
    this.dataService.getSecurityQuestions(null)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.questionsResponse = response.body;
          this.questions1 = this.questionsResponse.Questions[0].Question;
          this.questions2 = this.questionsResponse.Questions[1].Question;
          this.questions3 = this.questionsResponse.Questions[2].Question;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  onSubmitSecurityQuestions() {
    let Question = [];

    let Question1 = {

      QuestionId: this.form.value.questionId1,
      QuestionAnswer: this.form.value.questionAnswer1
    };
    let Question2 = {

      QuestionId: this.form.value.questionId2,
      QuestionAnswer: this.form.value.questionAnswer2
    };
    let Question3 = {

      QuestionId: this.form.value.questionId3,
      QuestionAnswer: this.form.value.questionAnswer3
    };

    Question.push(Question1);
    Question.push(Question2);
    Question.push(Question3);
    const QArequest = { "Questions": Question };
    const updateStepreqObj = { "IntStepId": 3 };
    this.sharedService.loading.next(true);
    this.dataService.addSecurityQuestions(JSON.stringify(QArequest))
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == "Success" && response.status == 200) {
            this.updateButton = false;
            this.alertService.successToast(this.translate.instant('success_toast'));
            if(this.phase == 'registrationPhase') {
              this.router.navigate(['/manage-patrons']);
              const updateStepreqObj = { "IntStepId": 3 };
              this.dataService.updateCurrentStep(updateStepreqObj)
              .subscribe(
                (response: any) => {
                  sessionStorage.setItem('nextStep', JSON.stringify('AddStudent/Staff'));
                }
              );
            }
          } else {
            const message=this.translate.instant('error_due_to');
            this.alertService.checkPEProcessingMessages(response.body, message);
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  questionSelected(i, questionSetNum) {
    if(questionSetNum == 'question1') {
      this.selectedQuestions1 = i;
    } 
    else if(questionSetNum == 'question2') {
      this.selectedQuestions2 = i;
    }
    else if(questionSetNum == 'question3') {
      this.selectedQuestions3 = i;
    }
  }

  compareAnswers() {
    const isEqual1 = (this.questionAnswer1 === this.questionAnswer2);
    const isEqual2 = (this.questionAnswer2 === this.questionAnswer3);
    const isEqual3 = (this.questionAnswer1 === this.questionAnswer3);
    if (this.questionAnswer1 === this.questionAnswer2 && (this.questionAnswer1!=null) && this.questionAnswer2!=null) {
      this.validate = true;
      this.commonToastMessage();
    }
    else if (this.questionAnswer2 === this.questionAnswer3 && (this.questionAnswer2!=null) && this.questionAnswer3!=null) {
      this.commonToastMessage();
      this.validate = true;
    }
    else if (this.questionAnswer1 === this.questionAnswer3 && (this.questionAnswer1!=null) && this.questionAnswer3!=null) {
      this.commonToastMessage();
      this.validate = true;
    }
    else {
      this.validate = false;
    }
  }
  commonToastMessage() {
    this.alertService.failureToast(this.translate.instant('answers_unique_toast'))
    // const toast = this.toastController.create({
    //   message: 'Security answers should be unique',
    //   duration: 2000
    // });
    // toast.then((reason) => {
    //   reason.present();
    // })
  }

  onLogout() {
    this.authService.logout('logout');
  }

  onLangChange() {
    this.languageService.displayLanguageAlert();
  }

  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }
}
