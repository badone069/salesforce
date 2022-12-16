import { LightningElement ,api, wire, track} from 'lwc';
import getRelatedFilesByRecordId from '@salesforce/apex/dataTableData.getRelatedFilesByRecordId';
import {NavigationMixin} from 'lightning/navigation';




export default class DataTableJob extends LightningElement {
    @api recordId='0035g00000ewYhtAAE'
    filesList =[]
    @wire(getRelatedFilesByRecordId, {recordId: '$recordId'})
    wiredResult({data, error}){ e
        if(data){ 
            console.log(data)
            this.filesList = Object.keys(data).map(item=>({"label":data[item],
             "value": item,
             "url":`/sfc/servlet.shepherd/document/download/${item}`
            }))
            console.log(this.filesList)
        }
        if(error){ 
            console.log(error)
        }
    }
    previewHandler(event){
        console.log('check')
        console.log(event.target.dataset.id)
        this[NavigationMixin.Navigate]({ 
            type:'standard__namedPage',
            attributes:{ 
                pageName:'filePreview'
            },
            state:{ 
                selectedRecordId: event.target.dataset.id
            }
        })
    }
}