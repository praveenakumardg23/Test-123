import { AuthService } from './../auth/auth.service';
import { LanguageService } from './../services/language/language.service';
import { Component, OnInit } from '@angular/core';
import { TabHeaderService } from './../services/tab-header/tab-header.service';
import { DataService } from '../services/data/data.service';
import { States, Districts, studentDetail, Relationship } from '../services/data/model/add-patron';
import { NgForm } from '@angular/forms';
import { RemovePatron, UpdatePatronRelationship } from '../services/data/model/view-patron';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, AlertController, MenuController } from '@ionic/angular';
import { SharedService } from '../services/shared/shared.service';
import { AlertService } from './../services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-patrons',
  templateUrl: './manage-patrons.page.html',
  styleUrls: ['./manage-patrons.page.scss'],
})
export class ManagePatronsPage implements OnInit {
  category = 'Add';
  states: States[];
  districts: Districts[];
  // selectedDistrictValue: Districts;
  student: any;
  relationship: any;
  selectedRelationship: any;
  viewPatrons: any;
  Patronspicturedetails: any = [];
  IntPatronId: any;
  IntSiteId: any;
  patrons: any;
  relationshipIds: any;
  intPatronRelationshipId: any;
  intUserPatronId: any;
  phase: string;
  firstPatronObj: any;
  selectedDistrictValue: any;
  selectedLang: any;
  cartCount: number;
  districtFlag = false;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  selectedLangSubscription: any;
  languagedetailsSubscription: any;


  constructor(private tabHeaderService: TabHeaderService,
    private dataService: DataService,
    private router: Router,
    public toastController: ToastController,
    private sharedService: SharedService,
    private alertController: AlertController,
    public alertService: AlertService,
    public languageService: LanguageService,
    private authService: AuthService,
    private translate: TranslateService,
    private menu: MenuController,
    private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.sharedService.appPhase.subscribe((phase) => {
      this.phase = phase;
      if (this.phase == 'dashboard') {
        this.category = 'View';
      } else if (this.phase == 'registrationPhase') {
        this.sharedService.getUserInformation();
        this.category == 'Add'
        
      }
    })
    this.dataInitialize();
    let selectedLang;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let globals: any = JSON.parse(sessionStorage.getItem('globals'));

    // this.selectedLangSubscription = this.languageService.IntLanguageId.subscribe(
    //   (langdetails: any) => {
    //     this.selectedLang = langdetails;
    //     console.log("selectedLang",this.selectedLang);
    //     localStorage.setItem('selectedLangCode',this.selectedLang);
    // const issessionLang = sessionStorage.getItem('sessionLang');
    // const sessionLangid: any = sessionStorage.getItem('sessionLangid');
    // if (issessionLang === 'false') {
    //   this.selectedLang = sessionLangid;
    // }
    //   }
    // );
    this.languagedetailsSubscription = this.sharedService.languageId.subscribe(
      (langdetails: any) => {
        console.log("languageService-------", langdetails);
        this.selectedLang = langdetails;

        // if (globals != null) {
        //   let selectedLangCode = sessionStorage.getItem('selectedLangCode');
        //   if (selectedLangCode) {
        //     selectedLang = selectedLangCode;
        //   } else {
        //     selectedLang = (userInfo && userInfo.IntLanguageId) ? userInfo.IntLanguageId : '1';
        //   }
        // } else {
        //   selectedLang = localStorage.getItem('selectedLangCode');
        // }
        // this.selectedLang = selectedLang;
      }
    );

    if (globals != null) {
      let selectedLangCode = sessionStorage.getItem('selectedLangCode');
      if (selectedLangCode) {
        selectedLang = selectedLangCode;
      } else {
        selectedLang = (userInfo && userInfo.IntLanguageId) ? userInfo.IntLanguageId : '1';
      }
    } else {
      selectedLang = localStorage.getItem('selectedLangCode');
    }
    this.selectedLang = selectedLang;

    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
  }
  ionViewWillEnter() {
    let tabeType = this.route.snapshot.queryParams["page"];
    if (tabeType == 'add') {
      const ev = {
        detail: {
          value: 'Add'
        }
      }
      this.segmentChanged(ev);
      this.category == 'Add'
    }

    this.sharedService.loading.next(true);
    this.getPatronList();
    this.getUserPatrons();
  }
  changeTabTo(tabnum) {
    this.tabHeaderService.redirectToPage(tabnum);
  }

