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
    supplierName.addEventListener('input', () => {
        validation(supplierName, '^[A-Za-z ]{2,50}$', 'supplier', 'supplierName');
    });

    supplierStatus.addEventListener('change', () => {
        selectFieldValidator(supplierStatus, '', 'supplier', 'supplierStatus');
    });

    contactPersonName.addEventListener('input', () => {
        validation(contactPersonName, '^[A-Za-z ]{2,50}$', 'supplier', 'contactPersonName');
    });

    contactNo.addEventListener('input', () => {
        validation(contactNo, '^\\d{10}$', 'supplier', 'contactNo');
    });

    email.addEventListener('input', () => {
        validation(email, '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', 'supplier', 'email');
    });

    joinDate.addEventListener('change', () => {
        dateFeildValidator(joinDate, '', 'supplier', 'joinDate');
    });

    address.addEventListener('input', () => {
        validation(address, '^.{5,}$', 'supplier', 'address');
    });

    note.addEventListener('input', () => {
        validation(note, '^.{0,255}$', 'supplier', 'note');
    });
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

    if (supplierName.value.trim() === '') {
        errors += "Supplier name can't be null\n";
        supplierName.classList.add('is-invalid');
    }
    if (!supplierStatus.value) {
        errors += "Supplier status can't be null\n";
        supplierStatus.classList.add('is-invalid');
    }
    if (contactPersonName.value.trim() === '') {
        errors += "Contact Person name can't be null\n";
        contactPersonName.classList.add('is-invalid');
    }
    if (contactNo.value.trim() === '' || !/^\d{10}$/.test(contactNo.value)) {
        errors += "Contact No must be a 10-digit number\n";
        contactNo.classList.add('is-invalid');
    }
    if (email.value.trim() === '' || !/^\S+@\S+\.\S+$/.test(email.value)) {
        errors += "Email is invalid\n";
        email.classList.add('is-invalid');
    }
    if (!joinDate.value) {
        errors += "Join date can't be null\n";
        joinDate.classList.add('is-invalid');
    }
    if (address.value.trim() === '') {
        errors += "Address can't be null\n";
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

function openAddSupplierForm() {
    // Set modal title
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) modalTitle.textContent = 'Add Supplier';

    // Reset form fields
    supplierAddForm.reset();
    // Remove validation classes
    Array.from(supplierAddForm.elements).forEach((field) => {
        field.classList.remove('is-valid', 'is-invalid');
    });
    // Enable Add, disable Update
    document.querySelector('.btn-submit').disabled = false;
    document.querySelector('.btn-update').disabled = true;
    // Reset transfer list
    reloadSupplierForm();
    $("#modalSupplierAdd").modal('show');
}

function openEditSupplierForm(supplier) {

    supplier = JSON.parse(JSON.stringify(supplier));
    oldSupplier = JSON.parse(JSON.stringify(supplier));
    // Set modal title
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) modalTitle.textContent = 'Edit Supplier';

    // Fill form fields
    supplierName.value = supplier.supplierName;
    supplierStatus.value = supplier.supplierStatus;
    contactPersonName.value = supplier.contactPersonName;
    contactNo.value = supplier.contactNo;
    email.value = supplier.email;
    joinDate.value = convertDateTimeToDate(supplier.joinDate);
    address.value = supplier.address;
    note.value = supplier.note || '';
    // Set transfer list
    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");
    let excludedList = ingredientList.filter(i => !supplier.ingredients.some(si => si.ingredientCode === i.ingredientCode));
    getTransferList(excludedList, supplier.ingredients, getIng, 'add');
    // Enable Update, disable Add
    document.querySelector('.btn-submit').disabled = true;
    document.querySelector('.btn-update').disabled = false;
    $("#modalSupplierAdd").modal('show');
}

// Update editSupplier to use openEditSupplierForm
const editSupplier = (supplier) => {
    openEditSupplierForm(supplier);
};

// Optionally, add a global for opening add form
window.openAddSupplierForm = openAddSupplierForm;

