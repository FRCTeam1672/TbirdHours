let configFile = "config.json";
let endpoint;
let successSound;
let errorSound;
const date = new Date();
function transformTabularData(rawdata) {
	// This is an example of array destructuring.
	// - extract the first item in the array into local variable `headers`
	// - assign the remainder of the array to local variable `data` using the rest operator
	const [columns, ...rows] = rawdata;

	// do a 1 for 1 conversion of each row into an object and return a new array
	return rows.map((values) =>
		// create a new object per row
		// use the column headers as the object key
		// and the corresponding row value as the object value
		columns.reduce((obj, column, index) => {
			obj[column] = values[index];
			return obj;
		}, {})
	);
}

// adds a 0 in front of a 1-digit number, otherwise nothing changes
function padTwoDigits(x) {
	return x.toString().padStart(2, '0');
}

const app = {
	name: "TBird Hours",
	data() {
		return {
			popupTimer: null,
			form: {
				userID: "",
				operation: "",
			},
			mode: {
				operation: "checkIn",
				text: "Check In",
			},
			localLog: [],
			usersData: [],
			leaderboard: [
				{userID: "37971", name: "John Doe1", totalSeconds: 12343},
				{userID: "37971", name: "John Doe2", totalSeconds: 12143},
				{userID: "37971", name: "John Doe3", totalSeconds: 12349},
				{userID: "37971", name: "John Doe4", totalSeconds: 156343},
				{userID: "37971", name: "John Doe5", totalSeconds: 52343},
				{userID: "37971", name: "John Doe6", totalSeconds: 52343},
				{userID: "37971", name: "John Doe7", totalSeconds: 52343},
				{userID: "37971", name: "John Doe8", totalSeconds: 52343},
				{userID: "37971", name: "John Doe9", totalSeconds: 52343},
				{userID: "37971", name: "John Doe10", totalSeconds: 52343},

			],
			usersCheckedIn: 0,
			onLine: navigator.onLine,
			dateTime: {
				date: `${padTwoDigits(date.getMonth() + 1)}/${padTwoDigits(date.getDate())}/${date.getFullYear()}`,
				time: `${padTwoDigits(date.getHours() % 12)}:${padTwoDigits(date.getMinutes())}:${padTwoDigits(date.getSeconds())}`,
			},
			timer: undefined,
		};
	},
	beforeMount() {
		this.timer = setInterval(this.setDateTime, 1000);
	},
	mounted() {
		endpoint = APP_CONFIG["endpoint"];
		successSound = new Audio(APP_CONFIG["successSound"]);
		errorSound = new Audio(APP_CONFIG["errorSound"]);
		
		this.getUsersData();
		window.addEventListener("online", this.updateOnlineStatus);
		window.addEventListener("offline", this.updateOnlineStatus);
		window.addEventListener("keydown", (e) => {
			if (e.key === "*") {
				location.reload();
			}
		});
		window.addEventListener("keydown", (e) => {
			if (e.key === "m") {
				//show the popup modal
				this.toggleMembersView()
			}
		});
		window.addEventListener("keydown", (e) => {
			if (e.key === "h") {
				//show the popup modal
				this.toggleHelpText()
			}
		});
		window.addEventListener("keydown", (e) => {
			if (e.key === "l") {
				//show the popup modal
				this.toggleLeaderboard()
			}
		});
		window.addEventListener("keydown", (e) => {
			if (e.key === "#") {
				//show the popup modal
				this.form.userID = "#";
				this.submitForm()
			}
		});
		this.enableUserField();
	},
	beforeDestroy() {
		window.removeEventListener("online", this.updateOnlineStatus);
		window.removeEventListener("offline", this.updateOnlineStatus);
		window.removeEventListener("keydown");
	},
	beforeUnmount() {
		clearInterval(this.timer);
	},
	computed: {
		localLogEntries() {
			return this.localLog.slice(-10);
		},

	},
	methods: {
		//releated to popup
		showPopup() {
			const popup = document.getElementById("popup-box");
			if (popup) {
				popup.style.display = "flex";
			}
		},
		closePopup() {
			const popup = document.getElementById("popup-box");
			if (popup) {
				popup.style.display = "none";
				if(this.popupTimer) {
					clearTimeout(this.popupTimer);
					this.popupTimer = null;
				}
			}
		},
		startTimer() {
			if(this.popupTimer) {
				this.cancelTimer();
			}
			this.popupTimer = setTimeout(this.closePopup, 3000);
		},
		cancelTimer() {
			if (this.popupTimer) {
				clearTimeout(this.popupTimer);
				this.popupTimer = null;
			}
		},
		changePopupText(title, titleColor, description) {
			const popupTitle = document.getElementById("popup-title");
			if(popupTitle) {
				//change the color of popupTitle to the titleColor var
				popupTitle.style.color = titleColor;
				popupTitle.textContent = title;
			}
			const popupDesc = document.getElementById("popup-desc");
			if (popupDesc) {
				popupDesc.textContent = description;
			}
		},

		toggleMembersView() {
			var mem = document.getElementById("members");
			mem.style.display = mem.style.display === "none" ? "block" : "none";
		},
		toggleHelpText() {
			var help = document.getElementById("helpText");
			help.style.display = help.style.display === "none" ? "block" : "none";
		},
		toggleLeaderboard() {
			var lead = document.getElementById("leaderboard");
			lead.style.display = lead.style.display === "none" ? "block" : "none";
			var className = document.getElementById("app").className;
			document.getElementById("app").className = className.includes("two") ? className.replace("two", "one") : className.replace("one", "two");
		},
		enableUserField() {
			this.$refs.userID.disabled = false;
			this.$refs.userID.focus()
		},
		disableUserField() {
			this.$refs.userID.disabled = true;
		},
		setDateTime() {
			const date = new Date();
			this.dateTime = {
				date: `${padTwoDigits(date.getMonth() + 1)}/${padTwoDigits(date.getDate())}/${date.getFullYear()}`,
				time: `${padTwoDigits(date.getHours() % 12)}:${padTwoDigits(date.getMinutes())}:${padTwoDigits(date.getSeconds())}`,
			};
		},
		//https://javascript.plainenglish.io/create-a-digital-clock-app-with-vue-3-and-javascript-c5c0251d5ce3
		updateOnlineStatus(e) {
			const { type } = e;
			if (e.type === "offline") {
				this.disableUserField();
			}
			else {
				this.enableUserField();
			}
			this.onLine = type === "online";
		},
		async submitForm() {
			this.disableUserField();
			if (this.form.userID === "") {
				this.enableUserField();
				this.closePopup();
				return;
			}

			this.changePopupText("Please wait...", "#d57e00", "Student ID: " + this.form.userID);
			this.cancelTimer();
			if(this.form.userID === "#"){
				//Sign all of the users out
				this.mode.operation = "begonechildren";
				this.form.userID = "";
				this.changePopupText("Please wait...", "#0007c0", "Currently signing everyone out... ");
				this.enableUserField();
			}

			var id = this.form.userID + "";
			if(id.startsWith(" ")){
				id = id.substring(1);
			}
			this.showPopup()
			await fetch(
				endpoint +
				"?" +
				new URLSearchParams({
					userID: id,
					operation: this.mode.operation,
				}),
				{
					method: "GET",
					redirect: "follow",
				}
				)
				.then((response) => response.json())
				.then((data) => {
					if (data.status === "error") {
						errorSound.play();
						this.changePopupText("ERROR", "red", "Student ID " + id + " does not exist. \n Please scan again.");
						this.startTimer()
					} else if (data.status === "success") {
						successSound.play();
						if(data.begone === true) {
							this.changePopupText("Goodbye Everyone", "lightblue", "Successfully checked out all students");
						}
						else if(data.leave === false) {
							this.changePopupText("Welcome Back", "green", "Successfully checked in " + data.name);
						}
						else {
							this.changePopupText("Goodbye", "green", "Successfully checked out " + data.name);
						}
						this.startTimer()
					}
					this.localLog.push({
						userID: id,
						operation: this.mode.operation,
						status: data.status,
						message: data.message,
					});

					console.log(data);
					this.form.userID = "";
					this.enableUserField()
				});
				this.mode.operation = "attendance";
				await this.getUsersData();

		},
		async getUsersData() {
			await fetch(
				endpoint +
					"?" +
					new URLSearchParams({
						operation: "getUsersData",
					}),
				{
					method: "GET",
					redirect: "follow",
				}
			)
				.then((response) => response.json())
				.then((data) => {
					usersCheckedInCount = 0
					this.usersData = transformTabularData(data);
					data.forEach((item, index) => {
						if (index > 0) {
							item[4] === true && usersCheckedInCount++
						}
					},
					)
					this.usersCheckedIn = usersCheckedInCount
				});
		},
		convertTimestampToDuration(timestamp) {
			var d = Number(timestamp);

			var h = padTwoDigits(Math.floor(d / 3600));
			var m = padTwoDigits(Math.floor((d % 3600) / 60));
			var s = padTwoDigits(Math.floor((d % 3600) % 60));

			return `${h}:${m}`;
			// https://stackoverflow.com/questions/5539028/converting-seconds-into-hhmmss
		},
	},
	watch: {
		onLine(v) {
			if (v) {
				this.showBackOnline = true;
				setTimeout(() => {
					this.showBackOnline = false;
				}, 1000);
			}
		},
	},
};
Vue.createApp(app).mount("#app");
