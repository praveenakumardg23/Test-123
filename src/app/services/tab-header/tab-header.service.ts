import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabHeaderService {
  activeTab = new Subject<number>();
  tabStateData: any;


  constructor(private router: Router) { }
  ngOnInit() { }

  redirectToPage(tabnum:number) {
    const nextStep = JSON.parse(sessionStorage.getItem('nextStep') );
    this.setTabStatus(nextStep);
    if (tabnum == 1 && !this.tabStateData.isRegistertabDisabled) {
      this.router.navigate(['register']);
      this.activeTab.next(tabnum);
    } else if (tabnum == 2 && !this.tabStateData.isRegistertabDisabled) {
      this.router.navigate(['reset-password']);
      this.activeTab.next(tabnum);
    } else if (tabnum == 3 && !this.tabStateData.isRegistertabDisabled) {
      this.router.navigate(['security-questions']);
      this.activeTab.next(tabnum);
    } else if (tabnum == 4 && !this.tabStateData.isStudenttabDisabled) {
      this.router.navigate(['manage-patrons']);
      this.activeTab.next(tabnum);
    } else if (tabnum == 5 && !this.tabStateData.isPaymenttabDisabled) {
      this.router.navigate(['manage-payment-methods']);
      this.activeTab.next(tabnum);
    } else if (tabnum == 6 && !this.tabStateData.isNotificationtabDisabled) {
      this.router.navigate(['notifications']);
      this.activeTab.next(tabnum);
    } else if (tabnum == 0) {
      this.router.navigate(['login']);
      this.activeTab.next(tabnum);
    }
  }

  setTabStatus(step:string) {
    let tabStateData = {
      isRegistertabDisabled: true,
      isStudenttabDisabled: false,
      isPaymenttabDisabled: false,
      isNotificationtabDisabled: false
    }
    if (step) {
      if (step == 'SecurityQ&A') {
        tabStateData.isStudenttabDisabled = true;
        tabStateData.isPaymenttabDisabled = true;
        tabStateData.isNotificationtabDisabled = true;
      }
      else if (step == 'AddStudent/Staff') {
        tabStateData.isPaymenttabDisabled = true;
        tabStateData.isNotificationtabDisabled = true;
      }
      else if (step == 'AddPayment') {
        tabStateData.isNotificationtabDisabled = true;
      }
    } else {
      tabStateData.isRegistertabDisabled = false;
      tabStateData.isStudenttabDisabled = true;
      tabStateData.isPaymenttabDisabled = true;
      tabStateData.isNotificationtabDisabled = true;
    }

    this.tabStateData = tabStateData;
  }
  // updateTabNumber(tabnum) {
  //   if (tabnum == 1 && !this.tabStateData.isRegistertabDisabled) {
  //     this.activeTab.next(tabnum);
  //   } else if (tabnum == 2 && !this.tabStateData.isRegistertabDisabled) {
  //     this.activeTab.next(tabnum);
  //   } else if (tabnum == 3 && !this.tabStateData.isRegistertabDisabled) {
  //     this.activeTab.next(tabnum);
  //   } else if (tabnum == 4 && !this.tabStateData.isStudenttabDisabled) {
  //     this.activeTab.next(tabnum);
  //   } else if (tabnum == 5 && !this.tabStateData.isPaymenttabDisabled) {
  //     this.activeTab.next(tabnum);
  //   } else if (tabnum == 6 && !this.tabStateData.isNotificationtabDisabled) {
  //     this.activeTab.next(tabnum);
  //   }
  // }

}
