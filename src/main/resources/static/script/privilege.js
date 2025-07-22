let tablePrivilegeInstance;

//browser on load event
window.addEventListener("load", () => {

    getPrivilege = ajaxGetRequest('/privilege/byloggedusermodule/PRIVILEGE');
    console.log(getPrivilege)


    //Create empty object
    privilege = {};

    // call table refresh function
    refresPrivilegeTable();

    //call form refresh function
    refreshPrivilegeForm();

    //Validate form input fields
    formValidation();



});

const refresPrivilegeTable = () => {


    privileges = [];
    privileges = ajaxGetRequest("/privilege/findall")
    designations = ajaxGetRequest("/designation/findall")


    // text-> string date number
    //function ->object array boolean -- create function
    //column count === object count
    const displayProperty = [
        { dataType: "function", propertyName: getRoleInPri },
        { dataType: "function", propertyName: getModule },
        { dataType: "function", propertyName: getSelect },
        { dataType: "function", propertyName: getInsert },
        { dataType: "function", propertyName: getUpdate},
        { dataType: "function", propertyName: getDelete }
    ];

    //call fillDataIntoTable funtion
    //(tableID, dataArrayName, displayPropertyArea,editfuntion, deletefunction, printfuntion, button Visibility);

    if (tablePrivilegeInstance) {
        tablePrivilegeInstance.destroy();
    }
    $("#tableQuotations tbody").empty();
    tableDataBinder(
        tablePrivilege,
        privileges,
        displayProperty,
        true,
        generatePrivilegeDropDown,
        getPrivilege
    );
    tablePrivilegeInstance = $("#tablePrivilege").DataTable();


};

const filterModuleList = function () {

    modulesByRole = ajaxGetRequest("/module/modulelistbyrole?roleid=" + JSON.parse(selectRole.value).id);
    fillDataIntoSelect(selectModule, 'Choose a Module', modulesByRole, 'name');
    selectModule.disabled = false;
}

const refreshPrivilegeForm = function() {
    privilege = new Object();

    roles = ajaxGetRequest('/role/list');
    fillDataIntoSelect(selectRole, 'Choose a Role', roles, 'name');
    selectRole.disabled = false;
    selectRole.value = '';
    selectRole.classList.remove('is-valid');
    selectRole.classList.remove('is-invalid');


    modules = ajaxGetRequest('/module/list');
    fillDataIntoSelect(selectModule, 'Choose a Module', modules, 'name');
    selectModule.disabled = true;
    selectModule.value = '';
    selectModule.classList.remove('is-valid');
    selectModule.classList.remove('is-invalid');


    privilege.sel = false;
    checkSelect.checked = false;
    labelSelect.innerHTML = '<b>Select</b> Privilege is NOT-GRANTED.';

    privilege.ins = false;
    checkInsert.checked = false;
    labelInsert.innerHTML = '<b>Insert</b> Privilege is NOT-GRANTED.';

    privilege.upd = false;
    checkUpdate.checked = false;
    labelUpdate.innerHTML = '<b>Update</b> Privilege is NOT-GRANTED.';

    privilege.del = false;
    checkDelete.checked = false;
    labelDelete.innerHTML = '<b>Delete</b> Privilege is NOT-GRANTED.';

}

