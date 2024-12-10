let grnTableInstance;
let selectedGRN;

window.addEventListener('load', () => {

    //Call function to reload the GRN table
    reloadGRN()

    //Call function to refresh the Add Grn form
    reloadGRNForm();

    let selectedPO;

    //Call function to validate
    grnFormValidation();
//    const purchaseOrders = ajaxGetRequest("/purchaseOrder/getAllPurchaseOrders").filter((po) => po.purchaseOrderStatus === 'Pending');
//    const poSelectElement = document.getElementById("add_grn_poNo");

//    purchaseOrders.forEach(po => {
//        const option = document.createElement('option');
//        option.value = po.purchaseOrderNo;
//        option.textContent = po.purchaseOrderNo;
//        poSelectElement.appendChild(option);
//    });
//    poSelectElement.addEventListener('change', (event) => {
//        const val = event.target.value;
//        selectedPO = purchaseOrders.filter((po) => po.purchaseOrderNo === val)[0];
//        document.getElementById("add-grn-tot").value = parseInt(selectedPO.totalPrice).toLocaleString("en-US", {
//            style: "currency",
//            currency: "LKR",
//        });
//    });

//    document.getElementById('grnAddForm').onsubmit =  (event) => {
//        event.preventDefault();
//        const grn = {
//            purchaseOrder: selectedPO,
//            totalAmount: selectedPO.totalPrice,
//            grnStatus: document.getElementById('add-grn-status').value,
//            receivedDate: new Date(document.getElementById('add-grn-recDate').value)
//        }
//
//        let response = ajaxRequestBody("/grn/addNewGRN", "POST", grn);
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            reloadGRN()
//            $("#modalGRNAdd").modal("hide");
//
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//    }


//    document.getElementById('grnEditForm').onsubmit =  (event) => {
//        event.preventDefault();
//
//        selectedGRN.receivedDate = new Date(document.getElementById('edit-grn-recDate').value);
//        selectedGRN.grnStatus = document.getElementById('edit-grn-status').value
//
//        let response = ajaxRequestBody("/grn/updateGRN", "PUT", selectedGRN);
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            reloadGRN()
//            $("#modalGRNEdit").modal("hide");
//
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//    }
})

//Call function for validation and object binding
const grnFormValidation = () =>{

    addGrnPoNo.addEventListener('change',() => {
               DynamicSelectValidation(addGrnPoNo, 'grn', 'purchaseOrder');
    });

    //Bind value to object in line 250 in reloadGRNForm

    addGrnRecDate.addEventListener('change',  () => {
                selectFieldValidator(addGrnRecDate, '', 'grn', 'receivedDate');
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
    event.preventDefault();
    console.log("GRN submit button clicked");
    console.log(grn);

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
                    grnAddForm.reset();
                    reloadGRN();
                    reloadGRNForm();

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
    let selectedPO;

    //Get ONLY pending purchase orders
    const purchaseOrders = ajaxGetRequest("/purchaseOrder/getAllPurchaseOrders").filter((po) => po.purchaseOrderStatus === 'Pending');

    //Function to fill data into PO select element
        fillDataIntoSelect(
             addGrnPoNo,
             "Select Purchase Order",
             purchaseOrders,
             "purchaseOrderNo",
        );

    //Fill Total Amount field on changing PO
    addGrnPoNo.addEventListener('change', (event) => {
            const val = event.target.value;
            const SelectedValue = JSON.parse(val)
            console.log(SelectedValue.purchaseOrderNo)
            selectedPO = purchaseOrders.filter((po) => po.purchaseOrderNo === SelectedValue.purchaseOrderNo)[0];
            addGrnTot.value = parseInt(selectedPO.totalPrice).toLocaleString("en-US", {
                style: "currency",
                currency: "LKR",
            });
            //Add Total amount to GRN object
            grn.totalAmount = parseInt(selectedPO.totalPrice);
            addGrnTot.classList.add('is-valid');
        });

}

//Function to Reload the GRN table
const reloadGRN = () => {
    const grnList = ajaxGetRequest("/grn/getAllGRNs")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

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
    const displayProperty = [
        {dataType: "text", propertyName: "grnNo"},
        {dataType: "function", propertyName: getPONo},
        {dataType: "price", propertyName: "totalAmount"},
        {dataType: "date", propertyName: "receivedDate"},
        {dataType: "function", propertyName: getStatus},
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
        getPrivilege
    )
    grnTableInstance = $("#tableGRN").DataTable({
        responsive: true,
        autoWidth: false,
    })

}

//Function to generate the drop down
const generateGRNDropDown = (element,rowIndex) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: grNFormRefill,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deleteGRN, icon: "fa-solid fa-trash me-2"},

    ];

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
        buttonElement.onclick = function () {
            button.action(element);
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
//const deleteGRN = (grn) => {
//    swal.fire({
//        title: "Delete GRN",
//        text: "Are you sure, you want to delete " + grn.grnNo + "?",
//        icon: "warning",
//        showCancelButton: true,
//        confirmButtonColor: "#cb421a",
//        cancelButtonColor: "#3f3f44",
//        confirmButtonText: "Yes, Delete"
//    }).then((result) => {
//        if (result.isConfirmed) {
//            let response = ajaxDeleteRequest(`/grn/deleteGrn/${grn.id}`);
//            if (response.status === 200) {
//                swal.fire({
//                    title: response.responseText,
//                    icon: "success"
//                });
//                reloadGRN();
//            } else {
//                swal.fire({
//                    title: "Something Went Wrong",
//                    text: response.responseText,
//                    icon: "error"
//                });
//            }
//        }
//    });
//}

//Function for refill the supplier form
const grNFormRefill = (ob, rowIndex) =>{

$("#modalGRNAdd").modal('show');

    grn = JSON.parse(JSON.stringify(ob));
    oldGrn = JSON.parse(JSON.stringify(ob));

    // Clear the Element
    addGrnPoNo.innerHTML = '';

    // Create a new option element
    const PoElement = document.createElement("option");

    // Set the value and text content of the new option
    PoElement.value = grn.purchaseOrder.purchaseOrderNo;
    PoElement.textContent = grn.purchaseOrder.purchaseOrderNo;

    // Append the new option to the select element
    addGrnPoNo.appendChild(PoElement);

    addGrnPoNo.disabled = true;


    addGrnPoNo.value = grn.purchaseOrder.purchaseOrderNo;
    addGrnTot.value = grn.totalAmount;
    addGrnRecDate.value = convertDateTimeToDate(grn.receivedDate);
    addGrnStatus.value = grn.grnStatus;

}

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