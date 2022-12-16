/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 03-11-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   21-09-2021   Vrushabh Uprikar   Initial Version
**/
import { LightningElement, track, wire, api } from 'lwc';
import getAllDailyLogs from '@salesforce/apex/DailyTimeSheetController.getAllDailyLogs';
import getTaskListByDay from '@salesforce/apex/DailyTimeSheetController.getTaskListByDay'; //
import getUserNameUnderManager from '@salesforce/apex/DailyTimeSheetController.getUserNameUnderManager';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
import USER_ID from '@salesforce/user/Id';
import USER_NAME from '@salesforce/schema/User.Name';
import USER_ROLE_NAME from '@salesforce/schema/User.UserRole.Name';
import USER_MANAGER_ID from '@salesforce/schema/User.Manager.Name';
import { getRecord } from 'lightning/uiRecordApi';
import getWrapperClassList from '@salesforce/apex/DailyTimeSheetController.getSubmittedRecords';
import processRecords from '@salesforce/apex/DailyTimeSheetController.processRecords';
import gettotalcount from '@salesforce/apex/DailyTimeSheetController.getTotalPendingApproval';
import { refreshApex } from '@salesforce/apex';

export default class Calender extends NavigationMixin(LightningElement) {
    @track showCalender = false;
    @track todayDate;
    @track dateTrack;
    @track currentYear;
    @track currentMonth;
    @track dispMonthDates = [];
    @track dailyLogs = [];
    @track totalHours = [];
    @track showModal = false;
    @track isEditFrom = false;
    @track isCreateFrom = false;
    @track recordID = '';
    @track selectedDate;
    @track userNameOption = [];
    error;
    @track allData = []; // Task Data 
    allDataOrgCopy = []; // DatatableOrignalCpy

    CALENDER_GRID_LENGTH = 42;
    CURRUNET_MONTH_NAME = '';

    OBJECT_API_NAME = 'Log_Hour__c';

    MONTH_NAME_LIST = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    WEEK_DAYS_LIST = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