// Dropdown menu for each privilege row (refactored to match product.js pattern)
const generatePrivilegeDropDown = (element, index, privilegeOb = null) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "View",
            action: viewPrivilegeData,
            icon: "fa-solid fa-eye me-2",
            enabled: privilegeOb ? !!privilegeOb.select : true,
        },
        {
            name: "Edit",
            action: PrivilegeFormRefill,
            icon: "fa-solid fa-edit me-2",
            enabled: privilegeOb ? !!privilegeOb.update : true,
        },
        {
            name: "Delete",
            action: deletePrivilege,
            icon: "fa-solid fa-trash me-2",
            enabled: privilegeOb ? !!privilegeOb.delete : true,
        },
    ];

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class=\"${button.icon}\"></i>${button.name}`;
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
const checkPrivilegeUpdates = function () {
    let updates = '';
    if (privilege.role_id.name != oldPrivilege.role_id.name) {
        updates += `Role changed from <b>${oldPrivilege.role_id.name}</b> to <b>${privilege.role_id.name}</b>.<br>`;
    }
    if (privilege.module_id.name != oldPrivilege.module_id.name) {
        updates += `Module changed from <b>${oldPrivilege.module_id.name}</b> to <b>${privilege.module_id.name}</b>.<br>`;
    }
    if (privilege.sel != oldPrivilege.sel) {
        updates += `Select Privilege changed from <b>${oldPrivilege.sel ? 'Granted' : 'Not Granted'}</b> to <b>${privilege.sel ? 'Granted' : 'Not Granted'}</b>.<br>`;
    }
    if (privilege.ins != oldPrivilege.ins) {
        updates += `Insert Privilege changed from <b>${oldPrivilege.ins ? 'Granted' : 'Not Granted'}</b> to <b>${privilege.ins ? 'Granted' : 'Not Granted'}</b>.<br>`;
    }
    if (privilege.upd != oldPrivilege.upd) {
        updates += `Update Privilege changed from <b>${oldPrivilege.upd ? 'Granted' : 'Not Granted'}</b> to <b>${privilege.upd ? 'Granted' : 'Not Granted'}</b>.<br>`;
    }
    if (privilege.del != oldPrivilege.del) {
        updates += `Delete Privilege changed from <b>${oldPrivilege.del ? 'Granted' : 'Not Granted'}</b> to <b>${privilege.del ? 'Granted' : 'Not Granted'}</b>.<br>`;
    }
    return updates;
}

const getFormErrors = function () {

    let formSubmitErrors = '';

    if (privilege.role_id == null) {
        formSubmitErrors = formSubmitErrors + 'Please enter a Role \n';
        selectRole.classList.remove('is-valid');
        selectRole.classList.add('is-invalid');
    }

    if (privilege.module_id == null) {
        formSubmitErrors = formSubmitErrors + 'Please enter a Module \n';
        selectModule.classList.remove('is-valid');
        selectModule.classList.add('is-invalid');
    }

    if (privilege.sel == null) {
        formSubmitErrors = formSubmitErrors + 'Please Check or Uncheck Select privilege \n';
        checkSelect.classList.remove('is-valid');
        checkSelect.classList.add('is-invalid');
    }

    if (privilege.ins == null) {
        formSubmitErrors = formSubmitErrors + 'Please Check or Uncheck Insert privilege \n';
        checkInsert.classList.remove('is-valid');
        checkInsert.classList.add('is-invalid');
    }

    if (privilege.upd == null) {
        formSubmitErrors = formSubmitErrors + 'Please Check or Uncheck Update privilege \n';
        checkUpdate.classList.remove('is-valid');
        checkUpdate.classList.add('is-invalid');
    }

    if (privilege.del == null) {
        formSubmitErrors = formSubmitErrors + 'Please Check or Uncheck Delete privilege \n';
        checkDelete.classList.remove('is-valid');
        checkDelete.classList.add('is-invalid');
    }
    return formSubmitErrors;
};

