sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent", "../utils/dataformatter", "sap/ui/core/Fragment",
	"../utils/services",
	"../utils/configuration"
], function (JSONModel, Controller, UIComponent, Formatter, Fragment, Services, Config) {
	"use strict";

	return Controller.extend("nus.edu.sg.pttdetailedreport.controller.BaseController", {

		getComponentModel: function (modelName) {
			var model = (modelName) ? this.getOwnerComponent().getModel(modelName) : this.getOwnerComponent().getModel();
			return model;
		},
		setComponentModel: function (modelName) {
			var model = (modelName) ? this.getOwnerComponent().setModel(new JSONModel(), modelName) : null;
			return this.getOwnerComponent().getModel(modelName);
		},
		handleRefresh: function () {
			this.getOwnerComponent().getInitialDataForUser();
		},
		/*
		 * Display Message in different Sections
		 */
		showMessagePopOver: function (messageElement) {
			messageElement = JSON.parse(JSON.stringify(messageElement));
			var messageModel = this.modelAssignment("MessagePopOver");
			// var data = messageModel.getData();
			var data = [];
			// data = (data instanceof Array) ? data : [];
			messageElement = (messageElement instanceof Array) ? messageElement : [messageElement];
			for (var i = 0; i < messageElement.length; i++) {
				data.push(messageElement[i]);
			}
			messageModel.setData(data);
			var showButton = this.getUIControl("showMsgeBtnId");
			showButton.firePress();
		},
		/*
		 * Close Message PopOver
		 */
		closeMessagePopOver: function () {
			//Initialize Message PopOver for the first time
			var messageModel = this.modelAssignment("MessagePopOver");
			if (!Formatter.validateDataInModels(messageModel)) {
				messageModel.setData(this.getOwnerComponent().getModel().getProperty("/messagedata"));
			}
			var data = messageModel.getData();
			data = (data.length > 0) ? [data[0]] : [];
			messageModel.setData(data);
		},
		/**
		 * Handle Navigation
		 */
		handleNav: function (target) {
			var navCon = this.getUIControl("claimNav");
			if (target) {
				navCon.to(this.getUIControl(target), "slide");
			}
		},
		/**
		 * Handle Routing
		 */
		handleRouting: function (target, navObj) {
			this.oRouter = this.getOwnerComponent().getRouter();
			if (!navObj) {
				navObj = {};
			}
			if (!navObj.layout) {
				navObj.layout = this.getOwnerComponent().getHelper().getNextUIState(1).layout;
			}
			this.oRouter.navTo(target, navObj);
		},
		/**
		 * Lookup Value Help
		 */
		lookupValueHelp: function (oEvent) {
			var showDesc = false;
			if (oEvent.getSource().getProperty("dialogCodeLbl") === 'ProcessTitle') {
				this.taskTypeLookUp();
				showDesc = false;
			} 
			var src = oEvent.getSource();
			var bindingControl = oEvent.getSource().getBindingInfo("value").parts[0].path;
			var data;
			// var ownerComponent = this.getComponentModel("LookupModel");
			data = this.AppModel.getProperty(src.getUrlAttr());
			// this.closeMessagePopOver();
			var that = this;
			src.openValueHelp(oEvent, null, true, data, true, function (selectedObj) {
				that.setValuesFromLookup(bindingControl, selectedObj);
			}, showDesc);
		},
		wbsElementsLookUp: function (oEvent) {
			// var that = this;
			var token = this.AppModel.getProperty("/token");
			// var isClaimantForMassUpload = this.AppModel.getProperty("/isMassUploadFeatureVisible");
			var oHeaders = {
				"Accept": "application/json",
				"Authorization": "Bearer" + " " + token,
				"AccessPoint": "A",
				"Content-Type": "application/json"
			};
			var url = "/eclaims/rest/fetchWBS?staffId=12564";
			var wbsElementTypeModel = new JSONModel();
			wbsElementTypeModel.loadData(url, null, false, "GET", null, null, oHeaders);
			this.AppModel.setProperty("/claimRequest/wbsElementsList", wbsElementTypeModel.getProperty("/"));
		},
		staffListLookUp: function (oEvent) {
			var token = this.AppModel.getProperty("/token");
			var oHeaders = {
				"Accept": "application/json",
				"Authorization": "Bearer" + " " + token,
				"AccessPoint": "A",
				"Content-Type": "application/json"
			};
			var selMonthYear = this.AppModel.getProperty("/claimRequest/month");
			var aSelMonthYear = selMonthYear.split("-");
			var year = aSelMonthYear[0];
			var month = parseInt(aSelMonthYear[1]) + 1;
			month = month.toString();

			var selClaimType = this.AppModel.getProperty("/claimRequest/claimType");
			var url = "/eclaims/rest/staffLookup?claimMonth=8&claimYear=2020&claimType=006";
			var staffListModel = new JSONModel();
			staffListModel.loadData(url, null, false, "GET", null, null, oHeaders);
			this.AppModel.setProperty('/claimRequest/staffList', staffListModel.getProperty("/"));
		},
		taskTypeLookUp: function (oEvent) {
			var that = this;
			var token = this.AppModel.getProperty("/token");
			var oHeaders = {
				"Accept": "application/json",
				"Authorization": "Bearer" + " " + token,
				"AccessPoint": "A",
				"Content-Type": "application/json"
			};
			var url = Config.dbOperations.fetchTaskType;;

			//uncomment the below line and comment the harcoding of month and year later, it is done because there is not much data         
			var taskTypeModel = new JSONModel();
			taskTypeModel.loadData(url, null, false, "GET", null, null, oHeaders);

			this.AppModel.setProperty("/ProcessConfigs", taskTypeModel.getProperty("/"));
		},
		claimTypesLookUp: function (oEvent) {
			
			var that = this;
			var token = this.AppModel.getProperty("/token");
			var isClaimantForMassUpload = this.AppModel.getProperty("/claimRequest/isMassUploadFeatureVisible");
			var oHeaders = {
				"Accept": "application/json",
				"Authorization": "Bearer" + " " + token,
				"AccessPoint": "A",
				"Content-Type": "application/json"
			};
			if (isClaimantForMassUpload) {
				var url = "/eclaims/rest/eligibleClaimTypes";
			} else {
				var selMonthYear = this.AppModel.getProperty("/claimRequest/createClaimRequest/month");
				var aSelMonthYear = selMonthYear.split("-");
				var year = aSelMonthYear[0];
				var month = parseInt(aSelMonthYear[1]) + 1;
				month = month.toString();
				var url = "/eclaims/rest/eligibleClaimTypes?claimMonth=8&claimYear=2020";
			}

			//uncomment the below line and comment the harcoding of month and year later, it is done because there is not much data         
			// var url = '/eclaims/rest/eligibleClaimTypes?claimMonth=' + month + '&claimYear=' + year;
			var url = "/eclaims/rest/eligibleClaimTypes?claimMonth=8&claimYear=2020";
			var claimTypeModel = new JSONModel();
			claimTypeModel.loadData(url, null, false, "GET", null, null, oHeaders);

			this.AppModel.setProperty("/claimRequest/claimsList", claimTypeModel.getProperty("/"));
		},
		/**
		 * Set Values From Lookup
		 */
		setValuesFromLookup: function (bindingControl, selectedObj) {
			// var requestModel = this.modelAssignment("ClaimRequest");
			// var requestData = requestModel.getData();
			switch (bindingControl) {
			case "department":
				// requestModel.setProperty("/wbsElement", selectedObj.wbsElement);
				break;
			case "moduleCode":
				// requestModel.setProperty("/moduleDesc", selectedObj.moduleDesc);
				// requestModel.setProperty("/wbsWarningDisplay", false);
				break;
			case "/staffName":
				// Object.assign(requestData, selectedObj);
				break;
			case "/claimRequest/createClaimRequest/claimTypeDesc":
				this.AppModel.setProperty("/claimRequest/createClaimRequest/claimType", selectedObj.claimType);
				this.AppModel.setProperty("/claimRequest/createClaimRequest/claimTypeDesc", selectedObj.claimTypeDesc);
				break;
			default:
				break;
			}
			// requestModel.setData(requestData);
		},
		/**
		 * Model Assignment Function
		 */
		modelAssignment: function (modelName, objAssign) {
			var view = this.getView();
			var model = view.getModel(modelName);
			if (!model) {
				if (objAssign) {
					model = new JSONModel(objAssign);
				} else {
					model = new JSONModel();
				}
				view.setModel(model, modelName);
			}
			return model;
		},
		/**
		 * Get Employee Data
		 */
		getEmployeeData: function (employeeId, userList) {
			var employeeData = {};
			for (var i = 0; i < userList.length; i++) {
				if (employeeId === userList[i].userId) {
					employeeData = userList[i];
					break;
				}
			}
			return employeeData;
		},
		/**
		 * Parse Object
		 */
		parseJsonData: function (data) {
			if (data) {
				data = JSON.parse(JSON.stringify(data));
			}
			return data;
		},
		//Util Operation to Validate Date in the Appn
		checkDate: function (oEvent, srcMsgStrip, fragmentId) {
			srcMsgStrip = (srcMsgStrip) ? srcMsgStrip : (this.selectedIconTab === "Contract") ? "contractMsgStrip" : (this.selectedIconTab ===
				"Terminate") ? "terminateMsgStrip" : (this.selectedIconTab === "Ship Change") ? "shipMsgStrip" : "recruitMsgStrip";
			this.closeMessageStrip(srcMsgStrip);
			if (!(Formatter.validateEnteredDate(oEvent.getParameter("id"), oEvent.getParameter("valid")))) {
				this.showMessageStrip(srcMsgStrip, "Please select current or future date", "E", fragmentId);
			}
		},
		// getBillingDateProperties: function (requestData, calendarData, bundle) {
		// 	requestData.billingCutoffDate = this.getBillingCutOffDate(calendarData, requestData.billingDate, true);
		// 	var tempBillingDate;
		// 	if (!requestData.fixedRecurring) { //If the Billing Request is Normal
		// 		requestData.billingDate = requestData.billingCutoffDate;
		// 		tempBillingDate = new Date(requestData.billingDate);
		// 	} else {
		// 		tempBillingDate = new Date(requestData.billingDate);
		// 		tempBillingDate.setMonth(tempDate.getMonth() + 1);
		// 		requestData.billingDateDisplay = Formatter.formatDateAsString((tempDate) ? tempDate : "NA", "dd/MM/yyyy");
		// 		requestData.billingDate = Formatter.formatDateAsString((tempDate) ? tempDate : "NA", "yyyy-MM-dd");
		// 		var fdRunDates = (requestData.fdRunDates) ? requestData.fdRunDates.split(",") : "";
		// 		if (fdRunDates && fdRunDates instanceof Array) {
		// 			fdRunDates.splice(0, 1);
		// 			requestData.selectedFDRunDates = fdRunDates;
		// 		}
		// 		requestData.fdRunDates = fdRunDates.join(",");
		// 	}
		// 	requestData.billingMonth = bundle.getText("BillingReq.Month." + tempBillingDate.getMonth()) + " " + tempBillingDate.getFullYear();
		// },
		/**
		 * Get Billing Cutoff Date
		 */
		// getBillingCutOffDate: function (calendarData, billingDate, isNextMonthCutoff) {
		// 	var cutoffDate;
		// 	calendarData = (calendarData) ? calendarData : this.modelAssignment("CalendarModel").getData();
		// 	var tempDate = (billingDate) ? new Date(billingDate) : new Date();
		// 	var tempMonth = (isNextMonthCutoff) ? 2 : 1;
		// 	jQuery.sap.each(calendarData.months, function (mK, mV) {
		// 		if ((tempDate.getMonth() + tempMonth) === Number(mV)) {
		// 			jQuery.sap.each(calendarData.BillingDays, function (b) {
		// 				if (mK === calendarData.BillingDays[b].month) {
		// 					cutoffDate = tempDate.getFullYear() + "-" + mV + "-" + calendarData.BillingDays[b].day;
		// 				}
		// 			});
		// 		}
		// 	});
		// 	return cutoffDate;
		// },
		/**
		 * Confirmation to submit
		 */
		confirmOnAction: function (submissionCallBack) {
			var dialog = new sap.m.Dialog({
				title: "Confirmation",
				state: "Information",
				type: "Message",
				content: new sap.m.Text({
					text: "Do you want to Submit?"
				}),
				beginButton: new sap.m.Button({
					text: "Yes",
					press: function () {
						dialog.close();
						submissionCallBack();
					}
				}),
				endButton: new sap.m.Button({
					text: 'No',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		/*
		 * Show Message Strip
		 */
		showMessageStrip: function (stripId, message, mType, fragmentId) {
			var mStrip = this.getUIControl(stripId, fragmentId);
			mStrip.setText(message);
			mStrip.setType((mType === "E") ? "Error" : "None");
			mStrip.setVisible(true);
		},
		/**
		 * Show Message List in a Dialog 
		 */
		showMassUploadErrorDialog: function (errorMessageList) {
			if (this.errorDialog) {
				this.errorDialog.destroy(true);
			}
			this.errorDialog = sap.ui.xmlfragment(
				"com.stengglink.billingrequest.view.fragments.display.MassUploadErrorDialog", this);
			this.getView().addDependent(this.errorDialog);
			this.modelAssignment("ErrorMessageModel").setData(errorMessageList);
			// this.errorDialog.setModel(new JSONModel({
			// 	"errorList": errorMessageList
			// }));
			this.errorDialog.open();
		},
		closeMassErrorDialog: function () {
			if (this.errorDialog) {
				this.errorDialog.destroy(true);
			}
		},
		/**
		 * Show Mass Upload Confirmation 
		 */
		showAcknowledgementDialog: function (ackData) {
			if (this.ackDialog) {
				this.ackDialog.destroy(true);
			}
			this.ackDialog = sap.ui.xmlfragment("com.stengglink.billingrequest.view.fragments.display.AcknowledgementDialog", this);
			this.getView().addDependent(this.ackDialog);
			this.ackDialog.setModel(new JSONModel(ackData));
			this.ackDialog.open();
		},
		/**
		 * Close Mass upload Confirmation Dialog
		 */
		closeAcknowledgementDialog: function () {
			if (this.ackDialog) {
				this.ackDialog.destroy(true);
			}
		},
		/**
		 * Close Message Strip
		 */
		closeMessageStrip: function (stripIds, fragmentId) {
			stripIds = (stripIds.indexOf(",") > -1) ? stripIds.split(",") : [stripIds];
			var control;
			var that = this;
			jQuery.sap.each(stripIds, function (s) {
				control = that.getUIControl(stripIds[s], fragmentId);
				if (control) {
					control.setVisible(false);
				}
			});
		},
		/*
		 * Set Busy Indicators
		 */
		loadBusyIndicator: function (content, isBusy) {
			var pageContent = this.getView().byId(content);
			pageContent = (pageContent) ? pageContent : sap.ui.getCore().byId(content);
			pageContent.setBusy(isBusy);
		},
		/**
		 * Fetch control
		 */
		getUIControl: function (id, fragmentId) {
			var view = this.getView();
			var control = (fragmentId) ? Fragment.byId(fragmentId, id) : (view.byId(id)) ? view.byId(id) : sap.ui.getCore().byId(id);
			return control;
		},
		formatAmount: function (val) {
			return Formatter.formatRequestAmount(val);
			// if (val) {
			// 	val = Number(val);
			// 	val = val.toFixed(2);
			// 	return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			// } else {
			// 	return 0.00;
			// }
		},
		showBusyIndicator: function (milliseconds) {
			var delay = milliseconds || 0;
			sap.ui.core.BusyIndicator.show(delay);
		},

		hideBusyIndicator: function () {
			sap.ui.core.BusyIndicator.hide();
		},		

	});
}, true);