//Function for refill the supplier form
const supplierFormRefill = (ob, rowIndex) =>{

$("#modalSupplierAdd").modal('show');
  supplier = JSON.parse(JSON.stringify(ob));
  oldSupplier = JSON.parse(JSON.stringify(ob));

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

const deleteSupplier = (supplier) => {
    swal.fire({
        title: "Delete Supplier",
        text: `Are you sure, you want to delete ${supplier.supplierName}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxRequestBody("/supplier", "Delete", supplier);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadSupTable();
                reloadSupplierForm();
            } else {
                swal.fire({
                    title: "Something Went Wrong",
                    text: response.responseText,
                    icon: "error"
                });
            }
        }
    });
};

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

const checkSupplierUpdates = () => {
    let updates = "";
    if (!oldSupplier) return updates;
    if (supplier.supplierName !== oldSupplier.supplierName) {
        updates += `Supplier Name changed from <b>${oldSupplier.supplierName}</b> to <b>${supplier.supplierName}</b>.<br>`;
    }
    if (supplier.supplierStatus !== oldSupplier.supplierStatus) {
        updates += `Status changed from <b>${oldSupplier.supplierStatus}</b> to <b>${supplier.supplierStatus}</b>.<br>`;
    }
    if (supplier.contactPersonName !== oldSupplier.contactPersonName) {
        updates += `Contact Person Name changed from <b>${oldSupplier.contactPersonName}</b> to <b>${supplier.contactPersonName}</b>.<br>`;
    }
    if (supplier.contactNo !== oldSupplier.contactNo) {
        updates += `Contact No changed from <b>${oldSupplier.contactNo}</b> to <b>${supplier.contactNo}</b>.<br>`;
    }
    if (supplier.email !== oldSupplier.email) {
        updates += `Email changed from <b>${oldSupplier.email}</b> to <b>${supplier.email}</b>.<br>`;
    }
    if (supplier.joinDate !== oldSupplier.joinDate) {
        updates += `Join Date changed from <b>${oldSupplier.joinDate}</b> to <b>${supplier.joinDate}</b>.<br>`;
    }
    if (supplier.address !== oldSupplier.address) {
        updates += `Address changed from <b>${oldSupplier.address}</b> to <b>${supplier.address}</b>.<br>`;
    }
    if ((supplier.note || "") !== (oldSupplier.note || "")) {
        updates += `Note changed from <b>${oldSupplier.note || ''}</b> to <b>${supplier.note || ''}</b>.<br>`;
    }
    // Compare ingredients (simple string compare)
    if (JSON.stringify(supplier.ingredients) !== JSON.stringify(oldSupplier.ingredients)) {
        updates += `Ingredients list has been changed.<br>`;
    }
    return updates;
};

const supplierUpdate = () => {
    event.preventDefault();
    supplierAddForm.classList.add('needs-validation');
    // Gather form data into supplier object
    supplier.supplierName = supplierName.value;
    supplier.supplierStatus = supplierStatus.value;
    supplier.contactPersonName = contactPersonName.value;
    supplier.contactNo = contactNo.value;
    supplier.email = email.value;
    supplier.joinDate = joinDate.value;
    supplier.address = address.value;
    supplier.note = note.value;
    supplier.ingredients = selectedIngredients;
    supplier.regNo = oldSupplier.regNo; // or from the form if you display it
    // Ingredients already set by transfer list
    
    // Check form errors
    let errors = checkSupplierFormError();
    if (errors === "") {
        let updates = checkSupplierUpdates();
        supplierAddForm.classList.remove('was-validated');
        $('#modalSupplierAdd').modal('hide');
        if (updates !== "") {
            Swal.fire({
                title: `Do you want to update ${supplier.supplierName}?`,
                html: updates,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#cb421a",
                cancelButtonColor: "#3f3f44",
                confirmButtonText: "Yes, Update"
            }).then((result) => {
                if (result.isConfirmed) {
                    let updateServiceResponse = ajaxRequestBody("/supplier/updateSupplier", "PUT", supplier);
                    if (updateServiceResponse.status === 200) {
                        Swal.fire({
                            title: "Update successfully!",
                            text: "",
                            icon: "success"
                        });
                        supplierAddForm.reset();
                        reloadSupTable();
                        reloadSupplierForm();
                        // Remove validation classes
                        document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
                            input.classList.remove('is-valid', 'is-invalid');
                        });
                        supplierAddForm.classList.remove('was-validated');
                        $('#modalSupplierAdd').modal('hide');
                    } else {
                        Swal.fire({
                            title: "Update Not Successfully ...!",
                            text: updateServiceResponse.responseText,
                            icon: "error"
                        });
                    }
                }
            });
        } else {
            $('#modalSupplierAdd').modal('hide');
            Swal.fire({
                title: "No updates found!",
                text: '',
                icon: "question"
            });
        }
    } else {
        $('#modalSupplierAdd').modal('hide');
        Swal.fire({
            title: "Form has following errors!",
            text: errors,
            icon: "error"
        });
    }
};
