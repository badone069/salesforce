import { LightningElement, api, wire, track} from 'lwc';
import getjobOrderCandidate from '@salesforce/apex/jobOrderMatchCandidate.jobOrderCandidate';
import getCandidate from '@salesforce/apex/jobOrderMatchCandidate.candidate';


export default class JobOrderMatchcandidate extends LightningElement {

   
    @api recordId;
    @track jobRecord;

    @wire(getjobOrderCandidate,{ recordId: '$recordId'}) 
    jobOrderCandidate({ error, data }) {
        if (data) {

            //console.log('RecordId is'+recordId);

            this.jobRecord = data;

            this.error = undefined;

        } else if (error) {

            //console.log('Error block');

            this.error = error;

            this.jobRecord = undefined;

        }

       

    }

connectedCallback(){
    
    
}

@wire (getjobOrderCandidate) wiredAccounts({data,error}){
    if (data) {
    console.log('getjobOrderCandidate' + JSON.stringify( data)); 
    } else if (error) {
    console.log(error);
    }
}

@wire (getCandidate) wiredAccounts1({data,error}){
    if (data) {
    console.log('candidate' + JSON.stringify( data)); 
    } else if (error) {
    console.log(error);
    }
}
    
   
    
}