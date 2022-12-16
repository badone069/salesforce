/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 26-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   21-09-2021   Vrushabh Uprikar   Initial Version
**/
import { LightningElement, track, wire } from 'lwc';
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

    columns = [
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
    loggedUserId = USER_ID;
    loggedUserManagerId;

    @track userIdTogetdata;

    @track userComboBoxNameValue = 'None';

    connectedCallback() {
        this.todayDate = new Date();
        this.dateTrack = this.todayDate;
        this.setDateandCalDetails();
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

    userNameChnageHandler(event)
    {
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

}

// Employee Name should be Auto Number 
// Employee Name and User name should be Same 
// Remaove User Mapping with Employee(We can't create many users) 
// Map Task Project and Login Hr Project