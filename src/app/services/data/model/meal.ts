export class LunchRestrictions {
    Code: string;
    Value: string;
    Active: string;

}
export class LunchRestrictionsDefinitions {
    IntSiteId: number;
    IntDefinitionId: number;
    Code: string;
    DefinitionValue: string;
    Active: string;
    Value: any;
    Displayname: string;
    DefaultValue: any;
    DataType:string;

}
export class Lunch {
    LunchRestrictions: LunchRestrictions[];
    Definitions: Definitions[];
};
export class Definitions {
    IntSiteId: number;
    IntDefinitionId: number;
    Code: string;
    DefinitionValue: string;
    Active: string;

}
export class ItemGroups {
    IntSiteId: number;
    IntItemGroupId: number;
    Name: string;
    Code: string;
    restricedGroupsCodeValue: string;
    Value: boolean;
}
export class Items {
    IntSiteId: number;
    IntItemId: number;
    IntDistrictId: number;
    DistrictName: string;
    ItemDescription: string;
    ItemKeyName: string;
    Code: string;
    restricedItemsCodeValue: string;
    Value: boolean;
  
}