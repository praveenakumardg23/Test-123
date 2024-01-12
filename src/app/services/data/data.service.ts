import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private apiService: ApiService) { }

  login(payload:any) {
    return this.apiService.post('Central/Authentication/Login', payload);
  }

  getLanguages() {
    return this.apiService.post('Public/General/GetLanguages', '')
  }

  getLanguagesAfterLogin() {
    return this.apiService.post('Central/General/GetLanguages', '')
  }

  getAllStates() {
    return this.apiService.post('Public/General/GetStates', '')
  }

  getCountry() {
    return this.apiService.post('Public/General/GetCountries', '')
  }

  register(payload:any) {
    return this.apiService.post('Central/Authentication/CreateAccount', payload);
  }
  accountActivate(accountActivateData:any) {
    return this.apiService.post('Central/Authentication/ValidateEmail', accountActivateData);
  }

  getSecurityQuestions(payload:any) {
    return this.apiService.post('Central/User/GetSecurityQuestions', payload)
  }

  addSecurityQuestions(payload:any) {
    return this.apiService.post('Central/User/AddSecurityQuestions', payload)
  }

  getDistrictStates() {
    return this.apiService.post('Central/General/GetDistrictStates', '')
  }

  getDistrictsByState(payload:any) {
    return this.apiService.post('Central/General/GetDistrictsByState', payload)
  }

  getRelationship(payload:any) {
    return this.apiService.post('Central/General/GetRelationshipByLang', payload)
  }

  addUserPatron(payload:any) {
    return this.apiService.post('Central/User/AddUserPatron', payload)
  }

  updateCurrentStep(payload:any) {
    return this.apiService.post('Central/User/UpdateStep', payload)
  }

  viewUserPatron() {
    return this.apiService.post('Central/User/GetUserPatrons', '')
  }

  getProcessFeeBreakdown(payload:any) {
    return this.apiService.post('Central/Payment/GetProcessFeeBreakdown', payload)
  }

  getPatronList() {
    return this.apiService.post('Central/Patron/GetPatronList', '')
  }

  updateRelationship(payload:any) {
    return this.apiService.post('Central/User/UpdateRelationship', payload)
  }

  removeUserPatron(payload:any) {
    return this.apiService.post('Central/User/RemoveUserPatron', payload)
  }
  addCreditCard(payload:any) {
    return this.apiService.post('Central/Payment/AddCreditCard', payload)
  }

  addBankAccount(payload:any) {
    return this.apiService.post('Central/Payment/AddBankAccount', payload)
  }

  viewPaymentMethods() {
    return this.apiService.post('Central/Payment/GetPaymentMethods', '')
  }

  removePaymentMethod(payload:any) {
    return this.apiService.post('Central/Payment/RemovePaymentMethod', payload)
  }

  SetDefaultPaymentMethod(payload:any) {
    return this.apiService.post('Central/Payment/SetDefaultPaymentMethod', payload)
  }

  getUserInfo() {
    return this.apiService.post('Central/User/GetUserInfo', '')
  }

  clearARNotification() {
    return this.apiService.post('Central/User/ClearARNotification', '');
  }

  addNotificationPreference(data:any) {
    return this.apiService.post('Central/Notification/AddNotificationPreference', data)
  }

  updateProfile(payload:any) {
    return this.apiService.post('Central/User/SaveUserInfo', payload);
  }

  getProfileLanguages() {
    return this.apiService.post('Central/General/GetLanguages', '')
  }

  getProfileStates() {
    return this.apiService.post('Central/General/GetStates', '')
  }

  getProfileCountry() {
    return this.apiService.post('Central/General/GetCountries', '')
  }

  saveUserInfo(payload:any) {
    return this.apiService.post('Central/User/SaveUserInfo', payload)
  }

  changeEmail(payload:any) {
    return this.apiService.post('Central/User/ChangeEmail', payload)
  }

  RecoverPassword(payload:any) {
    return this.apiService.post('Central/Authentication/RecoverPassword', payload);
  }

  RecoverPasswordBySMS(payload:any) {
    return this.apiService.post('Central/Authentication/RecoverPasswordBySMS', payload)
  }

  ChangePasswordBySMS(payload:any) {
    return this.apiService.post('Central/Authentication/ChangePasswordBySMS', payload)
  }

  ValidatePhoneNumber(payload:any) {
    return this.apiService.post('Central/Authentication/ValidatePhoneNumber', payload)
  }

  setDefaultPaymentMethod(payload:any) {
    return this.apiService.post('Central/Payment/SetDefaultPaymentMethod', payload)
  }

  getUserMessages(payload:any) {
    return this.apiService.post('Central/Messaging/GetUserMessages', payload)
  }

  updateUserMessages(payload:any) {
    return this.apiService.post('Central/Messaging/UpdateUserMessage', payload)
  }

  getPostalCodeDetails(payload:any) {
    return this.apiService.getPostalCodeDetails(payload)
  }

  getNotificationPreference() {
    return this.apiService.post('Central/Notification/GetNotificationPreference', '')
  }

  removeNotificationPreference(payload:any) {
    return this.apiService.post('Central/Notification/RemoveNotificationPreference', payload)
  }

  updateNotificationPreference(payload:any) {
    return this.apiService.post('Central/Notification/UpdateNotificationPreference', payload)
  }

  getDistrictFeatureList() {
    return this.apiService.post('Central/General/GetDistrictFeaturesList', '')
  }

  getAllPaymentHistory(payload:any) {
    return this.apiService.post('Central/Payment/GetAllPaymentHistory', payload)
  }

  getPaymentHistoryReport(payload:any) {
    return this.apiService.post('Central/Payment/GetPaymentHistoryReport', payload)
  }

  getUserPatronBalances() {
    return this.apiService.post('Central/Patron/GetUserPatronBalances', '');
  }

  getPatronAccountBalances(Payload:any) {
    return this.apiService.post('Central/Patron/GetPatronAccountBalances', Payload);
  }

  getCartItems() {
    return this.apiService.post('Central/Payment/GetCartItems', '');
  }

  getCartItemsWithMMOStatus(payload:any) {
    return this.apiService.post('Central/Payment/GetCartItems', payload);
  }

  saveMealPayments(payload:any) {
    return this.apiService.post('Central/Payment/SaveMealsPayment', payload);
  }

  getAllPatronSourceAccounts() {
    return this.apiService.post('Central/Patron/GetAllPatronSourceAccounts', '');
  }

  transferAccountFund(payload:any) {
    return this.apiService.post('Central/Patron/TransferAccountFunds', payload);
  }
  transferMealAccountBal (payload:any) {
    return this.apiService.post('Central/Patron/TransferMealAccountBal', payload);
  }

  getPatronSourceAccounts(payload:any) {
    return this.apiService.post('Central/Patron/GetPatronSourceAccounts', payload);
  }

  SaveSourceAccountPayment(payload:any) {
    return this.apiService.post('Central/Payment/SaveSourceAccountPayment', payload);
  }

  getAllPatronsSourceAccounts() {
    return this.apiService.post('Central/Patron/GetAllPatronSourceAccounts', '');
  }

  getSourceAccounts(payload:any) {
    return this.apiService.post('Central/Patron/GetPatronSourceAccounts', payload);
  }

  getMealActivity(payload:any) {
    return this.apiService.post('Central/Patron/GetMealActivityReport', payload);
  }

  getMealHistory(payload:any) {
    return this.apiService.post('Central/Patron/GetMealHistoryReport', payload);
  }

  getFundActivity(payload:any) {
    return this.apiService.post('Central/Patron/GetFundActivityReport', payload);
  }

  getGlobalMessages(payload:any) {
    return this.apiService.post('Public/Messaging/GetGlobalMessages', payload);
  }

  getUserPatronFees() {
    return this.apiService.post('Central/Fees/GetUserPatronFees', '');
  }

  getPatronFees(Payload:any) {
    return this.apiService.post('Central/Fees/GetPatronFees', Payload);
  }

  getOptionalUserPatronFees() {
    return this.apiService.post('Central/Fees/GetOptionalUserPatronFees', '');
  }

  getOptionalPatronFees(Payload:any) {
    return this.apiService.post('Central/Fees/GetOptionalPatronFees ', Payload);
  }

  saveOptionalFeePayment(Payload:any) {
    return this.apiService.post('Central/Payment/SaveOptionalFeePayment', Payload);
  }

  saveAssignedFeePayment(Payload:any) {
    return this.apiService.post('Central/Payment/SaveAssignedFeePayment', Payload);
  }

  getScheduledPaymentMethod() {
    return this.apiService.post('Central/Payment/GetScheduledPaymentMethod', '');
  }
  getFeesForScheduledPayments() {
    return this.apiService.post('Central/Fees/GetFeesForScheduledPayments', '');
  }
  addScheduledPaymentMethod(Payload:any) {
    return this.apiService.post('Central/Payment/AddScheduledPaymentMethod', Payload);
  }
  removeScheduledPaymentMethod(Payload:any) {
    return this.apiService.post('Central/Payment/RemoveScheduledPaymentMethod', Payload);
  }
  updateScheduledPaymentMethod(Payload:any) {
    return this.apiService.post('Central/Payment/UpdateScheduledPaymentMethod', Payload);
  }
  getPaymentMethods() {
    return this.apiService.post('Central/Payment/GetPaymentMethods', '')
  }

  removeAllScheduledPayments(Payload:any) {
    return this.apiService.post('Central/Payment/RemoveAllScheduledPayments', Payload)
  }
  removeCartItems(data:any) {
    return this.apiService.post('Central/Payment/RemoveCartItems', data);
  }
  processZeroDollar(payload:any) {
    return this.apiService.post('Central/Payment/ProcessZeroDollar', payload)
  }
  getQuikLunchRestrictionsByPatron(Payload:any) {
    return this.apiService.post('Central/QuikLunch/GetQuikLunchRestrictionsByPatron', Payload)
  }

  getQuikLunchRestrictionDefinitions(Payload:any) {
    return this.apiService.post('Central/QuikLunch/GetQuikLunchRestriction_Definitions', Payload)
  }

  getQuikLunchItems(Payload:any) {
    return this.apiService.post('Central/QuikLunch/GetQuikLunchItems', Payload)
  }

  getQuikLunchItemGroups(Payload:any) {
    return this.apiService.post('Central/QuikLunch/GetQuikLunchItemGroups', Payload)
  }

  setQuikLunchPatronRestrictions(Payload:any) {
    return this.apiService.post('Central/QuikLunch/SetQuikLunchPatronRestrictions', Payload)
  }

  processCreditCard(payload:any) {
    return this.apiService.post('Central/Payment/ProcessCreditCard', payload)
  }

  processAutomatedClearingHouse(payload:any) {
    return this.apiService.post('Central/Payment/processAutomatedClearingHouse', payload)
  }

  processTempCreditCard(payload:any) {
    return this.apiService.post('Central/Payment/ProcessTempCreditCard', payload)
  }

  processGuestPayment(payload:any) {
    return this.apiService.post('Central/Payment/ProcessGuestPayment', payload);
  }

  getPaidUserPatronFees(payload:any) {
    return this.apiService.post('Central/Fees/GetPaidUserPatronFees', payload)
  }

  getVersion(payload:any) {
    return this.apiService.post('public/General/GetVersion', payload)
  }

  getAutoReplenishments() {
    return this.apiService.post('Central/Payment/GetAutoReplenishments', '');
  }

  updateAutoReplenishment(payload:any) {
    return this.apiService.post('Central/Payment/UpdateAutoReplenishment', payload);
  }

  addAutoReplenishment(payload:any) {
    return this.apiService.post('Central/Payment/AddAutoReplenishment', payload);
  }

  removeAutoReplenishment(payload:any) {
    return this.apiService.post('Central/Payment/RemoveAutoReplenishment', payload);
  }

  GetProcessingFee(payload:any) {
    return this.apiService.post('Central/Payment/GetProcessingFee', payload);
  }

  GetValidateUser(payload:any) {
    return this.apiService.post('api/PSC/ValidateUser', payload);
  }

  ClearQuikappsNotification(payload:any){
    return this.apiService.post('Central/User/ClearNotification', payload);
  }
  getFundraiserFee(payload:any)
  {
    return this.apiService.post('Public/Fees/GetGuestUserFundraiserFee', payload);
  }
  getFundraiserFeeLoggedInUser(payload?:any)
  {
    return this.apiService.post('Central/Fees/GetFundraiserGuestPatronFees', payload);
  }
  getFundraiserFeeLoggedInUserAll()
  {
    return this.apiService.post('Central/Fees/GetFundraiserGuestUserPatronFees', '');
  }
  addFundraiserfeeInCartNoTokan(Payload:any)
  {
    return this.apiService.post('Public/Payment/SaveOptionalFundraiserPayment', Payload);
  }
  addFundraiserfeeInCartwithTokan(Payload:any)
  {
    return this.apiService.post('Central/Payment/SaveFundraiseGuestFeePayment', Payload);
  }

  getReceipt(payload:string) {
    return this.apiService.post('Central/Payment/GetTransactionReceipt', payload);
  }

  getMealAccountReport(payload:any){
    return this.apiService.post('Central/Patron/GetMealHistoryReport', payload);
  }

  GetMealActivityReport(payload:any){
    return this.apiService.post('Central/Patron/GetMealActivityReport', payload);
  }
                                              
}
