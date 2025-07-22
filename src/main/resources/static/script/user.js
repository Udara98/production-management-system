let UserTableInstance;
//Browser Load Option
window.addEventListener('DOMContentLoaded', ()=>{

    //Call table Refresh function
    refreshUserTable();

    //Call form refresh function
    refreshUserForm();

    // Declare variable for employee list
     employeeListWithoutUserAccount = [];

     //Employee List without user account
     employeeListWithoutUserAccount = ajaxGetRequest('/employee/listwithoutuseraccount');


})

//Define function for refresh user table
const refreshUserTable = () => {

    user = new Object();
    //Define array for store data
    let users = ajaxGetRequest("/user/findallwithoutadmin");
    if (!Array.isArray(users)) users = [];


    const displayProperty = [
        {dataType:"photo", propertyName:'imageArray'},
        {dataType:"function", propertyName:getEmployee},
        {dataType:"text", propertyName:"username"},
        {dataType:"text", propertyName:"email"},
        {dataType:"function", propertyName:getRole},
        {dataType:"function", propertyName:getUserStatus},

    ]


    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/USER")

     if (UserTableInstance) {
             UserTableInstance.destroy();
         }
         $("#tableUser tbody").empty();


    fillDataIntoTable6(
        tableUser,
        users,
        displayProperty,
        refillUserForm,
        deleteUser,
        printUser,
        true,
        getPrivilege

    );


    users.forEach((element,index) =>{
        if(getPrivilege.delete && element.status === false){
            tableUser.children[2].children[index].children[7].children[0].children[1].children[2].children[0].disabled = true;

        }
    })

        productTableInstance = $("#tableUser").DataTable({
            responsive: true,
            autoWidth: false,

        });

}

// Function to preview the uploaded photo
    function previewPhoto(event) {
        const reader = new FileReader();
        reader.onload = function(){
            const output = document.getElementById('profilePhoto');
            output.src = reader.result;  // Change the image src to the uploaded file
        };
        reader.readAsDataURL(event.target.files[0]);  // Convert the file to a data URL
    }

    // Function to reset the photo back to the default
    function clearPhoto() {
        document.getElementById('profilePhoto').src = "/image/userprofilephotos/userprofilephotodummy.png";
        document.getElementById('filePhoto').value = "";  // Clear the file input value
    }


//Get Role
const getRole = (ob) =>{
    let userRole = '';
    ob.roles.forEach((element, index )=> {
        if (ob.roles.length - 1 == index) {
            userRole = userRole + element.name;
        } else {
            userRole = userRole + element.name + ", ";
        }
    });
    return userRole;
}
//Get employee fullname
const getEmployee = (ob) =>{
    return ob.employee_id.fullname
}

//Define function for get user status
const getUserStatus = (ob) => {
    //Check user status
   if(ob.status){
       return ' <p class="align-middle userActive mx-auto">Active</p>'
   }else {
       return ' <p class="align-middle userInActive mx-auto">Inactive</p>'
   }
};

//Create refill Function
//User form refill function
const refillUserForm = (ob, rowIndex)=>{

    $("#modalUser").modal('show');

    user = JSON.parse(JSON.stringify(ob));
    oldUser = JSON.parse(JSON.stringify(ob));

    UserName.value = user.username;

    inputEmail.value = user.email;
    textNote.value = user.note;

    if(user.status){
        checkStatus.checked = true;
        labelStatus.innerText = 'Account is Active';
    }else {
        checkStatus.checked = false;
        labelStatus.innerText = 'Account is Not Active';
    }

        // Declare variable for employee list
         employeeListWithoutUserAccount = [];

         //Employee List without user account
         employeeListWithoutUserAccount = ajaxGetRequest('/employee/listwithoutuseraccount');

    console.log(employeeListWithoutUserAccount);
    employeeListWithoutUserAccount.push(user.employee_id);
    fillDataIntoSelect(selectEmployee, 'select Employee', employeeListWithoutUserAccount, 'fullname',user.employee_id.fullname);


    //Need to get roll List
    roles = ajaxGetRequest("/role/list");
    divRoles.innerHTML = "";

    roles.forEach(element => {

        const div = document.createElement("div");
        div.className = "form-check form-check-inline";

        const inputCHK = document.createElement('input');
        inputCHK.type = "checkbox";
        inputCHK.className = "form-check-input";
        inputCHK.id = "chk" + element.name;

        inputCHK.onchange = function () {
            if (this.checked) {
                user.roles.push(element);
            } else {
                let extIndex = user.roles.map(item => item.name).indexOf(element.name);
                if (extIndex !== -1) {
                    user.roles.splice(extIndex, 1);
                }

            }
        }

        let extURoleIndex = user.roles.map(item => item.name).indexOf(element.name);
        if(extURoleIndex !== -1){
            inputCHK.checked = true;
        }

        const label = document.createElement('label');
        label.className = "form=check-label fw-bold";
        label.for = inputCHK.id;
        label.innerText = element.name;

        div.appendChild(inputCHK);
        div.appendChild(label);

        divRoles.appendChild(div);

    });

        if (user.photo == null) {
                profilePhoto.src = '/image/userprofilephotos/userprofilephotodummy.png';
                console.log("NO Photot")
            } else {
                console.log("Photo set")
                profilePhoto.src = atob(user.photo);
            }

}
// create funtion for delete User
const deleteUser = (ob, rowIndex) => {
    console.log("delete");
    // console.log(tableEmployee.children[1].children[rowIndex])
//    tableUser.children[1].children[rowIndex].style.backgroundColor = "pink";

    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete User " +
            "" + (ob.employee_id.gender === "Male" ? "Mr. " : "Mrs. ") + ob.employee_id.callingname + "?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E11D48",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then(async (result) => {
        if(result.isConfirmed) {

            // Delete Service
            let deleteServiceRequestResponse =  ajaxRequestBody("/user", "DELETE", ob)

            //Check Backend Service
            if (deleteServiceRequestResponse.status === 200) {
                swal.fire({
                    title: "Deleted!",
                    text: "User has been deleted.",
                    icon: "success"
                });
                userForm.reset();
                refreshUserTable();
                refreshUserForm();

            } else {
                swal.fire({
                    title: "Delete Not Successfully",
                    text: deleteServiceRequestResponse.responseText,
                    icon: "error"
                });
            }
        }
    })
}

