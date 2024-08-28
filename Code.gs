var dataSheet = SpreadsheetApp.getActive().getSheetByName("Data Log");
var userSheet = SpreadsheetApp.getActive().getSheetByName("Users");

function findOrphanedCheckIn(userID) {
	let values = dataSheet.getDataRange().getValues();
	for (let i = 0; i < values.length; i++) {
		if (i > 0) {
			if (
				values[i][0].toString() === userID.toString() &&
				values[i][2].toString() === "" &&
				values[i][1]
			) {
				return i;
			}
		}
	}
	return null;
}

function userHasPastCheckin(userID) {
	let values = dataSheet.getDataRange().getValues();
	for (let i = 0; i < values.length; i++) {
		if (i > 0) {
			if (
				values[i][0].toString() === userID.toString() &&
				values[i][1].toString() != ""
			) {
				return i;
			}
		}
	}
	return null;
}

function userExists(userID) {
	let values = userSheet.getDataRange().getValues();
	for (let i = 0; i < values.length; i++) {
		if (i > 0) {
			if (values[i][0].toString() === userID.toString()) {
				return true;
			}
		}
	}
	return false;
}

function toggleAttendance(e){
  if (findOrphanedCheckIn(e.parameter.userID)) {
			userName = getNameFromID(e.parameter.userID);
      console.log(userName);
      	//User is already checked in, lets check them out
        if (
				findOrphanedCheckIn(e.parameter.userID) &&
				userHasPastCheckin(e.parameter.userID)
			) {

				row = findOrphanedCheckIn(e.parameter.userID) + 1;
				dataSheet
					.getRange(row, 3, 1, 2)
					.setValues([[new Date(), `=C${row}-B${row}`]]);
				return ContentService.createTextOutput(
					JSON.stringify({ status: "success", leave: true, message: "User checked out", name: getNameFromID(e.parameter.userID)})
				).setMimeType(ContentService.MimeType.JSON);
			}
			} else {
				dataSheet.appendRow([e.parameter.userID, new Date()]);
				return ContentService.createTextOutput(
					JSON.stringify({ status: "success", leave: false, message: "User checked in", name: getNameFromID(e.parameter.userID)})
				).setMimeType(ContentService.MimeType.JSON);
			}
}

function getNameFromID(userID) {
  let values = userSheet.getDataRange().getValues();
	for (let i = 0; i < values.length; i++) {
		if (i > 0) {
			if (values[i][0].toString() === userID.toString()) {
				return values[i][1] + " " + values[i][2];
			}
		}
	}
	return "NO NAME";
}

function begoneChildren(){
  let values = userSheet.getDataRange().getValues();
	for (let i = 0; i < values.length; i++) {
		if (i > 0) {
			if (values[i][0].toString() != "") {
				console.log("UserName: " + values[i][0].toString());
        console.log("Value: " + values[i][4].toString());
        if(values[i][4]){
          console.log("check them out")
            row = findOrphanedCheckIn(values[i][0]) + 1;
				    dataSheet
					.getRange(row, 3, 1, 2)
					.setValues([[new Date(), `=C${row}-B${row}`]]);
        }
        continue;
			}
		}
	}
	return null;
}
function doGet(e) {
	if (e.parameter.operation.toString() === "getUsersData") {
		return ContentService.createTextOutput(
			JSON.stringify(userSheet.getDataRange().getValues())
		).setMimeType(ContentService.MimeType.JSON);
	}
  if(e.parameter.operation.toString() === "begonechildren"){
    begoneChildren();

    //Little fun message for if you want to be able to add a bit of *spice* to your message
    // return ContentService.createTextOutput(
		// 	JSON.stringify({ status: "success", message: "BEGONE CHILLLDREEEEN" })
		// ).setMimeType(ContentService.MimeType.JSON);
      return ContentService.createTextOutput(
			JSON.stringify({ status: "success", message: "Signed everyone out" })
		).setMimeType(ContentService.MimeType.JSON);
  }
	if (userExists(e.parameter.userID)) {
    //Start by checking in the user, if not, then check them out
    return toggleAttendance(e);
	} else {
		return ContentService.createTextOutput(
			JSON.stringify({ status: "error", message: "User does not exist" })
		).setMimeType(ContentService.MimeType.JSON);
	}
}