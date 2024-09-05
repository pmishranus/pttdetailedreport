sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"./configuration"
], function (JSONModel, Device, Config) {
	"use strict";

	return {
		"ErrorPageTitle": "ErrorPageTitle",
		"ErrorPageText": "ErrorPageText",
		"ErrorPageDescription": "ErrorPageDescription",
		"ProcessCodeSelected": {},
		"ProcessData": [],
		"DelegationTo": [],
		"delegationToUser": {},
		"delegationForUser": {},
		"delegationStartDate": new Date(),
		"delegationEndDate": new Date(),
		"taskInboxFilter": '',
		"processFlowRequestID": "",
		"selectedKeyTask": "MyTask",
		"submissionStartDate": "",
		"submissionEndDate": "",
		"selectedKeySubmissionDate": "Today",
		"massApprovalText": "",
		"massApprovalTextCode": "",
		"massRejectText": "",
		"massRejectTextCode": "",
		"btnDisableForMassAction": false,
		"remarks": "",
		"actionPayload": [],
		"taskView": "Default",
		"token": null,
		"loggedInUserId": null,
		"loggedInUserStfNumber": null,
		"loggedInUserSfStfNumber": null,
		"loggedInUserInfo": {},
		"ProcessConfigs": [],
		"visibility": {
			"actionColumn": false
		},
		"userRole": null,
		"claimRequest": {
			"createClaimRequest": {}
		},
		"staffList": [],
		"claimsList": [],
		"months": {
			"JANUARY": "01",
			"FEBRUARY": "02",
			"MARCH": "03",
			"APRIL": "04",
			"MAY": "05",
			"JUNE": "06",
			"JULY": "07",
			"AUGUST": "08",
			"SEPTEMBER": "09",
			"OCTOBER": "10",
			"NOVEMBER": "11",
			"DECEMBER": "12"
		},
		"monthNames": ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		],
		"days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		"filterLookupData": {
			"TASK_INST_ID": [{
				"TaskInstId": "T001"
			}],
			"REQ_ID": [{
				"RequestId": "REQ002",
				"StatusCode": "1"
			}],
			"CLAIM_TYPE": [{
				"ClaimTypeId": "1",
				"ClaimTypeDesc": "PTT"
			}],
			"PERIOD": [{
				"Month": "June",
				"Year": "2022"
			}],
			"STATUS": [{
				"StatusID": "1",
				"StatusDesc": "Pending"
			}]
		},
		"sortingLookupData": [{
			"key": "TASK_INST_ID",
			"selectedStatus": true,
			"text": "Task Id"
		}, {
			"key": "REQUEST_ID",
			"selectedStatus": false,
			"text": "Request Id"
		}, {
			"key": "Period",
			"selectedStatus": false,
			"text": "Period"
		}, {
			"key": "SUBMITTED_ON",
			"selectedStatus": false,
			"text": "Submitted On"
		}, {
			"key": "FULL_NM",
			"selectedStatus": false,
			"text": "Staff Name"
		}, {
			"key": "STAFF_NUSNET_ID",
			"selectedStatus": false,
			"text": "Nusnet ID"
		}, {
			"key": "ULU_T",
			"selectedStatus": false,
			"text": "ULU"
		}, {
			"key": "FDLU_T",
			"selectedStatus": false,
			"text": "FDLU"
		}, {
			"key": "STATUS_ALIAS",
			"selectedStatus": false,
			"text": "Status"
		}, {
			"key": "SUBMITTED_BY_NID",
			"selectedStatus": false,
			"text": "Submitted By"
		}],
		"groupLookupData": [{
			"key": "TASK_INST_ID",
			"selectedStatus": false,
			"text": "Task Id"
		}, {
			"key": "REQUEST_ID",
			"selectedStatus": false,
			"text": "Request Id"
		}, {
			"key": "Period",
			"selectedStatus": false,
			"text": "Period"
		}, {
			"key": "SUBMITTED_ON",
			"selectedStatus": false,
			"text": "Submitted On"
		}, {
			"key": "FULL_NM",
			"selectedStatus": false,
			"text": "Staff Name"
		}, {
			"key": "STAFF_NUSNET_ID",
			"selectedStatus": false,
			"text": "Nusnet ID"
		}, {
			"key": "ULU_T",
			"selectedStatus": false,
			"text": "ULU"
		}, {
			"key": "FDLU_T",
			"selectedStatus": false,
			"text": "FDLU"
		}, {
			"key": "STATUS_ALIAS",
			"selectedStatus": false,
			"text": "Status"
		}, {
			"key": "SUBMITTED_BY_NID",
			"selectedStatus": false,
			"text": "Submitted By"
		}],
		"processNode": {
			"nodes": [],
			"lanes": []
		},
		"employeeInformation": {
			"pageId": "employeePageId",
			"header": "Employee Info",
			"icon": "test-resources/sap/ui/documentation/sdk/images/johnDoe.png",
			"displayShape": "Circle",
			"title": "",
			"description": "",
			"groups": [{
				"heading": "User Details",
				"elements": [{
						"label": "Company",
						"value": ""
					}, {
						"label": "ULU",
						"value": ""
					}, {
						"label": "FDLU",
						"value": ""
					}, {
						"label": "Job Grade",
						"value": ""
					}, {
						"label": "Email",
						"value": "",
						"emailSubject": "Subject",
						"elementType": "email"
					}, {
						"label": "Employee Category",
						"value": ""
					}
					// , {
					// 	"label": "Employee Group",
					// 	"value": ""
					// }
				]
			}]
		}

	};
});