 import { compactDecrypt } from 'https://esm.sh/jose';
const BASE_URL = 'https://cctapi.petron.com';
const PASSKEY  = '59d6aa5a-a648-422c-a0e2-ee8181c3d189';
const SECRETKEY = '2f8a5f6ed2b04185aa621c6752245522';
const customerForm = document.getElementById('customerForm');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('q');
const salesOrgSelect = document.getElementById("salesOrg");
const customerContacts = document.getElementById('contacts');
  const loading = document.getElementById('loadingPopup');
let ticketID = "";
let contacts;
let salesOrgData = [];

window.onload = function () {
    ZOHODESK.extension.onload().then(function (App) {
    //Get ticket related data
    ZOHODESK.get('ticket').then(function (res) {
         console.log(res);
            ticketID = res.ticket.id;
        console.log("Ticket ID: " + ticketID);
           
        }).catch(function (err) {
            //error Handling
        });
});
};


 async function decryptResponse(encryptedToken, keyUtf8) {
    const raw = new TextEncoder().encode(keyUtf8);
    if (raw.length !== 32) throw new Error('Key must be 32 bytes (UTF-8).');
    const { plaintext } = await compactDecrypt(encryptedToken, raw);

    let sapPayload = JSON.parse(new TextDecoder().decode(plaintext));
    const cleaned = cleanSapPayload(sapPayload);
    addAccountDatails(cleaned);
    aggregateSalesOrg(cleaned);
    aggregateContacts(cleaned);
    console.log(cleaned);
    hideLoading();
    // SAPdata = cleaned;
    return JSON.stringify(JSON.parse(new TextDecoder().decode(plaintext)));
  }
  
searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
showLoading();
removeChildrenExceptFirst(salesOrgSelect);
ZOHODESK.get('ticket').then(function (res) {
         console.log(res);
            ticketID = res.ticket.id;
        console.log("Ticket ID: " + ticketID);
           
        }).catch(function (err) {
            //error Handling
        });
let customerNumber = searchInput.value.trim(searchInput.value);
 const url = `${BASE_URL}/api/auth/Token`;
let requestObj = {
             url: url,
             headers: {"Content-Type":"application/json"},
             postBody: {"Passkey": PASSKEY},
             type: 'POST',
             data: {}
         }
console.clear();		 
console.log(requestObj)		 
         ZOHODESK.request(requestObj).then(res => {
            // Implement your logic here
            let requestRes=JSON.parse(res).response;
            let authData= JSON.parse(requestRes);
            console.log(authData.token);
            let token=authData.token;
            
    
           let getCustomerUrl = `${BASE_URL}/api/marketing/GetCustomerProfile?CustomerNumber=${customerNumber}`;
            let customerObj = {
                 url: getCustomerUrl,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"},
                postBody: {},
                type: 'GET',
                data: {}
             }
        ZOHODESK.request(customerObj).then(customerRes => {
             // Implement your logic here
            let customerData=JSON.parse(customerRes).response;
            console.log(customerData);
            let customerDataResult= JSON.parse(customerData);
            console.log(customerDataResult.encryptedResponse);
            let encryptedToken=customerDataResult.encryptedResponse;

            decryptResponse(encryptedToken, SECRETKEY).then(console.log).catch(console.error);
         }, (error) => {
             // Implement your logic here
             console.log(error);
         })


         }, (error) => {
             // Implement your logic here
             console.log(error);
         })
}); 


function cleanSapPayload(raw) {
  const outer = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const inner = typeof outer.data === 'string' ? JSON.parse(outer.data) : outer.data;

  function normalize(v) {
    if (v == null) return null;
    if (Array.isArray(v)) return v.map(normalize);
    if (typeof v === 'object') {
      const o = {};
      for (const k of Object.keys(v)) o[k] = normalize(v[k]);
      return o;
    }
    if (typeof v === 'string') {
      const t = v.trim();
      return t === '' ? null : t;
    }
    return v; // numbers/booleans unchanged
  }

  return normalize(inner);
}

function aggregateSalesOrg(data) {
    let customers = data.customerProfile;
    customers.forEach(function(currentValue, index, arr) {

    let myObject = {
    SalesOrg: currentValue.SalesOrg,
    DistributionChannel: currentValue.DistributionChannel,
    Division: currentValue.Division,
    SalesGroup:currentValue.SalesGroup,
    ServiceOrganization:currentValue.ServiceOrganization,
    RegionMarket:currentValue.RegionMarket
    };

    salesOrgData.push(myObject);

    });
    
    for (let i=0;i<salesOrgData.length;i++){
        // console.log(salesOrgData[i]);
    let option = document.createElement("option");
        option.value = i;
        option.textContent = salesOrgData[i].SalesOrg;
    salesOrgSelect.appendChild(option);
    }

}

function aggregateContacts(data) {
    contacts = data.contactInfo;

    
    for (let i=0;i<contacts.length;i++){
        // console.log(salesOrgData[i]);
    let option = document.createElement("option");
        option.value = i;
        option.textContent = contacts[i].ContactName;
    customerContacts.appendChild(option);
    }

}


