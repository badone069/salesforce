public with sharing class fileUploader {
    @AuraEnabled
    public static List<String> loadData( Id contentDocumentId) {
        
        String strMessage;
        List<String> myCsvHead=new List<String>();
        List<String> testCsvHead=new List<String>();
        List < Contact > contactList = new List < Contact >();
        
        if ( contentDocumentId != null ) {
            
            ContentVersion contentVersionObj = [ SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:contentDocumentId ];
            List < String > records = contentVersionObj.VersionData.toString().split( '\n' );
            System.debug('records====>'+records);
            String str = records[0];
            str=str.replaceAll('\r','');
            
            System.debug('str=====>'+str);
            //Removing the Header
            
            myCsvHead.add(str);
            testCsvHead.addAll(str.split(','));
            // System.debug('record[1][1]'+records[1][1]);
            System.debug('myCsvHead'+myCsvHead);
            System.debug(' testCsvHead '+ testCsvHead.indexOf('Ak'));
            records.remove(0);
            
            /* for ( String record : records ) {

if ( record != null ) {

Contact objContact = new Contact();
List < String > row = record.split( ',' );
objContact.FirstName = row[ 0 ];
objContact.LastName = row[ 1 ];
objContact.Email = row[ 2 ];
contactList.add( objContact );

}

}

try {    

if ( contactList.size() > 0 ) {

Database.DeleteResult deleteResult = Database.delete( contentDocumentId, true );
insert contactList;
strMessage = 'Records loaded successfully';

}

}
catch ( Exception e ) {

strMessage = 'Some error occured. Please reach out to your System Admin';
system.debug( e.getMessage() );

} 
*/
        }
        
        return myCsvHead;
        
    }
}