const printUser = ()=>{}

//Define funtion for user update
const buttonUserUpdate = () => {
    userForm.classList.add('needs-validation');
    console.log("User update Button");
    console.log(user);
    //Check form Error
    let errors = checkUserFormEroor();

    if (errors === "") {
        //Check form update
        let updates = checkUserUpdate();
        console.log(updates);
        userForm.classList.remove('was-validated')
        $('#modalUser').modal("hide");
        if (updates !== "") {
            // let userConfirm = confirm("Are you sure to following updates..? \n" + updates);
            swal.fire({
                title: "Do you want to Update User",
                html:updates,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#cb421a",
                cancelButtonColor: "#3f3f44",
                confirmButtonText: "Yes, Update"
            }).then((result) =>{
                if(result.isConfirmed){
                    let updateServiceResponse = ajaxRequestBody("/user", "PUT", user);

                    if (updateServiceResponse.status === 200) {
                        // alert("Update successfully ...! \n");
                        Swal.fire({
                            title: "Update successfully ..! ",
                            text: "",
                            icon: "success"
                        });
                        //Need to refresh
                        userForm.reset();
                        refreshUserTable();
                        refreshUserForm();
                        // Remove 'is-valid' and 'is-invalid' classes from all input fields
                        document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
                            input.classList.remove('is-valid', 'is-invalid');
                        });
                        formEmployee.classList.remove('was-validated');
                        //Need hide modal
                        $('#userForm').modal("hide");
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
            $('#userForm').modal("hide");
            Swal.fire({
                title: "No updates Found..!",
                text: '',
                icon: "question"
            });
        }

    } else {
        $('#userForm').modal("hide");
        Swal.fire({
            title: "Form has following errors!",
            text: errors,
            icon: "error"
        });
    }
}

const checkUserFormEroor = () => {
    let errors = '';

    if (user.employee_id == null) {
        errors = errors + "Full name can't be null \n";
        selectEmployee.classList.add('is-invalid')
    }

    if (user.username == null) {
        errors = errors + "User name can't be null \n";
        UserName.classList.add('is-invalid')
    }


    if (user.password == null) {
        errors = errors + "Please Enter Password \n";
        inputRePassword.classList.add('is-invalid')
    }


    if (user.email == null) {
        errors = errors + "Email Enter Valid Email Address \n";
        textEmail.classList.add('is-invalid')
    }


    if (user.roles == null) {
        errors = errors + "Please Select the role \n";
        divRoles.classList.add('is-invalid');
    }

    return errors;
}

const refreshUserForm = ()=>{

    //Create new object call user
    user = new Object();

    oldUser = null;

    user.roles = new Array();

    //Employee List without user account
    employeeListWithoutUserAccount = ajaxGetRequest('/employee/listwithoutuseraccount');

    //employee list without user account
    fillDataIntoSelect(selectEmployee,"Select Employee", employeeListWithoutUserAccount,'fullname');

    //Set Auto Binding
    user.status = true;

    //Set Default Color
    selectEmployee.style.border = "2px solid #ced4da";
    UserName.style.border = "2px solid #ced4da";
    userPassword.style.border = "2px solid #ced4da";
    inputRePassword.style.border = "2px solid #ced4da";
    textEmail.style.border = "2px solid #ced4da";
    checkStatus.style.border = "2px solid #ced4da";
    textNote.style.border = "2px solid #ced4da";

    //Need to get roll List
    roles = ajaxGetRequest("/role/list");
    divRoles.innerHTML = "";

    roles.forEach(element => {

        const div = document.createElement("div");
        div.className = "form-check form-check-inline";

        const inputCHK = document.createElement('input');
        inputCHK.type= "checkbox";
        inputCHK.className = "form-check-input";
        inputCHK.id = "chk" + element.name;

        inputCHK.onchange = function (){
            if(this.checked){
                user.roles.push(element);
            }else {
                let extIndex = user.roles.map(item => item.name).indexOf(element.name);
                if(extIndex !== -1){
                    users.roles.splice(extIndex,1);
                }

            }
        }

        const label = document.createElement('label');
        label.className = "form=check-label fw-bold";
        label.for = inputCHK.id;
        label.innerText = element.name;

        div.appendChild(inputCHK);
        div.appendChild(label);

        divRoles.appendChild(div);
    })

    if (user.photo == null) {
            profilePhoto.src = '/image/userprofilephotos/userprofilephotodummy.png';
            console.log("NO Photot")
        } else {
            profilePhoto.src = atob(user.photo);
        }

}

//Password re type
const passwordRTValidator = (fieldId,passwordField ) =>{
    if(userPassword.value !== ""){
        if(userPassword.value === inputRePassword.value){
            fieldId.classList.remove("is-invalid");
            fieldId.classList.add("is-valid");
            user.password = userPassword.value;
            console.log(user)
        }else {
            fieldId.classList.add("is-invalid");
            user.password = null;
        }

    }else {
        fieldId.classList.add("is-invalid");
        user.password = null;
    }

}

const UserSubmit = () => {
    console.log("button User Submit");
    console.log(user);

    //1 Check form eroors
    const errors = checkUserFormEroor();

    if (errors == "") {


        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to Add User " +
                "" + (employee.gender === "Male" ? "Mr. " : "Mrs. ") + user.username + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E11D48",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Add"
        }).then((result) => {
            let postServiceRequestResponse = ajaxRequestBody("/user", "POST", user)
            //Check Backend Service
            if (postServiceRequestResponse.status===201) {
                //need to hide modal
                $("#modalUser").modal('hide');
                userForm.reset();
                refreshUserTable();
                refreshUserForm();
                // Remove validation classes from form fields
                Array.from(userForm.elements).forEach(function(field) {
                    field.classList.remove('is-valid', 'is-invalid');
                });

                Swal.fire({
                    title: "Save Successfully ..! ",
                    icon: "success"
                });



            } else {
                console.error(postServiceRequestResponse)
                // alert("Form has error\n" + postServiceRequestResponse)
                swal.fire({
                    title: "Form has error",
                    text: postServiceRequestResponse,
                    icon: "error"
                });

            }
        })
    } else {
         Swal.fire({
           title: " Add User Not Successfully ...!",
           text: errors,
           icon: "error"
         });


    }
}

