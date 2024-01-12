import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class FundraiserserviceService {
  fee = new Subject<any>();
  guestCheckoutInfo : any;
  schoolId:any;
  constructor(private apiServiceService: ApiService) { }

  getDistrictStates() {
    return this.apiServiceService.post('Public/General/GetDistrictStates', '');
  }

  getDistrictsByState(payload) {
    return this.apiServiceService.post('Public/General/GetDistrictsByState', payload);
  }

  getSchoolsByDistrict(payload){
    return this.apiServiceService.post('Public/General/GetSchoolsByDistrict', payload);
  }

  getFundraiserFee(payload){
    return this.apiServiceService.post('Public/Fees/GetGuestUserFundraiserFee', payload);
  }

  setFees(fee){
    this.fee.next(fee);
  }

  getFees(){
    return this.fee;
  }
}
