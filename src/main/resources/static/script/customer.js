// =============================
// Customer Management JS
// =============================

// Reset and prepare the customer add form for new entry
function reloadCustomerForm() {
    console.log('reloadCustomerForm called');

    const form = document.getElementById('customerAddForm');
    if (!form) return;

    // Input fields
    const companyName = document.getElementById('add-cus-comName');
    const brn = document.getElementById('add-cus-brn');
    const contactPerson = document.getElementById('add-cus-contactPerson');
    const firstName = document.getElementById('add-cus-fName');
    const secondName = document.getElementById('add-cus-sName');
    const nic = document.getElementById('add-cus-nic');
    const mobile = document.getElementById('add-cus-mobNo');
    const landNo = document.getElementById('add-cus-landNo');
    const address = document.getElementById('add-cus-address');
    const creditLimit = document.getElementById('add-cus-creditLimit');
    const email = document.getElementById('add-cus-email');
    const status = document.getElementById('add-cus-status');
    const businessTypeSelect = document.getElementById('add-cus-businessType');

    // Reset all input fields
    if (companyName) companyName.value = '';
    if (brn) brn.value = '';
    if (contactPerson) contactPerson.value = '';
    if (firstName) firstName.value = '';
    if (secondName) secondName.value = '';
    if (nic) nic.value = '';
    if (mobile) mobile.value = '';
    if (landNo) landNo.value = '';
    if (address) address.value = '';
    if (creditLimit) creditLimit.value = '';
    if (email) email.value = '';
    if (bankName) bankName.value = '';
    if (bankBranch) bankBranch.value = '';
    if (accountNo) accountNo.value = '';
    if (accountName) accountName.value = '';
    status.value = 'Active';
    status.selected = true;
    
    status.disabled = true;
    if (businessTypeSelect) businessTypeSelect.selectedIndex = 0;

    // Remove validation classes
    [companyName, brn, contactPerson, firstName, secondName, nic, mobile, landNo, address, creditLimit, email, status].forEach(f => {
        if (f) f.classList.remove('is-invalid', 'is-valid');
    });

    const firstRow = form.querySelector('.row.mt-2');
        // Add business type selector if not present
        if (!document.getElementById('add-cus-businessType')) {
            const businessTypeDiv = document.createElement('div');
            businessTypeDiv.className = 'col-12 mb-3';
            businessTypeDiv.innerHTML = `
                <label class="form-label fw-medium" for="add-cus-businessType">Business Type<span class="text-danger"> * </span></label>
                <select class="form-select" id="add-cus-businessType">
                    <option value="COMPANY" selected>Company</option>
                    <option value="INDIVIDUAL">Individual</option>
                </select>
            `;
            firstRow.parentNode.insertBefore(businessTypeDiv, firstRow);
        }

        function setCompanyFieldsVisible(isCompany) {
            document.getElementById('add-cus-comName').closest('.col').style.display = isCompany ? '' : 'none';
            document.getElementById('add-cus-contactPerson').closest('.col').style.display = isCompany ? '' : 'none';
            document.getElementById('add-cus-brn').closest('.col').style.display = isCompany ? '' : 'none';
            document.getElementById('add-cus-fName').closest('.col').style.display = isCompany ? 'none' : '';
            document.getElementById('add-cus-sName').closest('.col').style.display = isCompany ? 'none' : '';
            document.getElementById('add-cus-nic').closest('.col').style.display = isCompany ? 'none' : '';
        }
        // Initial state
        setCompanyFieldsVisible(true);
        document.getElementById('add-cus-businessType').addEventListener('change', function (e) {
            setCompanyFieldsVisible(e.target.value === 'COMPANY');
        });

    // Clear selected customer state
    selectedCustomer = null;
}


let customerTableInstance;
let selectedCustomer;

window.addEventListener('DOMContentLoaded', () => {
    customerTableRefresh();
    reloadCustomerForm();
    customerFormValidation();

    let userCustomerPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/CUSTOMER");

})


