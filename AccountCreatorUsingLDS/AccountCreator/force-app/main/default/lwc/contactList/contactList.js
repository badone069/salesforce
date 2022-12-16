import { LightningElement, wire } from 'lwc';
import { reduceErrors } from 'c/ldsUtils';
import FirstName from '@salesforce/schema/Contact.FirstName';
import LastName from '@salesforce/schema/Contact.LastName';
import Email from '@salesforce/schema/Contact.Email';
import getContacts from '@salesforce/apex/ContactController.getContacts';
const COLUMNS = [
    { label: 'Account Name', fieldName: FirstName.fieldApiName, type: 'text' },
    { label: 'Annual Revenue', fieldName: LastName.fieldApiName, type: 'text' },
    { label: 'Industry', fieldName: Email.fieldApiName, type: 'Email' }
];
export default class AccountList extends LightningElement {
    columns = COLUMNS;
    @wire(getContacts)
    contacts;

    get errors() {
        return (this.accounts.error) ?
            reduceErrors(this.accounts.error) : [];
    }
}