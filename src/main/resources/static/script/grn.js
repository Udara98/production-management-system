let grnTableInstance;
let selectedGRN;
let purchaseOrders;
let addAcceptedQty;
let addRejectedQty;
let getPrivilegeGrn;

window.addEventListener('load', () => {

     getPrivilegeGrn = ajaxGetRequest("/privilege/byloggedusermodule/GRN");

    if (!getPrivilegeGrn.insert) {
        $("#addGrnBtn").prop("disabled", true);
    }

    purchaseOrders = ajaxGetRequest("/purchaseOrder/getAllPurchaseOrders").filter((po) => po.purchaseOrderStatus === 'Pending');
    addAcceptedQty = document.getElementById('addAcceptedQty');
    addRejectedQty = document.getElementById('addRejectedQty');


    //Call function to reload the GRN table
    reloadGRN()

    //Call function to refresh the Add Grn form
    reloadGRNForm();

    //Call function to validate
    grnFormValidation();

    addGrnRecDate.disabled = true;
    addAcceptedQty.disabled = true;
    addRejectedQty.disabled = true;

    
    
})

//Call function for validation and object binding
const grnFormValidation = () => {
    // Validate and bind PO selection
    addGrnPoNo.addEventListener('change', () => {
        // DynamicSelectValidation(addGrnPoNo, 'grn', 'purchaseOrder');
        // Bind selected PO object to grn.purchaseOrder
        const selectedPONo = addGrnPoNo.value;
        const selectedPO = purchaseOrders.find(po => po.purchaseOrderNo === selectedPONo);
        grn.purchaseOrder = selectedPO;
        addGrnRecDate.disabled = false;
        addAcceptedQty.disabled = false;
        addRejectedQty.disabled = false;

        const OrderDate = new Date(selectedPO.orderedDate);
        const today = new Date();

        console.log(OrderDate);
        console.log(today);

        addGrnRecDate.setAttribute('min', OrderDate.toISOString().split('T')[0]);
        addGrnRecDate.setAttribute('max', today.toISOString().split('T')[0]);

        addGrnPoNo.classList.remove('is-invalid')
        addGrnPoNo.classList.add('is-valid')

        addOrderedQty.value = grn.purchaseOrder ? grn.purchaseOrder.qty : '';

        // Fetch and display remaining quantity for selected PO
        const remainingQtyField = document.getElementById('addRemainingQty');
        if (grn.purchaseOrder) {
            fetch(`/grn/remaining-qty/${encodeURIComponent(grn.purchaseOrder.purchaseOrderNo)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.remainingQuantity !== undefined) {
                        addOrderedQty.value = data.remainingQuantity;
                    } else {
                        addOrderedQty.value = '';
                    }
                })
                .catch(() => {
                    addOrderedQty.value = '';
                });
        } else {
            addOrderedQty.value = '';
        }


    });

    // Validate and bind accepted/rejected qty
    addAcceptedQty.addEventListener('input', () => {
        const acceptedQty = parseFloat(addAcceptedQty.value) || 0;
        const rejectedQty = parseFloat(addRejectedQty.value) || 0;
        const orderedQty = grn.purchaseOrder ? grn.purchaseOrder.qty : 0;
        if (acceptedQty <= orderedQty) {
            addAcceptedQty.classList.remove('is-invalid');
            addAcceptedQty.classList.add('is-valid');
            grn.acceptedQuantity = acceptedQty;

            if (grn.purchaseOrder && grn.purchaseOrder.pricePerUnit) {
                grn.totalAmount = (parseFloat(addAcceptedQty.value) || 0) * grn.purchaseOrder.pricePerUnit;
                addGrnTot.value = grn.totalAmount.toFixed(2);
            }
        } else {
            addAcceptedQty.classList.remove('is-valid');
            addAcceptedQty.classList.add('is-invalid');
        }
    });
    
    addRejectedQty.addEventListener('input', () => {
        const acceptedQty = parseFloat(addAcceptedQty.value) || 0;
        const rejectedQty = parseFloat(addRejectedQty.value) || 0;
        const orderedQty = grn.purchaseOrder ? grn.purchaseOrder.qty : 0;
        if (acceptedQty + rejectedQty > orderedQty) {
            addRejectedQty.classList.add('is-invalid');
            addRejectedQty.classList.remove('is-valid');
        }else{
            addRejectedQty.classList.remove('is-invalid');
            addRejectedQty.classList.add('is-valid');
            grn.rejectedQuantity = rejectedQty;
        }
    });

    addRejectReason.addEventListener('input', () => {
        addRejectReason.classList.remove('is-invalid');
        addRejectReason.classList.add('is-valid');
        grn.rejectReason = addRejectReason.value.trim();
    });

    // Bind received date
    addGrnRecDate.addEventListener('change', () => {
        dateFeildValidator(addGrnRecDate, '', 'grn', 'receivedDate');
    });

    addGrnStatus.addEventListener('change', () => {
        selectFieldValidator(addGrnStatus, '', 'grn', 'grnStatus');
    });


}

const checkGrnFormError = () =>{

    let errors = '';


    if (grn.purchaseOrder == null) {
        errors = errors + "GRN No can't be null \n";
        addGrnPoNo.classList.add('is-invalid')
    }

    if (grn.totalAmount == null) {
        errors = errors + "Total Amount can't be null \n";
        addGrnTot.classList.add('is-invalid')
    }

    if (grn.acceptedQuantity == null) {
        errors = errors + "Accepted Quantity can't be null \n";
        addAcceptedQty.classList.add('is-invalid')
    }

    if (grn.receivedDate == null) {
        errors = errors + "Received Date can't be null \n";
        addGrnRecDate.classList.add('is-invalid')
    }


    if (grn.grnStatus == null) {
        errors = errors + "GRN status can't be null \n";
        addGrnStatus.classList.add('is-invalid')
    }

    return errors;
}


//Declare product submit function
 const grnSubmit = () => {
    console.log("GRN submit button clicked");
    console.log(grn);
    grn.grnStatus = "Pending";

    //Check form errors
    const errors = checkGrnFormError();

    if (errors === "") {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to add the GRN to Purchase Order No" + grn.purchaseOrder.purchaseOrderNo + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E11D48",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Add"
        }).then((result) => {
            if (result.isConfirmed) {
                const postServiceRequestResponse = ajaxRequestBody("/grn", "POST", grn);

                // Check backend response
                if (postServiceRequestResponse.status === 200) {
                    $("#modalGRNAdd").modal('hide');
                    reloadGRN();
                    reloadGRNForm();
                    grnAddForm.reset();

                    // Reset validation classes
                    Array.from(grnAddForm.elements).forEach((field) => {
                        field.classList.remove('is-valid', 'is-invalid');
                    });

                    Swal.fire({
                        title: "GRN Added Successfully!",
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
            title: "GRN Not Added",
            text: errors,
            icon: "error"
        });
    }
};

//Function to refresh the GRN form
const reloadGRNForm = () =>{

    grn = new Object();
    oldGrn = null;

    //Get ONLY pending purchase orders
//    const purchaseOrders = ajaxGetRequest("/purchaseOrder/getAllPurchaseOrders").filter((po) => po.purchaseOrderStatus === 'Pending');
      const purchaseOrders = ajaxGetRequest("/purchaseOrder/findPendingPurchaseOrdersForGrn");
    //Function to fill data into PO select element
    addGrnPoNo.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = 'Select PO No';
    addGrnPoNo.appendChild(defaultOption);
    purchaseOrders.forEach(po => {
        const option = document.createElement('option');
        option.value = po.purchaseOrderNo; // Only the PO number
        option.textContent = po.purchaseOrderNo;
        addGrnPoNo.appendChild(option);
      });

      //Select Status
      const selectStatus = document.getElementById('addGrnStatus');
      selectStatus.value = 'Pending';
      addGrnStatus.disabled = true;



}

//Function to Reload the GRN table
const reloadGRN = () => {
    const grnList = ajaxGetRequest("/grn/getAllGRNs")

    const getPONo = (ob) => ob.purchaseOrder.purchaseOrderNo;

    const getStatus = (ob) => {
        if (ob.grnStatus === "Pending") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Pending</p>';
        }
        if (ob.grnStatus === "Approved") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Approved</p>';
        }
        if (ob.grnStatus === "Rejected") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">Rejected</p>';
        }
        if (ob.grnStatus === "Closed") {
            return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">Closed</p>';
        }
    };

    const getPaymentStatus = (ob) => {
        if (ob.paymentStatus === "Pending") {
            return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">Pending</p>';
        }
        if (ob.paymentStatus === "Paid") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Paid</p>';
        }
        if (ob.paymentStatus === "Partially_Paid") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Partially Paid</p>';
        }
        return '';
    };

    // Helper functions to show quantity with unit
    const getAcceptedQtyWithUnit = (ob) => {
        if (ob.acceptedQuantity !== undefined && ob.unitType) {
            return ob.acceptedQuantity + ' ' + ob.unitType;
        }
        return ob.acceptedQuantity !== undefined ? ob.acceptedQuantity : '';
    };
    const getRejectedQtyWithUnit = (ob) => {
        if (ob.rejectedQuantity !== undefined && ob.unitType) {
            return ob.rejectedQuantity + ' ' + ob.unitType;
        }
        return ob.rejectedQuantity !== undefined ? ob.rejectedQuantity : '';
    };

    const displayProperty = [
        {dataType: "text", propertyName: "grnNo"},
        {dataType: "function", propertyName: getPONo},
        {dataType: "function", propertyName: getAcceptedQtyWithUnit},
        {dataType: "function", propertyName: getRejectedQtyWithUnit},
        {dataType: "price", propertyName: "totalAmount"},
        {dataType: "date", propertyName: "receivedDate"},
        {dataType: "function", propertyName: getStatus},
        {dataType: "function", propertyName: getPaymentStatus},
    ];

    if (grnTableInstance) {
        grnTableInstance.destroy();
    }
    $("#tableGRN tbody").empty();
    tableDataBinder(
        tableGRN,
        grnList,
        displayProperty,
        true,
        generateGRNDropDown,
        getPrivilegeGrn
    )
    grnTableInstance = $("#tableGRN").DataTable({
        responsive: true,
        autoWidth: false,
    })

}

//Function to generate the drop down
const generateGRNDropDown = (element,rowIndex,getPrivilegeGrn) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: grNFormRefill,
            icon: "fa-solid fa-edit me-2",
            enabled: getPrivilegeGrn.update && element.purchaseOrder.purchaseOrderStatus === "Pending"
        },
        {name: "Delete", action: deleteGRN, icon: "fa-solid fa-trash me-2",enabled: getPrivilegeGrn.delete},

    ];

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
        buttonElement.type = "button";
        buttonElement.disabled = !button.enabled;

        if(!button.enabled) {
             buttonElement.style.cursor = "not-allowed";
             buttonElement.classList.add("text-muted");
            }

        buttonElement.onclick = function () {
            if (button.enabled) {
                           button.action(element);
              }
        };
        const liElement = document.createElement("li");
        liElement.appendChild(buttonElement);
        dropdownMenu.appendChild(liElement);
    });
    return dropdownMenu;
};

const editGRN = (grn) => {
    selectedGRN = grn;
    document.getElementById('edit_grn_poNo').value = grn.purchaseOrder.purchaseOrderNo;
    document.getElementById('edit-grn-status').value = grn.grnStatus;
    document.getElementById('edit-grn-tot').value = grn.purchaseOrder.totalPrice.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });
    document.getElementById('edit-grn-recDate').value = convertDateTimeToDate(grn.receivedDate);

    $("#modalGRNEdit").modal("show");
}

//Define method for GRN Delete
const deleteGRN= (ob, rowIndex) => {

    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete GRN " +
            "" + (ob.grnNo) +"?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E11D48",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then(async (result) => {
        if(result.isConfirmed) {

            console.log(ob.id)

            // Delete Service
            let deleteServiceRequestResponse =  ajaxRequestBody("/grn/deleteGrn/"+ ob.id, "DELETE", ob)

            //Check Backend Service
            if (deleteServiceRequestResponse.status === 200) {
                swal.fire({
                    title: "Deleted!",
                    text: "GRN has been deleted.",
                    icon: "success"
                });
                grnAddForm.reset();
                reloadGRN();
                reloadGRNForm();

            } else {
                swal.fire({
                    title: "Delete Not Successfully",
                    text: deleteServiceRequestResponse,
                    icon: "error"
                });
            }
        }
    })
}

//Function for refill the supplier form
const grNFormRefill = (ob, rowIndex) => {

    grnUpdateBtn.disabled = false;
    grnSubmitBtn.disabled = true;

    document.getElementById("modalTitleGrn").textContent = "Update GRN";
    
    // Disable all fields except status for edit mode
    addGrnPoNo.disabled = true;
    addOrderedQty.disabled = true;
    addAcceptedQty.disabled = true;
    addRejectedQty.disabled = true;
    addRejectReason.disabled = true;
    addGrnTot.disabled = true;
    addGrnRecDate.disabled = true;
    // Only enable status
    addGrnStatus.disabled = false;
    $("#modalGRNAdd").modal('show');

    grn = JSON.parse(JSON.stringify(ob));
    oldGrn = JSON.parse(JSON.stringify(ob));

    // Clear and set PO dropdown for edit mode
    addGrnPoNo.innerHTML = '';
    const poOption = document.createElement("option");
    poOption.value = grn.purchaseOrder.purchaseOrderNo;
    poOption.textContent = grn.purchaseOrder.purchaseOrderNo;
    addGrnPoNo.appendChild(poOption);
    addGrnPoNo.disabled = true;
    addGrnPoNo.value = grn.purchaseOrder.purchaseOrderNo;

    // Fill ordered quantity (remaining or original)
    // Optionally, fetch latest remaining quantity and display
    fetch(`/grn/remaining-qty/${encodeURIComponent(grn.purchaseOrder.purchaseOrderNo)}`)
        .then(response => response.json())
        .then(data => {
            if (data.remainingQuantity !== undefined) {
                addOrderedQty.value = data.remainingQuantity;
            } else {
                addOrderedQty.value = grn.purchaseOrder.qty;
            }
        })
        .catch(() => {
            addOrderedQty.value = grn.purchaseOrder.qty;
        });

    // Fill accepted/rejected qty and reject reason
    addAcceptedQty.value = grn.acceptedQuantity !== undefined ? grn.acceptedQuantity : '';
    addRejectedQty.value = grn.rejectedQuantity !== undefined ? grn.rejectedQuantity : '';
    addRejectReason.value = grn.rejectReason !== undefined ? grn.rejectReason : '';

    // Fill other fields
    addGrnTot.value = grn.totalAmount !== undefined ? grn.totalAmount : '';
    addGrnRecDate.value = convertDateTimeToDate(grn.receivedDate);
    addGrnStatus.value = grn.grnStatus;
};



//Define function for GRN update
const grnUpdate = () => {
    event.preventDefault();
    grnAddForm.classList.add('needs-validation');

    //Check form Error
    let errors = checkGrnFormError();

    if (errors === "") {
      //Check form update
      let updates = checkGrnUpdates();
      console.log(updates);
      grnAddForm.classList.remove('was-validated')
      $('#modalGRNAdd').modal("hide");
      if (updates !== "") {
        swal.fire({
          title: "Do you want to Update " + grn.grnNo  + "?",
          html:updates,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#cb421a",
          cancelButtonColor: "#3f3f44",
          confirmButtonText: "Yes, Update"
        }).then((result) =>{
          if(result.isConfirmed){
            let updateServiceResponse = ajaxRequestBody("/grn", "PUT", grn);

            if (updateServiceResponse.status === 200) {

              // alert("Update successfully ...! \n");
              Swal.fire({
                title: "Update successfully ..! ",
                text: "",
                icon: "success"
              });

              //Need to refresh
              grnAddForm.reset();
              reloadGRN();
              reloadGRNForm();

              // Remove 'is-valid' and 'is-invalid' classes from all input fields
              document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
                input.classList.remove('is-valid', 'is-invalid');
              });
              grnAddForm.classList.remove('was-validated');

              //Need hide modal
              $('#modalGRNAdd').modal("hide");
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
        $('#modalGRNAdd').modal("hide");
        Swal.fire({
          title: "No updates Found..!",
          text: '',
          icon: "question"
        });
      }

    } else {
      $('#modalGRNAdd').modal("hide");
      Swal.fire({
        title: "Form has following errors!",
        text: errors,
        icon: "error"
      });
    }
  }


//Define method for check updates
const checkGrnUpdates = () =>{
    let updates = "";

    if(grn.receivedDate !== oldGrn.receivedDate){
      updates = updates + "Received Date is changed " + oldGrn.receivedDate + " into " + grn.receivedDate +"<br>";
    }

    if(grn.grnStatus !== oldGrn.grnStatus){
      updates = updates + "Grn Status is changed " + oldGrn.grnStatus + " into " + grn.grnStatus + "<br>";
    }

    return updates;
}

const prepareGrnModal = () => {
    // Reset form fields
    document.getElementById("addGrnRecDate").value = "";
    document.getElementById("addGrnStatus").value = "Pending";
    document.getElementById("addGrnPoNo").value = "";
    document.getElementById("addOrderedQty").value = "";
    document.getElementById("addAcceptedQty").value = "";
    document.getElementById("addRejectedQty").value = "";
    document.getElementById("addRejectReason").value = "";
    document.getElementById("addGrnTot").value = "";

    // Remove validation classes
    [
        "addGrnRecDate",
        "addGrnStatus",
        "addGrnPoNo",
        "addOrderedQty",
        "addAcceptedQty",
        "addRejectedQty",
        "addRejectReason",
        "addGrnTot"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("is-valid", "is-invalid");
            el.style.border = "";
        }
    });

    grnSubmitBtn.disabled = false;
    grnUpdateBtn.disabled = true;

    modalTitleGrn.textContent = "Add GRN";

    reloadGRNForm();

    $('#modalGRNAdd').modal('show');
}
