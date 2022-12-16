import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class GoogleSearchBar extends LightningElement {
    @api recordId;
    @api objectAPIName;
    @api valueFromLwc;
    strStreet;
    strCity;
    strState;
    strCountry;
    strPostalCode;

    handleSuccess( event ) {

        console.log( 'Updated Record Id is ', event.detail.id );
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Successful Record Update',
                message: 'Record Updated Surccessfully!!!',
                variant: 'success'
            })
        );

    }

    handleSubmit( event ) {

        let fields = event.detail.fields;
        console.log( 'Fields are ' +  JSON.stringify( fields ) );
        event.preventDefault(); 

        if ( this.objectAPIName === 'Account' ) {

            fields.BillingStreet = this.strStreet;
            fields.BillingCity = this.strCity;
            fields.BillingState = this.strState;
            fields.BillingCountry = this.strCountry;
            fields.BillingPostalCode = this.strPostalCode;

        } else if ( this.objectAPIName === 'Contact' ) {

            fields.MailingStreet = this.strStreet;
            fields.MailingCity = this.strCity;
            fields.MailingState = this.strState;
            fields.MailingCountry = this.strCountry;
            fields.MailingPostalCode = this.strPostalCode;

        }

        this.template.querySelector( 'lightning-record-edit-form').submit( fields );

    }

    addressInputChange( event ) {

        this.strStreet = event.target.street;
        this.strCity =  event.target.city;
        this.strState = event.target.province;
        this.strCountry = event.target.country;
        this.strPostalCode = event.target.postalCode;

        var address = {
            street : this.strStreet, 
            city : this.strCity,
            state : this.strState,
            country: this.strCountry,
            zipCode : this.strPostalCode
        }
        console.log("address in LWC"+JSON.stringify(address));
        this.valueFromLwc = address;
        const addresses = new CustomEvent("valuechange", {
            detail: { valueFromLwc: this.valueFromLwc}
        });
        // Fire the custom event
        this.dispatchEvent(addresses);

    }

}
