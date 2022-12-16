public with sharing class searchObject {
    @AuraEnabled(cacheable=true)
    public static List<String> getObjectAPINameToLabel(){
        // * Initializing Map
        Map<String, String> objectAPINameToLabelMap = new Map<String, String>();
        List<String> objectAPINameToLabelList=new List<String>();
        // * Getting all sObjects metadata
        Map<String, Schema.SObjectType> globalDescribeMap = Schema.getGlobalDescribe();
        System.debug('globalDescribeMap '+globalDescribeMap);
        System.debug('globalDescribeMap.keySet() '+globalDescribeMap.keySet());
        // * Processing each sObject one by one
        
        for(String globalDescribeKey : globalDescribeMap.keySet()) {
            
            // * Getting the current sObject type
            System.debug('globalDescribeKey '+globalDescribeKey);
            Schema.SObjectType currentSObjectType = globalDescribeMap.get(globalDescribeKey);
            System.debug('currentSObjectType '+currentSObjectType);
            // * Getting the current sObject description result from sObject Type
            Schema.DescribeSObjectResult currentSObjectResult = currentSObjectType.getDescribe();
            System.debug('currentSObjectResult ' +currentSObjectResult);
            // * Getting the API name and value of current sObject and adding it to the map
            // System.debug(currentSObjectResult.getName().sort());
            objectAPINameToLabelList.add(currentSObjectResult.getName());
            objectAPINameToLabelMap.put(currentSObjectResult.getName(), currentSObjectResult.getLabel());
        }
       
         
         // * Returning the map
        return objectAPINameToLabelList;
    }
}
