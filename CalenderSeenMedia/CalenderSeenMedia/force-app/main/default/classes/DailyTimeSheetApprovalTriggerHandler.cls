/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 29-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   18-10-2021   Vrushabh Uprikar   Initial Version
**/
public with sharing class DailyTimeSheetApprovalTriggerHandler {
    private boolean isTriggerExecuting = false;
    private integer BatchSize = 0;
    
    public DailyTimeSheetApprovalTriggerHandler(boolean isExecuting, integer size) {
        isTriggerExecuting = isExecuting;
        BatchSize = size;
    }

    public void onAfterInsert(List<Log_Hour__c> newLogHrList) {
        system.debug('Log_Hour__c Trigger On After Insert');
        for(Log_Hour__c logHr : newLogHrList) {
            try
            {
                if(logHr.Status__c == 'Submited') {
                    DailyTimeSheetController.submitForApproval(logHr);
                }
            } catch(Exception e) {
                System.debug('onAfterInsert ' + e.getMessage());
            }
        }
    }

    public void onAfterUpdate( List<Log_Hour__c> newLogHrList, List<Log_Hour__c> oldLogHrList, Map<ID, Log_Hour__c> newLogHrListMap , Map<ID, Log_Hour__c> oldLogHrListMap ) {
        system.debug('Log_Hour__c Trigger On After Update ');
        for(Log_Hour__c logHr : newLogHrList) {
            Log_Hour__c logHrOld = oldLogHrListMap.get(logHr.Id);
            try {
                if( logHr.Status__c == 'Submited' && logHrOld.Status__c != 'Submited') {
                    DailyTimeSheetController.submitForApproval(logHr);
                }
            } catch(Exception e) {
                System.debug('onAfterUpdate ' + e.getMessage());
            }
        }
    }   
}