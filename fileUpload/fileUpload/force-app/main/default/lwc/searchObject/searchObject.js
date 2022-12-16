import { LightningElement,track, wire,api} from 'lwc';
import getObjectAPINameToLabel from '@salesforce/apex/searchObject.getObjectAPINameToLabel';
import { NavigationMixin } from 'lightning/navigation';
// import {ShowToastEvent} from 'lightning/platformShowToastEvent'

export default class SearchObject extends LightningElement {

    showContainer = false
      showContainer1 = true
      
    
    @api var1
    // @track searchObject
    selectedValue;
    @track objList;
    first=true;


initialized = false;
@wire(getObjectAPINameToLabel)
wiregetObjetcList(result){
let data=result.data;
let error=result.error;
console.log(data);
this.objList=result.data;

}
 changeFun(event){
this.var1 = event.target.value
console.log(this.var1);
 }

 
renderedCallback() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        let listId = this.template.querySelector('datalist').id;
        this.template.querySelector("input").setAttribute("list", listId);
        
    }

    handleClick(event){
      this.showContainer = true;
      this.showContainer1 = false;
    }
    
}
    