// Dropdown menu for each customer row (refactored to match product.js pattern)
const generateCustomerDropDown = (element, index, privilegeOb = null) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: customerFormRefill,
            icon: "fa-solid fa-edit me-2",
            enabled: privilegeOb ? !!privilegeOb.update : true,
        },
        {
            name: "View",
            action: printCustomer,
            icon: "fa-solid fa-eye me-2",
            enabled: privilegeOb ? !!privilegeOb.select : true,
        },
        {
            name: "Delete",
            action: deleteCustomer,
            icon: "fa-solid fa-trash me-2",
            enabled: privilegeOb ? !!privilegeOb.delete : true,
        },
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

// Refresh Customer Table
function customerTableRefresh() {
    const customerTable = document.getElementById('tableCustomer');
    const customers = ajaxGetRequest('/customer/getAllCustomers');
    let userCustomerPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/CUSTOMER");

    const getCustomerStatus = (ob) => {
        if (ob.customerStatus === "Active") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Active</p>';
        } else {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">Inactive</p>';
        }
    };

    const getCustomerName = (ob) => {
        if (ob.businessType === "COMPANY") {
            return ob.companyName;
        } else {
            return ob.firstName + ' ' + ob.secondName;
        }
    };
    
    const displayProperty = [
        { dataType: 'text', propertyName: 'regNo' },
        { dataType: 'text', propertyName: 'businessType' },
        { dataType: 'text', propertyName: 'companyName' },
        { dataType: 'function', propertyName: getCustomerName },
        { dataType: 'text', propertyName: 'nic' },
        { dataType: 'text', propertyName: 'mobile' },
        { dataType: 'text', propertyName: 'address' },
        { dataType: 'function', propertyName: getCustomerStatus },
        { dataType: 'price', propertyName: 'remainingCredit' },


    ];
    // const actionButtons = [
    //     { label: 'Edit', class: 'btn btn-sm btn-primary', onClick: editCustomer },
    //     { label: 'Delete', class: 'btn btn-sm btn-danger', onClick: deleteCustomer }
    // ];

    tableDataBinder(customerTable, customers, displayProperty, true, generateCustomerDropDown, userCustomerPrivilege);
}

// Refill Customer Form
function customerFormRefill(customer, rowIndex) {

    document.getElementById('customer-modal-title').textContent = 'Update Customer';
    document.getElementById('customer-submit-btn').disabled = true;
    document.getElementById('customer-update-btn').disabled = false;
    // Deep copy for update checks
    selectedCustomer = JSON.parse(JSON.stringify(customer));
    const form = document.getElementById('customerAddForm');
    if (!form) return;

    console.log("udara")

    // Field mapping (add-... IDs)
    const businessTypeSelect = document.getElementById('add-cus-businessType');
    const companyName = document.getElementById('add-cus-comName');
    const brn = document.getElementById('add-cus-brn');
    const contactPerson = document.getElementById('add-cus-contactPerson');
    const firstName = document.getElementById('add-cus-fName');
    const secondName = document.getElementById('add-cus-sName');
    const nic = document.getElementById('add-cus-nic');
    const mobile = document.getElementById('add-cus-mobNo');
    const landNo = document.getElementById('add-cus-landNo');
    const address = document.getElementById('add-cus-address');
    const creditLimit = document.getElementById('add-cus-creditLimit');
    const email = document.getElementById('add-cus-email');
    const status = document.getElementById('add-cus-status');
    const bankName = document.getElementById('bankName');
    const bankBranch = document.getElementById('bankBranch');
    const accountNo = document.getElementById('accountNo');
    const accountName = document.getElementById('accountName');


    businessTypeSelect.disabled = true;
    // Set business type and show/hide fields using robust class targeting
    if (businessTypeSelect && customer.businessType) {
        businessTypeSelect.value = customer.businessType;
        // Hide/show by group class for robust logic
        document.querySelectorAll('.company-fields').forEach(div => {
            div.style.display = customer.businessType === 'COMPANY' ? '' : 'none';
        });
        document.querySelectorAll('.individual-fields').forEach(div => {
            div.style.display = customer.businessType === 'INDIVIDUAL' ? '' : 'none';
        });
    }

    // Fill fields
    if (companyName) companyName.value = customer.companyName || '';
    if (brn) brn.value = customer.brn || '';
    if (contactPerson) contactPerson.value = customer.contactPerson || '';
    if (firstName) firstName.value = customer.firstName || '';
    if (secondName) secondName.value = customer.secondName || '';
    if (nic) nic.value = customer.nic || '';
    if (mobile) mobile.value = customer.mobile || '';
    if (landNo) landNo.value = customer.landNo || '';
    if (address) address.value = customer.address || '';
    if (creditLimit) {
        creditLimit.value = customer.creditLimit != null ? customer.creditLimit : '';
        creditLimit.disabled = true; // Disable for update
    }
    if (email) email.value = customer.email || '';
    if (status) status.value = customer.customerStatus || 'Active';
    if (bankName) bankName.value = customer.bankAccount.bankName || '';
    if (bankBranch) bankBranch.value = customer.bankAccount.bankBranch || '';
    if (accountNo) accountNo.value = customer.bankAccount.accountNo || '';
    if (accountName) accountName.value = customer.bankAccount.accountName || '';

    // Remove validation classes
    [companyName, brn, contactPerson, firstName, secondName, nic, mobile, landNo, address, creditLimit, email, status].forEach(f => {
        if (f) f.classList.remove('is-invalid', 'is-valid');
    });

    // Switch modal UI for update
    document.getElementById('customer-modal-title').textContent = 'Update Customer';

    // Show the add/edit modal
    if (typeof $ !== 'undefined') {
        $('#modalAddCustomer').modal('show');
    }
}

