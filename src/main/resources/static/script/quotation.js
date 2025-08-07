let quotationTableInstance;
let selectedQuotation;
let getPrivilege;


window.addEventListener("load", function () {

    //Get Privilege of Quot
    getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/QUOTATION");

    if (!getPrivilege.insert) {
        $("#addQuotationBtn").prop("disabled", true);
    }


    //Call function to reload the quotation table
    reloadQuotationTable();

    // Fetch all quotation requests via an AJAX GET request
    const qRequests = ajaxGetRequest("/quotation-request/send");


    const qrnSelectElement = document.getElementById("qRequest_no");
    const supIdSelectElement = document.getElementById("quo-supId");

   // Refresh the quotation form to reset all fields and reload data
    refreshQuotationForm();

   //Call function to validate the quotation form fields
   quotationValidation();


});


//Define refresh function for quotation form
const refreshQuotationForm = () =>{
    

    quotation = new Object();
    oldQuotation = null;


    // Fetch all quotation requests via an AJAX GET request
    const qRequests = ajaxGetRequest("/quotation-request/send");


    const qrnSelectElement = document.getElementById("qRequest_no");
    const supIdSelectElement = document.getElementById("quo-supId");

    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('add-receivedDate').setAttribute('max', todayStr);
    document.getElementById('add-proposedDeliveryDate').setAttribute('min', todayStr);
     document.getElementById('add-proposedDeliveryDate').setAttribute('max', todayStr);

    document.getElementById('btnQuotationUpdate').disabled = true;
    document.getElementById('btnQuotationSubmit').disabled = false;
    const receivedDateInput = document.getElementById('add-receivedDate');
    const proposedDeliveryDateInput = document.getElementById('add-proposedDeliveryDate');



     //Auto refill all batches on dropdown
         // Fill Batch dropdown as 'batchNo (flavor)'
         qrnSelectElement.innerHTML = '';
         const defaultOption = document.createElement('option');
         defaultOption.value = '';
         defaultOption.textContent = 'Select Quotation Request';
         qrnSelectElement.appendChild(defaultOption);
         qRequests.forEach(qReq => {
             const option = document.createElement('option');
             option.value = JSON.stringify(qReq);
             option.textContent = qReq.requestNo;
             qrnSelectElement.appendChild(option);
         });

    //Buttons should be disabled
    receivedDateInput.disabled = true;
    proposedDeliveryDateInput.disabled = true;

    // Add an event listener to handle changes in the quotation request number dropdown
    qrnSelectElement.addEventListener('change', (event) => {
        const selectedValue = JSON.parse(event.target.value);
        const request = qRequests.find((r) => r.requestNo === selectedValue.requestNo);

        //Buttons should be disabled
         receivedDateInput.disabled = false;
         proposedDeliveryDateInput.disabled = false;

        console.log(request);

        // Set min/max for Received Date input
        const deadline = request.deadline ? new Date(request.deadline) : null;
        const addedDate = request.requestDate ? new Date(request.requestDate) : null;
        // Convert to yyyy-mm-dd
        if (addedDate) {
            console.log(addedDate);
            receivedDateInput.setAttribute('min', addedDate.toISOString().split('T')[0]);
        }
        if (deadline) {
            receivedDateInput.setAttribute('max', deadline.toISOString().split('T')[0]);
        }

        const requiredDeliveryDate = request.requiredDeliveryDate ? new Date(request.requiredDeliveryDate) : null;
        // Convert to yyyy-mm-dd
        if (requiredDeliveryDate) {
            console.log(requiredDeliveryDate);
            proposedDeliveryDateInput.setAttribute('min', addedDate.toISOString().split('T')[0]);
        }
        if (requiredDeliveryDate) {
            proposedDeliveryDateInput.setAttribute('max', requiredDeliveryDate.toISOString().split('T')[0]);
        }


    // Fill data to Ingredient ID field: value = ingCode, textContent = 'ingCode - ingredientName'
    const ingInput = document.getElementById("quo-ingId");
    const option = document.createElement('option');
    option.value = request.ingCode;
    option.textContent = request.ingCode + " - " + request.ingredientName;
    option.selected = true;
    ingInput.appendChild(option);




    // Bind values into quotation object and validate
    quotation.ingredientCode = request.ingCode;

    const qStatus = document.getElementById('add-quotationStatus');
    qStatus.value = "Pending";
        

        // Fill data to supplier id select element
        supIdSelectElement.innerHTML = '';
        innerHTML = '<option value="" selected>Select Supplier ID</option>';
        const defaultOption = document.createElement('option');
         defaultOption.value = '';
         defaultOption.textContent = 'Select Supplier ID';
         supIdSelectElement.appendChild(defaultOption);
        request.suppliers.forEach((sup) => {
            const option = document.createElement('option');
            option.value = sup;
            option.textContent = sup;
            supIdSelectElement.appendChild(option);
        });
    });

}

