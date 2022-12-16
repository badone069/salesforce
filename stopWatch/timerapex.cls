public class timerapex {
    private static Set<id> newRecordId;
     public static void methodName(List<Contact> conList){
        newRecordId=new Set<Id>();
         for(Contact c : conList){
             newRecordId.add(c.Id);
             //System.debug('deepak raj');
         }
         //System.debug('newRecordId '+newRecordId);
        // newRecordId.addAll(recordIdSet);
      
        
 }
     @AuraEnabled
     public static List<String> setTime( Id Msgbody){
     //System.debug(' Id or current Record :'+Msgbody);
         DateTime now;
         DateTime current = system.now();
         List <Contact> conList = [ SELECT CreatedDate,Id,LastName FROM Contact WHERE Id =: Msgbody ];
         
         for( Contact c : conList){
             now = c.CreatedDate;
             
            // system.debug(' currentDateTime:  '+current);
            }
         
        DateTime startDate = now;
        DateTime endDate = current;
         
         Decimal seconds = Integer.valueOf((endDate.getTime() - startDate.getTime())/(1000));
         
        
         integer Sec = Integer.valueOf(seconds);
         Integer sumOfSecond = math.mod(Sec,60);
         //system.debug('second  :'+sumOfSecond);
         
  
        Decimal minutes = Integer.valueOf((endDate.getTime() - startDate.getTime())/(1000*60));
         
          Integer min = integer.valueOf(minutes);
          Integer sum = math.mod(min,60);
          //system.debug(' minutes  :'+sum);
  
         Decimal hours = Integer.valueOf((endDate.getTime() - startDate.getTime())/(1000*60*60));
         Integer Hours1 =Integer.valueOf(hours);
         //System.debug('Hours : ' +Hours1);
         String minute = String.valueOf(sum);
         String second = String.valueOf(sumOfSecond);
         String Hour = String.valueOf(Hours1);
         
         //System.debug(minute + '' + second + '' + minute);
         List<String> Timegap = new List<String>();
         Timegap.add(Hour);
         Timegap.add(minute);
         Timegap.add(second);
         
        // system.debug(''+Hour +':'+sum +':'+second);
  
         return TimeGap;
         }
 
 }