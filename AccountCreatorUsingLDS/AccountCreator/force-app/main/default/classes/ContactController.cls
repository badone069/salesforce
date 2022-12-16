public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
           // return [Select FirstName, LastName, Email FROM Contact WITH SECURITY_ENFORCED ];
            throw new AuraHandledException('Forced error');
    }
}
