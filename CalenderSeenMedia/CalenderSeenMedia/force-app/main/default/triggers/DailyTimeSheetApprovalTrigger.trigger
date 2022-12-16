/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 19-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   18-10-2021   Vrushabh Uprikar   Initial Version
**/
trigger DailyTimeSheetApprovalTrigger on Log_Hour__c ( after insert, after update) {

    DailyTimeSheetApprovalTriggerHandler handlerTrigger = new DailyTimeSheetApprovalTriggerHandler(Trigger.isExecuting, Trigger.size);

    if( Trigger.isInsert ) {
        if(Trigger.isAfter) {
            handlerTrigger.onAfterInsert(Trigger.new);
        }
    }
    else if ( Trigger.isUpdate ) {
        if(Trigger.isAfter) {
            handlerTrigger.onAfterUpdate(Trigger.new, Trigger.old, Trigger.newMap, Trigger.oldMap);
        }
    }
}