  segmentChanged(event) {
    this.category = event.detail.value;
    if (event.detail.value === 'Add') {
      this.dataInitialize();
      this.getPatronList();
      this.getUserPatrons();
    } else {
      this.districts = [];
      this.districtFlag = true;
      this.getPatronList();
      this.getUserPatrons();
      this.sharedService.loading.next(true);
    }
  }

  dataInitialize() {
    this.student = {
      IntStateId: null,
      IntSiteId: null,
      IntDistrictId: null,
      PatronId: '',
      FirstName: '',
      LastName: '',
      IntPatronRelationshipId: null
    }

    this.sharedService.loading.next(true);
    this.getDistrictStates();
    this.getRelationship();
  }

  getPatronList() {
    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.Patronspicturedetails = response.body.Patrons;
        }
      )
  }

  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.viewUserPatron()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.viewPatrons = response.body.Patrons;
          this.sharedService.userPatronsList.next(response.body.Patrons);
          this.firstPatronObj = this.viewPatrons[0];
          this.sharedService.setPatronsInfo(this.viewPatrons);
          const districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
          if (this.viewPatrons.length == 1) {
            const studentData = {
              type: 'individual',
              data: this.viewPatrons[0]
            }
            localStorage.setItem('selectedPatron', JSON.stringify(studentData));
          }
          if (this.viewPatrons.length > 0) {
            if (!districtFeaturelist) {
              this.sharedService.getDistrictFeatureList(response.body.Patrons, 'managepatron');
            }
            this.student.IntStateId = this.firstPatronObj.IntStateId;
            this.student.IntSiteId = this.firstPatronObj.IntSiteId;
            //this.student.IntDistrictId = this.firstPatronObj.IntDistrictId;
            this.getDistrictsByState(this.student.IntStateId);
          } else {
            this.sharedService.getDistrictFeatureList(response.body.Patrons, 'managepatron');
            localStorage.setItem('dashboardRedirectPath', '/dashboard/home');
          }
        }
      )
  }

  onRemovePatron(Ids) {
    this.sharedService.loading.next(true);
    this.patrons = Ids;
    this.IntPatronId = this.patrons.IntPatronId;
    this.IntSiteId = this.patrons.IntSiteId;
    const reqObj: RemovePatron = {
      IntSiteId: this.IntSiteId,
      IntPatronId: this.IntPatronId
    }
    this.dataService.removeUserPatron(reqObj)
      .subscribe(
        (response: any) => {
          this.districtFlag = true;
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            this.sharedService.loading.next(false);
            this.getUserPatrons();
          } else {
            const message = 'Error due to';
            this.alertService.checkPEProcessingMessages(response.body, message);
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  presentAlertConfirm(patron) {
    const alert = this.alertController.create({
      header: this.translate.instant('remove_patron'),
      message: this.translate.instant('confirm_message'),
      buttons: [
        {
          text: this.translate.instant('No'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: this.translate.instant('yes'),
          handler: () => {
            this.onRemovePatron(patron)
          }
        }
      ]
    });

    alert.then((val) => {
      val.present();
    });
  }
  getDistrictStates() {
    this.sharedService.loading.next(true);
    this.dataService.getDistrictStates()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success') {
            this.states = response.body.States;
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getDistrictsByState(state) {
    this.student.IntDistrictId = '';
    if (state) {
      this.sharedService.loading.next(true);
      const reqObject = {
        IntStateId: state
      }
      this.dataService.getDistrictsByState(reqObject)
        .subscribe(
          (response: any) => {
            this.sharedService.loading.next(false);
            if (response.body.APIStatus == 'Success') {
              this.districtFlag = false;
              this.districts = response.body.Districts;
              if (this.firstPatronObj && this.firstPatronObj.IntDistrictId != '') {
                if (this.viewPatrons.length > 0) {
                  this.districts = this.districts.filter((x) => {
                    if ((x.IntSiteId === this.firstPatronObj.IntSiteId) && (x.IntDistrictId === this.firstPatronObj.IntDistrictId)) {
                      return x;
                    }else{
                      return null;
                    }
                  })
                }
                this.student.IntDistrictId = this.districts[0];
              }
            }
          },
          (error) => {
            this.sharedService.loading.next(false);
            console.log(error);
          }
        );
    }
  }

  getRelationship() {
    let selectedLang;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let globals: any = JSON.parse(sessionStorage.getItem('globals'));

    if (globals != null) {
      let selectedLangCode = sessionStorage.getItem('selectedLangCode');
      if (selectedLangCode) {
        selectedLang = selectedLangCode;
      } else {
        selectedLang = (userInfo && userInfo.IntLanguageId) ? userInfo.IntLanguageId : '1';
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
      const payload = {
        IntLanguageId: selectedLang
      };
    this.dataService.getRelationship(payload)
      .subscribe(
        (response: any) => {
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            this.relationship = response.body.Relationship;
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }


  onChangeRelationship(RelationshipId) {
    this.sharedService.loading.next(true);
    this.relationshipIds = RelationshipId;
    this.intUserPatronId = this.relationshipIds.IntUserPatronId;
    this.intPatronRelationshipId = this.relationshipIds.IntPatronRelationshipId;
    const reqObjPatronRel: UpdatePatronRelationship = {
      IntUserPatronId: this.intUserPatronId,
      IntPatronRelationshipId: this.intPatronRelationshipId
    }
    this.dataService.updateRelationship(reqObjPatronRel)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            this.alertService.successToast(this.translate.instant('successfully_updated'));
          } else {
            const message = 'Error due to';
            this.alertService.checkPEProcessingMessages(response.body, message);
          }
        },
        (error) => {
          console.log(error)
        }
      )
  }

  selectedDistrict(data) {
    if (data) {
      const selectedDistrict = this.districts.filter((district) => {
        if ((district.IntDistrictId == data.IntDistrictId) && (district.IntSiteId == data.IntSiteId)) {
          return district;
        }else{
          return null;
        }
      })
      this.selectedDistrictValue = selectedDistrict;
    }
  }

  onAddStudentSubmit(formData: NgForm) {
    this.sharedService.loading.next(true);
    const reqObject: any = formData.value;
    reqObject.IntStateId = this.student.IntStateId;
    reqObject.IntDistrictId = this.student.IntDistrictId.IntDistrictId;
    if (this.viewPatrons.length > 0) {
      // const selectedDistrict = this.districts.filter((district) => {
      //   if (district.IntDistrictId == this.student.IntDistrictId) {
      //     reqObject.IntSiteId = district.IntSiteId;
      //   }
      // })
      const districtFeatureList = JSON.parse(localStorage.getItem('districtFeaturelist'));
      reqObject.IntSiteId = districtFeatureList.IntSiteId;
    } else {
      reqObject.IntSiteId = this.selectedDistrictValue[0].IntSiteId;
    }
    this.dataService.addUserPatron(reqObject)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            this.clearFormData(formData);
            this.alertService.successToast(this.translate.instant('patron_add_succ'));
            this.getUserPatrons();
            if (this.phase == 'registrationPhase') {
              const updateStepreqObj = { "IntStepId": 4 };
              this.dataService.updateCurrentStep(updateStepreqObj)
                .subscribe(
                  (updateResponse: any) => {
                    sessionStorage.setItem('nextStep', JSON.stringify('AddPayment'));
                  }
                );
            }
          } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
            const message = this.translate.instant('ERROR_CONTACT_SUPPORT');
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

  clearFormData(f: NgForm) {
    if (this.viewPatrons.length > 0) {
      f.controls['PatronId'].reset();
      f.controls['FirstName'].reset();
      f.controls['LastName'].reset();
      this.student.IntPatronRelationshipId = null;
    } else {
      f.reset();
      this.districts = null;
    }
  }

  async infoAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('information_header'),
      message: this.translate.instant('information_message'),
      buttons: [this.translate.instant('ok')],
      cssClass: 'infoCss'
    });
    await alert.present();
  }

  onContinue() {
    this.router.navigate(['/manage-payment-methods']);
  }

  // onSkipOrContinue(formData: NgForm, type) {
  //   if (type == 'skip') {
  //     if (formData.dirty) {
  //       this.changesNotSavedAlert(formData, 'skipcontinue', type);
  //       // this.alertService.warningAlert('addstudentpage');
  //     } else {
  //       this.router.navigate(['/manage-payment-methods']);
  //     }
  //   } else if (type == 'continue') {
  //     if (this.category == 'Add') {
  //       const ev = {
  //         detail: {
  //           value: 'View'
  //         }
  //       }
  //       this.segmentChanged(ev);
  //       this.category = 'View'
  //     } else {
  //       if (formData.dirty) {
  //         this.alertService.warningAlert('addstudentpage');
  //       } else {
  //         this.router.navigate(['/manage-payment-methods']);
  //       }
  //     }
  //   }

  // }
  updateCurrentStep() {
    const updateStepreqObj = { "IntStepId": 4 };
    this.dataService.updateCurrentStep(updateStepreqObj).subscribe((response: any) => {
      sessionStorage.setItem('nextStep', JSON.stringify('AddPayment'));
    });
  }

  redirect(formData) {
    this.updateCurrentStep();
    const patronsInfo = this.sharedService.getPatronsInfo();
    if (!patronsInfo) {
      this.getUserPatrons();
    } else {
      this.router.navigate(['/manage-payment-methods']);
    }
  }

  onSkipOrContinue(formData: NgForm, type) {
    const status = this.getStatus();
    if (formData.dirty && formData.valid && status) {
      this.changesNotSavedAlert(formData, 'skipcontinue', type);
    } else {
      if (type == 'skip') {
        this.redirect(formData);
      } else {
        if (this.category == 'Add') {
          let ev = {
            detail: {
              value: 'View'
            }
          }
          this.segmentChanged(ev);
          let element = document.getElementById('view-btn');
          element.click();
        } else if (this.category == 'View') {
          this.redirect(formData);
        }
        
      }
    }
  }

  onLangChange() {
    this.languageService.displayLanguageAlert();
    setTimeout(() => {
      this.dataInitialize();
    }, 5000);
  }

  onLogout(formData: NgForm) {
    const status = this.getStatus();
    if (formData.dirty && formData.valid && status) {
      this.changesNotSavedAlert(formData, 'logout', '');
    } else {
      this.authService.logout('logout');
    }
  }


  onGotoCart(formData: NgForm) {
    const status = this.getStatus();
    if (formData.dirty && formData.valid && status) {
      this.changesNotSavedAlert(formData, 'cart', '');
    } else {
      this.router.navigate(['/dashboard/cart']);
    }
  }

  onGotoDashboard(formData: NgForm) {
    const status = this.getStatus();
    this.redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
    if (formData.dirty && formData.valid && status) {
      this.changesNotSavedAlert(formData, 'dashboard', '');
      return false;
    } else {
      this.router.navigate([this.redirectToDashboard]);
      return false;
    }
  }

  onMenuClick(formData: NgForm, button) {
    const status = this.getStatus();
    if (formData.dirty && formData.valid && status) {
      this.changesNotSavedAlert(formData, 'menu', '');
    }
  }


  getStatus() {
    const formDataFlag1 = (!!this.student.IntStateId && !!this.student.IntSiteId && !!this.student.IntDistrictId && !!this.student.PatronId && !!this.student.FirstName && !!this.student.LastName && !!this.student.IntPatronRelationshipId)
    const formDataFlag2 = (!!this.student.PatronId && !!this.student.FirstName && !!this.student.LastName && !!this.student.IntPatronRelationshipId)
    if (this.viewPatrons.length > 0 && formDataFlag2) {
      return true;
    } else if (this.viewPatrons.length == 0 && formDataFlag1) {
      return true;
    } else {
      return false;
    }
  }

  changesNotSavedAlert(formData, button, type) {
    const alert = this.alertController.create({
      message: this.translate.instant('changes_not_saved'),
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
            if (button == 'skipcontinue') {
              if (type == 'skip') {
                this.redirect(formData);
              } else {
                if (this.category == 'Add') {
                  const ev = {
                    detail: {
                      value: 'View'
                    }
                  }
                  this.segmentChanged(ev);
                } else if (this.category == 'View') {
                  this.redirect(formData);
                }
              }
            } else if (button == 'cart') {
              this.router.navigate(['/dashboard/cart']);
            } else if (button == 'logout') {
              this.authService.logout('logout');
            } else if (button == 'menu') {

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

}
