let quotationTableInstance;
let selectedQuotation;

window.addEventListener("load", function () {

    //Call function to reload the quotation table
    reloadQuotationTable();

    // Fetch all quotation requests via an AJAX GET request
    const qRequests = ajaxGetRequest("/quotation-request/getAllRequests");

    const qrnSelectElement = document.getElementById("qRequest_no");
    const supIdSelectElement = document.getElementById("quo-supId");

   // Refresh the quotation form to reset all fields and reload data
    refreshQuotationForm();

   //Call function to validate the quotation form fields
   quotationValidation();


    // Fill the quotation request number dropdown with options
//    qRequests.forEach(req => {
//        const option = document.createElement('option');
//        option.value = req.requestNo;
//        option.textContent = req.requestNo;
//        qrnSelectElement.appendChild(option);
//    });

//    // Add an event listener to handle changes in the quotation request number dropdown
//    qrnSelectElement.addEventListener('change', (event) => {
//        const selectedValue = event.target.value;
//        const request = qRequests.filter((r) => r.requestNo === selectedValue)[0];
//        document.getElementById("quo-ingId").value = request.ingCode;
//        supIdSelectElement.innerHTML = '';
//        request.suppliers.forEach((sup) => {
//            const option = document.createElement('option');
//            option.value = sup;
//            option.textContent = sup;
//            supIdSelectElement.appendChild(option);
//        });
//    });

//    const forms = document.querySelectorAll('.needs-validation');
//
//    Array.prototype.slice.call(forms).forEach(function (form) {
//        form.addEventListener('submit', function (event) {
//            if (!form.checkValidity()) {
//                event.preventDefault();
//                event.stopPropagation();
//            }
//            form.classList.add('was-validated');
//        }, false);
//    });

});


