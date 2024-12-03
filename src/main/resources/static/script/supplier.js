let selectedIngredients = [];
const getIng = (ingList) => {
    selectedIngredients = [...ingList];
};

let tableSuppliersInstance;
window.addEventListener("load",  () => {

    //Call reloadSupTable function
    reloadSupTable();

    //Call supplier reg from refresh function
    reloadSupplierForm();

    //Call function for validation
   SupformValidation();

//    //Call getTransfter list function
//    getTransferList(ingredientList, [], getIng, 'add');

//Supplier Submit Function
//    document.getElementById("supplierAddForm").onsubmit = function (event) {
//        event.preventDefault();
//        const ingList = [];
//        selectedIngredients.forEach((ing) => {
//            const i = {...ing};
//            delete i.suppliers;
//            ingList.push(i);
//        });
//        const supplier = {
//            regNo: document.getElementById("regNo").value,
//            supplierName: document.getElementById("supplierName").value,
//            contactPersonName: document.getElementById("contactPersonName").value,
//            contactNo: document.getElementById("contactNo").value,
//            email: document.getElementById("email").value,
//            address: document.getElementById("address").value,
//            note: document.getElementById("note").value,
//            joinDate: new Date(document.getElementById("joinDate").value),
//            supplierStatus: document.getElementById("supplierStatus").value,
//            ingredients: ingList,
//        };
//        let response = ajaxRequestBody("/supplier/addNewSupplier", "POST", supplier);
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            $("#modalSupplierAdd").modal("hide");
//            reloadSupTable();
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//    };

//Supplier Edit Function
//    document.getElementById("supplierEditForm").onsubmit = function (event) {
//        event.preventDefault();
//        const ingList = [];
//        selectedIngredients.forEach((ing) => {
//            const i = {...ing};
//            delete i.suppliers;
//            ingList.push(i);
//        });
//        const supplier = {
//            regNo: document.getElementById("edit-regNo").value,
//            supplierName: document.getElementById("edit-supplierName").value,
//            contactPersonName: document.getElementById("edit-contactPersonName").value,
//            contactNo: document.getElementById("edit-contactNo").value,
//            email: document.getElementById("edit-email").value,
//            address: document.getElementById("edit-address").value,
//            note: document.getElementById("edit-note").value,
//            joinDate: new Date(document.getElementById("edit-joinDate").value),
//            supplierStatus: document.getElementById("edit-supplierStatus").value,
//            ingredients: ingList,
//        };
//        let response = ajaxRequestBody("/supplier/updateSupplier", "PUT", supplier);
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            $("#modalSupplierEdit").modal("hide");
//            reloadSupTable();
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//    };
});

//Define function to generate Supplier table
const reloadSupTable =  () => {
    const suppliers = ajaxGetRequest("/supplier/getAllSuppliers");
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getStatus = (ob) => {
        if (ob.supplierStatus === "Active") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Active </p>';
        }
        if (ob.supplierStatus === "InActive") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">InActive</p>';
        }
    };
    const displayProperty = [
        {dataType: "text", propertyName: "regNo"},
        {
            dataType: "text",
            propertyName: "supplierName",
        },
        {dataType: "date", propertyName: "joinDate"},
        {
            dataType: "List",
            propertyName: getIngredients,
        },
        {dataType: "function", propertyName: getStatus},
    ];

    if (tableSuppliersInstance) {
        tableSuppliersInstance.destroy();
    }
    $("#tableSupplier tbody").empty();
    tableDataBinder(
        tableSupplier,
        suppliers,
        displayProperty,
        true,
        generateSupDropDown,
        getPrivilege
    );

    tableSuppliersInstance = $("#tableSupplier").DataTable();
};

//Call function for validation and object binding
const SupformValidation = () =>{

    regNo.addEventListener('keyup',() => {
                validation(regNo, '', 'supplier', 'regNo');
    });


    supplierName.addEventListener('keyup',  () => {
                validation(supplierName, '', 'supplier', 'supplierName');
    });

    contactPersonName.addEventListener('keyup', () => {
                    validation(contactPersonName, '', 'supplier', 'contactPersonName');
    });

    contactNo.addEventListener('keyup', () =>{
                validation(contactNo,'','supplier','contactNo')
    })

    email.addEventListener('keyup', () =>{
                    validation(email,'','supplier','email')
    })

    address.addEventListener('keyup', () =>{
                        validation(address,'','supplier','address')
     })

    supplierStatus.addEventListener('change', () =>{
    selectFieldValidator(supplierStatus,'','supplier','supplierStatus')
    })

    joinDate.addEventListener('change', () =>{
        dateFeildValidator(joinDate,'','supplier','joinDate')
    })

    address.addEventListener('keyup', () =>{
        validation(address,'','product','address')
    })

    note.addEventListener('keyup', () =>{
            validation(note,'','product','note')
    })
}

