import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
 
  transform(items: Array<any>, filter: {[key: string]: any },arrayValues): Array<any> {
    
    filter = filter ? filter.toLocaleLowerCase() : null;
    if(filter){        
      return items.filter(item => {
      
        let notMatchingField = Object.keys(filter)
                              .find(key => filter[key].indexOf(item.ItemDescription.toLocaleLowerCase()[key]) == -1);
                return !notMatchingField;
      });
               
  }else{
      let notMatchingField=items;
      return notMatchingField
    }
    // true if matches all fields
         
  }


}
