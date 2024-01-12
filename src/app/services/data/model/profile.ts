export class ProfileDetails {
  IntLanguageId: any;
  UserName: string;
  FirstName: string;
  LastName: string;
  Address1: string;
  Address2: string;
  PostalCode: string;
  City: string;
  State: string;
  CountryCode: string;
  PhoneNumber: string;
  SMSNumber: string;
  PreferredComm: string;
};
export class GetStates {
  States: States[];
}
export class States {
  IntStateId: number;
  StateAbbreviation: string;
  StateName: string;
}
export class GetCountry {
  Country: Country[];
}
export class Country {
  IntCountryId: number;
  CountryCode: string;
  CountryName: string;
}
export class GetLanguagesResponse {
  Languages: Languages[];
  APIStatus: string;
  APIStatusReason: string;
  PEResponseCode: string;
  PEReasonPhrase: string;
  PEProcessingMessages: string;
}
export class Languages {
  IntLanguageId: number;
  Name: string;
  DisplayName: string;
  IconData: string;
  ActiveSw: boolean;
}