//Define function to validate the form
const quotationValidation = () =>{

    const qRequestNo = document.getElementById('qRequest_no');
    qRequestNo.addEventListener('change', () => {
        DynamicSelectValidationOnlyValue(qRequestNo, 'quotation', 'quotationRequestNo','requestNo');
    });

    //Ingredient ID Bind and validate in formRefresh function  on line 89

    const qSupId = document.getElementById('quo-supId');
        qSupId.addEventListener('change', () =>{
            selectFieldValidator(qSupId,'','quotation','supplierRegNo')
    })

    const addReceivedDate = document.getElementById('add-receivedDate');
    addReceivedDate.addEventListener('change', () =>{
        dateFeildValidator(addReceivedDate,'','quotation','receivedDate')
    })

    const addProposedDeliveryDate = document.getElementById('add-proposedDeliveryDate');
    addProposedDeliveryDate.addEventListener('change', () => {
        dateFeildValidator(addProposedDeliveryDate, '', 'quotation', 'proposedDeliveryDate');
    });

    const addPriceUnit = document.getElementById('add-pricePerUnit');
    addPriceUnit.addEventListener('input', () =>{
            validation(addPriceUnit,'^(?:[1-9]|[0-9]{2,6})$','quotation','pricePerUnit')
    })

    const addQuotationStatus = document.getElementById('add-quotationStatus');
    addQuotationStatus.addEventListener('change', () =>{
            selectFieldValidator(addQuotationStatus,'','quotation','quotationStatus')
    });

}

//Check Quotation form errors
const checkQuotationFormError = () => {
    let errors = '';
    const qRequestNo = document.getElementById('qRequest_no');
    const qSupId = document.getElementById('quo-supId');
    const addReceivedDate = document.getElementById('add-receivedDate');
    const addProposedDeliveryDate = document.getElementById('add-proposedDeliveryDate');
    const addPriceUnit = document.getElementById('add-pricePerUnit');
    const addQuotationStatus = document.getElementById('add-quotationStatus');

    if (quotation.quotationRequestNo == null) {
        errors += "QReQ No can't be null \n";
        qRequestNo.classList.add('is-invalid');
    }

    if (quotation.ingredientCode == null) {
        errors += "Ingredient Code can't be null \n";
        document.getElementById("quo-ingId").classList.add('is-invalid');
    }

    if (quotation.supplierRegNo == null) {
        errors += "Please Select Supplier \n";
        qSupId.classList.add('is-invalid');
    }

    if (quotation.receivedDate == null) {
        errors += "Received Date can't be null\n";
        addReceivedDate.classList.add('is-invalid');
    }

    if (quotation.proposedDeliveryDate == null || quotation.proposedDeliveryDate === "") {
        errors += "Proposed Delivery Date can't be null\n";
        addProposedDeliveryDate.classList.add('is-invalid');
    }

    if (quotation.pricePerUnit == null || quotation.pricePerUnit === "") {
        errors += "Price Per Unit can't be null\n";
        addPriceUnit.classList.add('is-invalid');
    }

    if (quotation.quotationStatus == null) {
        errors += "Please Select the status \n";
        addQuotationStatus.classList.add('is-invalid');
    }

    return errors;
}