//Define Supplier submit function
 const supplierSubmit = () => {
    event.preventDefault();
    console.log(supplier);

    const ingList = [];
            selectedIngredients.forEach((ing) => {
                const i = {...ing};
                delete i.suppliers;
                ingList.push(i);
            });

    supplier.ingredients = ingList;
    console.log(supplier);

    // Check form errors
    const errors = checkSupplierFormError();

    if (errors === "") {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to add the Supplier " + supplier.supplierName + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E11D48",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Add"
        }).then((result) => {
            if (result.isConfirmed) {
                const postServiceRequestResponse = ajaxRequestBody("/supplier", "POST", supplier);

                // Check backend response
                if (postServiceRequestResponse.status === 200) {
                    $("#modalSupplierAdd").modal('hide');
                    supplierAddForm.reset();
                    reloadSupTable();
                    reloadSupplierForm();

                    // Reset validation classes
                    Array.from(supplierAddForm.elements).forEach((field) => {
                        field.classList.remove('is-valid', 'is-invalid');
                    });

                    Swal.fire({
                        title: "Supplier Added Successfully!",
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
            title: "Supplier does not Added",
            text: errors,
            icon: "error"
        });
    }
};

//Define Supplier reg form function
const reloadSupplierForm = () =>{

    supplier = new Object();
    oldSupplier = null;

    //Get all suppliers
    const suppliers = ajaxGetRequest("/supplier/getAllSuppliers");

    //Call getTransfer list function
    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");
    getTransferList(ingredientList, [], getIng, 'add');

}

//Define function to generate dropdown
const generateSupDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "View", action: viewSupplierData, icon: "fa-solid fa-eye me-2"},
        {
            name: "Edit",
            action: editSupplier,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deleteSupplier, icon: "fa-solid fa-trash me-2"},
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

//Check Supplier form errors
const checkSupplierFormError = () => {
    let errors = '';

    if (supplier.regNo == null) {
        errors = errors + "Reg No can't be null \n";
        regNo.classList.add('is-invalid')
    }

    if (supplier.supplierName == null) {
        errors = errors + "Supplier name can't be null \n";
        supplierName.classList.add('is-invalid')
    }


    if (supplier.supplierStatus == null) {
        errors = errors + "Supplier name can't be null  \n";
        supplierStatus.classList.add('is-invalid')
    }


    if (supplier.contactPersonName == null) {
        errors = errors + "Contact Person name can't be null \n";
        contactPersonName.classList.add('is-invalid')
    }


    if (supplier.contactNo == null) {
        errors = errors + "Contact No can't be null \n";
        addProductUnitType.classList.add('is-invalid');
    }

    if (supplier.email == null) {
            errors = errors + "Email can't be null  \n";
            email.classList.add('is-invalid');
        }

    if (supplier.joinDate == null) {
                errors = errors + "Join date can't be null  \n";
                joinDate.classList.add('is-invalid');
            }

    if (supplier.address == null) {
                errors = errors + "Address can't be null  \n";
                address.classList.add('is-invalid');
            }


    return errors;
}

const getIngredients = function (ob) {
    const ingredients = [...ob.ingredients];
    const items = [];
    ingredients.forEach((ing)=>{
        items.push(`${ing.ingredientName} (${ing.ingredientCode})`)
    })
    return items;
};

const viewSupplierData = (supplier) => {
    const supplierModal = new bootstrap.Modal(
        document.getElementById("supplierModal")
    );

    bindSupplierData(supplier);
    supplierModal.show();
};

const editSupplier = (supplier) => {
    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");
    let excludedList = ingredientList.filter(i => !supplier.ingredients.some(si => si.ingredientCode === i.ingredientCode));
    getTransferList(excludedList, supplier.ingredients, getIng, 'edit');

    document.getElementById("edit-regNo").value = supplier.regNo;
    document.getElementById("edit-supplierName").value = supplier.supplierName;
    document.getElementById("edit-contactPersonName").value = supplier.contactPersonName;
    document.getElementById("edit-contactNo").value = supplier.contactNo;
    document.getElementById("edit-email").value = supplier.email;
    document.getElementById("edit-address").value = supplier.address;
    document.getElementById("edit-note").value = supplier.note;
    document.getElementById("edit-joinDate").value = convertDateTimeToDate(supplier.joinDate)
    document.getElementById("edit-supplierStatus").value = supplier.supplierStatus;
    $("#modalSupplierEdit").modal('show');
};

//Function for refill the supplier form
const supplierFormRefill = (ob, rowIndex) =>{

$("#modalSupplierAdd").modal('show');
  supplier = JSON.parse(JSON.stringify(ob));
  oldSupplier = JSON.parse(JSON.stringify(ob));

   regNo.value = supplier.regNo ;
   supplierName.value = supplier.supplierName;
   supplierStatus.value = supplier.supplierStatus;
   contactPersonName.value = supplier.contactPersonName;
   contactNo.value = supplier.contactNo;
   email.value = supplier.email;
   joinDate.value = convertDateTimeToDate(supplier.joinDate);
   address.value = supplier.address;

   if(supplier.note !=null){
           note.value = supplier.note;
         }else {
           note.value = '';
       }

    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");

    let excludedList = ingredientList.filter(i => !supplier.ingredients.some(si => si.ingredientCode === i.ingredientCode));
    getTransferList(excludedList, supplier.ingredients, getIng, 'edit');

}

const deleteSupplier = (ob, rowIndex)=>{
    swal.fire({
        title: "Delete Supplier",
        text: "Are you sure, you want to delete"+ " " + (ob.supplierName) + "?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let deleteServiceRequestResponse =  ajaxRequestBody("/supplier", "DELETE", ob)
            console.log(deleteServiceRequestResponse.status);
            if (deleteServiceRequestResponse.status === 200 ) {
                swal.fire({
                    title: response.responseText,
                    text: "Supplier has been deleted.",
                    icon: "success"
                });
                reloadSupTable();
                reloadSupplierForm();
                supplierAddForm.reset();

            } else {
                swal.fire({
                    title: "Delete Not Successfully",
                    text: deleteServiceRequestResponse,
                    icon: "error"
                });
            }
        }
    });
}

