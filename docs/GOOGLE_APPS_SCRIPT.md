# Google Apps Script Setup for Contact and Feedback Forms

This is the script deployed to Google Apps Script as a web app, which collects form data from both the `/contact` page and the `/student` layout feedback panel and appends it to respective sheets in a Google Spreadsheet.

## Spreadsheet Sheet Structure

The Google Spreadsheet ID is `1TODkswVHO0xls8EDljehI_eXsF_tryugHmYYQKztYMw`.
It contains two sheets:
1. `ContactForm`
2. `FeedbackForm`

Both sheets should have the following column headers in Row 1:
`Timestamp | Page | Role | Plan | Email | Phone | Name | Title | Message`

---

## Google Apps Script Code

Copy the following code into your Google Apps Script editor (`Extensions > Apps Script` inside the Google Sheet):

```javascript
function doPost(e) {
  const spreadsheet = SpreadsheetApp.openById("1TODkswVHO0xls8EDljehI_eXsF_tryugHmYYQKztYMw");

  const contactSheet = spreadsheet.getSheetByName("ContactForm");
  const feedbackSheet = spreadsheet.getSheetByName("FeedbackForm");

  try {
    const data = JSON.parse(e.postData.contents);

    const {
      page,
      role,
      plan,
      email,
      phone,
      name,
      title,
      message
    } = data;

    // Select sheet based on page URL
    const sheet = page === "/contact"
      ? contactSheet
      : feedbackSheet;

    // Append row
    sheet.appendRow([
      new Date(), // Timestamp generated automatically
      page,
      role,
      plan,
      email,
      phone,
      name,
      title,
      message
    ]);

    return ContentService
      .createTextOutput(
        JSON.stringify({
          status: "success"
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(
        JSON.stringify({
          status: "error",
          message: err.message
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Deployment

Deploy this script as a **Web App**:
1. Click **Deploy > New deployment**.
2. Select **Web app** as the type.
3. Choose **Execute as: Me**.
4. Choose **Who has access: Anyone**.
5. Copy the generated **Web app URL** and set it in the environment variable files:
   - Backend `.env`: `APPS_SCRIPT_URL`
   - Frontend `web/.env`: `CONTACT_FORM_GOOGLE_APPSCRIPT_URL` and `FEEDBACK_FORM_GOOGLE_APPSCRIPT_URL`
