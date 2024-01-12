import { Component, OnInit, Input } from '@angular/core';
import { NgForm, FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DataService } from '../services/data/data.service';
import { AlertService } from '../services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language/language.service';

@Component({
  selector: 'app-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss'],
})
export class CustomFieldsComponent implements OnInit {
  @Input() selectedFees: any;
  @Input() editMode: boolean;
  @Input() methodId: any;
  @Input() buttontype:any;

  customFieldsForm: any;
  CustomFieldList: any = []; FieldInputValue: any; FieldTextarea: any; ListOption: any = []; intDropdownOption: any;
  checkboxes: any = []; intRadioOption: any; setListItems: any = [];


  constructor(private formBuilder: FormBuilder,
              private modal: ModalController,
              private dataService: DataService,
              public languageService: LanguageService,
              private alertService: AlertService,
              private translate: TranslateService,) { }

  ngOnInit() {
    console.log(this.selectedFees);
    console.log(this.editMode);
    if(this.selectedFees.CustomFields && this.selectedFees.CustomFields.length) {
      this.selectedFees.CustomFields.forEach(Field => {
        // let item = this.CustomFieldList.find((item) => 
        // item.IntFeeCustomFieldId == Field.IntFeeCustomFieldId)
        // if(!item) {
            this.CustomFieldList.push(Field);
          
      });
      this.customFieldsForm = this.formBuilder.group({});

      this.selectedFees.CustomFields.forEach(CF => {
        let rules = [];
        // CF.IsMandatory = true;
        if (CF.IsMandatory) { 
          rules.push(Validators.required);
        }
        rules.push(Validators.maxLength(CF.FieldLength));
        
        if(CF.Type == 'Checkbox' && CF.Options.length > 1) {
          let array = this.formBuilder.array([], [Validators.required]);

          CF.Options.forEach(O => {

            if(O.IsSelected) {
              array.push(new FormControl(true));
              this.setFieldValue(CF, O, 'edit')
            } else {
            array.push(new FormControl(false));
          }
          });

          this.customFieldsForm.addControl(CF.IntFeeCustomFieldId, array);
        } else { 
          let control: FormControl = new FormControl('', rules); 
          this.customFieldsForm.addControl(CF.IntFeeCustomFieldId, control);
          if((CF.UserValue != '' || CF.UserValue != null) && this.editMode && CF.Options.length === 0) {
            this.customFieldsForm.controls[CF.IntFeeCustomFieldId].setValue(CF.UserValue);
            this.setFieldValue(CF, CF, 'edit')
          }
          if(this.editMode && CF.Options.length > 0) {
            for(let i = 0; i < CF.Options.length; i++) {
              if(CF.Options[i].IsSelected) {
                if(CF.Type === "List") {
                  this.setListItems.push(CF.Options[i]);
                  this.customFieldsForm.controls[CF.IntFeeCustomFieldId].setValue(this.setListItems);
                } else {
                  this.customFieldsForm.controls[CF.IntFeeCustomFieldId].setValue(CF.Options[i]);
                  this.setFieldValue(CF, CF.Options[i], 'edit')
                }
              }
            }
          }
        }
      });
    }
    console.log(this.customFieldsForm)
  }