function addAccountDatails(data) {
    let accountData = data.customerProfile[0];  
    document.getElementById('accountName').value = accountData.AccountName || '';
    document.getElementById('streetHouseNumber').value = accountData.StreetHouseNumber || '';
    document.getElementById('city').value = accountData.City || '';
    document.getElementById('postalCode').value = accountData.PostalCode || '';
    document.getElementById('region').value = accountData.Region || '';
    document.getElementById('district').value = accountData.District || '';
    document.getElementById('country').value = accountData.Country || '';

    let aseData = data.aseInfo;
    let asmData = data.asmInfo;

     document.getElementById('aseInfo').value = aseData.ASEName || '';
     document.getElementById('asmInfo').value = asmData.ASMName || '';
     
}
function removeChildrenExceptFirst(selectElement) {
  // Ensure the provided element is a <select>
  if (!selectElement || selectElement.tagName !== 'SELECT') {
    console.error("Provided element is not a <select> element.");
    return;
  }

  // Loop while there are more than one child elements
  // and remove the last child until only the first remains
  while (selectElement.children.length > 1) {
    selectElement.removeChild(selectElement.children[1]);
  }
}



salesOrgSelect.addEventListener('change', function() {
    let selectedIndex = salesOrgSelect.value;
    let selectedSalesOrg = salesOrgData[selectedIndex]; 
    
    document.getElementById('salesOrgName').value = selectedSalesOrg.SalesOrg || '';
    document.getElementById('distributionChannel').value = selectedSalesOrg.DistributionChannel || '';
    document.getElementById('division').value = selectedSalesOrg.Division || '';        
    document.getElementById('salesGroup').value = selectedSalesOrg.SalesGroup || '';
    document.getElementById('serviceOrg').value = selectedSalesOrg.ServiceOrganization || '';
    document.getElementById('regionMarket').value = selectedSalesOrg.RegionMarket || '';
});

customerContacts.addEventListener('change', function() {
    let selectedIndex = customerContacts.value;
    let selectedContact = contacts[selectedIndex];

    document.getElementById('contactName').value = selectedContact.ContactName || '';
    document.getElementById('contactEmail').value = selectedContact.Email || '';
    document.getElementById('contactFunc').value = selectedContact.ContactFunc || '';
    document.getElementById('contactRole').value = selectedContact.ContactRole || '';
    document.getElementById('contactPhone').value = selectedContact.Phone || '';
    document.getElementById('telNo').value = selectedContact.TelNo || '';
});

customerForm.addEventListener('submit', function (event) {
  event.preventDefault();

  showLoading();
    // Implement form submission logic here
  

    let customFeilds ={
        cf_customer_number:document.getElementById('q').value.trim(),
        cf_account_name:document.getElementById('accountName').value,
        cf_city:document.getElementById('city').value,
        cf_postal_code:document.getElementById('postalCode').value,
        cf_region:document.getElementById('region').value,
        cf_district:document.getElementById('district').value,
        cf_country:document.getElementById('country').value,
        cf_street_house_number:document.getElementById('streetHouseNumber').value,
        cf_division:document.getElementById('division').value,
        cf_sales_group:document.getElementById('serviceOrg').value,
        cf_service_organization_1:document.getElementById('serviceOrg').value,
        cf_sales_org_name:document.getElementById('salesOrgName').value,
        cf_distribution_channel:document.getElementById('distributionChannel').value,
        cf_region_market:document.getElementById('regionMarket').value,
        cf_contact_name:document.getElementById('contactName').value,
        cf_contact_func:document.getElementById('contactFunc').value,
        cf_contact_role:document.getElementById('contactRole').value,
        cf_contact_email:document.getElementById('contactEmail').value,
        cf_sap_tel_no:document.getElementById('telNo').value,
        cf_sap_contact_phone:document.getElementById('contactPhone').value,
        cf_asename:document.getElementById('aseInfo').value,
        cf_asmname:document.getElementById('asmInfo').value
    }

    let requestUrl = `https://desk.zoho.com/api/v1/tickets/${ticketID}`;

    console.log("Request URL: " + requestUrl);
    ZOHODESK.request({
        url: requestUrl,   
        headers: {"Content-Type":"application/json"},
        data: {},
        type: 'PUT',
        connectionLinkName: 'zdesk_conn', 
        postBody: {
            cf: customFeilds
        }       
    }).then(res => {
        // Implement your logic here
        console.log("Ticket updated successfully.");
        console.log(res);
        salesOrgSelect.innerHTML = '';
        customerContacts.innerHTML = '';
        salesOrgData = [];
        customerForm.reset();
        searchForm.reset();
        hideLoading();
    
   
        ZOHODESK.notify({
            title : "Notification",
            content : "Ticket updated successfully.",
            icon:"success",
            autoClose: false
        });

     }, (error) => {
         // Implement your logic here
         console.log("Error updating ticket.");
         console.log(error);
         ZOHODESK.notify({
            title : "Notification",
            content : "Error updating ticket.",
            icon:"failure",
            autoClose: false
        });
     });        

}); 

 function showLoading() {
    loading.classList.add('active');

  }
  function hideLoading() {
    loading.classList.remove('active');

  }
