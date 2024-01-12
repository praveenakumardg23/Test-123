export class PaymentHistory {

    Patrons: Patrons[];
  
  }
  export class Patrons {
    IntSiteId: number;
    SiteId: string;
    IntPatronId: number;
    PatronId: any;
    FirstName: string;
    LastName: string;
    Payments: Payments[];
  }
  export class Payments {
    PaymentDate: Date;
    PaymentDatestring: string;
    IntTransactionId: number;
    PaymentType: string;
    BalanceLevel: string;
    PaymentName: string;
    Amount:number ;
    ICF: number;
    PaymentMethod: string;
    Status: string
    FirstName: string;
    LastName: string;
    PaymentMode: string;
    Expanded:boolean;

    AttributeValue: string;
    SessionName: string;
    PeriodStartDateTime : Date;
    PeriodEndDateTime: Date; 
    SundaySw: boolean;
    MondaySw: boolean;
    TuesdaySw: boolean;
    WednesdaySw: boolean;
    ThursdaySw: boolean;
    FridaySw: boolean;
    SaturdaySw: boolean;
    // FeeAttribute: string;
    // FeeSession: string;
    // Attribute: Attribute[];
    // Session : Session[];
  }

  // export class Attribute{
  //   Type : string;
  //   Name : string;
  //   Options : Options[];
  // }

  // export class Options{
  //   AttributeValue : string;
  //   IntFeeAttributeId: string;    
  //   Amount: string;
  //   isSelected: string;
  // }

  // export class Session{
  //   SessionName : string;
  //   PeriodStartDateTime : Date;
  //   PeriodEndDateTime : Date;
  //   SundaySw: boolean;
  //   MondaySw: boolean;
  //   TuesdaySw: boolean;
  //   WednesdaySw: boolean;
  //   ThursdaySw: boolean;
  //   FridaySw: boolean;
  //   SaturdaySw: boolean;
  // }