  close() {
    this.modal.dismiss();
 }
  AddSchedule(form: NgForm) {
    console.log(form.value)
    let updateFields = []; let addCheckbox = false;
    if(this.CustomFieldList && this.CustomFieldList.length > 0) {
      for(let key in form.value) {
        const index = this.CustomFieldList.findIndex((item) => item.IntFeeCustomFieldId == key)
        if(!form.value[key] && this.CustomFieldList[index].IsMandatory) {
          return;
        } else if (this.CustomFieldList[index].IsMandatory && this.CustomFieldList[index].Type == "Checkbox") {
          // console.log(form.value[key])
          form.value[key].forEach(CF => {
            if(CF == true) {
              addCheckbox = true;
            }
        })
        if(addCheckbox == false) return; 
        }
   }
    for(let i = 0; i < this.CustomFieldList.length; i++) {
        switch(this.CustomFieldList[i].Type) { 
          case "Text Field": { 
            if(this.FieldInputValue) {
              let field = {
                IntFeeCustomFieldId: this.CustomFieldList[i].IntFeeCustomFieldId,
                FieldValue: form.value[this.CustomFieldList[i].IntFeeCustomFieldId + ''],
                IntFeeCustomFieldOptionId: null
              }
              updateFields.push(field)
            } 
             break; 
          } 
          case "Text Area": { 
            if(this.FieldTextarea) {
            let field = {
              IntFeeCustomFieldId: this.CustomFieldList[i].IntFeeCustomFieldId,
              FieldValue: form.value[this.CustomFieldList[i].IntFeeCustomFieldId + ''],
              IntFeeCustomFieldOptionId: null
            }
            updateFields.push(field)
          }
             break; 
          }
          case "List": { 
            if((this.ListOption && this.ListOption.length > 0) || this.CustomFieldList[i].Options) {
            let item = this.CustomFieldList[i].IntFeeCustomFieldId;
            if(form.value[item].length>0){
              form.value[item].forEach(element => {
                let field = {
                  IntFeeCustomFieldId: this.CustomFieldList[i].IntFeeCustomFieldId,
                  FieldValue: null,
                  IntFeeCustomFieldOptionId: 
                  element.IntFeeCustomFieldOptionId
                }
                updateFields.push(field)    
              });
            }
            
          }
             break; 
          } 
          case "Dropdown": { 
            if(this.intDropdownOption) {
            let field = {
              IntFeeCustomFieldId: this.CustomFieldList[i].IntFeeCustomFieldId,
              FieldValue: null,
              IntFeeCustomFieldOptionId: form.value[this.CustomFieldList[i].IntFeeCustomFieldId + ''].IntFeeCustomFieldOptionId
            }
            updateFields.push(field)
          } 
             break; 
          } 
          case "Checkbox": { 
            if(this.checkboxes && this.checkboxes.length > 0) {
            let item = this.CustomFieldList[i].IntFeeCustomFieldId;
            for(let index = 0; index < form.value[item].length; index++) {
              if(form.value[item][index] === true) {
              let field = {
                IntFeeCustomFieldId: this.CustomFieldList[i].IntFeeCustomFieldId,
                FieldValue: null,
                IntFeeCustomFieldOptionId: this.CustomFieldList[i].Options[index].IntFeeCustomFieldOptionId
              }
              updateFields.push(field)  
            } else {
              this.selectedFees.CustomFields[i].Options[index].IsSelected = false;
            } 
            }
          }
             break; 
          } 
          case "Radio Button": { 
            if(this.intRadioOption) {
            let field = {
              IntFeeCustomFieldId: this.CustomFieldList[i].IntFeeCustomFieldId,
              FieldValue: null,
              IntFeeCustomFieldOptionId: form.value[this.CustomFieldList[i].IntFeeCustomFieldId + ''].IntFeeCustomFieldOptionId
            }
            updateFields.push(field)
          } 
             break; 
          }  
          default: { 
             break; 
          } 
       }
    }
    console.log(updateFields, ": submit") 
    let response = {
      Updated: true,
      customfields: updateFields
    }
      // edit/update custom fields api implementation
      if(this.buttontype !='cart')
      {
        this.updateCustomFields(updateFields);
      }
      else
      {
        this.setValues(updateFields);

      }
    this.modal.dismiss({
      'response': response,
      'editMode': this.editMode
    });
  }
  
  }

  updateCustomFields(updatedFields) {
    let request = {

      "IntSiteId": this.selectedFees.IntSiteId,
      "IntPatronId": this.selectedFees.IntPatronId,
      "IntFeePatronId": this.selectedFees.IntFeePatronId,
      "IntFeeId": this.selectedFees.IntFeeId,
      "PaymentNumber": 1,
      "PaymentAmount": this.selectedFees.ScheduledAmount? this.selectedFees.ScheduledAmount: this.selectedFees.Amount,
      "PaymentDate": this.selectedFees.NextScheduledPayment? this.selectedFees.NextScheduledPayment.PaymentDate: new Date(),
      "PaymentMethodId": this.methodId,
      "IntFeeAdvanceAttributeId":this.selectedFees.selectedAttributeValue ? this.selectedFees.selectedAttributeValue:0,
      "CustomFields": updatedFields,

    };

    let payload = {
      "ScheduledPayments": [request]
    }

    // this.dataService.addScheduledPaymentMethod(payload)
    // .subscribe(
    //   (response: any) => {
    //     console.log('successfull : ' , response);
    //     if (response.body && response.body.APIStatus === 'Success') {
    //       this.alertService.successToast(this.translate.instant('CF_updated'));
    //       this.setValues(updatedFields);
    //     }
    //     if(response.body.APIStatus === "Error" && response.body.APIStatusReason === "Attribute_Not_Available") {
    //       this.alertService.failureToast(this.translate.instant('ATTRIBUTE_NOT_AVAILABLE1'));
    //     }
    //     if(response.body.APIStatus === "Error" && response.body.APIStatusReason !== "Attribute_Not_Available") {
    //       this.alertService.failureToast(response.body.APIStatusReason);
    //     }
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // )
    this.setValues(updatedFields);
  }

