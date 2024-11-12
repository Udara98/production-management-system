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

const generatePrivilegeDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "View", action: viewPrivilegeData, icon: "fa-solid fa-eye me-2"},
        {
            name: "Edit",
            action: editPrivilege,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deletePrivilege, icon: "fa-solid fa-trash me-2"},
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
const checkPrivilegeUpdates = function () {

    let updates = '';

    if (privilege.role_id.name != oldPrivilege.role_id.name) {
        updates = updates + 'Role change into ' + privilege.role_id.name;
    }
    if (privilege.module_id.name != oldPrivilege.module_id.name) {
        updates = updates + 'Module change into ' + privilege.module_id.name;
    }
    if (privilege.sel != oldPrivilege.sel) {
        updates = updates + 'Select Privilege change into ' + privilege.sel;
    }
    if (privilege.ins != oldPrivilege.ins) {
        updates = updates + 'Insert Privilege change into ' + privilege.ins;
    }
    if (privilege.upd != oldPrivilege.upd) {
        updates = updates + 'Update Privilege change into ' + privilege.upd;
    }
    if (privilege.del != oldPrivilege.del) {
        updates = updates + 'Delete Privilege change into ' + privilege.del;
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

const editPrivilege = () =>{
    console.log('Modal Privilege Update button');

    let formErrors = getFormErrors();
    if (formErrors === '') {

    let updates = checkPrivilegeUpdates();
    if (updates !== '') {

        let confirmMessage = confirm('Are you sure you want to do this update? \n \n' + updates + '\n');
        if (confirmMessage) {

            let updateResponse = bodyRequest('/privilege', 'PUT', privilege);

            if (updateResponse == '200') {
                // if (new RegExp('^[0-9]{7}$').test(updateResponse)) {
                alert('updated successfully');
                refresPrivilegeTable();
                reloadPrivilegeForm();
                $('#modalPrivilege').modal('hide');
            } else {
                alert('Not updated \n Following errors are occured. \n' + updateResponse);
            }
        }
    }else {
        alert('There\'s nothing updated on privilege form')
    }

} else {
    alert('There are multiple errors on the form \n' + formErrors);
}
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
        return 'Not-Granted';
    } else {
        return 'Granted';
    }
}

const getInsert = (ob) => {
    if (ob.inst == true) {
        return 'Not-Granted';
    } else {
        return 'Granted';
    }
}

const getUpdate = (ob) => {
    if (ob.upd == true) {
        return 'Not-Granted';
    } else {
        return 'Granted';
    }
}

const getDelete = (ob) => {
    if (ob.del == true) {
        return 'Not-Granted';
    } else {
        return 'Granted';
    }
}



const PrivilegeFormRefill = (ob, rowIndex) => {
    console.log("refil");
    $("#modalPrivilegeAddForm").modal('show');

    privilege = JSON.parse(JSON.stringify(ob));
    oldPrivilege = JSON.parse(JSON.stringify(ob));

    roles = ajaxGetRequest("/role/list");
    fillDataIntoSelect(
        selectRole,
        "Select Role",
        roles,
        "name",
        privilege.role_id.name
    );
    selectRole.disabled = true;

    modules = ajaxGetRequest("/module/list")
    fillDataIntoSelect(
        selectModule,
        "Select Module",
        modules,
        "name",
        privilege.module_id.name
    );

    selectModule.disabled = true;



};

const viewPrivilegeData = () => {

}

const deletePrivilege  = () => {
  
}

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

    // console.log('modal privilege add button');
    let formErrors = getFormErrors();
    // console.log(privilege);
    if (formErrors == '') {
        // alert('successfull');
    //     let confirmMessage = confirm('Privilege Details :- \n' + 'Role - ' + privilege.role_id.name + '\n' + 'Module - ' + privilege.module_id.name + '\n' + '\n' + 'Are you sure you want to add this privilege');
    //     if (confirmMessage) {
    //
    //         let postResponse = bodyRequest('/privilege', 'POST', privilege);
    //
    //         if (postResponse == '200') {
    //             alert('Saved successfully');
    //             reloadPrivilegeTable();
    //             reloadPrivilegeForm();
    //             $('#modalPrivilege').modal('hide');
    //             console.log('after privileges saved in database ' + privilege);
    //         } else {
    //             alert('Not saved \n Following errors are occured \n' + postResponse);
    //         }
    //     }
    // } else {
    //     alert('There are multiple errors on the form \n' + formErrors);
    // }
        Swal.fire({
            title: "Are you sure?",
            // text: "Do you want to Add Privilege " +
            //     "" + (employee.gender === "Male" ? "Mr. " : "Mrs. ") + employee.fullname + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E11D48",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Add"
        }).then((result) => {
            let postServiceRequestResponse = ajaxRequestBody("/privilege", "POST", privilege)
            //Check Backend Service
            if (postResponse === '200') {

                Swal.fire({
                    title: "Save Successfully ..! ",
                    html: postServiceRequestResponse,
                    icon: "success"
                });

                //need to hide modal
                $("#modalEmployeeAdd").modal('hide');
                formEmployee.classList.add('was-validated')
                formEmployee.reset();
                refreshEmployeeTable();
                refreshEmployeeForm();
                formEmployee.classList.add('needs-validated')

            } else {
                // alert("Form has error\n" + postServiceRequestResponse)
                swal.fire({
                    title: "Form has error",
                    text: postServiceRequestResponse,
                    icon: "error"
                });

            }
        });
    }
}