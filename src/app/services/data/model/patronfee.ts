
/*To store Patrons Details*/
export class CartDetails {

    Patrons: Patrons[];
};
export class CartBalanceDetails {

    IntPatronCartId: number;
    IntAccountId: number;
    IntPatronId: number;
    CartAmount: any;
    FeeType: string;
    IntFeeId: number;
};
// export class MealPayments {
//     IntPatronCartId: number;
//     IntAccountId: number;
//     AccountName: string;
//     IsPaid: boolean;
//     Active: boolean;
//     CartAmount: any;

// }
export class PatronList {
    Patrons: Patrons[];

}
export class PatronsDetails {
    IntSiteId: number;
    IntPatronId: number;
    IntUserId: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    FullName: string;
    Active: boolean;


}
/*To store AllFee Details*/
export class AllFeeDetails {
    IntSiteId: number;
    IntPatronId: number;
    FullName: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    EndDate: string;
    AmountDue: any;
    AmountPaid: any;
    FeeType: string;
    FeeName: string;
    FeeCategory: string;
    MasterFeeType: string;
    CartAmount: any;
    IntPatronCartId: number;
    IntFeePatronId: number;
    IntFeeId: number;
    IntUserId: number;
    VariablePricedSw: boolean;
    LimitedSpotsAvailable: boolean;
    FeeDescription: string;
    Paid: any;
    AllowPartial: boolean;
    Scheduled: boolean;
    ScheduledAmount: any;
    Installments: number;
    Active: boolean;
    PaymentDate: string;
    IsAmountInCart: boolean;
    NextScheduledPayment:any;
    NetAmount:any;
    RemainInListSw:any;
    FeeOrigin:any
    expanded:boolean;

};


/*To store Assigned Details*/
export class Fee {
    UserPatronFees: UserPatronFees[]
};
export class UserPatronFees {
    IntSiteId: number;
    IntPatronId: number;
    IntUserId: number;
    PatronFees: PatronFees[]

};

export class PatronFees {
    IntFeePatronId: any;
    IntUserId: number;
    IntPatronId: number;
    IntFeeId: number;
    FeeName: string;
    FeeCode: string;
    FeeDescription: string;
    FeeClass: string;
    FeeType: string;
    FeeCategory: string;
    AmountDue: any;
    AmountPaid: any;
    NetAmount: any;
    Paid: boolean;
    AssignedDate: string;
    StartDate: string;
    EndDate: string;
    Assigned: boolean;
    Optional: boolean;
    ScheduleDay: number;
    Installments: number;
    InstallmentsLeft: number;
    AllowPartial: boolean;
    PendingTransactionAmount: any;
    LimitedSpotsAvailable: boolean;
    Scheduled: boolean;
    ScheduledAmount: any;
    VariablePricedSw: boolean;
    RemainInListSw: boolean;
    FeeOrigin: any;
    NextScheduledPayment: any
};
/*To store Optional Details*/
export class FeeOptional {
    Patrons: Patrons[]
};


export class Patrons {
    IntSiteId: number;
    IntPatronId: number;
    IntUserId: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Active: boolean;
    OptionalFees: OptionalFees[]
    AssignedFees: AssignedFees[]
    PaidFees: PaidFees[]
    Fees: Fees[]
};
export class PaidFees {
    IntFeePatronId: number;
    IntFeeId: number;
    FeeName: string;
    FeeCode: string;
    FeeCategory: string;
    FeeDescription: string;
    FeeClass: string;
    FeeType: string;
    AmountDue: any;
    AmountPaid: any;
    AssignedDate: string;
    StartDate: string;
    DueDate: string;
    EndDate: string;
    SchoolName: string;
    DistrictName: string;
    Optional: boolean;
    FeeOrigin: string;
    Transactions: Transactions[]
}
export class PaidFeesDetails {
    IntSiteId: number;
    IntPatronId: number;
    IntUserId: number;
    FirstName: string;
    LastName: string;
    IntFeePatronId: number;
    IntFeeId: number;
    FeeName: string;
    FeeCode: string;
    FeeCategory: string;
    FeeDescription: string;
    FeeClass: string;
    FeeType: string;
    AmountDue: any;
    AmountPaid: any;
    AssignedDate: string;
    StartDate: string;
    DueDate: string;
    EndDate: string;
    SchoolName: string;
    DistrictName: string;
    Optional: boolean;
    FeeOrigin: string;
    IntTransactionId: number;
    IntTransactionItemId: number;
    TransactionDate: string;
    Amount: any;
    TaxAmount: any;
    PaymentMethod: string;
}
export class Transactions {
    IntTransactionId: number;
    IntTransactionItemId: number;
    TransactionDate: string;
    Amount: any;
    TaxAmount: any;
    PaymentMethod: string;
}
export class FeesForScheduledPayments {
    Patrons: Patrons[];
}
// export class FeesForScheduledPayments {
//     IntSiteId: number;
//     IntPatronId: number;
//     IntUserId: number;
//     FirstName: string;
//     MiddleName: string;
//     LastName: string;
//     Active:boolean;