// Prepare modal for Add New Customer
function prepareCustomerAddModal() {
    document.getElementById('customer-modal-title').textContent = 'Add New Customer';
    document.getElementById('customer-submit-btn').disabled = false;
    document.getElementById('customer-update-btn').disabled = true;
    document.getElementById('add-cus-businessType').disabled = false;
    // Enable business type select for new
    const businessTypeSelect = document.getElementById('add-cus-businessType');
    if (businessTypeSelect) businessTypeSelect.disabled = false;
    // Clear form fields and validation
    document.getElementById('customerAddForm').reset();
    document.querySelectorAll('#customerAddForm .is-invalid, #customerAddForm .is-valid').forEach(el => {
        el.classList.remove('is-invalid', 'is-valid');
    });
}



// Form Validation and object binding
function customerFormValidation() {
    // Business Type logic already handled on load
    // Validation for all relevant fields
    const businessTypeSelect = document.getElementById('add-cus-businessType');
    const companyName = document.getElementById('add-cus-comName');
    const brn = document.getElementById('add-cus-brn');
    const contactPerson = document.getElementById('add-cus-contactPerson');
    const firstName = document.getElementById('add-cus-fName');
    const secondName = document.getElementById('add-cus-sName');
    const nic = document.getElementById('add-cus-nic');
    const mobile = document.getElementById('add-cus-mobNo');
    const landNo = document.getElementById('add-cus-landNo');
    const address = document.getElementById('add-cus-address');
    const creditLimit = document.getElementById('add-cus-creditLimit');
    const email = document.getElementById('add-cus-email');
    const status = document.getElementById('add-cus-status');

   
    // Company fields
    if (companyName) companyName.addEventListener('input', () => validation(companyName, "^(?=.{4,})(?=.*[A-Za-z])[A-Za-z0-9.,&'’-]+( [A-Za-z0-9.,&'’-]+)*$", 'customer', 'companyName'));  
    if (brn) brn.addEventListener('input', () => validation(brn, '^[A-Za-z0-9-.]{5,12}$', 'customer', 'brn'));
    if (contactPerson) contactPerson.addEventListener('input', () => validation(contactPerson, '^([A-Z][a-z]+)( [A-Z][a-z]+)+$', 'customer', 'contactPerson'));
    // Individual fields
    if (firstName) firstName.addEventListener('input', () => validation(firstName, '^.{4,}$', 'customer', 'firstName'));
    if (secondName) secondName.addEventListener('input', () => validation(secondName, '^.{4,}$', 'customer', 'secondName'));
    if (nic) nic.addEventListener('input', () => validation(nic, '(^[0-9]{9}[VvXx]$)|(^[0-9]{12}$)', 'customer', 'nic'));
    // Common fields
    if (mobile) mobile.addEventListener('input', () => validation(mobile, '^[0][7][01245678][0-9]{7}$', 'customer', 'mobile'));
    if (landNo) landNo.addEventListener('input', () => validation(landNo, '^[0][1][01245678][0-9]{7}$', 'customer', 'landNo'));
    if (address) address.addEventListener('input', () => validation(address, '^(?=.{5,255})[0-9A-Z]+(\\/[0-9A-Za-z,\\.]+)?\\s+[A-Za-z0-9]+(\\s+[A-Za-z0-9]+)*$', 'customer', 'address'));
    if (creditLimit) creditLimit.addEventListener('input', () => validation(creditLimit, '^[0-9]{3,20}$', 'customer', 'creditLimit'));
    if (email) email.addEventListener('input', () => validation(email, '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', 'customer', 'email'));
    if (status) status.addEventListener('change', () => selectFieldValidator(status, '', 'customer', 'customerStatus'));
    if (bankName) {
        bankName.addEventListener('input', () => {
            validation(bankName, '^([A-Za-z]{3,50}+)( [A-Za-z]{3,50}+){2,5}$', 'customer.bankAccount', 'bankName');
        });
    }
    if (bankBranch) {
        bankBranch.addEventListener('input', () => {
            validation(bankBranch, '^([A-Z][a-z]+)( [A-Z][a-z]){0,2}$', 'customer.bankAccount', 'bankBranch');
        });
    }

     if (bankName) {
            bankName.addEventListener('input', () => {
                validation(bankName, '^([A-Z][a-z]+)( [A-Z][a-z]){0,5}$', 'customer.bankAccount', 'bankName');
            });
        }


    if (accountNo) {
        accountNo.addEventListener('input', () => {
            validation(accountNo, '^[0-9]{6,30}$', 'customer.bankAccount', 'accountNo'); 
        });
    }
    if (accountName) {
        accountName.addEventListener('input', () => {
            validation(accountName, '^([A-Z][a-z]+)( [A-Z][a-z]+)+$', 'customer.bankAccount', 'accountName');
        });
    }

    // Business type change: clear errors and update visible fields
    if (businessTypeSelect) {
        businessTypeSelect.addEventListener('change', () => {
            [companyName, brn, contactPerson, firstName, secondName, nic].forEach(f => {
                if (f) f.classList.remove('is-invalid', 'is-valid');
            });
        });
    }



    // Validate and bind form to customer object
    // (kept as helper for submit/update, main validation is now event-driven)
    window.getCustomerFormObject = function() {
        let errors = '';
        let customer = {};

        customer.bankAccount = {
            bankName: '',
            bankBranch: '',
            accountNo: '',
            accountName: ''
        };

        const businessType = businessTypeSelect.value;
        customer.businessType = businessType;

        // Company fields
        if (businessType === 'COMPANY') {
            if (!companyName.value.trim()) {
                errors += 'Business Name is required.\n';
                companyName.classList.add('is-invalid');
            } else {
                companyName.classList.remove('is-invalid');
                customer.companyName = companyName.value.trim();
            }
            if (!brn.value.trim()) {
                errors += 'Business Registration Number is required.\n';
                brn.classList.add('is-invalid');
            } else if (!/^[A-Za-z0-9-,]{5,12}$/.test(brn.value.trim())) {
                errors += 'Please Enter Valid BRN.\n';
                brn.classList.add('is-invalid');
            } else {
                brn.classList.remove('is-invalid');
                customer.brn = brn.value.trim();
            }
            if (!contactPerson.value.trim()) {
                errors += 'Contact Person Name is required.\n';
                contactPerson.classList.add('is-invalid');
            } else {
                contactPerson.classList.remove('is-invalid');
                customer.contactPerson = contactPerson.value.trim();
            }
        } else {
            // Individual fields
            if (!firstName.value.trim()) {
                errors += 'First Name is required.\n';
                firstName.classList.add('is-invalid');
            } else {
                firstName.classList.remove('is-invalid');
                customer.firstName = firstName.value.trim();
            }
            if (!secondName.value.trim()) {
                errors += 'secondName is required.\n';
                secondName.classList.add('is-invalid');
            } else {
                secondName.classList.remove('is-invalid');
                customer.secondName = secondName.value.trim();
            }
            if (!nic.value.trim()) {
                errors += 'NIC is required.\n';
                nic.classList.add('is-invalid');
            } else if (!/(^[0-9]{9}[VvXx]$)|(^[0-9]{12}$)/.test(nic.value.trim())) {
                errors += 'NIC must be 9 digits followed by V/v/X/x or 12 digits.\n';
                nic.classList.add('is-invalid');
            } else {
                nic.classList.remove('is-invalid');
                customer.nic = nic.value.trim();
            }
        }

        // Common fields
        if (!mobile.value.trim() || !/^[0][7][01245678][0-9]{7}$/.test(mobile.value.trim())) {
            errors += 'Valid Mobile Number is required.\n';
            mobile.classList.add('is-invalid');
        } else {
            mobile.classList.remove('is-invalid');
            customer.mobile = mobile.value.trim();
        }
        if (landNo.value.trim() && !/^[0][1][01245678][0-9]{7}$/.test(landNo.value.trim())) {
            errors += 'Valid Land Number is required (optional field).\n';
            landNo.classList.add('is-invalid');
        } else {
            landNo.classList.remove('is-invalid');
            customer.landNo = landNo.value.trim();
        }
        if (!address.value.trim()) {
            errors += 'Address is required.\n';
            address.classList.add('is-invalid');
        } else {
            address.classList.remove('is-invalid');
            customer.address = address.value.trim();
        }
        if (!creditLimit.value || !/^[0-9]{3,20}$/.test(creditLimit.value)) {
            errors += 'Credit Limit must be at least 3 digits and at most 20 digits.\n';
            creditLimit.classList.add('is-invalid');
        } else {
            creditLimit.classList.remove('is-invalid');
            customer.creditLimit = Number(creditLimit.value);
        }
        if (!email.value.trim() || !/^[A-Za-z0-9\-_]{6,20}[@][a-z]{3,10}[.][a-z]{2,3}$/.test(email.value.trim())) {
            errors += 'Valid Email is required.\n';
            email.classList.add('is-invalid');
        } else {
            email.classList.remove('is-invalid');
            customer.email = email.value.trim();

        }    // Bank Name Validation
        if (!bankName.value) {
            errors += 'Valid Bank Name is required.\n';
            bankName.classList.add('is-invalid');
        } else {
            bankName.classList.remove('is-invalid');
            customer.bankName = bankName.value.trim();
        }
    
        // Bank Branch Validation
        if (!bankBranch.value.trim()) {
            errors += 'Valid Bank Branch is required.\n';
            bankBranch.classList.add('is-invalid');
        } else {
            bankBranch.classList.remove('is-invalid');
            customer.bankBranch = bankBranch.value.trim();
        }
    
        // Account Number Validation
        if (!accountNo.value.trim() || !/^[0-9]{6,30}$/.test(accountNo.value.trim())) {
            errors += 'Valid Account Number is required.\n';
            accountNo.classList.add('is-invalid');
        } else {
            accountNo.classList.remove('is-invalid');
            customer.accountNo = accountNo.value.trim();
        }
    
        // Account Name Validation (at least two words, each starting with capital)
        if (!accountName.value.trim() || !/^([A-Z][a-z]+)( [A-Z][a-z]+)+$/.test(accountName.value.trim())) {
            errors += 'Valid Account Name is required (at least two words, each starting with a capital letter).\n';
            accountName.classList.add('is-invalid');
        } else {
            accountName.classList.remove('is-invalid');
            customer.accountName = accountName.value.trim();
        }
 


    customer.customerStatus = status.value;

    const bankAccount = {
        bankName: document.getElementById("bankName").value,
        bankBranch: document.getElementById("bankBranch").value,
        accountNo: document.getElementById("accountNo").value,
        accountName: document.getElementById("accountName").value
    };
    customer.bankAccount = bankAccount;

    return {customer, errors};
    }

    // Form submit event
    const form = document.getElementById('customerAddForm');
    if(form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            addCustomer();
        }
    }
}