//Declare Quotation submit function
 const quotationSubmit = () => {
    event.preventDefault();
    console.log("button Quotation Submit");
    quotation.quotationStatus = "Pending";

    // 1. Check form errors
    const errors = checkQuotationFormError();

    if (errors === "") {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to add the Quotation " + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E11D48",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Add"
        }).then((result) => {
            if (result.isConfirmed) {
                const postServiceRequestResponse = ajaxRequestBody("/quotation", "POST", quotation);

                // Check backend response
                if (postServiceRequestResponse.status === 200) {
                    $("#modalQuotationAdd").modal('hide');
                    quotationAddForm.reset();
                    reloadQuotationTable();
                    refreshQuotationForm();

                    // Reset validation classes
                    Array.from(quotationAddForm.elements).forEach((field) => {
                        field.classList.remove('is-valid', 'is-invalid');
                    });

                    Swal.fire({
                        title: "Quotation Added Successfully!",
                        icon: "success"
                    });

                } else {
                    console.error(postServiceRequestResponse);
                    Swal.fire({
                        title: "Error",
                        text: postServiceRequestResponse.responseText,
                        icon: "error"
                    });
                }
            }
        });
    } else {
        Swal.fire({
            title: "Quotation Not Added",
            text: errors,
            icon: "error"
        });
    }
};

//Refill Product form fields
const quotationFormRefill = (ob, rowIndex) => {


  quotation = JSON.parse(JSON.stringify(ob));
  oldQuotation = JSON.parse(JSON.stringify(ob));

  const modalTitle = document.getElementById('quotationModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Quotation';
    }

    console.log(quotation);
    document.getElementById('btnQuotationUpdate').disabled = false;
    document.getElementById('btnQuotationSubmit').disabled = true;


  // Fill Ingredient select/input with both code and name
  const ingInput = document.getElementById("quo-ingId");
  
    // If it's an input, just fill value with code + name
  
  document.getElementById("add-receivedDate").value = convertDateTimeToDate(quotation.receivedDate);
  document.getElementById("add-pricePerUnit").value = quotation.pricePerUnit;
  document.getElementById("add-quotationStatus").value = quotation.quotationStatus;
  document.getElementById("add-proposedDeliveryDate").value = convertDateTimeToDate(quotation.proposedDeliveryDate);

  // Get the select element by its ID
  const qReqNo = document.getElementById("qRequest_no");
  qReqNo.innerHTML = '';

   // Create a new option element
   const newOption = document.createElement("option");

   // Set the value and text content of the new option
   newOption.value = quotation.quotationRequestNo;
   newOption.textContent = quotation.quotationRequestNo;

  // Append the new option to the select element
  qReqNo.appendChild(newOption);

  // Set the value of the select element
  qReqNo.value = quotation.quotationRequestNo;
  qReqNo.disabled = true;

  // Fill Supplier select with regNo and name
  const quoSupID = document.getElementById("quo-supId");
  quoSupID.innerHTML = '';
  const supData = ajaxGetRequest("/supplier/byRegNo/" + quotation.supplierRegNo);
  const supOption = document.createElement("option");
  supOption.value = quotation.supplierRegNo;
  if (supData.businessType && supData.companyName) {
    supOption.textContent = `${quotation.supplierRegNo} - ${supData.companyName}`;
  } else {
    supOption.textContent = `${quotation.supplierRegNo} - ${supData.firstName || ''} ${supData.secondName || ''}`;
  }
  supOption.selected = true;
  quoSupID.appendChild(supOption);
  quoSupID.value = quotation.supplierRegNo;
  quoSupID.disabled = true;
  document.getElementById("add-quotationStatus").disabled = false;


    //refill Quotation No
     const qRequests = ajaxGetRequest("/quotation-request/getAllRequests");
    //
    //    const quoSupID = document.getElementById("quo-supId");

    // Function to fill data into a quotation request select element
//    fillDataIntoSelect.classList.remove('valid-input', 'invalid-input');

    fillDataIntoSelect(
         quoSupID,
         "Select Supplier ID",
         qRequests,
         "supplierRegNo",
         quotation.supplierRegNo
    );

    $("#modalQuotationAdd").modal('show');

};