const editPrivilege = (privilegeObj) => {
    privilege = JSON.parse(JSON.stringify(privilegeObj));
    oldPrivilege = JSON.parse(JSON.stringify(privilegeObj));
    // Fill the form fields
    // Role
    roles = ajaxGetRequest('/role/list');
    fillDataIntoSelect(selectRole, 'Select Role', roles, 'name', privilege.role_id.name);
    selectRole.disabled = true;
    // Module
    modules = ajaxGetRequest('/module/list');
    fillDataIntoSelect(selectModule, 'Select Module', modules, 'name', privilege.module_id.name);
    selectModule.disabled = true;
    // Privileges
    checkSelect.checked = privilege.sel;
    labelSelect.innerHTML = privilege.sel ? '<b>Select</b> Privilege is GRANTED.' : '<b>Select</b> Privilege is NOT-GRANTED.';
    checkInsert.checked = privilege.ins;
    labelInsert.innerHTML = privilege.ins ? '<b>Insert</b> Privilege is GRANTED.' : '<b>Insert</b> Privilege is NOT-GRANTED.';
    checkUpdate.checked = privilege.upd;
    labelUpdate.innerHTML = privilege.upd ? '<b>Update</b> Privilege is GRANTED.' : '<b>Update</b> Privilege is NOT-GRANTED.';
    checkDelete.checked = privilege.del;
    labelDelete.innerHTML = privilege.del ? '<b>Delete</b> Privilege is GRANTED.' : '<b>Delete</b> Privilege is NOT-GRANTED.';
    // Show the modal
}


const getModule = (ob) => {
    // console.log('module');
    return ob.module_id.name;
}

const getRoleInPri = (ob) => {
    // console.log('role');
    return ob.role_id.name;
}

const getSelect = (ob) => {
    if (ob.sel == true) {
        return 'Granted';
    } else {
        return 'Not-Granted';
    }
}

const getInsert = (ob) => {
    if (ob.ins == true) {
        return 'Granted';
    } else {
        return 'Not-Granted';
    }
}

const getUpdate = (ob) => {
    if (ob.upd == true) {
        return 'Granted';
    } else {
        return 'Not-Granted';
    }
}

const getDelete = (ob) => {
    if (ob.del == true) {
        return 'Granted';
    } else {
        return 'Not-Granted';
    }
}



const PrivilegeFormRefill = (ob, rowIndex) => {
    $("#modalPrivilegeAdd").modal('show');

    privilege = JSON.parse(JSON.stringify(ob));
    oldPrivilege = JSON.parse(JSON.stringify(ob));

    // Fill Role
    roles = ajaxGetRequest("/role/list");
    fillDataIntoSelect(
        selectRole,
        "Select Role",
        roles,
        "name",
        privilege.role_id.name
    );
    selectRole.disabled = true;

    // Fill Module
    modules = ajaxGetRequest("/module/list");
    fillDataIntoSelect(
        selectModule,
        "Select Module",
        modules,
        "name",
        privilege.module_id.name
    );
    selectModule.disabled = true;

    // Fill Privileges
    checkSelect.checked = privilege.sel;
    labelSelect.innerHTML = privilege.sel ? '<b>Select</b> Privilege is GRANTED.' : '<b>Select</b> Privilege is NOT-GRANTED.';

    checkInsert.checked = privilege.ins;
    labelInsert.innerHTML = privilege.ins ? '<b>Insert</b> Privilege is GRANTED.' : '<b>Insert</b> Privilege is NOT-GRANTED.';

    checkUpdate.checked = privilege.upd;
    labelUpdate.innerHTML = privilege.upd ? '<b>Update</b> Privilege is GRANTED.' : '<b>Update</b> Privilege is NOT-GRANTED.';

    checkDelete.checked = privilege.del;
    labelDelete.innerHTML = privilege.del ? '<b>Delete</b> Privilege is GRANTED.' : '<b>Delete</b> Privilege is NOT-GRANTED.';

    // Disable Add button, enable Update button
    document.getElementById('btnPrivAdd').disabled = true;
    document.getElementById('btnPrivUpdate').disabled = false;
};

const viewPrivilegeData = () => {

}

const deletePrivilege = (privilegeObj) => {
    Swal.fire({
        title: "Delete Privilege",
        text: "Are you sure you want to delete this privilege?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E11D48",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            // Call backend
            let response = ajaxRequestBody("/privilege", "DELETE", privilegeObj);
            if (response.status === 200) {
                Swal.fire({
                    title: "Privilege deleted successfully!",
                    icon: "success"
                });
                refresPrivilegeTable();
                refreshPrivilegeForm();
            } else {
                Swal.fire({
                    title: "Delete Not Successful",
                    text: response.responseText || response,
                    icon: "error"
                });
            }
        }
    });
};

