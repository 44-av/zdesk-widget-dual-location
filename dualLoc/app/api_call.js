// Read the value from .env file
const org_id = "913866287";
const connection_name = "z_widget";

console.log("JS Loaded");

const sampleData = {
  email: "philip.gaje@devtac.com",
  subject: "Initial Email v2",
};
let widget_location = "";
window.onload = function () {
  ZOHODESK.extension
    .onload()
    .then((App=>{
      console.log("Location");
      console.log(App);
      widget_location = App.location;
      updateWidgetTitle(widget_location);
    }))
    .then(checkCurrentTicket)
    .then(bindEvents)
    .catch(function (err) {
      console.error("Zoho Desk Extension initialization failed:", err);
    });
};
function updateWidgetTitle(location) {
  const titleEl = document.getElementById("widgetTitle");
  if (!titleEl) return;

  if (location === "desk.ticket.detail.subtab") {
    titleEl.innerText = "Ticket Detail Helper";
  } else if (location === "desk.ticket.form.rightpanel") {
    titleEl.innerText = "Ticket Form Autofiller";
  } else {
    titleEl.innerText = "Zoho Desk Widget"; // Fallback
  }
}
function checkCurrentTicket() {
  ZOHODESK.get("ticket")
    .then((res) => {
      const ticket = res.ticket;
      console.log("--- Current Ticket Info ---");
      console.log("Ticket ID:", ticket.id);
      console.log("Email:", ticket.email);
      console.log("Subject:", ticket.subject);
      console.log("Full Ticket Object:", ticket);
    })
    .catch(function (err) {
      console.error("Failed to fetch current ticket:", err);
    });
}

function bindEvents() {
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveTrigger);
    console.log("Event listener attached to #saveBtn");
  } else {
    console.warn("Element #saveBtn not found in the DOM.");
  }
}
function handleSaveTrigger() {
  console.log("Save button clicked. Validating initialized location status...");
  console.log("Evaluated location:", widget_location);

  if (widget_location === "desk.ticket.detail.subtab") {
    console.log("Routing execution context to: updateviaSubTav");
    updateviaSubTav();
  } else if (widget_location == "desk.ticket.form.rightpanel"){
    console.log("Routing execution context to: updateviaFormPanel");
    updateviaFormPanel();
  }
}
function updateviaFormPanel() {
  ZOHODESK.set("ticketForm.cf_sap_test_field",{ value: "This is a test data from SAP" })
    .then(function(data) {
      console.log("Subject field data:", data);
    })
    .catch(function(err) {
      console.error("Failed to get individual field:", err);
    });
}
// Update phone data when save button is clicked
function updateviaSubTav() {
  console.log("Save button clicked. Attempting to update ticket phone...");
 ZOHODESK.set("ticket", {
  customFields: {
    cf_sap_test_field: "Test from SubTab"
  }
})
.then(function (response) {
  console.log("Update Success", response);
})
.catch(function (err) {
  console.error("Update Failed", err);
});
    
}