//Define refresh function for quotation form
const refreshQuotationForm = () =>{

    quotation = new Object();
    oldQuotation = null;

    // Fetch all quotation requests via an AJAX GET request
    const qRequests = ajaxGetRequest("/quotation-request/getAllRequests");

    const qrnSelectElement = document.getElementById("qRequest_no");
    const supIdSelectElement = document.getElementById("quo-supId");

    // Function to fill data into a quotation request select element
    fillDataIntoSelect(
           qrnSelectElement,
           "Select QRequest No",
           qRequests,
           "requestNo",
     );


    // Add an event listener to handle changes in the quotation request number dropdown
     qrnSelectElement.addEventListener('change', (event) => {
         const selectedValue = JSON.parse(event.target.value);

         const request = qRequests.filter((r) => r.requestNo === selectedValue.requestNo);

         //fill data to Ingredient ID field
         document.getElementById("quo-ingId").value = request[0].ingCode;

         //Bind values into quotation object and validate
         quotation.ingredientCode = request[0].ingCode;
         document.getElementById("quo-ingId").classList.add('is-valid');


         //fill data to supplier id select element
         supIdSelectElement.innerHTML = '';
         supIdSelectElement.innerHTML = '<option value="" selected>Select Supplier ID</option>';
         request[0].suppliers.forEach((sup) => {
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
    const addDeadline = document.getElementById('add-deadline');
    addDeadline.addEventListener('change', () =>{
        dateFeildValidator(addDeadline,'','quotation','deadline')
    })

    const addPriceUnit = document.getElementById('add-pricePerUnit');
    addPriceUnit.addEventListener('keyup', () =>{
            validation(addPriceUnit,'^(?:[1-9]|[1-9][0-9]|[1-9][0-9]{3}|[1-9][0-9]{2})$','quotation','pricePerUnit')
    })

    const addQuotationStatus = document.getElementById('add-quotationStatus');
    addQuotationStatus.addEventListener('change', () =>{
            selectFieldValidator(addQuotationStatus,'','quotation','quotationStatus')
    });

}

//Check Quotation form errors
const checkQuotationFormError = () => {
    let errors = '';

    if (quotation.quotationRequestNo == null) {
        errors = errors + "QReQ No can't be null \n";
        qRequestNo.classList.add('is-invalid')
    }

    if (quotation.ingredientCode == null) {
        errors = errors + "Ingredient Code can't be null \n";
        document.getElementById("quo-ingId").classList.add('is-invalid')
    }


    if (quotation.supplierRegNo == null) {
        errors = errors + "Please Select Supplier \n";
        qSupId.classList.add('is-invalid')
    }


    if (quotation.receivedDate == null) {
        errors = errors + "Received Date can't be null\n";
        addReceivedDate.classList.add('is-invalid')
    }


    if (quotation.deadline == null) {
        errors = errors + "Please Select the deadline \n";
        addDeadline.classList.add('is-invalid');
    }

    if (quotation.quotationStatus == null) {
            errors = errors + "Please Select the status \n";
            addQuotationStatus.classList.add('is-invalid');
        }

    return errors;
}


//Declare Quotation submit function
 const quotationSubmit = () => {
    event.preventDefault();
    console.log("button Quotation Submit");
    console.log(quotation);

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

//document.getElementById("quotationEditForm").onsubmit = function (event) {
//    event.preventDefault();
//
//    selectedQuotation.quotationRequestNo = document.getElementById("edit-qRequest_no").value;
//    selectedQuotation.ingredientCode = document.getElementById("edit-quo-ingId").value;
//    selectedQuotation.supplierRegNo = document.getElementById("edit-quo-supId").value;
//    selectedQuotation.pricePerUnit = parseFloat(document.getElementById("edit-pricePerUnit").value);
//    selectedQuotation.receivedDate = new Date(document.getElementById("edit-receivedDate").value);
//    selectedQuotation.deadline = new Date(document.getElementById("edit-deadline").value);
//    selectedQuotation.quotationStatus = document.getElementById("edit-quotationStatus").value;
//
//    let response = ajaxRequestBody("/quotation/editQuotation", "PUT", selectedQuotation);
//    if (response.status === 200) {
//        swal.fire({
//            title: response.responseText,
//            icon: "success",
//        });
//        reloadQuotationTable();
//        $("#modalQuotationEdit").modal("hide");
//
//    } else {
//        swal.fire({
//            title: "Something Went Wrong",
//            text: response.responseText,
//            icon: "error",
//        });
//    }
//};

//Refill Product form fields
const quotationFormRefill = (ob, rowIndex) => {


  $("#modalQuotationAdd").modal('show');
  quotation = JSON.parse(JSON.stringify(ob));
  oldQuotation = JSON.parse(JSON.stringify(ob));


  document.getElementById("quo-ingId").value = quotation.ingredientCode ;
  document.getElementById("add-receivedDate").value = convertDateTimeToDate(quotation.receivedDate);
  document.getElementById("add-deadline").value= convertDateTimeToDate(quotation.deadline);
  document.getElementById("add-pricePerUnit").value = quotation.pricePerUnit;
  document.getElementById("add-quotationStatus").value = quotation.quotationStatus;

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

  //Get the select element by its ID
  const quoSupID = document.getElementById("quo-supId");
  quoSupID.innerHTML = '';

   // Create a new option element
   const optionSup = document.createElement("option");

   // Set the value and text content of the new option
   optionSup.value = quotation.supplierRegNo;
   optionSup.textContent = quotation.supplierRegNo;

   // Append the new option to the select element
   quoSupID.appendChild(optionSup);

  quoSupID.disabled = true;



  // Disable the select element

    //refill Quotation No
    //  const qRequests = ajaxGetRequest("/quotation-request/getAllRequests");
    //
    //    const quoSupID = document.getElementById("quo-supId");

    // Function to fill data into a quotation request select element
    fillDataIntoSelect(
         quoSupID,
         "Select Supplier ID",
         qRequests,
         "supplierRegNo",
         quotation.supplierRegNo
    );



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
    updates = updates + "Received Date is changed " + oldQuotation.receivedDate + " into " + quotation.receivedDate +"<br>";
  }

  if(quotation.deadline !== oldQuotation.deadline){
    updates = updates + "Deadline is changed " + oldIngredient.deadline + " into " + quotation.deadline + "<br>";
  }

  if(quotation.pricePerUnit !== oldQuotation.pricePerUnit){
    updates = updates + "Price Per Unit is changed " + oldQuotation.pricePerUnit + " into " + quotation.pricePerUnit + "<br>";
  }

  if(quotation.quotationStatus !== oldQuotation.quotationStatus){
    updates = updates + "Quotation Status is changed " + oldQuotation.quotationStatus + " into " + quotation.quotationStatus  + "<br>";
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
const reloadQuotationTable = function () {
    const quotations = ajaxGetRequest("/quotation/getAllQuotations");
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getStatus = (ob) => {
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
    };

    const displayProperty = [
        {dataType: "text", propertyName: "quotationNo"},
        {dataType: "text", propertyName: "quotationRequestNo"},
        {dataType: "text", propertyName: "ingredientCode"},
        {dataType: "text", propertyName: "supplierRegNo"},
        {dataType: "price", propertyName: "pricePerUnit"},
        {dataType: "date", propertyName: "receivedDate"},
        {dataType: "date", propertyName: "deadline"},
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

const generateQuotationDropDown = (element,index) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "Delete", action: deleteQuotation, icon: "fa-solid fa-trash me-2"},
    ];
    if (element.quotationStatus !== "Closed") {
        buttonList.push({
            name: "Edit",
            action: quotationFormRefill,
            icon: "fa-solid fa-edit me-2",
        })
    }

    if (element.quotationStatus === "Accepted") {
        buttonList.push({
            name: "Send Perches Order",
            action: sendPerchesOrder,
            icon: "fa-solid fa-basket-shopping me-2"
        })
    }

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
        buttonElement.onclick = function () {
            button.action(element,index);
        };
        const liElement = document.createElement("li");
        liElement.appendChild(buttonElement);
        dropdownMenu.appendChild(liElement);
    });
    return dropdownMenu;
};

//const editQuotation = (quotation) => {
//    selectedQuotation = quotation;
//
//    document.getElementById("edit-qRequest_no").value = quotation.quotationRequestNo;
//    document.getElementById("edit-quo-ingId").value = quotation.ingredientCode;
//    document.getElementById("edit-quo-supId").value = quotation.supplierRegNo;
//    document.getElementById("edit-receivedDate").value = convertDateTimeToDate(quotation.receivedDate);
//    document.getElementById("edit-deadline").value = convertDateTimeToDate(quotation.deadline);
//    document.getElementById("edit-pricePerUnit").value = quotation.pricePerUnit;
//    document.getElementById("edit-quotationStatus").value = quotation.quotationStatus;
//
//    $("#modalQuotationEdit").modal("show");
//};

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
    selectedQuotation = quotation;
    $("#modalSendPurchaseOrder").modal("show");
    document.getElementById("add-po-qno").value = quotation.quotationNo;
    document.getElementById("add-po-ingId").value = quotation.ingredientCode;
    document.getElementById("add-po-supId").value = quotation.supplierRegNo;
    document.getElementById("add-po-pricePerUnit").value = quotation.pricePerUnit.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });

}
document.getElementById("add-po-qty").addEventListener('change', (event) => {
    const total = selectedQuotation.pricePerUnit * parseInt(event.target.value);
    document.getElementById("add-po-total").value = total.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    })
})