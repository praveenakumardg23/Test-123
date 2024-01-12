export class Funds {
    Patrons: Patrons[];

}
export class FundDetails {
    IntSiteId: number;
    IntPatronId: number;
    IntDistrictId:number;
    PatronId:any;
    IntUserId: number;
    FirstName: string;
    LastName: string;
    IntPatronAccountId:number;
    IntFundId:number;
    AccountName:string;
    Balance:any;
    IntPatronCartId: number;
    IntAccountId: number;
    CartAmount: any;
    FeeType: string;
    Active:boolean;

}
export class Students {
    Patrons: Patrons[];
};

export class Patrons {
    IntSiteId: number;
    IntPatronId: number;
    IntDistrictId:number;
    PatronId:any;
    IntUserId: number;
    FirstName: string;
    LastName: string;
    Active:boolean;
    SourceAccounts:SourceAccounts[]
    SourceAccountPayments:SourceAccountPayments[]
}
export class SourceAccounts {
    IntPatronAccountId:number;
    IntFundId:number;
    AccountName:string;
    Balance:any;

}
export class CartDetails {

    Patrons: Patrons[];
};
export class CartBalanceDetails {

    IntPatronCartId: number;
    IntAccountId: number;
    IntPatronId: number;
    CartAmount: any;
    FeeType: string;
    IntPatronAccountId:number;
    
};

export class SourceAccountPayments {
    IntPatronCartId: number;
    IntFeePatronId: number;
    FeeName: string;
    FeeCode: string;
    FeeDescription: string;
    IsPaid: boolean;
    Active: boolean;
    AmountDue: any;
    AdjustedAmountDue: any;
    AdjustmentReason: any;
    AmountPaid: any;
    CartAmount: any;
    AssignedDate: string;
    DueDate: string;
    IntPatronAccountId:number;

};