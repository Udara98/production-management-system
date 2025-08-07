let selectedIngredients = [];
const getIng = (ingList) => {
    selectedIngredients = [...ingList];
};

let tableSuppliersInstance;
let getPrivilege;
window.addEventListener("load",  () => {


    getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    if (!getPrivilege.insert) {
        $("#addSupplierBtn").prop("disabled", true);
    }

    //Call reloadSupTable function
    reloadSupTable();

    //Call supplier reg from refresh function
    reloadSupplierForm();

    //Call function for validation
   SupformValidation();

});

//Define function to generate Supplier table
const reloadSupTable =  () => {
    const suppliers = ajaxGetRequest("/supplier/getAllSuppliers");

    console.log(suppliers);

    const getStatus = (ob) => {
        if (ob.supplierStatus === "Active") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Active </p>';
        }
        if (ob.supplierStatus === "InActive") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">InActive</p>';
        }
    };

    const getSupplierName = (ob) => {
        if (ob.businessType === "COMPANY") {
            return ob.companyName;
        } else {
            return ob.firstName + " " + ob.secondName;
        }
    };
    const displayProperty = [
        {dataType: "text", propertyName: "regNo"},
        {
            dataType: "function",
            propertyName: getSupplierName,
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
    // Business type logic
    const businessTypeSelect = document.getElementById('add-sup-businessType');
    const companyName = document.getElementById('supplierName');
    const brn = document.getElementById('brn');
    const contactPersonName = document.getElementById('contactPersonName');
    const firstName = document.getElementById('firstName');
    const secondName = document.getElementById('secondName');
    const nic = document.getElementById('nic');
    const supplierStatus = document.getElementById('supplierStatus');
    const contactNo = document.getElementById('contactNo');
    const email = document.getElementById('email');
    const joinDate = document.getElementById('joinDate');
    const address = document.getElementById('address');
    const note = document.getElementById('note');
    // Bank fields
    const bankName = document.getElementById('bankName');
    const bankBranch = document.getElementById('bankBranch');
    const accountNo = document.getElementById('accountNo');
    const accountName = document.getElementById('accountName');

    function attachCompanyValidation() {
        if (companyName) companyName.addEventListener('input', () => validation(companyName, "^(?=.{4,})(?=.*[A-Za-z])[A-Za-z0-9.,&'’-]+( [A-Za-z0-9.,&'’-]+)*$", 'supplier', 'companyName'));
        if (brn) brn.addEventListener('input', () => validation(brn, '^[A-Za-z0-9-.]{5,12}$', 'supplier', 'brn'));
        if (contactPersonName) contactPersonName.addEventListener('input', () => validation(contactPersonName, '^([A-Z][a-z]+)( [A-Z][a-z]+){0,4}$', 'supplier', 'contactPersonName'));
    }
    function attachIndividualValidation() {
        if (firstName) firstName.addEventListener('input', () => validation(firstName, '^([A-Z][a-z]{2,20})$', 'supplier', 'firstName'));
        if (secondName) secondName.addEventListener('input', () => validation(secondName, '^([A-Z][a-z]{2,50})$', 'supplier', 'secondName'));
        if (nic) nic.addEventListener('input', () => validation(nic, '(^[0-9]{9}[VvXx]$)|(^[0-9]{12}$)', 'supplier', 'nic'));
    }
    // Common fields
    if(businessTypeSelect) businessTypeSelect.addEventListener('change', () => {selectFieldValidator(businessTypeSelect, '', 'supplier', 'businessType')});
    if (supplierStatus) supplierStatus.addEventListener('change', () => selectFieldValidator(supplierStatus, '', 'supplier', 'supplierStatus'));
    if (contactNo) contactNo.addEventListener('input', () => validation(contactNo, '^[0-9]{10}$', 'supplier', 'contactNo'));
    if (email) email.addEventListener('input', () => validation(email, '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', 'supplier', 'email'));
    if (joinDate) joinDate.addEventListener('change', () => dateFeildValidator(joinDate, '', 'supplier', 'joinDate'));
    if (address) {
        address.addEventListener('input', () =>
            validation(address, /^\S{1,15}( \S{1,15}){0,9}$/, 'supplier', 'address')
        );
    }

    if (note) note.addEventListener('input', () => validation(note, '^.{0,255}$', 'supplier', 'note'));
    // Bank fields
    // Bank Name: Only letters and spaces, 3-50 characters
    if (bankName) bankName.addEventListener('input', () => validation(bankName, '^[A-Za-z]+( [A-Za-z]+){0,5}$', 'supplier.bankAccount', 'bankName'));
    // Bank Branch: Only letters and spaces, 3-50 characters
    if (bankBranch) bankBranch.addEventListener('input', () => validation(bankBranch, '^([A-Z][a-z]+)( [A-Z][a-z]+)*$', 'supplier.bankAccount', 'bankBranch'));
    // Account Number: 6-30 digits
    if (accountNo) accountNo.addEventListener('input', () => validation(accountNo, '^[0-9]{6,30}$', 'supplier.bankAccount', 'accountNo'));
    // Account Name: Two or more words, each starting with a capital letter
    if (accountName) accountName.addEventListener('input', () => validation(accountName, '^([A-Z][a-z]+)( [A-Z][a-z]+)*$', 'supplier.bankAccount', 'accountName'));

    function updateValidation() {
        if (businessTypeSelect.value === 'COMPANY') {
            attachCompanyValidation();
        } else {
            attachIndividualValidation();
        }

    }
    if (businessTypeSelect) {
        businessTypeSelect.addEventListener('change', updateValidation);
        updateValidation();
    }
}

//Define Supplier submit function
    const supplierSubmit = () => {
    event.preventDefault();
    console.log(supplier);

    const ingList = [];
    selectedIngredients.forEach((ing) => {
        const i = { ingredientName: ing.ingredientName, ingredientCode: ing.ingredientCode };
        ingList.push(i);
    });




    supplier.ingredientList = ingList;

    // Collect bank account details from form
    const bankAccount = {
        bankName: document.getElementById("bankName").value,
        bankBranch: document.getElementById("bankBranch").value,
        accountNo: document.getElementById("accountNo").value,
        accountName: document.getElementById("accountName").value
    };
    supplier.bankAccount = bankAccount;
    console.log('Submitting supplier:', JSON.stringify(supplier));
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
                const postServiceRequestResponse = ajaxRequestBody("/supplier/addNewSupplier", "POST", supplier);

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

    // Get all suppliers
    const suppliers = ajaxGetRequest("/supplier/getAllSuppliers");

    // Call getTransfer list function
    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");
    getTransferList(ingredientList, [], getIng, 'add');

    // Reset all input fields
    const businessTypeSelect = document.getElementById('add-sup-businessType');
    const companyFields = document.getElementsByClassName('supplier-company-fields');
    const individualFields = document.getElementsByClassName('supplier-individual-fields');
    // Hide all company fields by default
    for (let elem of companyFields) {
        elem.style.display = 'none';
    }
    // Show all individual fields by default
    for (let elem of individualFields) {
        elem.style.display = '';
    }

    //Auto Selected Supplier Status
    const supplierStatusSelect = document.getElementById('supplierStatus');
    if (supplierStatusSelect) supplierStatusSelect.value = 'Active';
    supplierStatusSelect.disabled = true;


    // Toggle field visibility based on business type
    function updateFieldVisibility() {
        if (businessTypeSelect.value === 'COMPANY') {
            for (let elem of companyFields) {
                elem.style.display = '';
                elem.value = '';

            }
            for (let elem of individualFields) {
                   elem.value = '';
                elem.style.display = 'none';
            }
        } else {
            for (let elem of companyFields) {
                elem.style.display = 'none';
                elem.value = '';
            }
            for (let elem of individualFields) {
                elem.style.display = '';
                elem.value = '';
            }
        }
    }
    if (businessTypeSelect) {
        businessTypeSelect.addEventListener('change', updateFieldVisibility);
        updateFieldVisibility();
    }
}


//Define function to generate dropdown
const printSupplier = (supplier) => {
    // Populate modal with supplier details and show print button
    const supplierModal = new bootstrap.Modal(document.getElementById("supplierModal"));

    const supplierDetailsDiv = document.getElementById("supplierDetails");
    let bankAccountsHtml = '';
    if (supplier.bankAccount) {
        bankAccountsHtml = `<div>
            <hr>
            <h6><strong>Bank Account</strong></h6>
            <div><strong>Bank Name:</strong> ${supplier.bankAccount.bankName || ''}</div>
            <div><strong>Bank Branch:</strong> ${supplier.bankAccount.bankBranch || ''}</div>
            <div><strong>Account No:</strong> ${supplier.bankAccount.accountNo || ''}</div>
            <div><strong>Account Name:</strong> ${supplier.bankAccount.accountName || ''}</div>
        </div>`;
    }
    let ingredientsHtml = '';
    if (supplier.ingredients && supplier.ingredients.length > 0) {
        ingredientsHtml = `<div class="mb-3"><ul>${supplier.ingredients.map(ing => `<li>${ing.ingredientName} (${ing.ingredientCode})</li>`).join('')}</ul></div>`;
    }
    supplierDetailsDiv.innerHTML = `
        <div class="mb-3">
            <div><strong>Reg No:</strong> ${supplier.regNo || ''}</div>
            <div><strong>Name:</strong> ${supplier.businessType === "COMPANY" ? supplier.companyName : supplier.firstName + " " + supplier.secondName || ''}</div>
            <div><strong>Contact Person:</strong> ${supplier.contactPersonName || ''}</div>
            <div><strong>Contact Number:</strong> ${supplier.contactNo || ''}</div>
            <div><strong>Email:</strong> ${supplier.email || ''}</div>
            <div><strong>Address:</strong> ${supplier.address || ''}</div>
            <div><strong>Status:</strong> ${supplier.supplierStatus || ''}</div>
            <div><strong>Join Date:</strong> ${supplier.joinDate || ''}</div>
            <div><strong>Note:</strong> ${supplier.note || 'N/A'}</div>
        </div>
        <div class="mb-3">
            <hr>
            <h6><strong>Supplier Ingredients</strong></h6>
            ${ingredientsHtml}
        </div>
        ${bankAccountsHtml}
        <div class="text-end">
            <button id="btnPrintSupplier" class="btn btn-submit"><i class="fa fa-print"></i> Print</button>
        </div>
    `;
    supplierModal.show();
    setTimeout(() => {
        document.getElementById('btnPrintSupplier').onclick = function() {
            // Print only the modal content
            let printContents = supplierDetailsDiv.innerHTML;
            let printWindow = window.open('', '', 'height=700,width=900');
            printWindow.document.write(`
                <html>
                <head>
                <title>Supplier Details</title>
                <link href="/bootstrap-5.3.2/css/bootstrap.min.css"  rel="stylesheet">
                <link href="/styles/global.css" rel="stylesheet">
                </head>
                <body>` + printContents + `</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        };
    }, 300);
};

// Dropdown menu for each supplier row (refactored to match product.js pattern)
const generateSupDropDown = (element, index, privilegeOb = null) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Print",
            action: printSupplier,
            icon: "fa-solid fa-print me-2",
            enabled: privilegeOb ? !!privilegeOb.select : true,
        },
        {
            name: "Edit",
            action: editSupplier,
            icon: "fa-solid fa-edit me-2",
            enabled: privilegeOb ? !!privilegeOb.update : true,
        },
        // {
        //     name: "Delete",
        //     action: deleteSupplier,
        //     icon: "fa-solid fa-trash me-2",
        //     enabled: privilegeOb ? !!privilegeOb.delete : true,
        // },
    ];

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
        buttonElement.type = "button";
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
        const li = document.createElement("li");
        li.appendChild(buttonElement);
        dropdownMenu.appendChild(li);
    });

    return dropdownMenu;
};

//Check Supplier form errors
const checkSupplierFormError = () => {
    let errors = '';
    const businessTypeSelect = document.getElementById('add-sup-businessType');
    const brn = document.getElementById('brn');
    const contactPersonName = document.getElementById('contactPersonName');
    const firstName = document.getElementById('firstName');
    const secondName = document.getElementById('secondName');
    const nic = document.getElementById('nic');
    const supplierStatus = document.getElementById('supplierStatus');
    const contactNo = document.getElementById('contactNo');
    const email = document.getElementById('email');
    const address = document.getElementById('address');
    const note = document.getElementById('note');
    // Bank fields
    const bankName = document.getElementById('bankName');
    const bankBranch = document.getElementById('bankBranch');
    const accountNo = document.getElementById('accountNo');
    const accountName = document.getElementById('accountName');




    // Business type specific validation
    if (businessTypeSelect.value === 'COMPANY') {
        if (!supplierName.value.trim() || !/^(?=.{4,})(?=.*[A-Za-z])[A-Za-z0-9.,&'’-]+( [A-Za-z0-9.,&'’-]+)*$/.test(supplierName.value)) {
            errors += "Company Name is required and must be valid.\n";
            supplierName.classList.add('is-invalid');
        }
        if (!brn.value.trim() || !/^[A-Za-z0-9-.]{5,12}$/.test(brn.value)) {
            errors += "BRN is required and must be valid.\n";
            brn.classList.add('is-invalid');
        }
        if (!contactPersonName.value.trim() || !/^([A-Z][a-z]+)( [A-Z][a-z]+){0,4}$/.test(contactPersonName.value)) {
            errors += "Contact Person Name is required.\n";
            contactPersonName.classList.add('is-invalid');
        }
    } else {
        if (!firstName.value.trim() || !/^([A-Z][a-z]+)$/.test(firstName.value)) {
            errors += "First Name is required and must start with a capital letter.\n";
            firstName.classList.add('is-invalid');
        }
        if (!secondName.value.trim() || !/^([A-Z][a-z]+)$/.test(secondName.value)) {
            errors += "Second Name is required and must start with a capital letter.\n";
            secondName.classList.add('is-invalid');
        }
        if (!nic.value.trim() || !/(^[0-9]{9}[VvXx]$)|(^[0-9]{12}$)/.test(nic.value)) {
            errors += "NIC is required and must be valid.\n";
            nic.classList.add('is-invalid');
        }
    }
    // Common fields
    if (!supplierStatus.value) {
        errors += "Supplier status can't be null\n";
        supplierStatus.classList.add('is-invalid');
    }
    if (!contactNo.value.trim() || !/^[0-9]{10}$/.test(contactNo.value)) {
        errors += "Contact No must be a 10-digit number\n";
        contactNo.classList.add('is-invalid');
    }
    if (!email.value.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
        errors += "Email is invalid\n";
        email.classList.add('is-invalid');
    }
    if (address && !address.value.trim()) {
        errors += "Address is required and must be valid.\n";
        address.classList.add('is-invalid');
    }
    if (note && note.value.length > 255) {
        errors += "Note must be less than 255 characters.\n";
        note.classList.add('is-invalid');
    }
    // Bank fields
    if (!bankName.value.trim() || !/^[A-Za-z ]{3,50}$/.test(bankName.value)) {
        errors += "Bank Name is required and must be 3-50 letters.\n";
        bankName.classList.add('is-invalid');
    }
    if (!bankBranch.value.trim() || !/^[A-Za-z ]{3,50}$/.test(bankBranch.value)) {
        errors += "Bank Branch is required and must be 3-50 letters.\n";
        bankBranch.classList.add('is-invalid');
    }
    if (!accountNo.value.trim() || !/^[0-9]{6,30}$/.test(accountNo.value)) {
        errors += "Account Number is required and must be 6-30 digits.\n";
        accountNo.classList.add('is-invalid');
    }
    if (!accountName.value.trim() || !/^([A-Z][a-z]+)( [A-Z][a-z]+)*$/.test(accountName.value)) {
        errors += "Account Name is required (two words, capitalized).\n";
        accountName.classList.add('is-invalid');
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

    // bindSupplierData(supplier);
    supplierModal.show();
};

function openAddSupplierForm() {
    const businessTypeSelect = document.getElementById('add-sup-businessType');

    // Set modal title
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) modalTitle.textContent = 'Add Supplier';

    businessTypeSelect.disabled = false;



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

function openEditSupplierForm(supplier ) {
    supplier = JSON.parse(JSON.stringify(supplier));
    oldSupplier = JSON.parse(JSON.stringify(supplier));
    console.log(oldSupplier);
    console.log(supplier);
    
        const businessTypeSelect = document.getElementById('add-sup-businessType');
        businessTypeSelect.disabled = true;
        const companyName = document.getElementById('supplierName');
        const companyFields = document.getElementsByClassName('supplier-company-fields');
        const individualFields = document.getElementsByClassName('supplier-individual-fields');

     function updateFieldVisibility() {
            if (businessTypeSelect.value === 'COMPANY') {
                for (let elem of companyFields) {
                    elem.style.display = '';
                    elem.value = '';

                }
                for (let elem of individualFields) {
                       elem.value = '';
                    elem.style.display = 'none';
                }
            } else {
                for (let elem of companyFields) {
                    elem.style.display = 'none';
                    elem.value = '';
                }
                for (let elem of individualFields) {
                    elem.style.display = '';
                    elem.value = '';
                }
            }
        }



  
    // Set modal title
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) modalTitle.textContent = 'Edit Supplier';

    const getSupplierName = (ob) => {
        if (ob.businessType === "COMPANY") {
            return ob.companyName;
        } else {
            return ob.firstName + " " + ob.secondName;
        }
    };

    // Fill form fields
    supplierStatus.disabled = false;
    businessTypeSelect.value = supplier.businessType;
    updateFieldVisibility()

    supplierStatus.value = supplier.supplierStatus;
    firstName.value = supplier.firstName || '';
    secondName.value = supplier.secondName || '';
    nic.value = supplier.nic || '';
    supplier.note = supplier.note || '';
    companyName.value = supplier.companyName || '';
    brn.value = supplier.brn || '';
    contactPersonName.value = supplier.contactPersonName;
    bankName.value= supplier.bankAccount.bankName;
    bankBranch.value = supplier.bankAccount.bankBranch;
    accountNo.value = supplier.bankAccount.accountNo;
    accountName.value = supplier.bankAccount.accountName;
    contactNo.value = supplier.contactNo;
    email.value = supplier.email;
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

const checkSupplierUpdates = (supplier, oldSupplier) => {
    let updates = "";
   

    if (!oldSupplier) return updates;
    // Determine type
    const type = supplier.businessType;
    if (type === "COMPANY") {
        if (supplier.companyName !== oldSupplier.companyName) {
            updates += `Company Name changed from <b>${oldSupplier.companyName}</b> to <b>${supplier.companyName}</b>.<br>`;
        }
        if (supplier.brn !== oldSupplier.brn) {
            updates += `BRN changed from <b>${oldSupplier.brn}</b> to <b>${supplier.brn}</b>.<br>`;
        }
        if (supplier.contactPersonName !== oldSupplier.contactPersonName) {
            updates += `Contact Person Name changed from <b>${oldSupplier.contactPersonName}</b> to <b>${supplier.contactPersonName}</b>.<br>`;
        }
    }
    if (type === "INDIVIDUAL") {
        if (supplier.firstName !== oldSupplier.firstName) {
            updates += `First Name changed from <b>${oldSupplier.firstName}</b> to <b>${supplier.firstName}</b>.<br>`;
        }
        if (supplier.secondName !== oldSupplier.secondName) {
            updates += `Second Name changed from <b>${oldSupplier.secondName}</b> to <b>${supplier.secondName}</b>.<br>`;
        }
        if (supplier.nic !== oldSupplier.nic) {
            updates += `NIC changed from <b>${oldSupplier.nic}</b> to <b>${supplier.nic}</b>.<br>`;
        }
    }
    // Always check common fields
    if (supplier.supplierStatus !== oldSupplier.supplierStatus) {
        updates += `Status changed from <b>${oldSupplier.supplierStatus}</b> to <b>${supplier.supplierStatus}</b>.<br>`;
    }
    if (supplier.contactNo !== oldSupplier.contactNo) {
        updates += `Contact No changed from <b>${oldSupplier.contactNo}</b> to <b>${supplier.contactNo}</b>.<br>`;
    }
    if (supplier.email !== oldSupplier.email) {
        updates += `Email changed from <b>${oldSupplier.email}</b> to <b>${supplier.email}</b>.<br>`;
    }
    if (supplier.address !== oldSupplier.address) {
        updates += `Address changed from <b>${oldSupplier.address}</b> to <b>${supplier.address}</b>.<br>`;
    }

    function arraysAreEqual(arr1, arr2) {
      if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
      if (arr1.length !== arr2.length) return false;
      return arr1.every((val, index) => val === arr2[index]);
    }

    
    
    
    if (supplier.bankAccount.bankName !== oldSupplier.bankAccount.bankName) {
        updates += `Bank Name changed from <b>${oldSupplier.bankAccount.bankName || ''}</b> to <b>${supplier.bankAccount.bankName || ''}</b>.<br>`;
    }
    if (supplier.bankAccount.bankBranch !== oldSupplier.bankAccount.bankBranch) {
        updates += `Bank Branch changed from <b>${oldSupplier.bankAccount.bankBranch || ''}</b> to <b>${supplier.bankAccount.bankBranch || ''}</b>.<br>`;
    }
    if (supplier.bankAccount.accountNo !== oldSupplier.bankAccount.accountNo) {
        updates += `Account No changed from <b>${oldSupplier.bankAccount.accountNo || ''}</b> to <b>${supplier.bankAccount.accountNo || ''}</b>.<br>`;
    }
    if (supplier.bankAccount.accountName !== oldSupplier.bankAccount.accountName) {
        updates += `Account Name changed from <b>${oldSupplier.bankAccount.accountName || ''}</b> to <b>${supplier.bankAccount.accountName || ''}</b>.<br>`;
    }
    if (!arraysAreEqual(supplier.ingredientList, oldSupplier.ingredientList)) {
  updates += `Ingredients have changed.<br>`;

    }
    return updates;
};

const supplierUpdate = () => {
    event.preventDefault();
    supplierAddForm.classList.add('needs-validation');

    const ingList = [];

    selectedIngredients.forEach((ing) => {
        const i = { ingredientName: ing.ingredientName, ingredientCode: ing.ingredientCode };
        ingList.push(i);
    });


    // Update supplier object with latest form values
    const businessTypeSelect = document.getElementById('add-sup-businessType');
    const companyName = document.getElementById('supplierName');
    supplier.businessType = businessTypeSelect.value;
    supplier.supplierStatus = supplierStatus.value;
    supplier.contactNo = contactNo.value;
    supplier.email = email.value;
    supplier.address = address.value;
    supplier.note = note.value;
    supplier.ingredientList  = ingList ;
    supplier.regNo = oldSupplier.regNo;
    supplier.bankAccount = {
        bankName: bankName.value,
        bankBranch: bankBranch.value,
        accountNo: accountNo.value,
        accountName: accountName.value
    };
    // Assign business-type-specific fields
    if (supplier.businessType === 'COMPANY') {
        supplier.companyName = companyName.value;
        supplier.brn = brn.value;
        supplier.contactPersonName = contactPersonName.value;
        // Clear individual fields
        supplier.firstName = '';
        supplier.secondName = '';
        supplier.nic = '';
    } else if (supplier.businessType === 'INDIVIDUAL') {
        supplier.firstName = firstName.value;
        supplier.secondName = secondName.value;
        supplier.nic = nic.value;
        // Clear company fields
        supplier.companyName = '';
        supplier.brn = '';
        supplier.contactPersonName = '';
    }

    // Check form errors
    let errors = checkSupplierFormError();
    if (errors === "") {
        let updates = checkSupplierUpdates(supplier, oldSupplier);
        supplierAddForm.classList.remove('was-validated');
        $('#modalSupplierAdd').modal('hide');
        if (updates !== "") {
            Swal.fire({
                title: `Do you want to update ${supplier.regNo}?`,
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