const formValidation = function () {

    selectRole.addEventListener('change', function () {
        selectDValidation(selectRole,'', 'privilege', 'role_id');
    });

    selectModule.addEventListener('change', function () {
        selectDValidation(selectModule,'', 'privilege', 'module_id');
    });

    checkSelect.addEventListener('change', function () {
        inputCheckBoxValidation(checkSelect, 'privilege', 'sel', true, false, labelSelect, '<b>Select</b> Privilege is GRANTED.', '<b>Select</b> Privilege is NOT-GRANTED.');
    });

    checkInsert.addEventListener('change', function () {
        inputCheckBoxValidation(checkInsert, 'privilege', 'ins', true, false, labelInsert, '<b>Insert</b> Privilege is GRANTED.', '<b>Insert</b> Privilege is NOT-GRANTED.');
    });


    checkDelete.addEventListener('change', function () {
        inputCheckBoxValidation(checkDelete, 'privilege', 'del', true, false, labelDelete, '<b>Delete</b> Privilege is GRANTED.', '<b>Delete</b> Privilege is NOT-GRANTED.');
    });

    checkUpdate.addEventListener('change', function () {
        inputCheckBoxValidation(checkUpdate, 'privilege', 'upd', true, false, labelUpdate, '<b>Update</b> Privilege is GRANTED.', '<b>Update</b> Privilege is NOT-GRANTED.');
    });

}



const addPrivilege = function () {
    let formErrors = getFormErrors();
    if (formErrors == '') {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E11D48",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Add"
        }).then((result) => {
            if (result.isConfirmed) {
                let postServiceRequestResponse = ajaxRequestBody("/privilege", "POST", privilege);
                // Check Backend Service
                if (postServiceRequestResponse === '201' || postServiceRequestResponse.status === 201) {
                Swal.fire({
                        title: "Privilege Added Successfully!",
                        text: "The privilege has been granted and saved.",
                    icon: "success"
                });
                    // Hide modal
                    $('#modalPrivilegeAdd').modal('hide');
                    // Refresh privilege table and form
                    refresPrivilegeTable();
                    refreshPrivilegeForm();

            } else {
                    Swal.fire({
                        title: "Failed to Add Privilege",
                        text: postServiceRequestResponse.responseText || postServiceRequestResponse,
                    icon: "error"
                });
                }
            }
        });
    } else {
        Swal.fire({
            title: "Form has errors",
            text: formErrors,
            icon: "error"
        });
    }
}

const buttonPrivilegeUpdate = () => {
    let formErrors = getFormErrors();
    if (formErrors === '') {
        let updates = checkPrivilegeUpdates();
        if (updates !== '') {
            Swal.fire({
                title: "Do you want to update this privilege?",
                html: updates,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#cb421a",
                cancelButtonColor: "#3f3f44",
                confirmButtonText: "Yes, Update"
            }).then((result) => {
                if (result.isConfirmed) {
                    let updateResponse = ajaxRequestBody('/privilege', 'PUT', privilege);
                    if (updateResponse === '200' || updateResponse.status === 200) {
                        Swal.fire({
                            title: "Privilege updated successfully!",
                            icon: "success"
                        });
                        refresPrivilegeTable();
                        refreshPrivilegeForm();
                        $('#modalPrivilegeAdd').modal('hide');
                    } else {
                        Swal.fire({
                            title: "Update Not Successful",
                            text: updateResponse.responseText || updateResponse,
                            icon: "error"
                        });
                    }
                }
            });
        } else {
            $('#modalPrivilegeAdd').modal('hide');
            Swal.fire({
                title: "No updates found.",
                icon: "question"
            });
        }
    } else {
        Swal.fire({
            title: "Form has errors!",
            text: formErrors,
            icon: "error"
        });
    }
}