  setValues(fields) {
    console.log(fields, this.selectedFees.CustomFields)
    fields.forEach(element => {
      let index = this.selectedFees.CustomFields.findIndex((item) => item.IntFeeCustomFieldId === element.IntFeeCustomFieldId);
      if(index !== -1) {
        if(element.FieldValue === null) {
          for(let i = 0; i < this.selectedFees.CustomFields[index].Options.length; i++) {
            this.selectedFees.CustomFields[index].Options[i].IsSelected = false;
          }
        }
      }
    });
    fields.forEach(element => {
      let index = this.selectedFees.CustomFields.findIndex((item) => item.IntFeeCustomFieldId === element.IntFeeCustomFieldId);
      if(index !== -1) {
        if(element.FieldValue !== null) {
          this.selectedFees.CustomFields[index].UserValue = element.FieldValue;
        }
        if(element.FieldValue === null) {
          let i = this.selectedFees.CustomFields[index].Options.findIndex((item) => item.IntFeeCustomFieldOptionId === element.IntFeeCustomFieldOptionId);
          if(i !== -1) {
            this.selectedFees.CustomFields[index].Options[i].IsSelected = true;
          }
        }
      }
    });
    console.log(this.selectedFees);
    this.alertService.successToast(this.translate.instant('CF_updated'));
  }

  isNoCheckboxSelected(values, flag): boolean {
    if(flag) {
      const result = values.filter((v => v === true));
      return result.length === 0;
    }
    return false;
  }

  setFieldValue(item: any, ev?, option?) {
    switch(item.Type) {
      case "Text Field": { 
        this.FieldInputValue = this.editMode && option ? ev.UserValue : ev.target.value;
         break; 
      } 
      case "Text Area": { 
        this.FieldTextarea = this.editMode && option ? ev.UserValue : ev.target.value;
         break; 
      } 
      case "List": { 
        if(this.editMode && option) {
          this.ListOption.push(ev)
        } else {
          this.ListOption = ev.detail.value
        }
        // this.ListOption = this.editMode && option ? ev.value: ev.detail.value;
         break; 
      } 
      case "Dropdown": { 
      this.intDropdownOption = this.editMode && option ? ev.IntFeeCustomFieldOptionId : ev.detail.value.IntFeeCustomFieldOptionId;  
         break; 
      } 
      case "Checkbox": { 
        if(ev.target && ev.target.checked === true && !this.editMode) {
          this.checkboxes.push(ev.detail.value)
        } else if(ev.target && ev.target.checked === false && !this.editMode) {
          this.checkboxes.splice(ev.detail.value, 1)
        }
        if(this.editMode && !ev.target && option) {
          console.log(ev, "eve check")
          this.checkboxes.push(ev)
        }
         break; 
      } 
      case "Radio Button": { 
        this.intRadioOption = ev.IntFeeCustomFieldOptionId ? ev.IntFeeCustomFieldOptionId : ev.target.value.IntFeeCustomFieldOptionId
         break; 
      }  
      default: { 
         break; 
      } 
   } 
  }

  checkMandatory(isMandatory, value, arr?): boolean {
    if(isMandatory && value && !arr || isMandatory && arr && value.length > 0) {
      return false;
    } else if(isMandatory && !value && !arr || isMandatory && arr && value.length == 0) {
      return true;
    }else{
      return false
    }
  }
}