//Define function for Product update
  const quotationUpdate = () => {
    event.preventDefault();
    quotationAddForm.classList.add('needs-validation');

    //Check form Error
    let errors = checkQuotationFormError();

    if (errors === "") {
      //Check form update
      let updates = checkQuotationUpdates();
      console.log(updates);
      quotationAddForm.classList.remove('was-validated')
      $('#modalQuotationAdd').modal("hide");
      if (updates !== "") {
        swal.fire({
          title: "Do you want to Update " + quotation.quotationNo  + "?",
          html:updates,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#cb421a",
          cancelButtonColor: "#3f3f44",
          confirmButtonText: "Yes, Update"
        }).then((result) =>{
          if(result.isConfirmed){
            let updateServiceResponse = ajaxRequestBody("/quotation", "PUT", quotation);

            if (updateServiceResponse.status === 200) {

              // alert("Update successfully ...! \n");
              Swal.fire({
                title: "Update successfully ..! ",
                text: "",
                icon: "success"
              });

              //Need to refresh
              quotationAddForm.reset();
              reloadQuotationTable();
              refreshQuotationForm();

              // Remove 'is-valid' and 'is-invalid' classes from all input fields
              document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
                input.classList.remove('is-valid', 'is-invalid');
              });
              quotationAddForm.classList.remove('was-validated');

              //Need hide modal
              $('#modalQuotationAdd').modal("hide");
            } else {
              Swal.fire({
                title: "Update Not Successfully ...!",
                text: updateServiceResponse.responseText,
                icon: "error"
              });
            }
          }

        })

      } else {
        $('#modalQuotationAdd').modal("hide");
        Swal.fire({
          title: "No updates Found..!",
          text: '',
          icon: "question"
        });
      }

    } else {
      $('#modalQuotationAdd').modal("hide");
      Swal.fire({
        title: "Form has following errors!",
        text: errors,
        icon: "error"
      });
    }
  }


//Define method for check updates
const checkQuotationUpdates = () =>{
  let updates = "";

  if(quotation.receivedDate !== oldQuotation.receivedDate){
    updates += `Received Date is changed ${oldQuotation.receivedDate} into ${quotation.receivedDate}<br>`;
  }

  if(quotation.proposedDeliveryDate !== oldQuotation.proposedDeliveryDate){
    updates += `Proposed Delivery Date is changed ${oldQuotation.proposedDeliveryDate} into ${quotation.proposedDeliveryDate}<br>`;
  }

  if(quotation.pricePerUnit !== oldQuotation.pricePerUnit){
    updates += `Price Per Unit is changed ${oldQuotation.pricePerUnit} into ${quotation.pricePerUnit}<br>`;
  }

  if(quotation.quotationStatus !== oldQuotation.quotationStatus){
    updates += `Quotation Status is changed ${oldQuotation.quotationStatus} into ${quotation.quotationStatus}<br>`;
  }

  return updates;
}

