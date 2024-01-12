export class States {
  IntStateId: number;
  StateAbbreviation: string;
  StateName: string;
};

export class Districts {
  IntSiteId: number;
  IntDistrictId: number;
  DistrictId: string;
  DistrictName: string;
  ActiveSw: boolean
}
export class studentDetail {
  IntStateId: number;
  IntSiteId: number;
  IntPatronRelationshipId: number;
  IntDistrictId: number;
  PatronId: string;
  FirstName: string;
  LastName: string;
}

export class Relationship {
  IntPatronRelationshipId: number;
  RelationshipType: string;
  ActiveSw: boolean;
}