// CRUD Skeletons
const customerSubmit  = () => {
    const {customer, errors} = getCustomerFormObject();
    console.log(customer);

    if(errors === '') {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to add this customer?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E11D48',
            cancelButtonColor: '#3f3f44',
            confirmButtonText: 'Yes, Add'
        }).then((result) => {
            if(result.isConfirmed) {
                // POST to backend
                let response = ajaxRequestBody('/customer/addNewCustomer', 'POST', customer);
                if(response.status === 200 || response.status === 201) {
                    Swal.fire({
                        title: 'Customer Added Successfully!',
                        icon: 'success'
                    });
                    reloadCustomerForm();
                    customerTableRefresh();
                    $('#modalAddCustomer').modal('hide');
                    // Reset validation classes
                    Array.from(customerAddForm.elements).forEach((field) => {
                        field.classList.remove('is-valid', 'is-invalid');
                    });
                    $('#modalAddCustomer').modal('hide');

                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.responseText,
                        icon: 'error'
                    });
                }
            }
        });
    } else {
        Swal.fire({
            title: 'Form has errors!',
            text: errors,
            icon: 'error'
        });
    }
}


function editCustomer(customer, rowIndex) {
    customerFormRefill(customer, rowIndex);
}

// Check for changes between customer and oldCustomer (for update summary)
const checkCustomerUpdates = () => {
    let updates = "";
    if (!selectedCustomer) return updates;
    const form = document.getElementById('customerAddForm');
    const businessTypeSelect = document.getElementById('add-cus-businessType');
    const companyName = document.getElementById('add-cus-comName');
    const brn = document.getElementById('add-cus-brn');
    const contactPerson = document.getElementById('add-cus-contactPerson');
    const firstName = document.getElementById('add-cus-fName');
    const secondName = document.getElementById('add-cus-sName');
    const nic = document.getElementById('add-cus-nic');
    const mobile = document.getElementById('add-cus-mobNo');
    const landNo = document.getElementById('add-cus-landNo');
    const address = document.getElementById('add-cus-address');
    const email = document.getElementById('add-cus-email');
    const status = document.getElementById('add-cus-status');
    const bankName = document.getElementById('bankName');
    const bankBranch = document.getElementById('bankBranch');
    const accountNo = document.getElementById('accountNo');
    const accountName = document.getElementById('accountName');
    
    // Credit limit is not updatable
    if (businessTypeSelect.value !== selectedCustomer.businessType) updates += `Business Type changed from <b>${selectedCustomer.businessType}</b> to <b>${businessTypeSelect.value}</b>.<br>`;
    if (companyName && companyName.value !== (selectedCustomer.companyName || "")) updates += `Business Name changed from <b>${selectedCustomer.companyName || ""}</b> to <b>${companyName.value}</b>.<br>`;
    if (brn && brn.value !== (selectedCustomer.brn || "")) updates += `BRN changed from <b>${selectedCustomer.brn || ""}</b> to <b>${brn.value}</b>.<br>`;
    if (contactPerson && contactPerson.value !== (selectedCustomer.contactPerson || "")) updates += `Contact Person changed from <b>${selectedCustomer.contactPerson || ""}</b> to <b>${contactPerson.value}</b>.<br>`;
    if (firstName && firstName.value !== (selectedCustomer.firstName || "")) updates += `First Name changed from <b>${selectedCustomer.firstName || ""}</b> to <b>${firstName.value}</b>.<br>`;
    if (secondName && secondName.value !== (selectedCustomer.secondName || "")) updates += `secondName changed from <b>${selectedCustomer.secondName || ""}</b> to <b>${secondName.value}</b>.<br>`;
    if (nic && nic.value !== (selectedCustomer.nic || "")) updates += `NIC changed from <b>${selectedCustomer.nic || ""}</b> to <b>${nic.value}</b>.<br>`;
    if (mobile && mobile.value !== (selectedCustomer.mobile || "")) updates += `Mobile changed from <b>${selectedCustomer.mobile || ""}</b> to <b>${mobile.value}</b>.<br>`;
    if (landNo && landNo.value !== (selectedCustomer.landNo || "")) updates += `Land No changed from <b>${selectedCustomer.landNo || ""}</b> to <b>${landNo.value}</b>.<br>`;
    if (address && address.value !== (selectedCustomer.address || "")) updates += `Address changed from <b>${selectedCustomer.address || ""}</b> to <b>${address.value}</b>.<br>`;
    if (email && email.value !== (selectedCustomer.email || "")) updates += `Email changed from <b>${selectedCustomer.email || ""}</b> to <b>${email.value}</b>.<br>`;
    if (status && status.value !== (selectedCustomer.customerStatus || "")) updates += `Status changed from <b>${selectedCustomer.customerStatus || ""}</b> to <b>${status.value}</b>.<br>`;
    if (bankName && bankName.value !== (selectedCustomer.bankAccount.bankName || "")) updates += `Bank Name changed from <b>${selectedCustomer.bankAccount.bankName || ""}</b> to <b>${bankName.value}</b>.<br>`;
    if (bankBranch && bankBranch.value !== (selectedCustomer.bankAccount.bankBranch || "")) updates += `Bank Branch changed from <b>${selectedCustomer.bankAccount.bankBranch || ""}</b> to <b>${bankBranch.value}</b>.<br>`;
    if (accountNo && accountNo.value !== (selectedCustomer.bankAccount.accountNo || "")) updates += `Account No changed from <b>${selectedCustomer.bankAccount.accountNo || ""}</b> to <b>${accountNo.value}</b>.<br>`;
    if (accountName && accountName.value !== (selectedCustomer.bankAccount.accountName || "")) updates += `Account Name changed from <b>${selectedCustomer.bankAccount.accountName || ""}</b> to <b>${accountName.value}</b>.<br>`;
    return updates;
}

