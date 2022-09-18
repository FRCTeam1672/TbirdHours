# T-Bird Hours

Team 1672's attendance solution, originally by Team 5892

## How to install

### Setting up google sheets and apps script

1. Create a new Google Sheet titled "Team 1672 Attendance [Year here]"
2. Go to File→Import and import the T-Bird Hours template
    - You will need to fill out all the student info on the "Users" tab — first name, last name, and ID
    - Make sure to extend the formulas in columns D, E, and F downwards as needed
3. Go to Extensions→Apps Script, delete the contents of Code.gs and paste in the contents of Code.gs from this project
4. Make sure to click the save button to save the project before deploying
5. Click the Deploy button, then click New Deployment
    - Make sure the Deployment Type is "Web App", Execute As is set to "Me (your email)", and Who Has Access is set to "Anyone
7. Make sure to authorize the application (it may be marked as untrusted which is normal)
8. Copy the web app URL and save it for later

### Setting up your kiosk

1. Download this project as a ZIP file (Code→Download ZIP on GitHub)
2. Extract the ZIP file into a folder of your choice
3. Rename config.js.sample to config.js
5. Put the web app URL you copied earlier into config.js, replacing "web_app_url_here"

## How to use

1. Open index.html in any web browser
2. Connect the ID scanner to the laptop you're using
    - If the scanner is broken, you can enter ID numbers manually
3. Keep the ID input field focused

## Tips

- You can enter "#" into the ID field to immediately sign out every student that is currently checked in
