sap.ui.define([],
	function () {

		return {
			getRandomNumber: function () {
				return Math.floor(Math.random() * Math.floor(5));
			},
			taskOperations: {},
			gwTaskOperations: {},
			sfOperations: {},
			processOperations: {},
			dbOperations: {
				metadataclaims: "/odata/eclaims",
				fetchTaskType: "/odata/eclaims/ProcessConfigs",
			//	eclaimAuthToken: "/authorize?username=",
				eclaimAuthToken: "/tokenauthorize",
				userDetails: "/rest/utils/getUserDetails",
				fetchPhotoUser: "/rest/eclaims/photo/api",
				fetchFilterLookup: "/rest/eclaims/filter",
				taskProcessHistory: "/rest/inbox/getProcessTrackerDetails?draftId="
			}

		};
	});