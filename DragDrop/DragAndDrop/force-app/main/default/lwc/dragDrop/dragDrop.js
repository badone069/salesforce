import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';
import { LightningElement, track } from 'lwc';

export default class DragDrop extends LightningElement {
    numberarray = ['1','2','3','4','5','6'];
    randomlist=[];
    buttonss=true;
    
    
    
    //userInputArray = [...this.randomlist];

    connectedCallback(){
        this.shufflelist();

        if(!this.randomlist){
            this.randomlist = [...this.Data]
        }
    }

    Change(event){
        this.Data = event.detail.join(', ');
    }

     DragStart(event) {
        event.target.classList.add('drag')
    }

    DragOver(event) {
        event.preventDefault()
        return false
    }


    Drop(event) {
        event.stopPropagation()
        const Element = this.template.querySelectorAll('.Items')
        const DragValName = this.template.querySelector('.drag').textContent
        const DropValName = event.target.textContent
        
        
        if(DragValName === DropValName){ return false }
        const index = this.randomlist.indexOf(DropValName)
        this.randomlist = this.randomlist.reduce((acc, curVal, CurIndex) => {
            if(CurIndex === index){
                return [...acc, DragValName, curVal]
            }
            else if(curVal !== DragValName){
                return [...acc, curVal]
            }
            return acc
        }, [])

        Element.forEach(element => {
            element.classList.remove('drag')
        })
        
       this.validateCaptcha();
        return this.randomlist
        }
        
    


    shufflelist(){
        this.randomlist = this.numberarray.sort(() => Math.random() - 0.5);
    }

    validateCaptcha(){
       console.log(this.cheeckSorted(this.randomlist));
    }

    cheeckSorted(arr){
        let second_index;
	    for(let first_index = 0; first_index < arr.length; first_index++){
  	    second_index = first_index + 1;
        if(arr[second_index] - arr[first_index] < 0){
            this.buttonss = true;
            return false;
        } 
            }
        this.buttonss = false;
        return true;
    }


    // drag(event){
    //     event.dataTransfer.setData("divId", event.target.id);
    // }

    // allowDrop(event){
    //     event.preventDefault();
    // }
    // drop(event){
    //     event.preventDefault();
    //     var divId = event.dataTransfer.getData("divId");
    //     var draggedElement = this.template.querySelector('#' +divId);
    //     draggedElement.classList.add('completed'); 
    //     event.target.appendChild(draggedElement);
    // }
}