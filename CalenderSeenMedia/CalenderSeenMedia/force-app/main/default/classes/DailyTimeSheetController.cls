/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 31-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   23-09-2021   Vrushabh Uprikar   Initial Version
**/
public with sharing class DailyTimeSheetController 
{

    public static void submitForApproval(Log_Hour__c logHr) {
        
        Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();          
        req.setComments('Submitting request for approval using Trigger');        
        req.setObjectId(logHr.id);      
        req.setProcessDefinitionNameOrId('Approve_Daily_Logs');      
        Approval.ProcessResult result = Approval.process(req);  
        System.debug('result '+result);
        System.assert(result.isSuccess());
    }

   @AuraEnabled(cacheable = true)
   public static List<SObject> getAllDailyLogs(Integer year, String id ) {
      try {
         List<SObject> dailyLogs = [SELECT Id, Daily_Log_Hour__c, Daily_Log_Mins__c , Date__c FROM Log_Hour__c Where CALENDAR_YEAR(Date__c) =:year AND CreatedById =:id Order by Date__c] ;
         System.debug('yearInt new: ' + dailyLogs);      
         return dailyLogs;
      } catch(Exception e) {
         throw new AuraHandledException('Error @ DailyTimeSheetController.getAllDailyLogs'+e.getMessage());
      }
   }

   @AuraEnabled
   public static List<SObject> getTaskListByDay(String strDate, String id) {
      try {
         Date selectedDate = date.valueOf(strDate);
         List<SObject> tasklist = [SELECT Id, Name, Daily_Task__r.Name, Daily_Log_Hour__c, Daily_Log_Mins__c , Date__c,Project__c, CreatedBy.Name FROM Log_Hour__c Where Date__c =:selectedDate AND CreatedById =:id Order By Daily_Log_Hour__c];
         System.debug('tasklist: ' + tasklist);      
         return tasklist;
      } catch(Exception e) {
         throw new AuraHandledException('Error @ DailyTimeSheetController.getTaskListByDay'+e.getMessage());
      }
   }

   @AuraEnabled
   public static List<SObject> getUserNameUnderManager(String Id) {
      try {
         List<SObject> usersList = [Select Id, Name, ManagerId From User where ManagerId =:Id] ;
         System.debug('usersList: ' + usersList);      
         return usersList; 
      } catch (Exception e) {
         throw new AuraHandledException('Error @ DailyTimeSheetController.getUserNameUnderManager'+e.getMessage());
      }
   }

   public class ProcessInstanceWrapper
   {
        @AuraEnabled public Id workItemId;
        @AuraEnabled public String recordId;
        @AuraEnabled public String submittedBy;
        @AuraEnabled public String submittercomment;
        @AuraEnabled public Date submittedDate;
        @AuraEnabled public String comments;
    }

    public class ApprovalWrapper
    {
        @AuraEnabled public Id workItemId;
        @AuraEnabled public String recordId;
        @AuraEnabled public String submittedBy;
        @AuraEnabled public String submittercomment;
        @AuraEnabled public Date submittedDate;
        @AuraEnabled public String comments;
        @AuraEnabled public String Name;
        @AuraEnabled public Integer Daily_Log_Hour;
        @AuraEnabled public Integer Daily_Log_Mins;
        @AuraEnabled public String Daily_Task;
    }

  @AuraEnabled (cacheable=true)
  public static integer getTotalPendingApproval()
  {
      Integer pendingApprovalsCount = 0;
      List<ProcessInstance> processInstaList = [SELECT Id, TargetObjectId, TargetObject.Name, CreatedDate, (SELECT ID FROM WorkItems WHERE OriginalActorId = : UserInfo.getUserId()) FROM ProcessInstance WHERE TargetObject.Type ='Log_Hour__c'];
      for(ProcessInstance porcessInstance : processInstaList )
      {
          if(!porcessInstance.WorkItems.isEmpty())
          {
            pendingApprovalsCount++; // counting Submited Pending Approvals
          }
      }
      System.debug('pendingApprovalsCount: ' + pendingApprovalsCount);
      return pendingApprovalsCount;
  }



  @AuraEnabled
  public static List<ApprovalWrapper> getSubmittedRecords(Integer queryLimit, Integer queryOffset)
  {
    List<ProcessInstanceWrapper> listProcessInstanceWrapper = new List<ProcessInstanceWrapper>();
    List<ApprovalWrapper> listApprovalWrapper = new  List<ApprovalWrapper>();
    List<Id> targetObjIdList = new List<Id>();

    system.debug('queryLimit '+queryLimit + ' queryOffset '+queryOffset);

    List<ProcessInstance> processInstaList = [SELECT Id,TargetObjectId,
      (SELECT ID FROM WorkItems WHERE OriginalActorId = :UserInfo.getUserId()),
      (SELECT OriginalActor.Name,Comments FROM Steps WHERE StepStatus = 'Started') 
      FROM ProcessInstance WHERE TargetObject.Type ='Log_Hour__c'
      ORDER BY CreatedDate DESC LIMIT :queryLimit OFFSET :queryOffset];

    for(ProcessInstance ps : processInstaList )
    {
        if(!ps.WorkItems.isEmpty())
        {
            ProcessInstanceWrapper objProcessInstanceWrapper = new ProcessInstanceWrapper();
            objProcessInstanceWrapper.workItemId = ps.WorkItems[0].Id;
            objProcessInstanceWrapper.recordId = ps.TargetObjectId;
            targetObjIdList.add(ps.TargetObjectId);
            objProcessInstanceWrapper.comments = '';
            
            if(!ps.steps.isEmpty())
            {
                objProcessInstanceWrapper.submittedBy = ps.steps[0].OriginalActor.Name;
                if(ps.steps[0].Comments == '' || ps.steps[0].Comments == null)
                    objProcessInstanceWrapper.submittercomment = 'No Comments from Submitter';
                else
                    objProcessInstanceWrapper.submittercomment = ps.steps[0].Comments;
                listProcessInstanceWrapper.add(objProcessInstanceWrapper);
            }
        }
    }

    System.debug(listProcessInstanceWrapper.size());
    System.debug('listProcessInstanceWrapper: ' + listProcessInstanceWrapper);

    List<Log_Hour__c> submitedRecordsData = [Select Id, Name, Daily_Log_Hour__c, Daily_Log_Mins__c, Daily_Task__r.Name From Log_Hour__c WHERE Id IN :targetObjIdList];
    
    if(submitedRecordsData.size() > 0)
    {
        for (Log_Hour__c log : submitedRecordsData)
        {   
            ApprovalWrapper appWrapObj = new ApprovalWrapper();
            for (ProcessInstanceWrapper prw : listProcessInstanceWrapper) 
            {
                if(log.Id == prw.recordId)
                {
                    appWrapObj.workItemId       = prw.workItemId ;
                    appWrapObj.recordId         = prw.recordId ;
                    appWrapObj.submittedBy      = prw.submittedBy ;
                    appWrapObj.submittercomment = prw.submittercomment ;
                    appWrapObj.submittedDate    = prw.submittedDate ;
                    appWrapObj.comments         = prw.comments ;
                    appWrapObj.Name             = log.Name ;
                    appWrapObj.Daily_Log_Hour   = Integer.valueOf(log.Daily_Log_Hour__c) ;
                    appWrapObj.Daily_Log_Mins   = Integer.valueOf(log.Daily_Log_Mins__c) ;
                    appWrapObj.Daily_Task       = log.Daily_Task__r.Name ;
                    listApprovalWrapper.add(appWrapObj);
                }
            }
        }   
    }

    System.debug('listApprovalWrapper '+listApprovalWrapper);
    return listApprovalWrapper;
}

//  getApprovedRecords

//  getRejectedRecords
  
  @AuraEnabled
  public static String processRecords(String processType,String strwraprecs)
  {
    System.debug('processType'+processType);
    System.debug('wraprecs'+strwraprecs);
      List<ProcessInstanceWrapper> wraprecs = (List<ProcessInstanceWrapper>)System.JSON.deserialize(strwraprecs, List<ProcessInstanceWrapper>.class);
      Map<string,ProcessInstanceWrapper> mapProcessInstanceWrapper = new map<String,ProcessInstanceWrapper>();
      List<String> lstWorkItemIds = new List<String>();
      for(ProcessInstanceWrapper iwrap: wraprecs)
      {
          mapProcessInstanceWrapper.put(iwrap.workItemId,iwrap);
          lstWorkItemIds.add(iwrap.workItemId);
      }
      
      //Approve,reject the record programmatically
      String message = ''; 
      Integer recordsProcessed = 0;
      String comments = processType == 'Approve' ? 'Approved' : 'Rejected';
      List<Approval.ProcessWorkitemRequest> lstWorkItemRequest = new List<Approval.ProcessWorkitemRequest>();//ProcessWorkitemRequest class has methods to programmatically process submitted records
      for(String workItemId : lstWorkItemIds){
          Approval.ProcessWorkitemRequest objWorkItemRequest = new Approval.ProcessWorkitemRequest();
          if(mapProcessInstanceWrapper.containsKey(workItemId))
              objWorkItemRequest.setComments(mapProcessInstanceWrapper.get(workItemId).comments);
          else
              objWorkItemRequest.setComments(comments);
          objWorkItemRequest.setAction(processType);//approve or reject
          objWorkItemRequest.setWorkitemId(workItemId);
          lstWorkItemRequest.add(objWorkItemRequest);
      }
      Approval.ProcessResult[] lstProcessResult = Approval.process(lstWorkItemRequest,FALSE);//process method is used for approving/rejecting records depending on setAction attribute
      for(Approval.ProcessResult processResult : lstProcessResult){
          if(processResult.isSuccess()){
              recordsProcessed++;
          }
          else{
              for(Database.Error error : processResult.getErrors()){
                  message += error.getMessage();
              }
          }
      }
      if(recordsProcessed == lstWorkItemIds.size()){
          message = 'All records are '+comments+' successfully';
      }
      System.debug('message: ' + message);
      return message;
  }
}