//deifine method for check updates
const checkUserUpdate = () =>{
    let updates = "";

    if(user.employee_id !== oldUser.employee_id){
        updates = updates + "Employee " + oldUser.employee_id.fullname + " into " + user.employee_id.fullname + "<br>";
    }

    if(user.username !== oldUser.username){
        updates = updates + "User Name" + oldUser.callingname + " into " + user.callingname +"<br>";
    }

     if(user.photo !== oldUser.photo){
            updates = updates + "photo" + oldUser.photoname + " into " + user.photoname +"<br>";

        }

    if(user.password !== oldUser.password){
        updates = updates + "Password is changed to new password" + "<br>";
    }

    if(user.email !== oldUser.email){
        updates = updates + "Email is changed" + oldUser.email + " into " + user.email + "<br>";
    }


// Your code using arraysEqual function
    if (user.roles.length !== oldUser.roles.length) {
        updates = updates + "Roles are changed:";
        user.roles.forEach(userRole => {
            if (!oldUser.roles.some(oldRole => oldRole.id === userRole.id)) {
                updates = updates + "Added role: " + userRole.name + "<br>";
            }
        });
        oldUser.roles.forEach(oldRole => {
            if (!user.roles.some(userRole => userRole.id === oldRole.id)) {
                updates = updates + "Removed role: " + oldRole.name + "<br>";
            }
        });
    }
    return updates;
}