    recordColumns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Task', fieldName: 'Daily_Task__r.Name' },
        { label: 'Date', fieldName: 'Date__c', type: 'date' },
        { label: 'Log Hour', fieldName: 'Daily_Log_Hour__c' },
        { label: 'Log Mins', fieldName: 'Daily_Log_Mins__c' },
        { label: 'CreatedBy', fieldName: 'CreatedBy.Name' },
        {
            label: 'Edit', type: 'button-icon', typeAttributes:
            {
                iconName: 'utility:edit',
                variant: 'border-filled',
                alternativeText: 'Edit Record',
                label: 'Edit',
                name: 'Edit',
                title: 'Edit',
                disabled: false,
                value: 'edit',
                iconPosition: 'left'
            }
        },
    ];

    // Manager Portal
    @track isManager = false;
    @track userManagerName;
    loggedUserName;
    loggedUserRoleName;
    @track loggedUserId = USER_ID;
    @track loggedUserManagerId;

    @track userIdTogetdata;

    @track userComboBoxNameValue = 'None';

    // Manager compoenet 

    @api wrapperList = [];
    @api draftValues = [];
    @track sortBy;
    @track sortDirection;
    @track bShowModal = false;
    @track selectedcommentrowno;
    @track icomments = '';
    @track record;
    @track queryOffset;
    @track queryLimit;
    @track totalRecordCount;
    @track showinfiniteLoadingSpinner = true;
    @track showLoadingSpinner = false;
    @track isDialogVisible = false;
    @track originalMessage;
    @track wrapperListtrue = true;
    @track title;
    @api footertext;
    @track enable_app_rej = true;
    @track columns = [
        /* {
             label: '#',
             fieldName: 'recordId',
             type: 'url',
             initialWidth:50,
             typeAttributes: { label: 'View', target: '_blank' }
         },*/
        {
            type: 'button-icon',
            fixedWidth: 40,
            typeAttributes: {
                iconName: 'utility:preview',
                name: 'view_record',
                title: 'View Record',
                variant: 'border-filled',
                alternativeText: 'View Record',
                disabled: false
            }
        },
        {
            type: 'button-icon',
            fixedWidth: 40,
            typeAttributes: {
                iconName: 'utility:comments',
                name: 'submitter_comments',
                title: 'Submitter comments',
                variant: 'border-filled',
                alternativeText: 'Submitter comments',
                disabled: false
            }
        },
        {
            label: 'Name',
            fieldName: 'Name',
            type: 'text',
            wrapText: true,
            sortable: true
        },
        {
            label: 'Daily Task',
            fieldName: 'Daily_Task',
            type: 'text',
            sortable: true
        },
        {
            label: 'Log Hour',
            fieldName: 'Daily_Log_Hour',
            type: 'text',
            sortable: true
        },
        {
            label: 'Log Mins',
            fieldName: 'Daily_Log_Mins',
            type: 'text',
            sortable: true
        },
        {
            label: 'Submitter',
            fieldName: 'submittedBy',
            type: 'text',
            initialWidth: 120,
            sortable: true
        },
        {
            label: 'Approver Comment',
            fieldName: 'comments',
            type: 'text',
            initialWidth: 290,
            wrapText: true,
            editable: true
        }
    ];

    connectedCallback()
    {
        this.todayDate = new Date();
        this.dateTrack = new Date();
        if(USER_MANAGER_ID)
        {
            this.getUserLoginDataById(USER_ID);
        }
        this.setDateandCalDetails();
    }

    constructor() {
        super();
        this.title = 'Your Pending Approvals';
        this.showinfiniteLoadingSpinner = true;
        this.wrapperList = [];
        this.queryOffset = 0;
        this.queryLimit = 5;
        this.loadRecords();
    }


    setAllDailyLogs(year, totalNumberOfDays, Id) {
        getAllDailyLogs({ year: parseInt(year), id: Id }) // geting data from DailyTimeSheetController
            .then(data => {
                this.dailyLogs = JSON.parse(JSON.stringify(data));
                console.log('this.dailyLogs:', JSON.stringify(this.dailyLogs));
            })
            .then(_ => {
                this.createDisplayMonthDates(totalNumberOfDays);
            }).then(_temp => {
                this.totalWorkingHrPerWeek();
            })
            .catch(error => {
                this.error = reduceErrors(error);
                console.log('Error @ getAllDailyLogs:', this.error);
            });
    }

    numberOfDaysInAMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    createDisplayMonthDates(totalNumberOfDays) {

        const firstDayOfTheMonth = new Date(this.currentYear, this.currentMonth, 1);
        const dayOne = firstDayOfTheMonth.getDay(); // Sunday is 0, Monday is 1, and so on.
        let noOfDaysInPreviousMonth = this.numberOfDaysInAMonth(this.currentYear, this.currentMonth);
        let noOfDaysToAdd = dayOne;
        let previousMonthDaysArray = [];

        for (let i = noOfDaysToAdd; i > 0; i--) {
            let any =
            {
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth - 1, noOfDaysInPreviousMonth)),
                day: noOfDaysInPreviousMonth,
                Daily_Log_Hr: 0,
                Daily_Log_Min: 0,
            };

            noOfDaysInPreviousMonth--;
            previousMonthDaysArray.push(any);
        }
        this.dispMonthDates = [...previousMonthDaysArray.reverse()];

        for (let i = 1; i <= totalNumberOfDays; i++) {

            let any =
            {
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth, i)), //'' + this.currentYear + '-' + this.currentMonth + '-' + i,
                day: i,
                isDisable: false,
                Daily_Log_Hr: 0,
                Daily_Log_Min: 0,
            };

            this.dispMonthDates.push(any);
        }

        let len = this.dispMonthDates.length;

        for (let i = 1; i <= (this.CALENDER_GRID_LENGTH - len); i++) {

            let any =
            {
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth + 1, i)),
                day: i,
                Daily_Log_Hr: 0,
                Daily_Log_Min: 0,
            };
            this.dispMonthDates.push(any);
        }

        this.dispMonthDates.map(date1 => {

            this.dailyLogs.forEach(date2 => {
                if (date1.date === date2.Date__c) {
                    date1.Id = date2.Id;
                    date1.Daily_Log_Hr = date2.Daily_Log_Hour__c ? date2.Daily_Log_Hour__c : 0;
                    date1.Daily_Log_Min = date2.Daily_Log_Mins__c ? date2.Daily_Log_Mins__c : 0;
                    date1.totalHr = 0;
                    date1.totalMin = 0;
                }
            })
        });

        this.dispMonthDates.map(date1 => {
            this.dailyLogs.forEach(date2 => {
                if ((date1.date == date2.Date__c) && (date1.Id != date2.Id)) {
                    date1.Id = date2.Id;
                    date1.totalHr = parseInt(date1.totalHr) + parseInt(date2.Daily_Log_Hour__c);
                    date1.totalMin = parseInt(date1.totalMin) + parseInt(date2.Daily_Log_Mins__c);
                    date1.displayTime = this.timeConvert((date1.totalHr * 60) + date1.totalMin);
                } else if ((date1.date == date2.Date__c) && (date1.Id == date2.Id)) {
                    date1.Id = date2.Id;
                    date1.totalHr = parseInt(date2.Daily_Log_Hour__c);
                    date1.totalMin = parseInt(date2.Daily_Log_Mins__c);
                    date1.displayTime = this.timeConvert((date1.totalHr * 60) + date1.totalMin);
                }
            })
        });
        console.log('this.dispMonthDates:', JSON.stringify(this.dispMonthDates));
    }

    formatedDate(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);

    }

    handleClickPrevious() {
        this.dateTrack = new Date(this.currentYear, this.currentMonth - 1, 1);
        this.setDateandCalDetails();
    }

    handleClickNext() {
        this.dateTrack = new Date(this.currentYear, this.currentMonth + 1, 1);
        this.setDateandCalDetails();
    }

    isToday(date) {
        return date == this.formatedDate(this.todayDate) ? true : false;
    }

    totalWorkingHrPerWeek() {
        try {
            var count = 0;
            var tempArry = [];
            for (let i = 0; i < 6; i++) {
                var hour = 0;
                var mins = 0;
                for (let j = 0; j < 7; j++) {
                    if (this.dispMonthDates[count].totalHr || this.dispMonthDates[count].totalMin) {
                        hour = hour + parseInt(this.dispMonthDates[count].totalHr);
                        mins = mins + parseInt(this.dispMonthDates[count].totalMin);
                    }
                    count++;
                }
                tempArry[i] = this.timeConvert((hour * 60) + mins);
            }
            this.totalHours = tempArry;
            console.log('this.totalHours:' + JSON.stringify(this.totalHours));
        }
        catch (error) {
            this.error = reduceErrors(error);
            console.log('Error @ totalWorkingHrPerWeek:', this.error);
        }
    }

    timeConvert(n) {
        var num = n;
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        return (rhours < 10 ? "0" : "") + rhours + ":" + (rminutes < 10 ? "0" : "") + rminutes;
    }

    setDateandCalDetails() {
        this.currentMonth = this.dateTrack.getMonth();
        this.currentYear = this.dateTrack.getFullYear();
        this.CURRUNET_MONTH_NAME = this.MONTH_NAME_LIST[this.currentMonth];
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.currentYear, this.currentMonth + 1);
        this.setAllDailyLogs(this.currentYear, totalNumberOfDays, this.userIdTogetdata);
        console.log('this.currentYear:', this.currentYear);
    }

    async onClickOfDate(event) {
        var onClickedDate = event.currentTarget.id.slice(0, 10);
        console.log('onClickedDate', onClickedDate);
        this.selectedDate = onClickedDate;

        await getTaskListByDay({ strDate: onClickedDate, id: this.userIdTogetdata })
            .then(data => {
                data.map(record => {
                    record["Daily_Task__r.Name"] = record.Daily_Task__r.Name;
                    record["CreatedBy.Name"] = record.CreatedBy.Name;
                });

                this.allData = data;
            }).then(_ => {
                console.log('this.allData:' + JSON.stringify(this.allData));
                this.openModal();
            })
            .catch(error => {
                this.error = reduceErrors(error);
                console.log('Error @ onClickOfDate:', this.error);
            });

    }

    checkDateIsAvailable(onClickedDate) {
        let flag = false;
        this.dailyLogs.forEach(key => {
            if (key.Date__c == onClickedDate) {
                this.recordID = key.Id;
                flag = true;
                console.log(' key.Id:', key.Id);
            }
        });

        if (flag) {
            return this.recordID;
        } else {
            return false;
        }
    }

    setEditForm() {
        this.isEditFrom = true;
        this.isCreateFrom = false;
    }

    setCreateForm() {
        this.isEditFrom = false;
        this.isCreateFrom = true;
    }

    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    handleCancel() {
        this.closeModal();
    }

    handleSubmit() {
        this.closeModal();
    }

    editSuccess() {
        this.closeModal();
    }

    handleSuccessNew(event) {
        const evt = new ShowToastEvent({
            title: "Record created",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.closeModal();
        this.setDateandCalDetails();
        this.clearDefValues();
    }

    handleSuccessEdit(event) {
        const evt = new ShowToastEvent({
            title: "Record Updated",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.closeModal();
        this.setDateandCalDetails();
        this.clearDefValues();
    }

    clearDefValues() {
        this.recordID = '';
    }

    callRowAction(event) {
        const recId = event.detail.row.Id;
        console.log('recId:', recId);
        const actionName = event.detail.action.name;
        if (actionName === 'Edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: recId,
                    actionName: 'edit'
                }
            });
        }
    }

    addRecord(event) {
        const defaultValues = encodeDefaultFieldValues({
            Date__c: this.selectedDate,
        });

        console.log('defaultValues : ' + defaultValues);

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.OBJECT_API_NAME,
                actionName: 'new'
            },
            state: {
                defaultFieldValues: defaultValues
            }
        }).then(_ => {
            this.selectedDate = '';
        });
    }

    // Manager Portal

    get userNameOptionList() {
        return this.userNameOption;
    }

    userNameChnageHandler(event) {
        this.totalHours = [];
        var value = event.detail.value;
        this.userComboBoxNameValue = value;
        console.log('value:', value);
        if (value == 'None') {
            this.showCalender = false;
        } else {
            this.showCalender = true;
            this.getUserLoginDataById(value);
        }

    }

    getUserLoginDataById(Id) {
        console.log('getUserLoginDataById :', Id);
        this.userIdTogetdata = Id;
        this.setDateandCalDetails();
    }

    getUserNameUnderManager(loggedUserId) {
        getUserNameUnderManager({ Id: loggedUserId })
            .then(data => {
                var options = [];
                options.unshift({ label: 'Select User', value: 'None' });
                data.forEach(any => {
                    options.push({ label: any.Name, value: any.Id });
                });
                this.userNameOption = JSON.parse(JSON.stringify(options));
                console.log('data @ this.userNameOption:', JSON.stringify(this.userNameOption));
            }).catch(error => {
                this.error = reduceErrors(error);
                console.log('Error @ getUserNameUnderManager:', this.error);
            });
    }

    isProjectmanager() {
        if (this.loggedUserRoleName == 'Project Manager') {
            this.isManager = true;
            this.getUserNameUnderManager(this.loggedUserId);
        } else {
            this.isManager = false;
            this.showCalender = true;
            this.userIdTogetdata = this.loggedUserId;
        }
    }

    @wire(getRecord, { recordId: USER_ID, fields: [USER_NAME, USER_ROLE_NAME, USER_MANAGER_ID] })
    wireuser({ error, data }) {
        if (error) {
            this.error = reduceErrors(error);
            console.log('error @ wireuser:', this.error);
        } else if (data) {
            console.log('data @ wireuser:', JSON.stringify(data));
            this.userManagerName = data.fields.Manager.displayValue == null ? 'None' : data.fields.Manager.displayValue;
            this.loggedUserManagerId = data.fields.Manager.value == null ? 'None' : data.fields.Manager.value.id;
            this.loggedUserName = data.fields.Name.value;
            this.loggedUserRoleName = data.fields.UserRole.displayValue == null ? 'None' : data.fields.UserRole.value.fields.Name.value;
            console.log('this.loggedUserRoleName', this.loggedUserRoleName);
            this.isProjectmanager();
        }
    }

    wiredcountResults;
    @wire(gettotalcount) totalcount(result) {
        console.log('result.data' + result.data);
        this.wiredcountResults = result;
        if (result.data != undefined) {
            this.totalRecordCount = result.data;
            console.log('tota' + this.totalRecordCount);
            this.title = 'Your Pending Approvals (' + this.totalRecordCount + ')';
            if (result.data > 0)
                this.wrapperListtrue = true;
            else {
                this.totalRecordCount = 0;
                this.title = 'Your Pending Approvals';
                this.wrapperListtrue = false;
                console.log('tota' + this.totalRecordCount);
            }
        } else if (result.error) {
            this.error = result.error;
            this.totalRecordCount = 0;
            this.title = 'Your Pending Approvals (' + this.totalRecordCount + ')';
            this.wrapperListtrue = false;
            console.log('tota' + this.totalRecordCount);
        }
    }

    reloadrecords() {
        this.showLoadingSpinner = true;
        this.showinfiniteLoadingSpinner = true;
        this.queryOffset = 0;
        this.queryLimit = 5;
        let flatData;
        this.wrapperList = [];
        console.log(this.totalRecordCount);
        return getWrapperClassList({ queryLimit: this.queryLimit, queryOffset: this.queryOffset })
            .then(result => {
                console.log('getWrapperClassList ' + result);
                console.log(this.totalRecordCount);
                flatData = result;
                if (flatData != undefined) {
                    for (var i = 0; i < flatData.length; i++) {
                        flatData[i].recordId = '/' + flatData[i].recordId;
                    }
                    this.wrapperList = flatData;
                }
                this.showLoadingSpinner = false;
                console.log(this.wrapperList);
                this.showLoadingSpinner = false;
                return refreshApex(this.wiredcountResults);
                //this.error = undefined;
            }).catch(error => {
                console.log(error);
                this.showLoadingSpinner = false;
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error,
                        variant: 'info'
                    })
                );
                return refreshApex(this.wiredcountResults);
            })
    }

    loadRecords() { //you can build a method for a button
        this.showLoadingSpinner = true;
        let flatData;
        console.log('loadRecords queryOffset ' + this.queryOffset);
        console.log('loadRecords queryLimit' + this.queryLimit);
        return getWrapperClassList({ queryLimit: this.queryLimit, queryOffset: this.queryOffset })
            .then(result => {
                console.log('getWrapperClassList ' + JSON.stringify(result));
                flatData = result;
                if (flatData != undefined) {
                    for (var i = 0; i < flatData.length; i++) {
                        flatData[i].recordId = '/' + flatData[i].recordId;
                    }
                    let updatedRecords = [...this.wrapperList, ...flatData];
                    this.wrapperList = updatedRecords;
                }
                this.showLoadingSpinner = false;
                console.log('this.wrapperList ' + this.wrapperList);
                refreshApex(this.wiredcountResults);
                this.title = 'Your Pending Approvals (' + this.totalRecordCount + ')';
            }).catch(error => {
                console.log(error);
                this.showLoadingSpinner = false;
                this.error = error;
                refreshApex(this.wiredcountResults);
                this.title = 'Your Pending Approvals (' + this.totalRecordCount + ')';
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error,
                        variant: 'info'
                    })
                );
            })
    }

    loadMoreData(event) {
        const { target } = event;
        this.showinfiniteLoadingSpinner = true;
        //Display a spinner to signal that data is being loaded
        console.log('loadMoreData totalRecordCount' + this.totalRecordCount);
        console.log('loadMoreData queryLimit' + this.queryLimit);
        console.log('loadMoreData queryOffset' + this.queryOffset);
        if (this.totalRecordCount < this.queryLimit) {
            console.log(this.wrapperList);
            this.showinfiniteLoadingSpinner = false;
            return refreshApex(this.wiredcountResults);
        }
        else if (this.totalRecordCount > this.queryOffset) {
            this.queryOffset = this.queryOffset + 5;
            console.log('loadMoreData queryLimit' + this.queryLimit);
            console.log('loadMoreData queryOffset' + this.queryOffset);
            let flatData;
            return getWrapperClassList({ queryLimit: this.queryLimit, queryOffset: this.queryOffset })
                .then(result => {
                    target.isLoading = false;
                    console.log(result);
                    console.log(this.totalRecordCount);
                    flatData = result;
                    if (flatData != undefined) {
                        for (var i = 0; i < flatData.length; i++) {
                            flatData[i].recordId = '/' + flatData[i].recordId;
                        }
                        //this.wrapperList = this.wrapperList.concat(flatData);
                        let updatedRecords = [...this.wrapperList, ...flatData];
                        this.wrapperList = updatedRecords;
                    }
                    target.isLoading = false;
                    console.log(this.wrapperList);
                    this.showinfiniteLoadingSpinner = false;
                    return refreshApex(this.wiredcountResults);
                }).catch(error => {
                    console.log(error);
                    this.showinfiniteLoadingSpinner = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error,
                            variant: 'info'
                        })
                    );
                    return refreshApex(this.wiredcountResults);
                })
        } else {
            this.showinfiniteLoadingSpinner = false;
            target.isLoading = false;
            return refreshApex(this.wiredcountResults);
        }
    }

    handleSave(event) {
        this.showLoadingSpinner = true;
        console.log(event.detail.draftValues);
        console.log(this.wrapperList);
        var draftlst = [];
        draftlst = event.detail.draftValues;
        for (var i = 0; i < this.wrapperList.length; i++) {
            console.log(this.wrapperList[i].workItemId);
            for (var j = 0; j < draftlst.length; j++) {
                console.log(draftlst[j].workItemId);
                if (this.wrapperList[i].workItemId === draftlst[j].workItemId) {
                    this.wrapperList[i].comments = draftlst[j].comments;
                }
            }
        }
        for (var i = 0; i < this.wrapperList.length; i++) {
            console.log(this.wrapperList[i].comments);
        }
        this.draftValues = [];
        this.showLoadingSpinner = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Approver comments Added.',
                variant: 'success'
            })
        );
    }

    enablebuttons(event) {
        const selectedRows = event.detail.selectedRows;
        var recordsCount = event.detail.selectedRows.length;
        if (recordsCount > 0)
            this.enable_app_rej = false;
        else
            this.enable_app_rej = true;

    }

    processrec() {
        this.showLoadingSpinner = true;
        var el = this.template.querySelector('lightning-datatable');
        var selectedrows = el.getSelectedRows();
        console.log('selectedrows' + selectedrows);
        // console.log(event.target.label);
        var varprocessType = this.originalMessage;// event.target.label;
        var processrows = [];
        for (var i = 0; i < selectedrows.length; i++) {
            processrows.push(selectedrows[i]);
        }
        if (processrows.length > 0) {
            var str = JSON.stringify(processrows);
            processRecords({ processType: varprocessType, strwraprecs: str })
                .then(result => {
                    this.showinfiniteLoadingSpinner = true;
                    this.queryOffset = 0;
                    this.queryLimit = 5;
                    let flatData;
                    this.wrapperList = [];
                    console.log(this.totalRecordCount);
                    return getWrapperClassList({ queryLimit: this.queryLimit, queryOffset: this.queryOffset })
                        .then(result => {
                            console.log(result);
                            console.log(this.totalRecordCount);
                            flatData = result;
                            if (flatData != undefined) {
                                for (var i = 0; i < flatData.length; i++) {
                                    flatData[i].recordId = '/' + flatData[i].recordId;
                                }
                                this.wrapperList = flatData;
                            }
                            this.showLoadingSpinner = false;
                            console.log(this.wrapperList);
                            this.showLoadingSpinner = false;
                            var messagetitle;
                            var ivariant;
                            if (varprocessType == 'Approve') {
                                messagetitle = 'Selected records are Approved.';
                                ivariant = 'success';
                            }
                            else if (varprocessType == 'Reject') {
                                messagetitle = 'Selected records are Rejected.';
                                ivariant = 'error';
                            }
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: varprocessType,
                                    message: messagetitle,
                                    variant: ivariant
                                })
                            );
                            return refreshApex(this.wiredcountResults);
                        }).catch(error => {
                            this.showLoadingSpinner = false;
                            this.error = reduceErrors(error);
                            console.log('return getWrapperClassList' + error);
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error',
                                    message: error,
                                    variant: 'error'
                                })
                            );
                            return refreshApex(this.wiredcountResults);
                        })
                })
                .catch(error => {
                    this.showLoadingSpinner = false;
                    this.error = reduceErrors(error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: this.error,
                            variant: 'error'
                        })
                    );
                    return refreshApex(this.wiredcountResults);
                });
        }
        else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'No Records chosen.',
                    message: 'Please select records to proceed.',
                    variant: 'warning'
                })
            );
            this.showLoadingSpinner = false;
        }
    }

    handleSortdata(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(event.detail.fieldName, event.detail.sortDirection);
    }

    sortData(fieldname, direction) {
        this.showLoadingSpinner = true;
        let parseData = JSON.parse(JSON.stringify(this.wrapperList));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';

            return isReverse * ((x > y) - (y > x));
        });
        this.wrapperList = parseData;
        this.showLoadingSpinner = false;
    }

    openConfirmationModal() {
        this.bShowModal = true;
    }

    closeConfirmationModal() {
        this.bShowModal = false;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        var row = event.detail.row;
        console.log(row);
        switch (actionName) {
            case 'view_record':
                this.viewrecord(row);
                break;
            case 'submitter_comments':
                this.opencomment(row);
                break;
            default:
        }
    }

    opencomment(row) {
        this.bShowModal = true;
        console.log(row);
        const { workItemId } = row;
        console.log(workItemId);
        this.record = row;
        console.log(this.record);
        this.icomments = this.record.submittercomment;
        console.log(this.bShowModal);
    }

    viewrecord(row) {
        this.record = row;
        console.log(this.record.recordId);
        window.open(this.record.recordId, '_blank');
    }

    handleconformClick(event) {
        try {
            if (event.target.label === 'Approve') {
                console.log('Event -> ' + event.target.label);
                this.originalMessage = event.target.label;
                this.processrec();
            }
            else if (event.target.label === 'Reject') {
                console.log('Event -> ' + event.target.label);
                this.originalMessage = event.target.label;
                this.processrec();
            }
        }
        catch (error) {
            this.error = reduceErrors(error);
            console.log('Errpor @ processrec ' + this.error);
        }
    }

}