// Check for form errors (reuse getCustomerFormObject for validation)
function checkCustomerFormErrorForUpdate() {
    // Temporarily enable creditLimit for validation, but do not update it
    const creditLimit = document.getElementById('add-cus-creditLimit');
    if (creditLimit) creditLimit.disabled = false;
    const { errors } = getCustomerFormObject();
    if (creditLimit) creditLimit.disabled = true;
    return errors;
}

// Main update function for customer
const customerUpdate = () => {
    event.preventDefault();
    const form = document.getElementById('customerAddForm');
    form.classList.add('needs-validation');
    // Disable credit limit field for update
    const creditLimit = document.getElementById('add-cus-creditLimit');
    if (creditLimit) creditLimit.disabled = true;
    let errors = checkCustomerFormErrorForUpdate();
    if (errors === "") {
        let updates = checkCustomerUpdates();
        form.classList.remove('was-validated');
        $('#modalCustomerAdd').modal("hide");
        if (updates !== "") {
            swal.fire({
                title: "Do you want to update this customer?",
                html: updates,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#E11D48",
                cancelButtonColor: "#3f3f44",
                confirmButtonText: "Yes, Update"
            }).then((result) => {
                if (result.isConfirmed && selectedCustomer) {
                    // Prepare customer object for update (exclude creditLimit)
                    const { customer } = getCustomerFormObject();
                    customer.id = selectedCustomer.id;
                    customer.creditLimit = selectedCustomer.creditLimit; // Do not update
                    let response = ajaxRequestBody("/customer/updateCustomer", "PUT", customer);
                    if (response.status === 200) {
                        Swal.fire({
                            title: "Customer updated successfully!",
                            icon: "success"
                        });
                        reloadCustomerForm();
                        customerTableRefresh();
                    } else {
                        Swal.fire({
                            title: "Error",
                            text: response.responseText,
                            icon: "error"
                        });
                    }
                }
            });
        } else {
            $('#modalCustomerAdd').modal("hide");
            Swal.fire({
                title: "No updates found!",
                text: '',
                icon: "question"
            });
        }
    } else {
        $('#modalCustomerAdd').modal("hide");
        Swal.fire({
            title: "Form has following errors!",
            text: errors,
            icon: "error"
        });
    }
}

