sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"./configuration"
], function (JSONModel, Device, Config) {
	"use strict";

	return {

		fetchLoggedUserToken: function (sThis, callBackFx) {
			var that = this;
			var userModel = new sap.ui.model.json.JSONModel();
			userModel.loadData("/services/userapi/currentUser", null, false);
			sap.ui.getCore().setModel(userModel, "userapi");
			userModel.dataLoaded().then(function () {
				var sUserName = sap.ui.getCore().getModel("userapi").getData().name;
				//sUserName = "PTT_VF1"; //VERFIER
				 sUserName = "UID53713"; //CA
				sThis.AppModel.setProperty("/loggedInUserId", sUserName);
				that._getUserDetails(sThis, that, sUserName, callBackFx);
			}.bind(sThis));
		},

		_getUserDetails: function (sThis, that, sUserName, callBackFx) {
			var oHeaders = {
                    "Content-Type": "application/json"
                };
                var oPayload = {
                    "userName": sUserName
                };
			var sUrl = Config.dbOperations.eclaimAuthToken;
			var authModel = new JSONModel();
			authModel.loadData(sUrl, JSON.stringify(oPayload), null, "POST", false, false,oHeaders);
			authModel.attachRequestCompleted(function (oResponse) {
				if (oResponse.getParameters().success) {
					if (oResponse.getSource().getProperty("/token")) {
						var userDetails = that.getUserInfoDetails(oResponse.getSource().getProperty("/token"));
						Object.assign(userDetails, oResponse.getSource().getData());
						callBackFx(userDetails);
						// callBackFx(oResponse.getSource().getData());
					}
				} else {
					if (oResponse.getParameters()['errorobject'].statusCode === 503) {
						sThis.AppModel.setProperty("/ErrorPageDescription", oResponse.getParameters()['errorobject'].responseText);
						// sap.m.MessageBox.error(oResponse.getParameters()['errorobject'].responseText);
						sThis.AppModel.setProperty("/ErrorPageTitle", "Service Maintenance");
						sThis.AppModel.setProperty("/ErrorPageText", "Please reach out to the admin team if not started working in next 10 minutes.");
						sThis.oRouter.navTo("NotFound", true);
						return;
					}
				}

			}.bind(sThis));
		},


		getUserInfoDetails: function (userToken) {
			var userInfoModel = new JSONModel();
			var oHeaders = {
				"Accept": "application/json",
				"Authorization": "Bearer" + " " + userToken,
				"AccessPoint": "A",
				"Content-Type": "application/json"
			};
			userInfoModel.loadData(Config.dbOperations.userDetails, null, false, "GET", false, false, oHeaders);
			return userInfoModel.getData();
		},

		fetchLoggeInUserImage: function (sThis, callBackFx) {
			var oPhotoModel = new JSONModel();
			var sUrl = Config.dbOperations.fetchPhotoUser;
			var staffId = sThis.AppModel.getProperty("/loggedInUserStfNumber");
			sUrl = sUrl + "?userId=" + staffId;
			// sUrl = sUrl + "?userId=CHELUK";
			//sUrl = sUrl + "?userId=10000027";
			var token = sThis.AppModel.getProperty("/token");
			var oHeaders = {
				"Accept": "application/json",
				"Authorization": "Bearer" + " " + token
			};
			oPhotoModel.loadData(sUrl, null, null, "GET", null, null, oHeaders);
			oPhotoModel.attachRequestCompleted(function (oResponse) {
				if (oResponse.getSource().getData().d.results instanceof Array) {
					callBackFx(oResponse.getSource().getData().d.results[0]);
				} else {
					callBackFx({});
				}
			}.bind(sThis));

		},
		fetchUserImageAsync: function (sThis, staffId) {
			var oPhotoModel = new JSONModel();
			var sUrl = Config.dbOperations.fetchPhotoUser;
			sUrl = sUrl + "?userId=" + staffId;
			var token = sThis.AppModel.getProperty("/token");
			var oHeaders = {
				"Accept": "application/json",
				"Authorization": "Bearer" + " " + token
			};
			oPhotoModel.loadData(sUrl, null, false, "GET", null, null, oHeaders);
			return oPhotoModel.getData().d.results;
		},
		fetchTaskProcessDetails: function (sThis, objData, callBackFx) {
			var oTaskProcessModel = new JSONModel();
			var sUrl = Config.dbOperations.taskProcessHistory;
			sUrl = sUrl + objData.DRAFT_ID;
			var token = sThis.AppModel.getProperty("/token");
			var oHeaders = {
				"Accept": "application/json",
				"Authorization": "Bearer" + " " + token
			};
			oTaskProcessModel.loadData(sUrl, null, false, "GET", null, null, oHeaders);
			callBackFx(oTaskProcessModel.getData());
		},
		fetchTaskType: function (sThis, callBackFx) {
			var oDataModel = sThis.getOwnerComponent().getModel("EclaimSrvModel");
			oDataModel.read("/EclaimsDatas/$count", {
				filters: [],
				success: function (oData) {
					if (oData) {
						// that.getView().byId("itfProcess").setCount(oData);
					}
				},
				error: function (oError) {}
			});
		},
		_loadDataUsingJsonModel: function (serviceUrl, oPayload, httpMethod, headers, callBackFx) {
			var oModel = new JSONModel();
			var sPayload = null;
			if (oPayload) {
				if (httpMethod === "GET") {
					sPayload = oPayload;
				} else {
					sPayload = JSON.stringify(oPayload);
				}
			}
			oModel.loadData(serviceUrl, sPayload, null, httpMethod, null, null, headers);
			oModel.attachRequestCompleted(function (oResponse) {
				callBackFx(oResponse);
			});
		}
	};
});