export class Denominations {
  value: any;
  option: string;
}

export class Amount {
  value: any;
  option: string;
}

export class AddAutoReplenishment {
  IntSiteId: number;
  IntPatronId: number;
  IntAccountId: number;
  TriggerValue: number;
  ChargeAmount: number;
  ExpireDate: any;
  PaymentMethodId: string;
  Active: boolean;
}