function deleteCustomer(customer, rowIndex) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this customer?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#E11D48',
        cancelButtonColor: '#3f3f44',
        confirmButtonText: 'Yes, Delete'
    }).then((result) => {
        if(result.isConfirmed) {
            let response = ajaxDeleteRequest(`/customer/${customer.id}`);
            if(response.status === 200) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Customer has been deleted.',
                    icon: 'success'
                });
                reloadCustomerForm();
                customerTableRefresh();
            } else {
                Swal.fire({
                    title: 'Delete Not Successful',
                    text: response.responseText,
                    icon: 'error'
                });
            }
        }
    });
}


// Show customer details in a modal with print option (like printSupplier)
const printCustomer = (customer) => {
    const customerModal = new bootstrap.Modal(document.getElementById("customerModal"));
    const customerDetailsDiv = document.getElementById("customerDetails");
    let bankAccountsHtml = '';
    if (customer.bankAccount) {
        bankAccountsHtml = `<div>
            <hr>
            <h6><strong>Bank Account</strong></h6>
            <div><strong>Bank Name:</strong> ${customer.bankAccount.bankName || ''}</div>
            <div><strong>Bank Branch:</strong> ${customer.bankAccount.bankBranch || ''}</div>
            <div><strong>Account No:</strong> ${customer.bankAccount.accountNo || ''}</div>
            <div><strong>Account Name:</strong> ${customer.bankAccount.accountName || ''}</div>
        </div>`;
    }
    customerDetailsDiv.innerHTML = `
        <div class="mb-3">
            <div><strong>Reg No:</strong> ${customer.regNo || ''}</div>
            <div><strong>Business Type:</strong> ${customer.businessType || ''}</div>
            <div><strong>Company Name:</strong> ${customer.companyName || ''}</div>
            <div><strong>BRN:</strong> ${customer.brn || ''}</div>
            <div><strong>Contact Person:</strong> ${customer.contactPerson || ''}</div>
            <div><strong>First Name:</strong> ${customer.firstName || ''}</div>
            <div><strong>Second Name:</strong> ${customer.secondName || ''}</div>
            <div><strong>NIC:</strong> ${customer.nic || ''}</div>
            <div><strong>Mobile:</strong> ${customer.mobile || ''}</div>
            <div><strong>Land No:</strong> ${customer.landNo || ''}</div>
            <div><strong>Email:</strong> ${customer.email || ''}</div>
            <div><strong>Address:</strong> ${customer.address || ''}</div>
            <div><strong>Status:</strong> ${customer.customerStatus || ''}</div>
            <div><strong>Credit Limit:</strong> ${customer.creditLimit || ''}</div>
        </div>
        ${bankAccountsHtml}
        <div class="text-end">
            <button id="btnPrintCustomer" class="btn btn-primary"><i class="fa fa-print"></i> Print</button>
        </div>
    `;
    customerModal.show();
    setTimeout(() => {
        document.getElementById('btnPrintCustomer').onclick = function() {
            let printContents = customerDetailsDiv.innerHTML;
            let printWindow = window.open('', '', 'height=700,width=900');
            printWindow.document.write(`
                <html>
                <head>
                <title>Customer Details</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                </head>
                <body>` + printContents + `</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        };
    }, 300);
};

// (Legacy) Show customer details in a modal or side panel
function viewCustomerDetails(customer, rowIndex) {
    document.getElementById('detailCustomerName').innerText = customer.name;
    document.getElementById('detailCustomerEmail').innerText = customer.email;
    document.getElementById('detailCustomerPhone').innerText = customer.phone;
    document.getElementById('detailCustomerAddress').innerText = customer.address;
    $('#modalViewCustomer').modal('show');
}