document.getElementById("purchaseOrderAddForm").onsubmit = function (event) {
    event.preventDefault();

    const total = selectedQuotation.pricePerUnit * parseInt(document.getElementById("add-po-qty").value)
    const purchaseOrder = {
        quotationNo: document.getElementById("add-po-qno").value,
        ingredientCode: document.getElementById("add-po-ingId").value,
        supplierRegNo: document.getElementById("add-po-supId").value,
        pricePerUnit: selectedQuotation.pricePerUnit,
        qty: document.getElementById("add-po-qty").value,
        totalPrice: total,
        requiredDate: new Date(document.getElementById("add-po-reqDate").value),
        notes: document.getElementById("add-po-note").value,
        purchaseOrderStatus: document.getElementById("add-po-status").value,
    }

    let response = ajaxRequestBody("/purchaseOrder/addNewPurchaseOrder", "POST", purchaseOrder);
    if (response.status === 200) {
        swal.fire({
            title: response.responseText,
            icon: "success",
        });
        $("#modalSendPurchaseOrder").modal("hide");

    } else {
        swal.fire({
            title: "Something Went Wrong",
            text: response.responseText,
            icon: "error",

        })
    }
}

// Helper function to display quantity with unit
function getQuantityWithUnit(ob) {
    return `${ob.quantity} ${ob.unitType || ''}`.trim();
}

function getAdvancePercentage(ob) {
    return ob.advancePercentage != null ? ob.advancePercentage + '%' : '-';
}

function getCreditDays(ob) {
    return ob.creditDays != null ? ob.creditDays : '-';
}

function getProposedDeliveryDate(ob) {
    return ob.proposedDeliveryDate != null ? ob.proposedDeliveryDate : '-';
}

function getStatus(ob) {
    if (ob.quotationStatus === "Accepted") {
        return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Accepted</p>';
    }
    if (ob.quotationStatus === "Pending") {
        return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Pending</p>';
    }
    if (ob.quotationStatus === "Rejected") {
        return '<p class="align-middle redLabel mx-auto" style="width: 100px">Rejected</p>';
    }
    if (ob.quotationStatus === "Closed") {
        return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">Closed</p>';
    }
    return '-';
}

const reloadQuotationTable = function () {
    const quotations = ajaxGetRequest("/quotation/getAllQuotations");

        

    const displayProperty = [
        {dataType: "text", propertyName: "quotationNo"},
        {dataType: "text", propertyName: "quotationRequestNo"},
        {dataType: "text", propertyName: "ingredientCode"},
        {dataType: "text", propertyName: "supplierRegNo"},
        {dataType: "function", propertyName: getProposedDeliveryDate},
        {dataType: "price", propertyName: "pricePerUnit"},
        {dataType: "function", propertyName: getStatus},
    ];

    if (quotationTableInstance) {
        quotationTableInstance.destroy();
    }
    $("#tableQuotations tbody").empty();
    tableDataBinder(
        tableQuotations,
        quotations,
        displayProperty,
        true,
        generateQuotationDropDown,
        getPrivilege
    );
    quotationTableInstance = $("#tableQuotations").DataTable();
};

const generateQuotationDropDown = (element, index, privilegeOb) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "Details", action: showQuotationDetails, icon: "fa-solid fa-circle-info me-2", enabled: privilegeOb.select},
        {name: "Delete", action: deleteQuotation, icon: "fa-solid fa-trash me-2", enabled: privilegeOb.delete},
    ];
    if (element.quotationStatus !== "Closed") {
        buttonList.push({
            name: "Edit",
            action: quotationFormRefill,
            icon: "fa-solid fa-edit me-2",
            enabled: privilegeOb.update,
        })
    }

    if (element.quotationStatus === "Accepted") {
        buttonList.push({
            name: "Send purchase order",
            action: sendPerchesOrder,
            icon: "fa-solid fa-basket-shopping me-2",
            enabled: privilegeOb.select,
        })
    }

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
        buttonElement.disabled = !button.enabled;
        if (!button.enabled) {
            buttonElement.style.cursor = "not-allowed";
            buttonElement.classList.add("text-muted");
        }
        buttonElement.onclick = function () {
            if (button.enabled) {
                button.action(element, index);
            }
        };
        const liElement = document.createElement("li");
        liElement.appendChild(buttonElement);
        dropdownMenu.appendChild(liElement);
    });
    return dropdownMenu;
};