function selected(data) {
    let ingredientsHtml = "";
    if (data.ingredients && data.ingredients.length > 0) {
        ingredientsHtml = `<div class="mb-3">
            <ul>`;
        data.ingredients.forEach((ingredient) => {
            ingredientsHtml += `<li>${ingredient.ingredientName} (${ingredient.ingredientCode})</li>`;
        });
        ingredientsHtml += `</ul>
        </div>`;
    }
    const supplierDetailsDiv = document.getElementById("supplierDetails");
    supplierDetailsDiv.innerHTML = `

<div class="mb-3">
                <h5><strong>Supplier Details</strong></h5>
                <hr>
            </div>
            <div class="mb-2">
                <strong>Registration Number:</strong> ${data.regNo}
            </div>
            <div class="mb-2">
                <strong>Supplier Name:</strong> ${data.supplierName}
            </div>
            <div class="mb-2">
                <strong>Join Date:</strong> ${new Date(data.joinDate).toLocaleDateString()}
            </div>
            <div class="mb-4">
                <strong>Status:</strong> ${data.supplierStatus}
            </div>
            
            <div class="mb-3">
                <h5><strong>Contact Details</strong></h5>
                <hr>
            </div>
            <div class="mb-2">
                <strong>Contact Person:</strong> ${data.contactPersonName}
            </div>
            <div class="mb-2">
                <strong>Contact Number:</strong> ${data.contactNo}
            </div>
            <div class="mb-2">
                <strong>Email:</strong> ${data.email}
            </div>
            <div class="mb-3">
                <strong>Address:</strong> ${data.address}
            </div>
            <div class="mb-4">
                <strong>Note:</strong> ${data.note ? data.note : "N/A"}
            </div>
            <div class="mb-3">
                <h5><strong>Supplier Ingredients</strong></h5>
                <hr>
            </div>
            ${ingredientsHtml}
        `;
}
