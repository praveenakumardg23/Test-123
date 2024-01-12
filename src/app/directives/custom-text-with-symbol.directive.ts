import { Platform } from '@ionic/angular';
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCustomTextWithSymbol]'
})
export class CustomTextWithSymbolDirective {

  private regex: RegExp = new RegExp(/^[A-Za-z-.' ]*$/);//•Only Alphabets, hyphen,fullstop or  apostrophe
  private regex1: RegExp = new RegExp(/^[A-Za-z-.'#/ ]*$/);//No special characters allowed except -,#,/
  private regex3: RegExp = new RegExp(/^[0-9- ]*$/);//Only numeric or hyphen
  private regex4: RegExp = new RegExp(/^[0-9]*$/);//Only numeric 
  private regex5: RegExp = new RegExp(/^[3-5][0-9]*$/);//Only numeric and starts with 3/4/5 
  private regex6: RegExp = new RegExp(/^(0[1-9]|1[0-2])\/?(([0-9]{4}|[0-9]{2})$)/);//card expire date validation
  private regex7: RegExp = new RegExp(/^[0-9/ ]*$/);//Only numeric or slash
  private regex8: RegExp = new RegExp(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$"/);//Emil validation
  private regex9: RegExp = new RegExp(/^[A-Za-z-' ]*$/);//Only Alphabets, hyphen or  apostrophe
  private regex10: RegExp = new RegExp(/^[a-zA-Z0-9-.#/]*$/);//alphanumeric and No special characters allowed except -,#,/ and .
  private regex11: RegExp = new RegExp(/^[a-zA-Z-'.]*$/);//Alphabets and No special characters allowed except -,' and .
  private regex12: RegExp = new RegExp(/^[a-zA-Z,.]*$/);//Alphabets and No special characters allowed except . and ,
  private regex13: RegExp = new RegExp(/^[a-zA-Z0-9-.#,/]*$/);//alphanumeric and No special characters allowed except -,#,/,. and ,
  private regex14: RegExp = new RegExp(/^[a-zA-Z-'. ]*$/);// for firstname and lastname in add student
  private regex15: RegExp = new RegExp(/^[a-zA-Z0-9]*$/);// Alphanumeric and all special characters allowed
  private regex16: RegExp = new RegExp(/^(\d+(\.\d{0,2})?|\.?\d{1,2})$/);//Only numeric and dott
  private regex17: RegExp = new RegExp(/^[a-zA-Z0-9-.#,/ ]*$/);//alphanumeric and No special characters allowed except space, -,#,/,. and ,
  private regex18: RegExp = new RegExp(/^[a-zA-Z,. ]*$/);//Alphabets and No special characters allowed except space . and ,
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-'];
  constructor(
    private el: ElementRef,
    private platform: Platform
  ) { }
  @Input('appCustomTextWithSymbol') validationtype: string;


  @HostListener('input', ['$event']) onInputChange(event) {

    if (this.platform.is('android')) {
      const initalValue = this.el.nativeElement.value;
      if (this.validationtype == "1") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z-'.]*/g, ''); // Alphabets and hyphen,fullstop or apostrophe
      } else if (this.validationtype == "2") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z-/#]*/g, ''); // Alphabets and No special characters allowed except -,#,/
      } else if (this.validationtype == "3") {
        this.el.nativeElement.value = initalValue.replace(/[^0-9-]*/g, ''); // numbers only and hyphen
      } else if (this.validationtype == "4") {
        this.el.nativeElement.value = initalValue.replace(/[^0-9]*/g, ''); // numbers only
      } else if (this.validationtype == "5") {
        // Only numeric and starts with 3/4/5 
      } else if (this.validationtype == "6") {
        //card expire date validation
      } else if (this.validationtype == "7") {
        this.el.nativeElement.value = initalValue.replace(/[^0-9/]*/g, ''); // numbers only and slash
      } else if (this.validationtype == "8") {
        // email validation
      } else if (this.validationtype == "9") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z-']*/g, ''); // Only Alphabets, hyphen, apostrophe
      } else if (this.validationtype == "10") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z0-9-.#/]*/g, ''); // Alphabets and No special characters allowed except -,#,.
      } else if (this.validationtype == "11") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z-'.]*/g, ''); // Alphabets and No special characters allowed except -,',.
      } else if (this.validationtype == "12") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z,.]*/g, ''); // Alphabets and No special characters allowed except , and .
      } else if (this.validationtype == "13") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z0-9-.#,/]*/g, ''); // Alphabets and No special characters allowed except , and .
      } else if (this.validationtype == "14") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z-'. ]*/g, ''); // Alphabets and No special characters allowed except , and .
      } else if (this.validationtype == "15") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z0-9]*/g, ''); // Alphanumeric and all special characters allowed
      } else if (this.validationtype == "16") {
        this.el.nativeElement.value = initalValue.replace(/[^(\d+(\.\d{0,2})?|\.?\d{1,2})]*/g, ''); // Alphanumeric and all special characters allowed
      } else if (this.validationtype == "25") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z,. ]*/g, ''); // Alphabets and No special characters allowed except space , and .
        this.el.nativeElement.value = this.el.nativeElement.value.slice(0, 25);
      } else if (this.validationtype == "30") {
        this.el.nativeElement.value = initalValue.slice(0, 30);
      } else if (this.validationtype == "50") {
        this.el.nativeElement.value = initalValue.slice(0, 50);
      } else if (this.validationtype == "75") {
        this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z0-9-.#,/ ]*/g, '');
        this.el.nativeElement.value = this.el.nativeElement.value.slice(0, 75);
      } else if (this.validationtype == "88") {
        this.el.nativeElement.value = initalValue.replace(/[^0-9]*/g, ''); // numbers only
        this.el.nativeElement.value = this.el.nativeElement.value.slice(0, 88);
      } else if (this.validationtype == "225") {
        this.el.nativeElement.value = this.el.nativeElement.value.slice(0, 225);
      }

      if (initalValue !== this.el.nativeElement.value) {
        event.stopPropagation();
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: any) {
    if (this.platform.is('ios')) {
      // Allow Backspace, tab, end, and home keys
      //validationtype =1 is  Only Alphabets, hyphen or  apostrophe
      //validationtype =2 is  No special characters allowed except -,#,/
      //validationtype =2 is  Only numbers and  hyphen
      if (this.validationtype == "1") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "2") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex1)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "3") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex3)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "4") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex4)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "5") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex5)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "6") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex6)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "7") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex7)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "8") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex8)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "9") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex9)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "10") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex10)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "11") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex11)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "12") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex12)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "13") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex13)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "14") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex14)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "15") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex15)) {
          event.preventDefault();
        }
      }

      else if (this.validationtype == "16") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex15)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "25") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex18)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "75") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex17)) {
          event.preventDefault();
        }
      }
      else if (this.validationtype == "88") {
        if (this.specialKeys.indexOf(event.key) !== -1) {
          return;
        }
        let current: string = this.el.nativeElement.value;
        let next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex4)) {
          event.preventDefault();
        }
      }
    }
  }

}