// Show Quotation Details in Modal
function showQuotationDetails(quotation) {
    console.log(quotation);
    document.getElementById("detailQuotationNo").textContent = quotation.quotationNo || '-';
    document.getElementById("detailQuotationRequestNo").textContent = quotation.quotationRequestNo || '-';
    document.getElementById("detailIngredientCode").textContent = quotation.ingredientCode || '-';
    document.getElementById("detailSupplierRegNo").textContent = quotation.supplierRegNo || '-';
    document.getElementById("detailProposedDeliveryDate").textContent = quotation.proposedDeliveryDate || '-';
    document.getElementById("detailPricePerUnit").textContent = quotation.pricePerUnit != null ? quotation.pricePerUnit : '-';
    document.getElementById("detailReceivedDate").textContent = quotation.receivedDate || '-';
    document.getElementById("detailQuotationStatus").textContent = quotation.quotationStatus || '-';
    document.getElementById("detailQuantity").textContent = quotation.quantity != null ? quotation.quantity + " " + quotation.unitType : '-';
    document.getElementById("detailTotalPrice").textContent = quotation.totalPrice != null ? quotation.totalPrice : '-';
    document.getElementById("detailNote").textContent = quotation.note || '-';
    $("#modalQuotationDetails").modal("show");
}



const deleteQuotation = (quotation) => {
    swal.fire({
        title: "Delete Quotation",
        text: "Are you sure, you want to delete" + quotation.quotationNo + "?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/quotation/deleteQuotation/${quotation.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadQuotationTable();
            } else {
                swal.fire({
                    title: "Something Went Wrong",
                    text: response.responseText,
                    icon: "error"
                });
            }
        }
    });
}

const sendPerchesOrder = (quotation) => {
    Swal.fire({
        title: 'Send Purchase Order',
        text: `Are you sure you want to send a purchase order for Quotation No: ${quotation.quotationNo}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Send',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#2e326d ',
        cancelButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            // Construct purchase order object from quotation
            const purchaseOrder = {
                quotationNo: quotation.quotationNo,
                ingredientCode: quotation.ingredientCode,
                supplierRegNo: quotation.supplierRegNo,
                pricePerUnit: quotation.pricePerUnit,
                qty: quotation.quantity,
                totalPrice: quotation.totalPrice,
                proposedDeliveryDate: quotation.proposedDeliveryDate,
                notes: quotation.quotationNo,
                purchaseOrderStatus: 'Pending',
            };
            console.log(purchaseOrder);
            console.log(quotation);
            // Send AJAX POST request
            const response = ajaxRequestBody('/purchaseOrder/addNewPurchaseOrder', 'POST', purchaseOrder);
            if (response.status === 200) {
                Swal.fire({
                    title: 'Purchase Order Sent!',
                    text: response.responseText,
                    icon: 'success'
                });
                // Try to reload purchase order table if function exists
                if (typeof reloadPOTable === 'function') {
                    reloadPOTable();
                }
            } else {
                Swal.fire({
                    title: 'Something Went Wrong',
                    text: response.responseText,
                    icon: 'error'
                });
            }
        }
    });
}

document.getElementById("add-po-qty").addEventListener('change', (event) => {
    const total = selectedQuotation.pricePerUnit * parseInt(event.target.value);
    document.getElementById("add-po-total").value = total.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    })
})

const openAddQuotationForm = () => {
    
    document.getElementById('quotationAddForm').reset();
    Array.from(document.getElementById('quotationAddForm').elements).forEach((field) => {
        field.classList.remove('is-valid', 'is-invalid');
    });
    const modalTitle = document.getElementById('quotationModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Quotation';
    }
    document.getElementById('btnQuotationUpdate').disabled = true;
    document.getElementById("add-quotationStatus").value = "Pending";
    document.getElementById("add-quotationStatus").disabled = true;
    document.getElementById('btnQuotationSubmit').disabled = false;
    qrnSelectElement.disabled = false;
    quotation = {};
    oldQuotation = null;

    $('#modelQuotationAdd').modal('show');
}
