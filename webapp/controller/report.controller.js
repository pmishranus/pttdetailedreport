sap.ui.define([
	"../controller/BaseController", "../extensions/extendedvaluehelp", "sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"../utils/dataformatter", "../utils/massuploadhelper", "sap/m/MessageToast", "sap/m/MessageBox", "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"../utils/services",
	"../utils/appconstant",
	"../model/models",
	"../utils/configuration",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/export/Spreadsheet",
	"sap/ui/export/library",
	"../utils/filter",
	"sap/m/Token"
], function (BaseController, ExtendedValueHelp, Fragment, JSONModel, Formatter, MassUploa, MessageToast, MessageBox, Filter,
	FilterOperator, FilterType, Sorter, services, AppConstant, models, config, ODataModel, Spreadsheet, exportLibrary,
	FilterUtility, Token) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return BaseController.extend("nus.edu.sg.pttdetailedreport.controller.report", {
		formatter: Formatter,
		onInit: function () {

			this.oRouter = this.getOwnerComponent().getRouter();
			this._bDescendingSort = false;
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			this.initializeModel();
			var oClaimsReqTable = this.getView().byId("idClaimRequestsTable");

			this.oTemplate = oClaimsReqTable.getBindingInfo("items").template;
			oClaimsReqTable.unbindAggregation("items");
		},
		initializeModel: function () {
			var oAppModel = this.setComponentModel("AppModel");
			oAppModel.setData(AppConstant);
			this.AppModel = oAppModel;
			// var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
			// 	pattern: "d MMM, yyyy"
			// });
			// var currentDate = oDateFormat.format(new Date());
			// this.AppModel.setProperty("/submissionStartDate", currentDate);
			// this.AppModel.setProperty("/submissionEndDate", currentDate);
			// this.generateTokenForLoggedInUser();
			this.onLoadInitialServices();

			this.handleValueHelpPeriod();
		},
		// _fnLoadMetaData: function () {
		// 	var serviceName = config.dbOperations.metadataclaims;
		// 	var token = this.AppModel.getProperty("/token");
		// 	var oHeaders = {
		// 		"Accept": "application/json",
		// 		"Authorization": "Bearer" + " " + token,
		// 		"AccessPoint": "A",
		// 		"Content-Type": "application/json"
		// 	};

		// 	// var oDataModel = new ODataModel({
		// 	// 	serviceUrl: serviceName,
		// 	// 	headers: oHeaders
		// 	// });
		// 	var oDataModel = this.getOwnerComponent().getModel();
		// 	// oDataModel.setUseBatch(false);
		// 	oDataModel.metadataLoaded().then(function () {
		// 	// this.getOwnerComponent().setModel(oDataModel, "EclaimSrvModel");
		// 	this.handleValueHelpStatus();
		// 	var noSearchHelpPopUp = 'Y';
		// 	this.handleValueHelpUlu(noSearchHelpPopUp);
		// 	this.handleValueHelpFdlu(noSearchHelpPopUp);
		// 	this.handleValueHelpRequestId();
		// 	this.handleValueHelpStaffId();
		// 	//				
		// 	}.bind(this));
		// },
		_fetchLoggedInUserPhoto: function () {
			//fetch photo
			var that = this;
			services.fetchLoggeInUserImage(that, function (oResponse) {
				that.AppModel.setProperty("/staffPhoto", oResponse.photo ? "data:image/png;base64," + oResponse.photo : null);
			});
		},
		// fetchMyTaskCount: function (compositeFilterForTaskCount) {
		// 	var oDataModel = this.getOwnerComponent().getModel("EclaimSrvModel");
		// 	var that = this;
		// 	oDataModel.read("/TaskInboxs/$count", {
		// 		filters: compositeFilterForTaskCount,
		// 		success: function (oData) {
		// 			if (oData) {
		// 				that.getView().byId("itbFlMyTasks").setCount(oData);
		// 			}
		// 		},
		// 		error: function (oError) {}
		// 	});
		// },
		// fetchCompletedTaskCount: function (compositeFilterForTaskCount) {
		// 	var oDataModel = this.getOwnerComponent().getModel("EclaimSrvModel");
		// 	var that = this;
		// 	oDataModel.read("/TaskInboxs/$count", {
		// 		filters: compositeFilterForTaskCount,
		// 		success: function (oData) {
		// 			if (oData) {
		// 				that.getView().byId("itbFlCompletedTasks").setCount(oData);
		// 			}
		// 		},
		// 		error: function (oError) {}
		// 	});
		// },
		// onSelectIconFilter: function (oEvent) {
		// 	var sKey = oEvent.getSource().getSelectedKey();
		// 	this._handleIcontabFilterKeySetting(sKey);

		// },
		// _handleIcontabFilterKeySetting: function (sKey) {
		// 	if (sKey === "MyTask") {
		// 		this.getTaskTypeDetails("95");
		// 	} else if (sKey === "CompletedTasks") {
		// 		this.getTaskTypeDetails("97");
		// 	}
		// },

		// generateTokenForLoggedInUser: function () {
		// 	// this._fnLoadMetaData();

		// 	services.fetchLoggedUserToken(this, function (oRetData) {
		// 		this.AppModel.setProperty("/token", oRetData.token);
		// 		// this.AppModel.setProperty("/loggedInUserInfo", oRetData.userDetails[0]);
		// 		// this.AppModel.setProperty("/loggedInUserStfNumber", oRetData.staffInfo.primaryAssignment.STF_NUMBER);
		// 		// this.AppModel.setProperty("/loggedInUserSfStfNumber", oRetData.staffInfo.primaryAssignment.SF_STF_NUMBER);
		// 		// //to incorporate primary and secondary assignments(concurrent case ULU and FDLUs)	
		// 		// this.AppModel.setProperty("/primaryAssigment", oRetData.staffInfo.primaryAssignment);
		// 		// this.AppModel.setProperty("/otherAssignments", oRetData.staffInfo.otherAssignments);
		// 		this.AppModel.setProperty("/claimAuthorizations", oRetData.staffInfo.claimAuthorizations);
		// 		this.AppModel.setProperty("/approverMatrix", oRetData.staffInfo.approverMatrix);

		// 		var aListOfGroups = [];
		// 		if (oRetData.staffInfo.approverMatrix.length) {
		// 			for (var i = 0; i < oRetData.staffInfo.approverMatrix.length; i++) {
		// 				//addition of code to incorporate Super Admin as well from Approver matrix
		// 				if (oRetData.staffInfo.approverMatrix[i].STAFF_USER_GRP === 'MATRIX_ADMIN' &&
		// 				oRetData.staffInfo.approverMatrix[i].PROCESS_CODE === '100') {
		// 					this.AppModel.setProperty("/userRoleGrp", 'NUS_CHRS_ECLAIMS_SUPER_ADMIN'); //Super Admin
		// 				}
		// 				//
		// 				var oGroups = oRetData.staffInfo.approverMatrix[i];
		// 				if (aListOfGroups.indexOf(oGroups.STAFF_USER_GRP) < 0) {
		// 					aListOfGroups.push(oGroups.STAFF_USER_GRP);
		// 				}
		// 			}
		// 			// if (aListOfGroups.length === 1) {
		// 			// 	this.AppModel.setProperty("/userRoleGrp", aListOfGroups[0]); //claimant
		// 			// 	// if (aListOfGroups[0] === "NUS_CHRS_ECLAIMS_APPROVER") {
		// 			// 	if (aListOfGroups[0] === "APPROVER" || aListOfGroups[0] === "ADDITIONAL_APP_1" || aListOfGroups[0] === "ADDITIONAL_APP_2") {
		// 			// 		this.AppModel.setProperty("/visibility/actionColumn", true);
		// 			// 	}
		// 			// } else {
		// 			// 	this.AppModel.setProperty("/userRoleGrp", "NUS_CHRS_ECLAIMS_ESS"); //claimant
		// 			// }
		// 		} else {
		// 			this.AppModel.setProperty("/userRole", "ESS"); // claimant 
		// 			this.AppModel.setProperty("/userRoleGrp", "NUS_CHRS_ECLAIMS_ESS"); //claimant
		// 		}
		// 		//commented the below code as Super Admin basically Matrix admin will be derived from Approver matrix and not from IAS 
		// 		//	Check for SUPER ADMIN role
		// 		// for (var i = 0; i < oRetData.userDetails[0].groups.length; i++) {
		// 		// 	var oGroups = oRetData.userDetails[0].groups[i];
		// 		// 	if (oGroups.value === "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
		// 		// 		this.AppModel.setProperty("/userRoleGrp", oGroups.value); //Super Admin
		// 		// 		break;
		// 		// 	}
		// 		// }

		// 		this._fnLoadMetaData();

		// 	}.bind(this));

		// },

		onLoadInitialServices: function () {
			var oUtilModel = this.getOwnerComponent().getModel(),
				oCatalogModel = this.getOwnerComponent().getModel("Catalog"),
				oUserServicePromises = new Promise(function (resolve, reject) {
					oUtilModel.metadataLoaded().then(function () {
						this.getUserDetails(resolve, reject);
					}.bind(this));
				}.bind(this));
			oUserServicePromises.then(function (resolve, reject) {
				oCatalogModel.metadataLoaded().then(function () {
					this.handleValueHelpStatus();
					var noSearchHelpPopUp = 'Y';
					this.handleValueHelpUlu(noSearchHelpPopUp);
					this.handleValueHelpFdlu(noSearchHelpPopUp);
					this.handleValueHelpRequestId();
					this.handleValueHelpStaffId();
				}.bind(this));
			}.bind(this));
		},

		getUserDetails: function (resolve, reject) {
			var oUtilModel = this.getOwnerComponent().getModel();
			oUtilModel.read("/getUserDetails", {
				success: function (oRetData) {
					this.AppModel.setProperty("/claimAuthorizations", oRetData.getUserDetails.staffInfo.claimAuthorizations);
					this.AppModel.setProperty("/approverMatrix", oRetData.getUserDetails.staffInfo.approverMatrix);
					var aListOfGroups = [];
					if (oRetData.getUserDetails.staffInfo.approverMatrix.length) {
						for (var i = 0; i < oRetData.getUserDetails.staffInfo.approverMatrix.length; i++) {
							//addition of code to incorporate Super Admin as well from Approver matrix
							if (oRetData.getUserDetails.staffInfo.approverMatrix[i].STAFF_USER_GRP === 'MATRIX_ADMIN' &&
								oRetData.getUserDetails.staffInfo.approverMatrix[i].PROCESS_CODE === '100') {
								this.AppModel.setProperty("/userRoleGrp", 'NUS_CHRS_ECLAIMS_SUPER_ADMIN'); //Super Admin
							}
							//
							var oGroups = oRetData.getUserDetails.staffInfo.approverMatrix[i];
							if (aListOfGroups.indexOf(oGroups.STAFF_USER_GRP) < 0) {
								aListOfGroups.push(oGroups.STAFF_USER_GRP);
							}
						}
					} else {
						this.AppModel.setProperty("/userRole", "ESS"); // claimant 
						this.AppModel.setProperty("/userRoleGrp", "NUS_CHRS_ECLAIMS_ESS"); //claimant
					}
					resolve();
				}.bind(this), error: function (oError) {
					reject();
				}
			});
		},
		//////////////////////////////////////////////////////////////////////////////////////////		
		//new logic for the reports
		//////////////////////////////////////////////////////////////////////////////////////////

		//value help for Claim No.
		handleValueHelpRequestId: function (oEvent) {
			var oDataModel = this.getOwnerComponent().getModel("Catalog");
			var aFilter = [];
			var orFilter = [];
			var andFilter = [];

			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");

				if (claimAuthorizations) {
					for (var i = 0; i < claimAuthorizations.length; i++) {
						andFilter = [];
						andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, claimAuthorizations[i].ULU_C));
						andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, claimAuthorizations[i].FDLU_C));
						orFilter.push(new sap.ui.model.Filter(andFilter, true));
					}
					aFilter.push(new sap.ui.model.Filter(orFilter, false));
				}
			}

			aFilter.push(new sap.ui.model.Filter("REQUEST_STATUS", sap.ui.model.FilterOperator.NE, '01'));

			// var uluList = this.AppModel.getProperty("/claimRequest/UluList");
			// if (uluList) {
			// 	for (var i = 0; i < uluList.length; i++) {
			// 		andFilter = [];
			// 		andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, uluList[i].ULU_C));
			// 		andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, uluList[i].FDLU_C));
			// 		orFilter.push(new sap.ui.model.Filter(andFilter, true));
			// 	}
			// 	aFilter.push(new sap.ui.model.Filter(orFilter, false));
			//}

			//var filters = this.generateFilter('CLAIM_TYPE_C', '1', sap.ui.model.FilterOperator.StartsWith);
			if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN" || (!!claimAuthorizations && claimAuthorizations.length > 0)) {
				var that = this;
				oDataModel.read("/eclaims_data", {
					//select: "REQUEST_ID",
					//parameters: {select: "REQUEST_ID"}
					filters: aFilter,
					urlParameters: {
						"$select": "REQUEST_ID"
					},
					success: function (oData) {
						if (oData) {

							//	that.AppModel.setProperty("/claimRequest/claimsList", oData.getProperty("/"));
							that.AppModel.setProperty("/claimRequest/ClaimNoList", oData.results);
							that.AppModel.setProperty("/claimRequest/originalClaimNoList", oData.results);
						}
					},
					error: function (oError) {

					}
				});
			}
		},

		openClaimNoValueHelpPopUp: function () {
			var claimNoList = this.AppModel.getProperty("/claimRequest/originalClaimNoList");
			this.AppModel.setProperty("/claimRequest/ClaimNoList", claimNoList);
			var oView = this.getView();
			if (!this._oDialogAddRequestId) {
				this._oDialogAddRequestId = Fragment.load({
					id: oView.getId(),
					name: "nus.edu.sg.pttdetailedreport.fragment.RequestIdValueHelpDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._oDialogAddRequestId.then(function (oDialog) {
				oDialog.setRememberSelections(false);
				oDialog.open();
			});
		},

		handleSelectionFinishClaimNo: function (oEvent) {
			var selectedItemsClaimNo = oEvent.getParameter("selectedItems");
			this.AppModel.setProperty("/claimRequest/selectedItemsClaimNo", selectedItemsClaimNo);
		},

		handleConfirmRequestId: function (oEvent) {
			this.getUIControl("inpClaimNoValueHelp").removeAllTokens();
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				for (var i = 0; i < aContexts.length; i++) {
					var sPath = aContexts[i].getPath();
					var objSelectedRequestId = this.AppModel.getProperty(sPath);
					this.getUIControl("inpClaimNoValueHelp").addToken(new Token({
						//text: oItem.getTitle()
						text: objSelectedRequestId.REQUEST_ID,
						key: objSelectedRequestId.REQUEST_ID
					}));
				}
			}
		},

		handleSearchRequestId: function (oEvent) {

			var oDataModel = this.getOwnerComponent().getModel("Catalog");
			//var uluFdluFilter;// = [];
			var orFilter = [];
			var andFilter = [];
			//var consolidatedUluFdluFilter;
			// var uluFilter;
			// var fdluFilter;
			var sValue = oEvent.getParameter("value").toString();
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
				if (claimAuthorizations) {
					for (var i = 0; i < claimAuthorizations.length; i++) {
						andFilter = [];
						andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, claimAuthorizations[i].ULU_C));
						andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, claimAuthorizations[i].FDLU_C));
						orFilter.push(new sap.ui.model.Filter(andFilter, true));
						// var uluFilter = new sap.ui.model.Filter("ULU_C", FilterOperator.EQ, claimAuthorizations[i].ULU_C);
						// var fdluFilter = new sap.ui.model.Filter("FDLU_C", FilterOperator.EQ, claimAuthorizations[i].FDLU_C);
						// var newUluFdluFilter = new Filter({
						// 	filters: [uluFilter, fdluFilter],
						// 	and: true
						//	});

						// consolidatedUluFdluFilter = new Filter({
						// 	filters: [newUluFdluFilter, consolidatedUluFdluFilter],
						// 	and: false
						// });
					}
				}
				var uluFdluFilter = new Filter({
					filters: orFilter,
					and: false
				});
				//	uluFdluFilter.push(new sap.ui.model.Filter(orFilter, false));
				//var uluFdluFilter = 

			}
			//		}
			var filterRequestId = new sap.ui.model.Filter("REQUEST_ID", sap.ui.model.FilterOperator.Contains, sValue);
			// var filterStaffName = new sap.ui.model.Filter("FULL_NM", sap.ui.model.FilterOperator.Contains, sValue);
			//aFilter.push(new sap.ui.model.Filter("STATUS_CODE", sap.ui.model.FilterOperator.NE, '01'));

			// var filtersStaffGrp = new Filter({
			// 	filters: [filterRequestId],
			// 	and: false
			// });

			var filtersGrp; // = [];
			if (!!uluFdluFilter) {
				//var uluFdluFilter1 = uluFdluFilter;
				filtersGrp = new Filter({
					filters: [filterRequestId, uluFdluFilter],
					and: true
				});
			} else {
				filtersGrp = filterRequestId;
			}

			if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN" || (!!claimAuthorizations && claimAuthorizations.length > 0)) {
				var that = this;

				oDataModel.read("/eclaims_data", {
					filters: [filtersGrp],
					urlParameters: {
						"$select": "REQUEST_ID"
					},
					success: function (oData) {
						//  
						if (oData) {
							that.AppModel.setProperty("/claimRequest/ClaimNoList", oData.results);

						}
					},
					error: function (oError) {

					}
				});
			}
		},

		//value help for ULU 
		handleValueHelpUlu: function (NoSearchHelpPopUp) {

			var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
			// if (claimAuthorizations.length === 1) {
			// 	this.AppModel.setProperty("/uluSelected", claimAuthorizations[0].ULU_T);
			// 	this.AppModel.setProperty("/fdluSelected", claimAuthorizations[0].FDLU_T);
			// 	this.AppModel.setProperty("/uluSelectedCode", claimAuthorizations[0].ULU_C);
			// 	this.AppModel.setProperty("/fdluSelectedCode", claimAuthorizations[0].FDLU_C);
			// }
			var uluList = [];
			var isUluRepeated;

			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var oDataModel = this.getOwnerComponent().getModel();
				var aFilters = [];

				var that = this;
				oDataModel.read("/CHRS_JOB_INFO", {

					filters: aFilters,
					success: function (oData) {
						if (oData) {

							//	that.AppModel.setProperty("/claimRequest/claimsList", oData.getProperty("/"));
							that.AppModel.setProperty("/claimAuthorizations", oData.results);
							for (var i = 0; i < oData.results.length; i++) {
								var item = oData.results[i];
								var uluListItem = {};
								if (item.ULU_C === '') {
									continue;
								}
								uluListItem.ULU_C = item.ULU_C;
								uluListItem.ULU_T = item.ULU_T;
								uluListItem.FDLU_C = item.FDLU_C;
								uluListItem.FDLU_T = item.FDLU_T;
								isUluRepeated = '';
								if (i > 0) {
									for (var j = 0; j < uluList.length; j++) {
										if (item.ULU_C === uluList[j].ULU_C) {
											isUluRepeated = 'Y';
											break;
										}
									}
									if (isUluRepeated !== 'Y') {
										uluList.push(uluListItem);
										//	break;
									}
									//}
								} else {
									uluList.push(uluListItem);
								}
							}

							that.AppModel.setProperty("/claimRequest/UluList", uluList);
						}

						if (NoSearchHelpPopUp !== 'Y') {
							var oView = that.getView();
							if (!that._oDialogAddUlu) {
								that._oDialogAddUlu = Fragment.load({
									id: oView.getId(),
									name: "nus.edu.sg.pttdetailedreport.fragment.UluValueHelpDialog",
									controller: that
								}).then(function (oDialog) {
									oView.addDependent(oDialog);
									return oDialog;
								});
							}

							that._oDialogAddUlu.then(function (oDialog) {
								oDialog.setRememberSelections(true);
								oDialog.open();
							}.bind(this));
						}
					},
					error: function (oError) {

					}
				});
			} else {
				for (var i = 0; i < claimAuthorizations.length; i++) {
					var item = claimAuthorizations[i];
					var uluListItem = {};
					uluListItem.ULU_C = item.ULU_C;
					uluListItem.ULU_T = item.ULU_T;
					uluListItem.FDLU_C = item.FDLU_C;
					uluListItem.FDLU_T = item.FDLU_T;
					isUluRepeated = '';
					if (i > 0) {
						for (var j = 0; j < uluList.length; j++) {
							if (item.ULU_C === uluList[j].ULU_C) {
								isUluRepeated = 'Y';
								break;
							}
							/*		else {
										break;
									}*/
						}
						if (isUluRepeated !== 'Y') {
							uluList.push(uluListItem);
							//	break;
						}
						//}
					} else {
						uluList.push(uluListItem);
					}
				}

				this.AppModel.setProperty("/claimRequest/UluList", uluList);
				if (NoSearchHelpPopUp !== 'Y') {
					var oView = this.getView();
					if (!this._oDialogAddUlu) {
						this._oDialogAddUlu = Fragment.load({
							id: oView.getId(),
							name: "nus.edu.sg.pttdetailedreport.fragment.UluValueHelpDialog",
							controller: this
						}).then(function (oDialog) {
							oView.addDependent(oDialog);
							return oDialog;
						});
					}

					this._oDialogAddUlu.then(function (oDialog) {
						oDialog.setRememberSelections(false);
						oDialog.open();
					}.bind(this));
				}
			}
		},

		handleConfirmUlu: function (oEvent) {
			this.getUIControl("inpUluValueHelp").removeAllTokens();
			this.getUIControl("inpFdluValueHelp").removeAllTokens();
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				for (var i = 0; i < aContexts.length; i++) {
					var sPath = aContexts[i].getPath();
					var objSelectedUlu = this.AppModel.getProperty(sPath);
					this.getUIControl("inpUluValueHelp").addToken(new Token({
						//text: oItem.getTitle()
						text: objSelectedUlu.ULU_T,
						key: objSelectedUlu.ULU_C
					}));
				}
			}
		},

		handleSearchUlu: function (oEvent) {
			var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
			var uluList = [];
			var isUluRepeated;
			var sValue = oEvent.getParameter("value").toString();
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin

			if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var oDataModel = this.getOwnerComponent().getModel();
				var filterUluCode = new sap.ui.model.Filter("ULU_C", sap.ui.model.FilterOperator.Contains, sValue);
				var filterUluName = new sap.ui.model.Filter("ULU_T", sap.ui.model.FilterOperator.Contains, sValue);
				var filtersUluGrp = new Filter({
					filters: [filterUluCode, filterUluName],
					and: false
				});
				//var aFilters = [];

				var that = this;
				oDataModel.read("/CHRS_JOB_INFO", {

					filters: [filtersUluGrp],
					success: function (oData) {
						if (oData) {

							//	that.AppModel.setProperty("/claimRequest/claimsList", oData.getProperty("/"));
							that.AppModel.setProperty("/claimAuthorizations", oData.results);
							for (var i = 0; i < oData.results.length; i++) {
								var item = oData.results[i];
								var uluListItem = {};
								if (item.ULU_C === '') {
									continue;
								}
								uluListItem.ULU_C = item.ULU_C;
								uluListItem.ULU_T = item.ULU_T;
								uluListItem.FDLU_C = item.FDLU_C;
								uluListItem.FDLU_T = item.FDLU_T;
								isUluRepeated = '';
								if (i > 0) {
									for (var j = 0; j < uluList.length; j++) {
										if (item.ULU_C === uluList[j].ULU_C) {
											isUluRepeated = 'Y';
											break;
										}
									}
									if (isUluRepeated !== 'Y') {
										uluList.push(uluListItem);
										//	break;
									}
									//}
								} else {
									uluList.push(uluListItem);
								}
							}

							that.AppModel.setProperty("/claimRequest/UluList", uluList);
						}

						//		if (NoSearchHelpPopUp !== 'Y') {
						var oView = that.getView();
						if (!that._oDialogAddUlu) {
							that._oDialogAddUlu = Fragment.load({
								id: oView.getId(),
								name: "nus.edu.sg.pttdetailedreport.fragment.UluValueHelpDialog",
								controller: that
							}).then(function (oDialog) {
								oView.addDependent(oDialog);
								return oDialog;
							});
						}

						that._oDialogAddUlu.then(function (oDialog) {
							oDialog.setRememberSelections(true);
							oDialog.open();
						}.bind(this));
						//		}
					},
					error: function (oError) {

					}
				});
			} else {
				for (var i = 0; i < claimAuthorizations.length; i++) {
					var item = claimAuthorizations[i];
					var uluListItem = {};
					uluListItem.ULU_C = item.ULU_C;
					uluListItem.ULU_T = item.ULU_T;
					uluListItem.FDLU_C = item.FDLU_C;
					uluListItem.FDLU_T = item.FDLU_T;
					isUluRepeated = '';
					if (i > 0) {
						for (var j = 0; j < uluList.length; j++) {
							if (item.ULU_C === uluList[j].ULU_C) {
								isUluRepeated = 'Y';
								break;
							}
							/*		else {
										break;
									}*/
						}
						if (isUluRepeated !== 'Y' && (!!item.ULU_C.match(sValue) || !!item.ULU_T.match(sValue))) {
							uluList.push(uluListItem);
							//	break;
						}
						//}
					} else if (!!item.ULU_C.match(sValue) || !!item.ULU_T.match(sValue)) {
						uluList.push(uluListItem);
					}
				}

				this.AppModel.setProperty("/claimRequest/UluList", uluList);
				if (NoSearchHelpPopUp !== 'Y') {
					var oView = this.getView();
					if (!this._oDialogAddUlu) {
						this._oDialogAddUlu = Fragment.load({
							id: oView.getId(),
							name: "nus.edu.sg.pttdetailedreport.fragment.UluValueHelpDialog",
							controller: this
						}).then(function (oDialog) {
							oView.addDependent(oDialog);
							return oDialog;
						});
					}

					this._oDialogAddUlu.then(function (oDialog) {
						oDialog.setRememberSelections(true);
						oDialog.open();
					}.bind(this));
				}
			}
		},

		handleValueHelpFdlu: function (NoSearchHelpPopUp) {

			var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
			var selectedItemsUlu = this.getUIControl("inpUluValueHelp").getTokens();
			// if (claimAuthorizations.length === 1) {
			// 	this.AppModel.setProperty("/uluSelected", claimAuthorizations[0].ULU_T);
			// 	this.AppModel.setProperty("/fdluSelected", claimAuthorizations[0].FDLU_T);
			// 	this.AppModel.setProperty("/uluSelectedCode", claimAuthorizations[0].ULU_C);
			// 	this.AppModel.setProperty("/fdluSelectedCode", claimAuthorizations[0].FDLU_C);
			// }
			var fdluList = [];
			if (!!!selectedItemsUlu) {
				for (var i = 0; i < claimAuthorizations.length; i++) {
					var item = claimAuthorizations[i];
					var fdluListItem = {};
					fdluListItem.FDLU_C = item.FDLU_C;
					fdluListItem.FDLU_T = item.FDLU_T;
					if (i > 0) {
						for (var j = 0; j < fdluList.length; j++) {
							if (item.FDLU_C !== fdluList[j].FDLU_C) {
								fdluList.push(fdluListItem);
								break;
							} else {
								break;
							}
						}
					} else {
						fdluList.push(fdluListItem);
					}
				}
			} else if (selectedItemsUlu.length > 0) {
				for (var i = 0; i < claimAuthorizations.length; i++) {
					var item = claimAuthorizations[i];
					var fdluListItem = {};
					for (var j = 0; j < selectedItemsUlu.length; j++) {
						if (item.ULU_C === selectedItemsUlu[j].getProperty("key")) {
							fdluListItem.FDLU_C = item.FDLU_C;
							fdluListItem.FDLU_T = item.FDLU_T;
							// fdluListItem.ULU_C = item.ULU_C;
							// fdluListItem.ULU_T = item.ULU_T;
							if (!!!fdluList) {
								fdluList.push(fdluListItem);
							} else if (fdluList.length === 0) {
								fdluList.push(fdluListItem);
							} else {
								for (var k = 0; k < fdluList.length; k++) {
									if (item.FDLU_C !== fdluList[k].FDLU_C) {
										fdluList.push(fdluListItem);
										break;
									} else {
										break;
									}
								}
							}
						}
					}
				}
			} else {
				for (var i = 0; i < claimAuthorizations.length; i++) {
					var item = claimAuthorizations[i];
					var fdluListItem = {};
					fdluListItem.FDLU_C = item.FDLU_C;
					fdluListItem.FDLU_T = item.FDLU_T;
					if (i > 0) {
						for (var j = 0; j < fdluList.length; j++) {
							if (item.FDLU_C !== fdluList[j].FDLU_C) {
								fdluList.push(fdluListItem);
								break;
							} else {
								break;
							}
						}
					} else {
						fdluList.push(fdluListItem);
					}
				}
			}
			this.AppModel.setProperty("/claimRequest/FdluList", fdluList);

			if (NoSearchHelpPopUp !== 'Y') {
				var oView = this.getView();
				if (!this._oDialogAddFdlu) {
					this._oDialogAddFdlu = Fragment.load({
						id: oView.getId(),
						name: "nus.edu.sg.pttdetailedreport.fragment.FdluValueHelpDialog",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}

				this._oDialogAddFdlu.then(function (oDialog) {
					oDialog.setRememberSelections(false);
					oDialog.open();
				}.bind(this));
			}

		},

		handleConfirmFdlu: function (oEvent) {

			this.getUIControl("inpFdluValueHelp").removeAllTokens();
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				for (var i = 0; i < aContexts.length; i++) {
					var sPath = aContexts[i].getPath();
					var objSelectedFdlu = this.AppModel.getProperty(sPath);
					this.getUIControl("inpFdluValueHelp").addToken(new Token({
						//text: oItem.getTitle()
						text: objSelectedFdlu.FDLU_T,
						key: objSelectedFdlu.FDLU_C
					}));
				}
			}
		},

		handleSearchFdlu: function (oEvent, NoSearchHelpPopUp) {

			var sValue = oEvent.getParameter("value").toString();
			var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
			var selectedItemsUlu = this.getUIControl("inpUluValueHelp").getTokens();
			// if (claimAuthorizations.length === 1) {
			// 	this.AppModel.setProperty("/uluSelected", claimAuthorizations[0].ULU_T);
			// 	this.AppModel.setProperty("/fdluSelected", claimAuthorizations[0].FDLU_T);
			// 	this.AppModel.setProperty("/uluSelectedCode", claimAuthorizations[0].ULU_C);
			// 	this.AppModel.setProperty("/fdluSelectedCode", claimAuthorizations[0].FDLU_C);
			// }
			var fdluList = [];
			if (!!!selectedItemsUlu) {
				for (var i = 0; i < claimAuthorizations.length; i++) {
					var item = claimAuthorizations[i];
					var fdluListItem = {};
					fdluListItem.FDLU_C = item.FDLU_C;
					fdluListItem.FDLU_T = item.FDLU_T;
					if (!!fdluList.length > 0) {
						for (var j = 0; j < fdluList.length; j++) {
							if (item.FDLU_C !== fdluList[j].FDLU_C && (!!item.FDLU_C.match(sValue) || !!item.FDLU_T.match(sValue))) {
								fdluList.push(fdluListItem);
								break;
							} else {
								break;
							}
						}
					} else if (!!item.FDLU_C.match(sValue) || !!item.FDLU_T.match(sValue)) {
						fdluList.push(fdluListItem);
					}
				}
			} else if (selectedItemsUlu.length > 0) {
				for (var i = 0; i < claimAuthorizations.length; i++) {
					var item = claimAuthorizations[i];
					var fdluListItem = {};
					for (var j = 0; j < selectedItemsUlu.length; j++) {
						if (item.ULU_C === selectedItemsUlu[j].getProperty("key")) {
							fdluListItem.FDLU_C = item.FDLU_C;
							fdluListItem.FDLU_T = item.FDLU_T;
							// fdluListItem.ULU_C = item.ULU_C;
							// fdluListItem.ULU_T = item.ULU_T;
							if (!!!fdluList && (!!item.FDLU_C.match(sValue) || !!item.FDLU_T.match(sValue))) {
								fdluList.push(fdluListItem);
							} else if (fdluList.length === 0 && (!!item.FDLU_C.match(sValue) || !!item.FDLU_T.match(sValue))) {
								fdluList.push(fdluListItem);
							} else {
								for (var k = 0; k < fdluList.length; k++) {
									if (item.FDLU_C !== fdluList[k].FDLU_C && (!!item.FDLU_C.match(sValue) || !!item.FDLU_T.match(sValue))) {
										fdluList.push(fdluListItem);
										break;
									} else {
										break;
									}
								}
							}
						}
					}
				}
			} else {
				for (var i = 0; i < claimAuthorizations.length; i++) {
					var item = claimAuthorizations[i];
					var fdluListItem = {};
					fdluListItem.FDLU_C = item.FDLU_C;
					fdluListItem.FDLU_T = item.FDLU_T;
					if (!!fdluList.length > 0) {
						for (var j = 0; j < fdluList.length; j++) {
							if (item.FDLU_C !== fdluList[j].FDLU_C && (!!item.FDLU_C.match(sValue) || !!item.FDLU_T.match(sValue))) {
								fdluList.push(fdluListItem);
								break;
							} else {
								break;
							}
						}
					} else if (!!item.FDLU_C.match(sValue) || !!item.FDLU_T.match(sValue)) {
						fdluList.push(fdluListItem);
					}
				}
			}
			this.AppModel.setProperty("/claimRequest/FdluList", fdluList);

			if (NoSearchHelpPopUp !== 'Y') {
				var oView = this.getView();
				if (!this._oDialogAddFdlu) {
					this._oDialogAddFdlu = Fragment.load({
						id: oView.getId(),
						name: "nus.edu.sg.pttdetailedreport.fragment.FdluValueHelpDialog",
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}

				this._oDialogAddFdlu.then(function (oDialog) {
					oDialog.setRememberSelections(false);
					oDialog.open();
				}.bind(this));
			}

		},

		handleSelectionFinishFdlu: function (oEvent) {

			var selectedItems = oEvent.getParameter("selectedItems");
			this.AppModel.setProperty("/claimRequest/selectedItemsFdlu", selectedItems);
		},

		handleConfirmUluFdlu: function (oEvent) {

			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var sPath = aContexts[0].getPath();
				var objSelectedUluFdlu = this.AppModel.getProperty(sPath);

				var objUluFdlu = {
					"ULU": objSelectedUluFdlu.ULU_T,
					"FDLU": objSelectedUluFdlu.FDLU_T
				};
				this.AppModel.setProperty("/uluSelected", objSelectedUluFdlu.ULU_T);
				this.AppModel.setProperty("/fdluSelected", objSelectedUluFdlu.FDLU_T);
				this.AppModel.setProperty("/uluSelectedCode", objSelectedUluFdlu.ULU_C);
				this.AppModel.setProperty("/fdluSelectedCode", objSelectedUluFdlu.FDLU_C);

			}
		},

		handleValueHelpStatus: function (oEvent) {
		
			var oDataModel = this.getOwnerComponent().getModel("Catalog");
			var aFilters = [];

			aFilters.push(new sap.ui.model.Filter("STATUS_TYPE", sap.ui.model.FilterOperator.EQ, 'ECLAIMS'));
			aFilters.push(new sap.ui.model.Filter("STATUS_CODE", sap.ui.model.FilterOperator.NE, '01'));
			//var filters = this.generateFilter('CLAIM_TYPE_C', '1', sap.ui.model.FilterOperator.StartsWith);

			var that = this;
			oDataModel.read("/statusconfig_data", {

				filters: aFilters,
				success: function (oData) {
					if (oData) {
					//	that.AppModel.setProperty("/claimRequest/statusList", oData.results);
						//to remove duplicate status description
						var aStatusDescListSet = [];
						if (oData.results && oData.results.length) {
							for (var i = 0; i < oData.results.length; i++) {
								var statusDescListSetItem = {};
								var statusDescDuplicate = undefined;
								statusDescListSetItem.STATUS_ALIAS = oData.results[i].STATUS_ALIAS;
								if (i === 0) {
									aStatusDescListSet.push(statusDescListSetItem);
								} else {
									// var statusDescDuplicate;
									for (var k = 0; k < aStatusDescListSet.length; k++) {
										if (statusDescListSetItem.STATUS_ALIAS === aStatusDescListSet[k].STATUS_ALIAS) {
											statusDescDuplicate = 'Y';
											break;
										}
									}
									if (!statusDescDuplicate) {
										aStatusDescListSet.push(statusDescListSetItem);
									}
								}
							}
						}
						that.AppModel.setProperty("/claimRequest/statusList", aStatusDescListSet);
						that.AppModel.setProperty("/claimRequest/fullStatusList", oData.results);
					}
				},
				error: function (oError) {

				}
			});
		},

		handleSelectionFinishClaimStatus: function (oEvent) {

			var selectedItems = oEvent.getParameter("selectedItems");
			this.AppModel.setProperty("/claimRequest/selectedItemsClaimStatus", selectedItems);
		},

		handleConfirmStatus: function (oEvent) {

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var sPath = aContexts[0].getPath();
				var objSelectedStatus = this.AppModel.getProperty(sPath);

				var objStatus = {
					"STATUS_CODE": objSelectedStatus.STATUS_CODE,
					"STATUS_ALIAS": objSelectedStatus.STATUS_ALIAS
				};
				this.AppModel.setProperty("/statusCode", objSelectedStatus.STATUS_CODE);
				this.AppModel.setProperty("/status", objSelectedStatus.STATUS_ALIAS);

			}

		},

		handleSearchStatus: function (oEvent) {

		},

		// handleValueHelpStaffId: function (oEvent) {

		// 	var oView = this.getView();
		// 	//var oButton = oEvent.getSource();
		// 	var token = this.AppModel.getProperty("/token");
		// 	//var EclaimSrvModel = this.getComponentModel("EclaimSrvModel");
		// 	//var filters = [];
		// 	var oHeaders = {
		// 		"Accept": "application/json",
		// 		"Authorization": "Bearer" + " " + token,
		// 		"Content-Type": "application/json"
		// 	};
		// 	var ulu;
		// 	var fdlu;
		// 	var uluList = this.AppModel.getProperty("/claimRequest/UluList");
		// 	if (uluList) {
		// 		for (var i = 0; i < uluList.length; i++) {
		// 			//	if (i === 2) {
		// 			ulu = uluList[i].ULU_C;
		// 			fdlu = uluList[i].FDLU_C;
		// 			//		break;
		// 			//}
		// 			//orFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, uluList[i].ULU_C));
		// 		}
		// 	}

		// 	var claimType = this.AppModel.getProperty("/claimTypeCode");
		// 	claimType = '101'; //'PTT'

		// 	var period = 'NA';
		// 	//	var url = "/rest/eclaims/fetchClaimTypes?staffId=" + staffId + "&userGroup=" + userGroup;
		// 	var url = "/rest/eclaims/caStaffLookup?ulu=" + ulu + "&fdlu=" + fdlu + "&claimType=" + claimType + "&period=" + period;
		// 	var saveObj = {};
		// 	var staffLookUpModel = new JSONModel();
		// 	staffLookUpModel.loadData(url, null, false, "GET", null, null, oHeaders);
		// 	this.AppModel.setProperty("/claimRequest/StaffIdList", staffLookUpModel.getData());
		// },

		handleSelectionFinishStaffId: function (oEvent) {

			var selectedItemsStaffId = oEvent.getParameter("selectedItems");
			this.AppModel.setProperty("/claimRequest/selectedItemsStaffId", selectedItemsStaffId);
		},

		handleValueHelpStaffId: function (oEvent) {
			var oDataModel = this.getOwnerComponent().getModel();
			//var aFilters = [];
			var aFilter = [];
			var orFilter = [];
			var andFilter = [];

			//	var uluList = this.AppModel.getProperty("/claimRequest/UluList");
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {

				var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
				//	var uluList = this.AppModel.getProperty("/claimRequest/UluList");
				if (claimAuthorizations) {
					for (var i = 0; i < claimAuthorizations.length; i++) {
						andFilter = [];
						andFilter.push(new sap.ui.model.Filter("ULU_C", FilterOperator.EQ, claimAuthorizations[i].ULU_C));
						andFilter.push(new sap.ui.model.Filter("FDLU_C", FilterOperator.EQ, claimAuthorizations[i].FDLU_C));
						orFilter.push(new sap.ui.model.Filter(andFilter, true));
					}
					aFilter.push(new sap.ui.model.Filter(orFilter, false));
				}
			}

			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN" || (!!claimAuthorizations && claimAuthorizations.length > 0)) {
				var that = this;
				this.showBusyIndicator();
				oDataModel.read("/CHRS_JOB_INFO", {
					filters: aFilter,
					urlParameters: {
						"$select": "STF_NUMBER,FULL_NM"
					},
					success: function (oData) {
						if (oData) {

							that.AppModel.setProperty("/claimRequest/staffLength", oData.results.length);
							that.AppModel.setProperty("/claimRequest/StaffIdList", oData.results);
							that.AppModel.setProperty("/claimRequest/originalStaffIdList", oData.results);
							// var oView = that.getView();
							// if (!that._oDialogAddStaff) {
							// 	that._oDialogAddStaff = Fragment.load({
							// 		id: oView.getId(),
							// 		name: "nus.edu.sg.pttdetailedreport.fragment.StaffValueHelpDialog",
							// 		controller: that
							// 	}).then(function (oDialog) {
							// 		oView.addDependent(oDialog);
							// 		return oDialog;
							// 	});
							// }

							// that._oDialogAddStaff.then(function (oDialog) {
							// 	oDialog.setRememberSelections(true);
							// 	oDialog.open();
							// }.bind(this));
							that.hideBusyIndicator();
						}
					},
					error: function (oError) {
						that.hideBusyIndicator();
					}

				});

				//	this.hideBusyIndicator();
			}
			// else {
			// 	MessageBox.error("No ULU and FDLU assigned in the approver matrix for the logged in user");
			// }
		},

		openStaffIdValueHelpPopUp: function () {
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var staffIdlist = this.AppModel.getProperty("/claimRequest/originalStaffIdList");
				this.AppModel.setProperty("/claimRequest/StaffIdList", staffIdlist);
			} else {
				this.AppModel.setProperty("/claimRequest/StaffIdList", []);
			}
			var oView = this.getView();
			if (!this._oDialogAddStaff) {
				this._oDialogAddStaff = Fragment.load({
					id: oView.getId(),
					name: "nus.edu.sg.pttdetailedreport.fragment.StaffValueHelpDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._oDialogAddStaff.then(function (oDialog) {
				oDialog.setRememberSelections(false);
				oDialog.open();
			});
		},

		handleConfirmStaff: function (oEvent) {

			this.getUIControl("inpStaffValueHelp").removeAllTokens();
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				for (var i = 0; i < aContexts.length; i++) {
					var sPath = aContexts[i].getPath();
					var objSelectedStaff = this.AppModel.getProperty(sPath);
					this.getUIControl("inpStaffValueHelp").addToken(new Token({
						//text: oItem.getTitle()
						text: objSelectedStaff.FULL_NM,
						key: objSelectedStaff.STF_NUMBER
					}));
					// var objStaff = {
					// 	"STAFF_ID": objSelectedStaff.STF_NUMBER,
					// 	// "NUSNET_ID": objSelectedStaff.NUSNET_ID,
					// 	// "ULU": objSelectedStaff.ULU_C,
					// 	// "FDLU": objSelectedStaff.FDLU_C,
					// 	"STAFF_FULL_NAME": objSelectedStaff.FULL_NM
					// };

					// this.AppModel.setProperty("/claimRequest/submittedByName", objSelectedStaff.FULL_NM);
					// this.AppModel.setProperty("/claimRequest/submittedById", objSelectedStaff.STF_NUMBER);
					//					this._fnAddToken(this.getUIControl("inpStaffValueHelp"), objSelectedStaff.STF_NUMBER, objSelectedStaff.FULL_NM);
				}
			}

			// 			var aSelectedItems = oEvent.getParameter("selectedItems"),
			// 				oMultiInput = this.getUIControl("inpStaffValueHelp");

			// 			if (aSelectedItems && aSelectedItems.length > 0) {
			// 				aSelectedItems.forEach(function (oItem) {
			// 					var sPath = oItem.getBindingContextPath();
			// 					var objSelectedStaff = this.AppModel.getProperty(sPath);
			// /*					oMultiInput.addToken(new Token({
			// 						//text: oItem.getTitle()
			// 					}));*/
			// this._fnAddToken(this.getUIControl("inpStaffValueHelp"), objSelectedStaff.STF_NUMBER, objSelectedStaff.FULL_NM);					
			// 				});
			//	}			
		},

		handleSearchStaff: function (oEvent) {

			var oDataModel = this.getOwnerComponent().getModel("EclaimSrvModel");
			//var uluFdluFilter;// = [];
			var orFilter = [];
			var andFilter = [];
			//var consolidatedUluFdluFilter;
			// var uluFilter;
			// var fdluFilter;
			var sValue = oEvent.getParameter("value").toString();
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
				if (claimAuthorizations) {
					for (var i = 0; i < claimAuthorizations.length; i++) {
						andFilter = [];
						andFilter.push(new sap.ui.model.Filter("ULU_C", FilterOperator.EQ, claimAuthorizations[i].ULU_C));
						andFilter.push(new sap.ui.model.Filter("FDLU_C", FilterOperator.EQ, claimAuthorizations[i].FDLU_C));
						orFilter.push(new sap.ui.model.Filter(andFilter, true));
						// var uluFilter = new sap.ui.model.Filter("ULU_C", FilterOperator.EQ, claimAuthorizations[i].ULU_C);
						// var fdluFilter = new sap.ui.model.Filter("FDLU_C", FilterOperator.EQ, claimAuthorizations[i].FDLU_C);
						// var newUluFdluFilter = new Filter({
						// 	filters: [uluFilter, fdluFilter],
						// 	and: true
						//	});

						// consolidatedUluFdluFilter = new Filter({
						// 	filters: [newUluFdluFilter, consolidatedUluFdluFilter],
						// 	and: false
						// });
					}
				}
				var uluFdluFilter = new Filter({
					filters: orFilter,
					and: false
				});
				//	uluFdluFilter.push(new sap.ui.model.Filter(orFilter, false));
				//var uluFdluFilter = 

			}
			//		}
			var filterStaffId = new sap.ui.model.Filter("STF_NUMBER", sap.ui.model.FilterOperator.Contains, sValue);
			var filterStaffName = new sap.ui.model.Filter("FULL_NM", sap.ui.model.FilterOperator.Contains, sValue);

			var filtersStaffGrp = new Filter({
				filters: [filterStaffId, filterStaffName],
				and: false
			});

			var filtersGrp; // = [];
			if (!!uluFdluFilter) {
				//var uluFdluFilter1 = uluFdluFilter;
				filtersGrp = new Filter({
					filters: [filtersStaffGrp, uluFdluFilter],
					and: true
				});
			} else {
				filtersGrp = filtersStaffGrp;
			}

			if (sValue && (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN" || (!!claimAuthorizations && claimAuthorizations.length > 0))) {
				var that = this;

				oDataModel.read("/ChrsJobInfos", {
					filters: [filtersGrp],
					urlParameters: {
						"$select": "STF_NUMBER,FULL_NM"
					},
					success: function (oData) {
						//  
						if (oData) {
							that.AppModel.setProperty("/claimRequest/StaffIdList", oData.results);

						}
					},
					error: function (oError) {

					}
				});
			} else if (!sValue && userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				this.AppModel.setProperty("/claimRequest/StaffIdList", []);
			} else if (!sValue && userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var staffIdlist = this.AppModel.getProperty("/claimRequest/originalStaffIdList");
				this.AppModel.setProperty("/claimRequest/StaffIdList", staffIdlist);
			}
		},

		onTokenUpdateStaff: function (oEvent) {

			if (oEvent.getParameter("type") === "removed") {
				this.AppModel.setProperty("/claimRequest/submittedByName", "");
				this.AppModel.setProperty("/claimRequest/submittedById", "");
			}
		},

		handleValueHelpPeriod: function (oEvent) {
			var currentDate = new Date();
			var currentYear = currentDate.getFullYear();
			//var currentMonth = currentDate.getMonth();
			var monthListSet = [];

			for (var i = 0; i < 12; i++) {
				var monthListSetItem = {};

				// var currentMonthFirstDate = new Date(Number(currentYear), currentMonth, 1);
				// currentMonthFirstDate = Formatter.formatDateAsString(currentMonthFirstDate, "yyyy-MM-dd");
				// currentDate = Formatter.formatDateAsString(currentDate, "yyyy-MM-dd");
				var monthname = this.AppModel.getProperty("/monthNames")[i];
				monthListSetItem.monthCode = currentYear + '-' + (i + 1);
				monthListSetItem.monthName = monthname + ',' + ' ' + currentYear;
				monthListSet.push(monthListSetItem);
			}
			this.AppModel.setProperty("/monthList", monthListSet);
		},

		handleValueHelpVerifier: function (oEvent) {
			var oView = this.getView();
			var EclaimSrvModel = this.getComponentModel("Catalog");
			//	var ulu = this.AppModel.getProperty("/claimRequest/createClaimRequest/uluSelectedCode");
			//	var fdlu = this.AppModel.getProperty("/claimRequest/createClaimRequest/fdluSelectedCode");
			//var andFilter = [];
			var aFilter = [];
			var orFilter = [];
			var andFilter = [];

			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			//	var uluList = this.AppModel.getProperty("/claimRequest/UluList");
			//	var uluList = this.AppModel.getProperty("/claimRequest/UluList");
			// if (uluList) {
			// 	for (var i = 0; i < uluList.length; i++) {
			// 		andFilter = [];
			// 		andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, uluList[i].ULU_C));
			// 		andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, uluList[i].FDLU_C));
			// 		orFilter.push(new sap.ui.model.Filter(andFilter, true));
			// 	}
			// 	aFilter.push(new sap.ui.model.Filter(orFilter, false));
			// }
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");

				if (claimAuthorizations) {
					for (var i = 0; i < claimAuthorizations.length; i++) {
						andFilter = [];
						andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, claimAuthorizations[i].ULU_C));
						andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, claimAuthorizations[i].FDLU_C));
						orFilter.push(new sap.ui.model.Filter(andFilter, true));
					}
					aFilter.push(new sap.ui.model.Filter(orFilter, false));
				}
			}
			//Changed the STAFF_USER_GRP filter value from NUS_CHRS_ECLAIMS_VERIFIER to VERIFIER
			//andFilter.push(new sap.ui.model.Filter("STAFF_USER_GRP", FilterOperator.EQ, ['NUS_CHRS_ECLAIMS_VERIFIER']));
			aFilter.push(new sap.ui.model.Filter("STAFF_USER_GRP", FilterOperator.EQ, ['VERIFIER']));
			//add the check for validity 
			var currentDate = new Date();
			aFilter.push(new sap.ui.model.Filter("APM_VALID_FROM", FilterOperator.LE, currentDate.toISOString()));
			aFilter.push(new sap.ui.model.Filter("APM_VALID_TO", FilterOperator.GE, currentDate.toISOString()));
			//			
			//aFilter.push(new sap.ui.model.Filter("STAFF_USER_GRP", FilterOperator.EQ, ['VERIFIER']));
			// andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, ulu));
			// andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, fdlu));
			//aFilter.push(new sap.ui.model.Filter(andFilter, true));
			if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN" || (!!claimAuthorizations && claimAuthorizations.length > 0)) {
				EclaimSrvModel.read("/v_approval_maxtrix", {
					filters: aFilter,
					success: function (oData) {
						if (oData.results.length) {
							this.AppModel.setProperty("/Verifier", oData.results);
							if (!this._oDialogVerifer) {
								this._oDialogVerifer = Fragment.load({
									id: oView.getId(),
									name: "nus.edu.sg.pttdetailedreport.fragment.VerifierValueHelpDialog",
									controller: this
								}).then(function (oDialog) {
									oView.addDependent(oDialog);
									return oDialog;
								});
							}

							this._oDialogVerifer.then(function (oDialog) {
								oDialog.setRememberSelections(true);
								oDialog.open();
							}.bind(this));
						} else {

						}
					}.bind(this),
					error: function (oError) {

					}
				});
			}
		},

		handleConfirmVerifier: function (oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var sPath = aContexts[0].getPath();
				var objSelectedVerifier = this.AppModel.getProperty(sPath);
				var objVerifier = {
					"STAFF_ID": objSelectedVerifier.STAFF_ID,
					"NUSNET_ID": objSelectedVerifier.STAFF_NUSNET_ID,
					"ULU": objSelectedVerifier.ULU,
					"FDLU": objSelectedVerifier.FDLU,
					"STAFF_FULL_NAME": objSelectedVerifier.FULL_NM
				};

				//	this.AppModel.setProperty("/claimRequest/createClaimRequest/VERIFIER", [objVerifier]);
				this.AppModel.setProperty("/claimRequest/VERIFIER_STAFF_ID", objSelectedVerifier.STAFF_ID);
				this.AppModel.setProperty("/claimRequest/VERIFIER_NUSNET_ID", objSelectedVerifier.STAFF_NUSNET_ID);
				this.AppModel.setProperty("/claimRequest/VERIFIER_ULU", objSelectedVerifier.ULU);
				this.AppModel.setProperty("/claimRequest/VERIFIER_FDLU", objSelectedVerifier.FDLU);
				this.AppModel.setProperty("/claimRequest/VERIFIER_STAFF_FULL_NAME", objSelectedVerifier.FULL_NM);
				this._fnAddToken(this.getUIControl("inpVerifierValueHelp"), objSelectedVerifier.STAFF_NUSNET_ID, objSelectedVerifier.FULL_NM);
			}
		},

		_fnAddToken: function (oControl, sKey, sText) {
			oControl.setTokens([new sap.m.Token({
				text: sText,
				key: sKey
			})]);
		},

		onTokenUpdateVerifier: function (oEvent) {
			if (oEvent.getParameter("type") === "removed") {
				this.AppModel.setProperty("/claimRequest/VERIFIER_STAFF_ID", "");
				this.AppModel.setProperty("/claimRequest/VERIFIER_NUSNET_ID", "");
				this.AppModel.setProperty("/claimRequest/VERIFIER_ULU", "");
				this.AppModel.setProperty("/claimRequest/VERIFIER_FDLU", "");
				this.AppModel.setProperty("/claimRequest/VERIFIER_STAFF_FULL_NAME", "");
			}
		},

		handleSearchVerifier: function (oEvent) {

			var oDataModel = this.getOwnerComponent().getModel("Catalog");
			var orFilter = [];
			var andFilter = [];
			var sValue = oEvent.getParameter("value").toString();
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
				if (claimAuthorizations) {
					for (var i = 0; i < claimAuthorizations.length; i++) {
						andFilter = [];
						andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, claimAuthorizations[i].ULU_C));
						andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, claimAuthorizations[i].FDLU_C));
						orFilter.push(new sap.ui.model.Filter(andFilter, true));
					}
				}

				var uluFdluFilter = new Filter({
					filters: orFilter,
					and: false
				});
			}

			var filterStaffId = new sap.ui.model.Filter("STAFF_ID", sap.ui.model.FilterOperator.Contains, sValue);
			var filterStaffNusNetId = new sap.ui.model.Filter("STAFF_NUSNET_ID", sap.ui.model.FilterOperator.Contains, sValue);
			var filterUlu = new sap.ui.model.Filter("ULU", sap.ui.model.FilterOperator.Contains, sValue);
			var filterFdlu = new sap.ui.model.Filter("FDLU", sap.ui.model.FilterOperator.Contains, sValue);
			var filterStaffName = new sap.ui.model.Filter("FULL_NM", sap.ui.model.FilterOperator.Contains, sValue);

			var filtersApproverGrp = new Filter({
				filters: [filterStaffId, filterStaffNusNetId, filterUlu, filterFdlu, filterStaffName],
				and: false
			});

			var staffUserGroup = new sap.ui.model.Filter("STAFF_USER_GRP", FilterOperator.EQ, ['VERIFIER']);
			//add the check for validity 
			var currentDate = new Date();
			var validityFromFilter = new sap.ui.model.Filter("APM_VALID_FROM", FilterOperator.LE, currentDate.toISOString());
			var validityToFilter = new sap.ui.model.Filter("APM_VALID_TO", FilterOperator.GE, currentDate.toISOString());
			//		
			var filtersGrp;
			if (!!uluFdluFilter) {

				filtersGrp = new Filter({
					filters: [filtersApproverGrp, uluFdluFilter, staffUserGroup, validityFromFilter, validityToFilter],
					and: true
				});
			} else {
				filtersGrp = new Filter({
					filters: [filtersApproverGrp, staffUserGroup, validityFromFilter, validityToFilter],
					and: true
				});
			}

			if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN" || (!!claimAuthorizations && claimAuthorizations.length > 0)) {
				var that = this;

				oDataModel.read("/v_approval_maxtrix", {
					filters: [filtersGrp],
					// urlParameters: {
					// 	"$select": "STF_NUMBER,FULL_NM"
					// },
					success: function (oData) {
						//  
						if (oData) {
							that.AppModel.setProperty("/Verifier", oData.results);
						}
					},
					error: function (oError) {

					}
				});
			}

		},

		handleValueHelpApprover: function (oEvent) {
			var oView = this.getView();
			var EclaimSrvModel = this.getComponentModel("Catalog");
			var aFilter = [];
			var orFilter = [];
			var andFilter = [];
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
				if (claimAuthorizations) {
					for (var i = 0; i < claimAuthorizations.length; i++) {
						andFilter = [];
						andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, claimAuthorizations[i].ULU_C));
						andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, claimAuthorizations[i].FDLU_C));
						orFilter.push(new sap.ui.model.Filter(andFilter, true));
					}
					aFilter.push(new sap.ui.model.Filter(orFilter, false));
				}
			}
			aFilter.push(new sap.ui.model.Filter("STAFF_USER_GRP", FilterOperator.EQ, ['APPROVER']));
			//add the check for validity 
			var currentDate = new Date();
			aFilter.push(new sap.ui.model.Filter("APM_VALID_FROM", FilterOperator.LE, currentDate.toISOString()));
			aFilter.push(new sap.ui.model.Filter("APM_VALID_TO", FilterOperator.GE, currentDate.toISOString()));
			//					
			if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN" || (!!claimAuthorizations && claimAuthorizations.length > 0)) {
				EclaimSrvModel.read("/v_approval_maxtrix", {
					filters: aFilter,
					success: function (oData) {
						if (oData.results.length) {
							this.AppModel.setProperty("/Approver", oData.results);
							if (!this._oDialogApprover) {
								this._oDialogApprover = Fragment.load({
									id: oView.getId(),
									name: "nus.edu.sg.pttdetailedreport.fragment.ApproverValueHelpDialog",
									controller: this
								}).then(function (oDialog) {
									oView.addDependent(oDialog);
									return oDialog;
								});
							}

							this._oDialogApprover.then(function (oDialog) {
								oDialog.setRememberSelections(true);
								oDialog.open();
							}.bind(this));
						} else {

						}
					}.bind(this),
					error: function (oError) {

					}
				});
			}
		},

		handleConfirmApprover: function (oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);

			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var sPath = aContexts[0].getPath();
				var objSelectedApprover = this.AppModel.getProperty(sPath);
				var objApprover = {
					"STAFF_ID": objSelectedApprover.STAFF_ID,
					"NUSNET_ID": objSelectedApprover.STAFF_NUSNET_ID,
					"ULU": objSelectedApprover.ULU,
					"FDLU": objSelectedApprover.FDLU,
					"STAFF_FULL_NAME": objSelectedApprover.FULL_NM
				};

				//	this.AppModel.setProperty("/claimRequest/createClaimRequest/VERIFIER", [objVerifier]);
				this.AppModel.setProperty("/claimRequest/APPROVER_STAFF_ID", objSelectedApprover.STAFF_ID);
				this.AppModel.setProperty("/claimRequest/APPROVER_NUSNET_ID", objSelectedApprover.STAFF_NUSNET_ID);
				this.AppModel.setProperty("/claimRequest/APPROVER_ULU", objSelectedApprover.ULU);
				this.AppModel.setProperty("/claimRequest/APPROVER_FDLU", objSelectedApprover.FDLU);
				this.AppModel.setProperty("/claimRequest/APPROVER_STAFF_FULL_NAME", objSelectedApprover.FULL_NM);
				this._fnAddToken(this.getUIControl("inpApproverValueHelp"), objSelectedApprover.STAFF_NUSNET_ID, objSelectedApprover.FULL_NM);
			}
		},

		onTokenUpdateApprover: function (oEvent) {
			if (oEvent.getParameter("type") === "removed") {
				this.AppModel.setProperty("/claimRequest/APPROVER_STAFF_ID", "");
				this.AppModel.setProperty("/claimRequest/APPROVER_NUSNET_ID", "");
				this.AppModel.setProperty("/claimRequest/APPROVER_ULU", "");
				this.AppModel.setProperty("/claimRequest/APPROVER_FDLU", "");
				this.AppModel.setProperty("/claimRequest/APPROVER_STAFF_FULL_NAME", "");
			}
		},
		handleSearchApprover: function (oEvent) {

			var oDataModel = this.getOwnerComponent().getModel("Catalog");
			var orFilter = [];
			var andFilter = [];
			var sValue = oEvent.getParameter("value").toString();
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			if (userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
				if (claimAuthorizations) {
					for (var i = 0; i < claimAuthorizations.length; i++) {
						andFilter = [];
						andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, claimAuthorizations[i].ULU_C));
						andFilter.push(new sap.ui.model.Filter("FDLU", FilterOperator.EQ, claimAuthorizations[i].FDLU_C));
						orFilter.push(new sap.ui.model.Filter(andFilter, true));
					}
				}

				var uluFdluFilter = new Filter({
					filters: orFilter,
					and: false
				});
			}

			var filterStaffId = new sap.ui.model.Filter("STAFF_ID", sap.ui.model.FilterOperator.Contains, sValue);
			var filterStaffNusNetId = new sap.ui.model.Filter("STAFF_NUSNET_ID", sap.ui.model.FilterOperator.Contains, sValue);
			var filterUlu = new sap.ui.model.Filter("ULU", sap.ui.model.FilterOperator.Contains, sValue);
			var filterFdlu = new sap.ui.model.Filter("FDLU", sap.ui.model.FilterOperator.Contains, sValue);
			var filterStaffName = new sap.ui.model.Filter("FULL_NM", sap.ui.model.FilterOperator.Contains, sValue);

			var filtersApproverGrp = new Filter({
				filters: [filterStaffId, filterStaffNusNetId, filterUlu, filterFdlu, filterStaffName],
				and: false
			});

			var staffUserGroup = new sap.ui.model.Filter("STAFF_USER_GRP", FilterOperator.EQ, ['APPROVER']);
			//add the check for validity 
			var currentDate = new Date();
			var validityFromFilter = new sap.ui.model.Filter("APM_VALID_FROM", FilterOperator.LE, currentDate.toISOString());
			var validityToFilter = new sap.ui.model.Filter("APM_VALID_TO", FilterOperator.GE, currentDate.toISOString());
			//		
			var filtersGrp;
			if (!!uluFdluFilter) {

				filtersGrp = new Filter({
					filters: [filtersApproverGrp, uluFdluFilter, staffUserGroup, validityFromFilter, validityToFilter],
					and: true
				});
			} else {
				filtersGrp = new Filter({
					filters: [filtersApproverGrp, staffUserGroup, validityFromFilter, validityToFilter],
					and: true
				});
			}

			if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN" || (!!claimAuthorizations && claimAuthorizations.length > 0)) {
				var that = this;

				oDataModel.read("/v_approval_maxtrix", {
					filters: [filtersGrp],
					// urlParameters: {
					// 	"$select": "STF_NUMBER,FULL_NM"
					// },
					success: function (oData) {
						//  
						if (oData) {
							that.AppModel.setProperty("/Approver", oData.results);
						}
					},
					error: function (oError) {

					}
				});
			}
		},

		onSearch: function (oEvent) {
			this.searchFilter();
			var aFilter = this.AppModel.getProperty("/aSearchFilter");
			if (!!aFilter && aFilter.length > 0) {
				var oClaimsReqTable = this.getView().byId("idClaimRequestsTable");
				oClaimsReqTable.bindItems({
					path: "Eclaims>/v_eclaim_item_view",
					//	sorter: oSorter,
					template: this.oTemplate,
					filters: aFilter
					// parameters: {
					// 	expand: "TaskActionConfigViewDetails,RequestLockDetailsDetails"
					// }
				});
			}
			//else {
			// 	MessageBox.error("No ULU and FDLU assigned in the approver matrix for the logged in user");
			// }
		},

		searchFilter: function (oEvent) {
			var userRoleGrp = this.AppModel.getProperty("/userRoleGrp"); //Super Admin
			//check whether the mandatory search criteria is provided or not
			if (this.AppModel.getProperty("/claimRequest/UluList").length > 0 || userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				//if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
				//var selectedItemsUlu = this.AppModel.getProperty("/claimRequest/selectedItemsUlu");
				var selectedItemsUlu = this.getUIControl("inpUluValueHelp").getTokens();
				if (!!selectedItemsUlu && selectedItemsUlu.length > 0) {
					//MessageBox.error("Please provide the ULU in order to execute the report!!");
					//	} else {

					var currentDate = new Date();
					var currentYear = currentDate.getFullYear();
					var currentMonth = currentDate.getMonth();
					var monthListSet = [];

					for (var i = 0; i < 12; i++) {
						var monthListSetItem = {};

						// var currentMonthFirstDate = new Date(Number(currentYear), currentMonth, 1);
						// currentMonthFirstDate = Formatter.formatDateAsString(currentMonthFirstDate, "yyyy-MM-dd");
						// currentDate = Formatter.formatDateAsString(currentDate, "yyyy-MM-dd");
						var monthname = this.AppModel.getProperty("/monthNames")[currentMonth];
						monthListSetItem.monthCode = currentYear + '-' + (i + 1);
						monthListSetItem.monthName = monthname + ',' + ' ' + currentYear;
						monthListSet.push(monthListSetItem);
					}
					//			var status = this.AppModel.getProperty("/status");
					var selectedItemsStatus = this.AppModel.getProperty("/claimRequest/selectedItemsClaimStatus");

					//var selectedItemsFdlu = this.AppModel.getProperty("/claimRequest/selectedItemsFdlu");
					var selectedItemsFdlu = this.getUIControl("inpFdluValueHelp").getTokens();
					//	var selectedItemsClaimNo = this.AppModel.getProperty("/claimRequest/selectedItemsClaimNo");
					//	var selectedItemsStaffId = this.AppModel.getProperty("/claimRequest/selectedItemsStaffId");
					var selectedItemsStaffId = this.getUIControl("inpStaffValueHelp").getTokens();
					var selectedItemsClaimNo = this.getUIControl("inpClaimNoValueHelp").getTokens();
					var claimType = this.AppModel.getProperty("/claimTypeCode");
					var requestId = this.AppModel.getProperty("/requestId");
					var submissionStartDate = this.AppModel.getProperty("/submissionStartDate");
					var submissionEndDate = this.AppModel.getProperty("/submissionEndDate");
					//var ulu = this.AppModel.getProperty("/uluSelectedCode");
					//var fdlu = this.AppModel.getProperty("/fdluSelectedCode");

					var submittedBy = this.AppModel.getProperty("/submittedById");
					var startMonth = this.AppModel.getProperty("/startMonth");
					var endMonth = this.AppModel.getProperty("/endMonth");
					var fromRateAmount = this.AppModel.getProperty("/fromRateAmount");
					var toRateAmount = this.AppModel.getProperty("/toRateAmount");
					var verifierStaffId = this.AppModel.getProperty("/claimRequest/VERIFIER_STAFF_ID");
					var approverStaffId = this.AppModel.getProperty("/claimRequest/APPROVER_STAFF_ID");
					//VERIFIER_STAFF_ID
					var aFilter = [];
					var andFilter = [];
					//02,03,04,05,06,08
					// if (status) {
					// 	andFilter.push(new sap.ui.model.Filter("STATUS_CODE", FilterOperator.EQ, status));
					// }	
					// if (!!selectedItemsStatus && selectedItemsStatus.length > 0) {
					// 	var orFilter = [];
					// 	for (var i = 0; i < selectedItemsStatus.length; i++) {

					// 		orFilter.push(new sap.ui.model.Filter("STATUS_CODE", FilterOperator.EQ, selectedItemsStatus[i].getProperty("key")));
					// 	}
					// 	andFilter.push(new sap.ui.model.Filter(orFilter, false));
					// }
					if (!!selectedItemsStatus && selectedItemsStatus.length > 0) {
						var orFilter = [];
						var fullStatusList = this.AppModel.getProperty("/claimRequest/fullStatusList");
						if (fullStatusList) {
							for (var i = 0; i < selectedItemsStatus.length; i++) {
								for (var j = 0; j < fullStatusList.length; j++) {
									if (selectedItemsStatus[i].getProperty("text") === fullStatusList[j].STATUS_ALIAS) {
										orFilter.push(new sap.ui.model.Filter("STATUS_CODE", FilterOperator.EQ, fullStatusList[j].STATUS_CODE));
									}
								}
							}
						}
						andFilter.push(new sap.ui.model.Filter(orFilter, false));
					}
					// if (claimType) {
					// 	andFilter.push(new sap.ui.model.Filter("CLAIM_TYPE", FilterOperator.EQ, claimType));
					// }
					if (!!selectedItemsClaimNo && selectedItemsClaimNo.length > 0) {
						var orFilter = [];
						for (var i = 0; i < selectedItemsClaimNo.length; i++) {
							orFilter.push(new sap.ui.model.Filter("REQUEST_ID", FilterOperator.EQ, selectedItemsClaimNo[i].getProperty("key")));
						}
						andFilter.push(new sap.ui.model.Filter(orFilter, false));
					}
					//	andFilter.push(new sap.ui.model.Filter("SUBMITTED_ON", FilterOperator.EQ, ));
					if (submissionStartDate && submissionEndDate) {
						andFilter.push(new sap.ui.model.Filter("SUBMITTED_ON", FilterOperator.BT, submissionStartDate, submissionEndDate));
					}
					// if (submissionEndDate) {

					// }			
					//If the ULU is passed as the selection criteria 
					if (!!selectedItemsUlu && selectedItemsUlu.length > 0) {
						//andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, ulu));
						if (userRoleGrp === "NUS_CHRS_ECLAIMS_SUPER_ADMIN" && this.AppModel.getProperty("/claimRequest/UluList").length ===
							selectedItemsUlu.length) { } else {
							var orFilter = [];
							for (var i = 0; i < selectedItemsUlu.length; i++) {
								orFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, selectedItemsUlu[i].getProperty("key")));
							}
							andFilter.push(new sap.ui.model.Filter(orFilter, false));
						}
					}
					//If the ULU is not passed as the selection criteria then pick all the ULUs based on the approver matrix of the logged in user 
					// else {
					// 	var uluList = this.AppModel.getProperty("/claimRequest/UluList");
					// 	var aUluFdluFilter = [];
					// 	var aFinalUluFdluFilter = [];
					// 	//var fdluFilter = [];
					// 	for (var j = 0; j < uluList.length; j++) {
					// 		aUluFdluFilter = [];
					// 		aUluFdluFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, uluList[j].ULU_C));

					// 		//aUluFdluFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, claimAuthorizations[i].ULU_C)); //testing ULU
					// 		aUluFdluFilter.push(new sap.ui.model.Filter("FDLU_C", FilterOperator.EQ, uluList[j].FDLU_C)); //testing FDLU
					// 		aFinalUluFdluFilter.push(new sap.ui.model.Filter(aUluFdluFilter, true));

					// 	}
					// 	andFilter.push(new sap.ui.model.Filter(aFinalUluFdluFilter, false));
					// }

					//If the FDLU is passed as the selection criteria 
					if (!!selectedItemsFdlu && selectedItemsFdlu.length > 0) {
						//andFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, ulu));
						var orFilter = [];
						for (var i = 0; i < selectedItemsFdlu.length; i++) {
							orFilter.push(new sap.ui.model.Filter("FDLU_C", FilterOperator.EQ, selectedItemsFdlu[i].getProperty("key")));
						}
						andFilter.push(new sap.ui.model.Filter(orFilter, false));
					} else if (!!selectedItemsUlu && selectedItemsUlu.length > 0 && userRoleGrp !== "NUS_CHRS_ECLAIMS_SUPER_ADMIN") {
						var claimAuthorizations = this.AppModel.getProperty("/claimAuthorizations");
						var uluList = this.AppModel.getProperty("/claimRequest/UluList");
						var orFilter = [];
						for (var i = 0; i < selectedItemsUlu.length; i++) {
							for (var j = 0; j < claimAuthorizations.length; j++) {
								//	for (var j = 0; j < uluList.length; j++) {
								if (selectedItemsUlu[i].getProperty("key") === claimAuthorizations[j].ULU_C) {
									orFilter.push(new sap.ui.model.Filter("FDLU_C", FilterOperator.EQ, claimAuthorizations[j].FDLU_C));
									//continue;
								}
							}
							//orFilter.push(new sap.ui.model.Filter("ULU", FilterOperator.EQ, selectedItemsUlu[i].getProperty("key")));
						}
						andFilter.push(new sap.ui.model.Filter(orFilter, false));
					}
					// if (fdlu) {
					// 	andFilter.push(new sap.ui.model.Filter("FDLU_C", FilterOperator.EQ, fdlu));
					// }

					if (!!selectedItemsStaffId && selectedItemsStaffId.length > 0) {
						var orFilter = [];
						for (var i = 0; i < selectedItemsStaffId.length; i++) {
							orFilter.push(new sap.ui.model.Filter("STAFF_ID", FilterOperator.EQ, selectedItemsStaffId[i].getProperty("key")));
						}
						andFilter.push(new sap.ui.model.Filter(orFilter, false));
						//andFilter.push(new sap.ui.model.Filter("SUBMITTED_BY_NID", FilterOperator.EQ, submittedBy));
					}
					if (fromRateAmount) {
						andFilter.push(new sap.ui.model.Filter("RATE_TYPE_AMOUNT", FilterOperator.GE, fromRateAmount));
					}

					if (toRateAmount) {
						andFilter.push(new sap.ui.model.Filter("RATE_TYPE_AMOUNT", FilterOperator.LE, toRateAmount));
					}

					if (verifierStaffId) {
						andFilter.push(new sap.ui.model.Filter("VERIFIER_STAFF_ID", FilterOperator.EQ, verifierStaffId));
					}

					if (approverStaffId) {
						andFilter.push(new sap.ui.model.Filter("APPROVED_BY", FilterOperator.EQ, approverStaffId));
					}

					if (startMonth && endMonth) {
						var startMonthYear = startMonth.split("-");
						var year = startMonthYear[0];
						if (startMonthYear[1].length === 1) {
							var startMonthCode = '0' + startMonthYear[1];
						} else {
							startMonthCode = startMonthYear[1];
						}
						//	}
						//	if (endMonth) {
						var endMonthYear = endMonth.split("-");
						//	var year = monthYear[0];
						if (endMonthYear[1].length === 1) {
							var endMonthCode = '0' + endMonthYear[1];
						} else {
							endMonthCode = endMonthYear[1];
						}
						var orFilter = [];

						for (var i = startMonthCode; i <= endMonthCode; i++) {
							if (i.toString().length === 1) {
								i = '0' + i;
							}
							orFilter.push(new sap.ui.model.Filter("CLAIM_MONTH", FilterOperator.EQ, i));
						}
						andFilter.push(new sap.ui.model.Filter(orFilter, false));
						andFilter.push(new sap.ui.model.Filter("CLAIM_YEAR", FilterOperator.EQ, year));
					} else if (startMonth) {
						startMonthYear = startMonth.split("-");
						year = startMonthYear[0];
						if (startMonthYear[1].length === 1) {
							startMonthCode = '0' + startMonthYear[1];
						} else {
							startMonthCode = startMonthYear[1];
						}
						andFilter.push(new sap.ui.model.Filter("CLAIM_MONTH", FilterOperator.EQ, startMonthCode));
						andFilter.push(new sap.ui.model.Filter("CLAIM_YEAR", FilterOperator.EQ, year));
					} else if (endMonth) {
						endMonthYear = endMonth.split("-");
						year = endMonthYear[0];
						if (endMonthYear[1].length === 1) {
							endMonthCode = '0' + endMonthYear[1];
						} else {
							endMonthCode = endMonthYear[1];
						}
						andFilter.push(new sap.ui.model.Filter("CLAIM_MONTH", FilterOperator.EQ, endMonthCode));
						andFilter.push(new sap.ui.model.Filter("CLAIM_YEAR", FilterOperator.EQ, year));
					}

					//handling is deleted flag
					andFilter.push(new sap.ui.model.Filter("IS_DELETED", FilterOperator.EQ, "N"));
					//Only for PTT Claim Types
					andFilter.push(new sap.ui.model.Filter("PROCESS_CODE", FilterOperator.EQ, "101"));

					if (andFilter.length) {
						aFilter.push(new sap.ui.model.Filter(andFilter, true));
					}
					this.AppModel.setProperty("/aSearchFilter", aFilter);
				} else {
					MessageBox.error("Please provide the ULU in order to execute the report!!");
				}
			} else {
				MessageBox.error("No ULU and FDLU assigned in the approver matrix for the logged in user");
			}
		},
		//
		onDataExport: function (oEvent) {
			//	if (this.AppModel.getProperty("/claimRequest/UluList").length > 0) {
			var oDataModel = this.getOwnerComponent().getModel("Eclaims");
			this.searchFilter();
			var aFilter = this.AppModel.getProperty("/aSearchFilter");
			if (!!aFilter && aFilter.length > 0) {
				//this._fnHandleDataToExport(oData.results);
				oDataModel.read("/v_eclaim_item_view", {
					filters: [aFilter],
					success: function (oData) {
						if (oData) {
							this._fnHandleDataToExport(oData.results);
						}
					}.bind(this),
					error: function (oError) { }
				});
			}
			// else {
			// 	MessageBox.error("No ULU and FDLU assigned in the approver matrix for the logged in user");
			// }
		},
		_fnHandleDataToExport: function (aData) {
			var aCols, aProducts, oSettings, oSheet;
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: aData,
				fileName: "PTT Detailed Report.xlsx"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					MessageToast.show('PTT Detailed Report exported successfully..!!');
				})
				.finally(function () {
					oSheet.destroy();
				});
		},
		createColumnConfig: function () {
			return [{
				label: 'Claim No',
				property: 'REQUEST_ID'
			}, {
				label: 'Year',
				property: 'CLAIM_YEAR'
			}, {
				label: 'Claim Month',
				property: 'CLAIM_MONTH'
			}, {
				label: 'Claim Type',
				property: 'CLAIM_TYPE_T'
			}, {
				label: 'Claim Status',
				property: 'STATUS_ALIAS'
			}, {
				label: 'Staff Number',
				property: 'STAFF_ID'
			}, {
				label: 'Staff Name',
				property: 'FULL_NM'
			},
			//{
			// 	label: 'ULU',
			// 	property: ['CLAIM_MONTH', 'CLAIM_YEAR'],
			// 	template: '{0} / {1}'
			// }, 
			{
				label: 'ULU Code',
				property: 'ULU'
			}, {
				label: 'ULU Name',
				property: 'ULU_T'
			}, {
				label: 'FDLU Code',
				property: 'FDLU_C'
			}, {
				label: 'FDLU Name',
				property: 'FDLU_T'
			}, {
				label: 'Employee Group',
				property: 'EMP_GP_T'
			}, {
				label: 'Date Joined',
				property: 'DATE_JOINED',
				type: EdmType.Date
				// type: EdmType.Number,
				// scale: 2
			}, {
				label: 'Rate Type',
				property: 'RATE_DESC'
			}, {
				label: 'Start Date',
				property: 'CLAIM_START_DATE'
				//	inputformat: "yyyy-mm-dd",
				//	type: sap.ui.export.EdmType.Date
			}, {
				label: 'End Date',
				property: 'CLAIM_END_DATE'
				//inputformat: "yyyy-mm-dd",
				//type: sap.ui.export.EdmType.Date
			}, {
				label: 'Day',
				property: 'CLAIM_DAY'
			}, {
				label: 'Start Time',
				property: 'START_TIME'
			}, {
				label: 'End Time',
				property: 'END_TIME'
			}, {
				label: 'Hours/Unit',
				property: 'HOURS_UNIT'
			}, {
				label: 'Rate Amount',
				property: 'RATE_TYPE_AMOUNT'
			}, {
				label: 'Total Amount',
				property: 'TOTAL_AMOUNT'
			}, {
				label: 'WBS',
				property: 'WBS'
			}, {
				label: 'Claim Item Remarks',
				property: 'REMARKS'
			}, {
				label: 'Submitted on',
				property: 'SUBMITTED_ON',
				type: EdmType.Date
			}, {
				label: 'Submitted by',
				property: 'SUBMITTED_BY'
			}, {
				label: 'Verified on',
				property: 'VERIFIED_ON',
				type: EdmType.Date
			}, {
				label: 'Verified Staff ID',
				property: 'VERIFIER_STAFF_ID'
			}, {
				label: 'Verified By',
				property: 'VERIFIER_STAFF_FULL_NAME'
			}, {
				label: 'AP1 Staff ID',
				property: 'ADD_APP_1_STAFF_ID'
			}, {
				label: 'Additional Approver 1',
				property: 'ADD_APP_1_STAFF_FULL_NAME'
			}, {
				label: 'Additional Appr 1 approved on',
				property: 'ADD_APRV_1_ON',
				type: EdmType.Date
			}, {
				label: 'AP2 Staff ID',
				property: 'ADDITIONAL_APP_2_STAFF_ID'
			}, {
				label: 'Additional Approver 2',
				property: 'ADDITIONAL_APP_2_STAFF_FULL_NAME'
			}, {
				label: 'Additional Appr 2 approved on',
				property: 'ADD_APRV_2_ON',
				type: EdmType.Date
			}, {
				label: 'Approved on',
				property: 'APPROVED_ON',
				type: EdmType.Date
			}, {
				label: 'Approver Staff ID',
				property: 'APPROVED_BY'
			}, {
				label: 'Approved by',
				property: 'APPROVER_STAFF_FULL_NAME'
			}, {
				label: 'CA Remarks',
				property: 'CA_REMARKS'
			}, {
				label: 'Verifier Remarks',
				property: 'VERIFIER_REMARKS'
			}, {
				label: 'Approver Remarks',
				property: 'APP_REMARKS'
			}

			];
		},

		onClear: function () {

			this.AppModel.setProperty("/claimRequest/selectedItemsClaimStatus", '');
			this.getUIControl("inpClaimStatus").removeAllSelectedItems();
			// this.AppModel.setProperty("/claimRequest/statusList/STATUS_CODE", '');
			// this.AppModel.setProperty("/claimRequest/statusList/STATUS_DESC", '');
			this.getUIControl("inpStaffValueHelp").removeAllTokens();
			this.getUIControl("inpClaimNoValueHelp").removeAllTokens();
			this.AppModel.setProperty("/startMonth", '');
			this.AppModel.setProperty("/endMonth", '');
			this.AppModel.setProperty("/submissionStartDate", '');
			this.AppModel.setProperty("/submissionEndDate", '');
			this.getUIControl("inpUluValueHelp").removeAllTokens();
			this.getUIControl("inpFdluValueHelp").removeAllTokens();
			this.AppModel.setProperty("/fromRateAmount", '');
			this.AppModel.setProperty("/toRateAmount", '');
			this.getUIControl("inpVerifierValueHelp").removeAllTokens();
			this.getUIControl("inpApproverValueHelp").removeAllTokens();
			this.AppModel.setProperty("/claimRequest/VERIFIER_STAFF_ID", "");
			this.AppModel.setProperty("/claimRequest/VERIFIER_NUSNET_ID", "");
			this.AppModel.setProperty("/claimRequest/VERIFIER_ULU", "");
			this.AppModel.setProperty("/claimRequest/VERIFIER_FDLU", "");
			this.AppModel.setProperty("/claimRequest/VERIFIER_STAFF_FULL_NAME", "");
			this.AppModel.setProperty("/claimRequest/APPROVER_STAFF_ID", "");
			this.AppModel.setProperty("/claimRequest/APPROVER_NUSNET_ID", "");
			this.AppModel.setProperty("/claimRequest/APPROVER_ULU", "");
			this.AppModel.setProperty("/claimRequest/APPROVER_FDLU", "");
			this.AppModel.setProperty("/claimRequest/APPROVER_STAFF_FULL_NAME", "");
			// this.AppModel.setProperty("/claimRequest/VERIFIER_STAFF_ID", '');
			// this.AppModel.setProperty("/claimRequest/APPROVER_STAFF_ID", '');			
			//	this.AppModel.setProperty("/submittedById", '');
		}
	});
});