//     Fees: Fees[]
// };
export class AssignedFees {
    IntPatronCartId: number;
    IntFeePatronId: number;
    FeeName: string;
    FeeCode: string;
    FeeDescription: string;
    IsPaid: boolean;
    Active: boolean;
    AmountDue: any;
    AmountPaid: number;
    NetAmount: number;
    AdjustedAmountDue: any;
    AdjustmentReason: any;
    EndDate: string;
    CartAmount: any;
    AssignedDate: string;
    DueDate: string;

};

export class OptionalFees {
    IntPatronCartId: number
    IntFeeId: number;
    FeeName: string;
    FeeCode: string;
    FeeDescription: string;
    IsPaid: boolean;
    Active: boolean;
    AmountDue: any;
    AmountPaid: number;
    NetAmount: number;
    AdjustedAmountDue: any;
    AdjustmentReason: any;
    CartAmount: any;
    FeeClass: string;
    FeeType: string;
    FeeCategory: string;
    StartDate: string;
    EndDate: string;
    IntSchoolId: number;
    School: string;
    Installments: number;
    AllowPartial: boolean;
    ScheduledDay: number;
    LimitedSpotsAvailable: boolean;
    VariablePricedSw: boolean;
    RemainInListSw: boolean;
};


export class Fees {
    IntFeeId: number;
    IntFeePatronId: number;
    IntPatronId: number;
    IntUserId: number;
    FeeName: string;
    FeeCode: string;
    FeeDescription: string;
    FeeClass: string;
    FeeType: string;
    AmountDue: any;
    AmountPaid: any;
    NetAmount: any;
    Paid: boolean;
    AssignedDate: string;
    StartDate: string;
    DueDate: string;
    SchoolName: string;
    DistrictName: string;
    Assigned: boolean;
    Optional: boolean;
    ScheduleDay: number;
    Installments: number;
    InstallmentsLeft: number;
    AllowPartial: boolean;
    PendingTransactionAmount: any;
    Scheduled: boolean;
    ScheduledAmount: any;
    EndDate: string;
    InstallmentsLeftToSchedule: any;
    NextScheduledPayment: NextScheduledPayment[]
};

export class NextScheduledPayment {
    IntSiteId: number;
    IntPatronId: number;
    IntUserId: number;
    IntScheduledPaymentId: number;
    ScheduledDate: any;
    IntFeePatronId: number;
    FeeName: string;
    FeeCode: string;
    PaymentNumber: number;
    PaymentAmount: any;
    PaymentDate: string;
    PaymentMethod: string;
    Active: boolean;
    Processed: boolean;
    AccountLast4: string;
}
export class ScheduledPaymentslist {
    ScheduledPayments: ScheduledPayments[];
}
export class ScheduledPayments {
    IntScheduledPaymentId: number;
    IntSiteId: number;
    IntPatronid: number;
    IntFeePatronId: number;
    FeeName: string;
    FeeClass: string;
    ActiveSw: boolean;
    PaymentNumber: any;
    PaymentAmount: any;
    PaymentDate: string;
    ProcessedSw: string;
    ProcessedDate: string;
    PreAuthToken: string;
    PreAuthType: string;
    PreAuthAccount: string;

}

export class ScheduledPaymentsInstallmentsDetails {
    IntScheduledPaymentId: any;
    IntSiteId: number;
    IntPatronId: number;
    IntFeePatronId: number;
    FeeName: string;
    FeeClass: string;
    ActiveSw: boolean;
    PaymentNumber: any;
    PaymentAmount: any;
    PaymentDate: string;
    PreAuthToken: string;
    PreAuthType: string;
    PreAuthAccount: any;
    IntFeeId: number;
    IntUserId: number;
    FeeCode: string;
    FeeDescription: string;
    FeeType: string;
    AmountDue: any;
    AmountPaid: any;
    NetAmount: any;
    Paid: boolean;
    AssignedDate: string;
    StartDate: string;
    DueDate: string;
    SchoolName: string;
    DistrictName: string;
    Assigned: boolean;
    Optional: boolean;
    ScheduleDay: number;
    Installments: number;
    InstallmentsLeft: number;
    AllowPartial: boolean;
    PendingTransactionAmount: any;
    Scheduled: boolean;
    ScheduledAmount: any;
    InstallmentsLeftToSchedule: any;
    ScheduledDate: any;
    PaymentMethod: string;
    Active: any;
    Processed: any;
    AccountLast4: string;
    ScheduledPayments: any
    CartAmount: any
    ProcessedSw: any
    ProcessedDate: any


}

