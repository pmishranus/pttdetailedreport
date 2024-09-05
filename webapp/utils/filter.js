sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/core/Fragment",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"nus/edu/sg/pttdetailedreport/utils/services",
	"nus/edu/sg/pttdetailedreport/utils/appconstant",
	"nus/edu/sg/pttdetailedreport/utils/configuration",
	"sap/m/Dialog",
	"sap/m/Text"
], function (Filter, FilterOperator, FilterType, Fragment, Sorter, JSONModel, Services, AppConstant, Config, Dialog, Text) {
	"use strict";
	var filter = ("nus.edu.sg.pttdetailedreport.utils.filter", {
		_fnFilterGroupCreation: function (taskStatusCode, component) {
			var stfNumber = component.AppModel.getProperty("/loggedInUserStfNumber");
			var claimAuthorizations = component.AppModel.getProperty("/claimAuthorizations");
			var approverMatrix = component.AppModel.getProperty("/approverMatrix");
			var aFilterGrp = [];
			var aFilterUser = [];
			var aFilterCompositeFilterGrpUserBased = [];
			var aFilterStatus = [];
			var aFinalArray = [];

			//handling task Assign to
			var filterTaskAssignToUser = new sap.ui.model.Filter("TASK_ASSGN_TO_STF_NUMBER", sap.ui.model.FilterOperator.EQ, stfNumber);

			//handling ULU and FDLU filter

			if (approverMatrix.length) {
				var oUluFdluMultipleList = this._fnFilterForUluFdlu(approverMatrix);
				var filtersGrp = new Filter({
					filters: [filterTaskAssignToUser, oUluFdluMultipleList],
					and: false
				});
				aFinalArray.push(filtersGrp);
			} else {
				aFinalArray.push(filterTaskAssignToUser);
			}

			//creating filter on the basis of approval matrix

			// //user specific filter
			// var filterTaskAssignGrp = new sap.ui.model.Filter("TASK_ASSGN_GRP", sap.ui.model.FilterOperator.EQ, component.AppModel.getProperty(
			// 	"/userRoleGrp"));
			// var filterTaskAssignTo = new sap.ui.model.Filter("TASK_ASSGN_TO", sap.ui.model.FilterOperator.EQ, "ALL");
			// aFilterGrp.push(filterTaskAssignGrp);
			// aFilterGrp.push(filterTaskAssignTo);

			// var filtersGrp = new Filter({
			// 	filters: aFilterGrp,
			// 	and: true
			// });
			// aFilterCompositeFilterGrpUserBased.push(filtersGrp);

			// //group specific filter
			// var filterTaskAssignGrpUser = new sap.ui.model.Filter("TASK_ASSGN_GRP", sap.ui.model.FilterOperator.EQ, component.AppModel.getProperty(
			// 	"/userRoleGrp"));
			// var filterTaskAssignToUser = new sap.ui.model.Filter("TASK_ASSGN_TO", sap.ui.model.FilterOperator.EQ, component.AppModel.getProperty(
			// 	"/loggedInUserId"));
			// aFilterUser.push(filterTaskAssignGrpUser);
			// aFilterUser.push(filterTaskAssignToUser);
			// var filtersGrpUser = new Filter({
			// 	filters: aFilterUser,
			// 	and: true
			// });
			// aFilterCompositeFilterGrpUserBased.push(filtersGrpUser);

			// //composite filter group and user based
			// var compositeFilterGrpUserBased = new Filter({
			// 	filters: aFilterCompositeFilterGrpUserBased,
			// 	and: false
			// });
			// aFinalArray.push(compositeFilterGrpUserBased);

			// //Task status query
			var filterTaskStatus = new sap.ui.model.Filter("TASK_STATUS", sap.ui.model.FilterOperator.EQ, taskStatusCode);
			// aFilterStatus.push(filterTaskStatus);
			// // aFilterUser.push(filterTaskAssignToUser);
			// var filtersTaskStatus = new Filter({
			// 	filters: aFilterStatus,
			// 	and: true
			// });
			aFinalArray.push(filterTaskStatus);

			// aFilter.push(new sap.ui.model.Filter({
			// 	filters: [oUserBasedFilter, oUluFdluMultipleList],
			// 	and: true
			// }));

			//handling input parameter

			var processCode = component.AppModel.getProperty("/ProcessCodeSelected/PROCESS_CODE");
			if (processCode) {
				var filterProcessCode = new sap.ui.model.Filter("PROCESS_CODE", sap.ui.model.FilterOperator.EQ, processCode);
				aFinalArray.push(filterProcessCode);
			}

			//final filter query
			var compositeFilter = new Filter({
				filters: aFinalArray,
				and: true
			});
			return compositeFilter;
		},
		_fnFilterForUluFdlu: function (claimAuthorizations) {
			var aUluFdluFilter = [];
			var aFinalUluFdluFilter = [];
			for (var i = 0; i < claimAuthorizations.length; i++) {
				aUluFdluFilter = [];
				aUluFdluFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, claimAuthorizations[i].ULU_C)); //testing ULU
				aUluFdluFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, claimAuthorizations[i].FDLU_C)); //testing FDLU
				aUluFdluFilter.push(new sap.ui.model.Filter("PROCESS_CODE", FilterOperator.EQ, claimAuthorizations[i].PROCESS_CODE)); //testing ULU
				// aUluFdluFilter.push(new sap.ui.model.Filter("TASK_ASSGN_GRP", FilterOperator.EQ, claimAuthorizations[i].STAFF_USER_GRP)); //testing FDLU
				aUluFdluFilter.push(new sap.ui.model.Filter("TASK_NAME", FilterOperator.EQ, claimAuthorizations[i].STAFF_USER_GRP)); //testing FDLU
				aUluFdluFilter.push(new sap.ui.model.Filter("TASK_ASSGN_TO", FilterOperator.EQ, "ALL")); //testing FDLU
				aFinalUluFdluFilter.push(new sap.ui.model.Filter(aUluFdluFilter, true));
			}
			var oUluFdluMultipleList = new Filter({
				filters: aFinalUluFdluFilter,
				and: false
			});
			return oUluFdluMultipleList;
		},
	});
	return filter;
}, true);