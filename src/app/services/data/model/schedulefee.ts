export interface FeesForScheduledPayments {
    Patrons: Patrons[];
}

export class ScheduledPayments {
    IntSiteId: any;
    IntPatronId:  any;
    IntFeePatronId:  any;
    IntFeeId: any;
    PaymentNumber:  any;
    PaymentAmount:  any;
    PaymentDate:  any;
    PaymentMethodId:  any;
    IntScheduledPaymentId:any;
    InstallmentsLeftToSchedule:any;
    Installments:any;
    AllowPartial:any;
    PreAuthAccount:any;
    ProcessedSw:any;
    TotalProcessingFee:any;
    PaymentTypeMsg: string;
    showPerTransaction: boolean;

};

export interface Patrons {
    IntSiteId: number;
    IntPatronId: number;
    IntUserId: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Active: boolean;
   
};
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
    PaymentMethodId:any;
    ProcessedSw:any;
    TotalProcessingFee: any
    PaymentTypeMsg: string
    showPerTransaction: boolean

}