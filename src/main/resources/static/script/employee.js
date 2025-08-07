let employeeTableInstance;
let empUpdBtn;
let empSubBtn;
//browser on load event
window.addEventListener("load", () => {

    empUpdBtn = document.getElementById("btn-emp-update");
    empSubBtn  = document.getElementById("btn-emp-submit");


  //Create empty object
  employee = {};

  // call table refresh function
  refreshEmployeeTable();

  //call form refresh function
  refreshEmployeeForm();


});

const prepareEmpModal = () => {

  empUpdBtn.disabled = true;
  empSubBtn.disabled = false;

  //Reset form
  formEmployee.reset();
  formEmployee.classList.remove('was-validated');
  formEmployee.classList.add('needs-validation');

  //Need to hide validation error
  document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
    input.classList.remove('is-valid', 'is-invalid');
  });

  $('#modalEmployeeAdd').modal('show');

}

const refreshEmployeeTable = () => {


  employees = [];
  employees = ajaxGetRequest("/employee/findall")
  designations = ajaxGetRequest("/designation/findall")


  // text-> string date number
  //funtion ->object array boolean -- create funtion
  //column count === object count
  const displayProperty = [
    { dataType: "text", propertyName: "empnumber" },
    { dataType: "text", propertyName: "fullname" },
    { dataType: "text", propertyName: "nic" },
    { dataType: "text", propertyName: "email" },
    { dataType: "function", propertyName: getHasUserAccount },
    { dataType: "text", propertyName: "mobile" },
    { dataType: "function", propertyName: getDesignation },
    { dataType: "function", propertyName: getEmployeeStatus },
  ];

  let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/EMPLOYEE")

  if (employeeTableInstance) {
          employeeTableInstance.destroy();
      }
      $("#tableEmployee tbody").empty();

  fillDataIntoTable6(
    tableEmployee,
    employees,
    displayProperty,
    employeeFormRefill,
    deleteEmployee,
    null,
    true,
      getPrivilege
  );


  employeeTableInstance = $("#tableEmployee").DataTable({
          responsive: true,
          autoWidth: false,

      });


  employees.forEach((element,index) =>{
    if(getPrivilege.delete && element.employeestatus_id.id ===3){
      tableEmployee.children[2].children[index].children[9].children[0].children[1].children[2].children[0].disabled = true;

    }
  })
};

//create funtion getEmployeeStatus
const getEmployeeStatus = (ob) => {
  console.log(ob.employeestatus_id.name);
  if (ob.employeestatus_id.name === "Working") {
    return '<p class="status-working align-middle">' + ob.employeestatus_id.name + "</p>";
  }
  if (ob.employeestatus_id.name === "Resign") {
    return '<p class="status-resign align-middle">' + ob.employeestatus_id.name + "</p>";
  }
  if (ob.employeestatus_id.name === "Deleted") {
    return '<p class="status-delete align-middle">' + ob.employeestatus_id.name + "</p>";
  }
};

const getDesignation = (ob) => {
  return ob.designation_id.name;
};

const getHasUserAccount = (ob) => {
  // Make API call to check if employee has user account
  const hasUserAccount = ajaxGetRequest(`/user/byempid/${ob.id}`);
  
  if (hasUserAccount) {
    return '<i class="fa-solid fa-circle-check fa-2x text-success d-flex justify-content-center"></i>';
  } else {
    return '<i class="fa-solid fa-circle-xmark fa-2x text-center d-flex justify-content-center" style="color: #e54a4a"></i>';
  }
};

//add funtion
// function add (){
//     refreshEmployeeTable();
// }

// employeeFormRefil, deleteEmployee, printEmployee

// create function for employee form refill
// const employeeFormRefill = (ob, rowIndex) => {
//   console.log("refil");
//   // textFullname.value = ob.fullName;
// };

//Create refill Function
const employeeFormRefill = (ob, rowIndex) => {

  empUpdBtn.disabled = false;
  empSubBtn.disabled = true;


  console.log("refil");
  $("#modalEmployeeAdd").modal('show');
  employee = JSON.parse(JSON.stringify(ob));
  oldemployee = JSON.parse(JSON.stringify(ob));

  let currentDate = new Date();
  console.log('Date', currentDate);
  console.log('Year', currentDate.getFullYear());
  console.log('Month', currentDate.getMonth()); //Month array [0-11]
  console.log('Day', currentDate.getDate()); //Range 0-31

  let minDate = new Date();
  let maxDate = new Date();

  let minMonth = minDate.getMonth();

  if(minMonth<10){
    minMonth = '0' + minMonth;
  }

  let minDay = minDate.getDate();
  if(minDay<10){
    minDay = '0' + minDay;
  }

  minDate.setFullYear(minDate.getFullYear() -60);
  dateOfBirth.min = minDate.getFullYear() + '-' + minMonth+ '-'+ minDay;


  let maxMonth = maxDate.getMonth();

  if(maxMonth<10){
    maxMonth = '0' + maxMonth;
  }

  let maxDay = maxDate.getDate();
  if(maxDay<10){
    maxDay = '0' + maxDay;
  }
  maxDate.setFullYear(maxDate.getFullYear() -18);
  dateOfBirth.max = maxDate.getFullYear() + '-' + maxMonth+ '-'+ maxDay;


  textFullName.value = employee.fullname ;
  txtCallingName.value = employee.callingname ;
  txtNic.value = employee.nic;
  dateOfBirth.value = employee.dob;
  textMobile.value = employee.mobile;
  textLand.value = employee.landno;
  textEmail.value = employee.email;
  textAddress.value = employee.address;
  textNote.value = employee.note;
  selectCivilStatus.value = employee.civilstatus;

  if(employee.landno !=null){
    textLand.value = employee.landno;
  }else {
    textLand.value = '';
  }

  if(employee.note !=null){
    textNote.value = employee.note;
  }else {
    textNote.value = '';
  }

  if(employee.gender =="Male"){
    radioMale.checked = true;
  }else {
    radioFemale.checked = true;
  }

  //Select Designation
  const selectDesignation = document.getElementById("selectDesignation");
  fillDataIntoSelect(
      selectDesignation,
      "Select Designation",
      designations,
      "name",
      employee.designation_id.name
  );



  //Select EmployeeStatus
  const selectStatus = document.getElementById("selectStatus");
  fillDataIntoSelect(
      selectStatus,
      "Select Status",
      employeeStatus,
      "name",
      employee.employeestatus_id.name
  );


  //Select Valid Color for element

};

  //deifine method for check updates
  const checkUpdates = () =>{
    let updates = "";

    if(employee.fullname !== oldemployee.fullname){
      updates = updates + "Full Name is changed" + oldemployee.fullname + " into " + employee.fullname + "<br>";
    }

    if(employee.callingname !== oldemployee.callingname){
      updates = updates + "Calling Name is changed" + oldemployee.callingname + " into " + employee.callingname +"<br>";
    }

    if(employee.nic !== oldemployee.nic){
      updates = updates + "NIC is changed" + oldemployee.nic + " into " + employee.nic + "<br>";
    }

    if(employee.gender !== oldemployee.gender){
      updates = updates + "Gender is changed" + oldemployee.gender + " into " + employee.gender + "<br>";
    }

    if(employee.dob !== oldemployee.dob){
      updates = updates + "Date Of Birth is changed" + oldemployee.dob + " into " + employee.dob + "<br>";
    }

    if(employee.email !== oldemployee.email){
      updates = updates + "Email is changed" + oldemployee.email + " into " + employee.email + "<br>";
    }

    if(employee.mobile !== oldemployee.mobile){
      updates = updates + "Mobile Num is Change " + oldemployee.mobile + " into "+ employee.mobile+  "<br>";
    }

    if(employee.landno !== oldemployee.landno){
      updates = updates + "Land Num is Change " + oldemployee.landno + " into "+ employee.landno+  "<br>";
    }

    if(employee.address !== oldemployee.address){
      updates = updates + "Address is Change " + oldemployee.address + " into "+ employee.address+ "<br>";
    }

    if(employee.note !== oldemployee.note){
      updates = updates + "Note is Change " + oldemployee.note + " into "+ employee.note+  "<br>";
    }

    if(employee.employeestatus_id.name !== oldemployee.employeestatus_id.name){
      updates = updates + "Status is Change " + oldemployee.employeestatus_id.name+ " into "+ employee.employeestatus_id.name+ "<br>";
    }

    if(employee.designation_id.name !== oldemployee.designation_id.name){
      updates = updates + "Designation is Change " + oldemployee.designation_id.name  + " into "+ employee.designation_id.name +  "<br>";
    }

    if(employee.civilstatus !== oldemployee.civilstatus){
      updates = updates + "Civill Status is Change " + oldemployee.civilstatus + " into "+ employee.civilstatus+  "<br>";
    }


    return updates;
  }

  //Define function for employee update
  const buttonEmployeeUpdate = () => {
    formEmployee.classList.add('needs-validation');
    console.log("update Button");
    console.log(employee);
    //Check form Error
    let errors = checkFormEroor();

    if (errors === "") {
      //Check form update
      let updates = checkUpdates();
      console.log(updates);
      formEmployee.classList.remove('was-validated')
      $('#modalEmployeeAdd').modal("hide");
      if (updates !== "") {
        // let userConfirm = confirm("Are you sure to following updates..? \n" + updates);
        swal.fire({
          title: "Do you want to Update employee",
          html:updates,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#cb421a",
          cancelButtonColor: "#3f3f44",
          confirmButtonText: "Yes, Update"
        }).then((result) =>{
          if(result.isConfirmed){
            let updateServiceResponse = ajaxRequestBody("/employee", "PUT", employee);

            if (updateServiceResponse.status === 200) {
              // alert("Update successfully ...! \n");
              Swal.fire({
                title: "Update successfully ..! ",
                text: "",
                icon: "success"
              });
              //Need to refresh
              formEmployee.reset();
              refreshEmployeeTable();
              refreshEmployeeForm();
              // Remove 'is-valid' and 'is-invalid' classes from all input fields
              document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
                input.classList.remove('is-valid', 'is-invalid');
              });
              formEmployee.classList.remove('was-validated');
              //Need hide modal
              $('#modalEmployeeAdd').modal("hide");
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
        $('#modalEmployeeAdd').modal("hide");
        Swal.fire({
          title: "No updates Found..!",
          text: '',
          icon: "question"
        });
      }

    } else {
      $('#modalEmployeeAdd').modal("hide");
      Swal.fire({
        title: "Form has following errors!",
        text: errors,
        icon: "error"
      });
    }
  }


//Set min value
//home work
//min = current date// new Date();
//max = current date + 14 days
//dateDOB.min = '2023-02-04'
//dateDOB.max = '2023-02-04'


// create funtion for delete employee
const deleteEmployee = (ob, rowIndex) => {
  console.log("delete");
  // console.log(tableEmployee.children[1].children[rowIndex])
//  tableEmployee.children[1].children[rowIndex].style.backgroundColor = "pink";

  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to delete employee " +
        "" + (ob.gender === "Male" ? "Mr. " : "Mrs. ") + ob.fullname + "?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#E11D48",
    cancelButtonColor: "#3f3f44",
    confirmButtonText: "Yes, Delete"
  }).then((result) => {
    // if(result.isConfirmed){
    //   swal.fire({
    //     title:"Deleted!",
    //     text:"Employee has been deleted.",
    //     icon:"success"
    //   });
    // }
    //Delete Service
    let deleteServiceRequestResponse = ajaxRequestBody("/employee", "DELETE", ob)


    //Check Backend Service
    if (deleteServiceRequestResponse.status === 200) {
      swal.fire({
        title: "Deleted!",
        text: "Employee has been deleted.",
        icon: "success"
      });
      formEmployee.reset();
      refreshEmployeeTable();
      refreshEmployeeForm();

    } else {
      swal.fire({
        title: "Delete Not Successfully",
        text: deleteServiceRequestResponse.responseText,
        icon: "error"
      });
    }
  })
}

// create function for print employee
const printEmployee = (ob, rowIndex) => {
  console.log("print");
};

//Create function for check form errors
const checkFormEroor = () => {
  let errors = '';

  if (employee.fullname == null) {
    errors = errors + "Full name can't be null \n";
    textFullName.classList.add('is-invalid')
  }

  if (employee.callingname == null) {
    errors = errors + "Calling name can't be null \n";
    txtCallingName.classList.add('is-invalid')
  }

  console.log(employee.employeestatus_id);

  if (employee.employeestatus_id == null) {
    errors = errors + "Please select employee status \n";
    textFullName.classList.add('is-invalid')
  }

  if (employee.nic == null) {
    errors = errors + "Please Enter Valid NIC \n";
    txtNic.classList.add('is-invalid')
  }

  if (employee.email == null) {
    errors = errors + "Email Enter Valid Email Address \n";
    textEmail.classList.add('is-invalid')
  }

  if (employee.mobile == null) {
    errors = errors + "Please Enter Valid Mobile Number \n";
    textMobile.classList.add('is-invalid');
  }

  if (employee.gender == null) {
    errors = errors + "Please Select Gender \n";
    textFullName.classList.add('is-invalid')
  }
  if (employee.dob == null) {
    errors = errors + "Please Select Employee DOB \n";
    dateOfBirth.classList.add('is-invalid')
  }


  if (employee.address == null) {
    errors = errors + "Please Enter Valid address \n";
    textAddress.classList.add('is-invalid')
  }

  if (employee.employeestatus_id == null) {
    errors = errors + "Please Select Employee Status \n";
    selectStatus.classList.add('is-invalid')
  }

  if (employee.address == null) {
    errors = errors + "Please Enter Valid Address \n";
    textAddress.classList.add('is-invalid')
  }

  if (employee.civilstatus == null) {
    errors = errors + "Please Select Civill Status \n";
    selectCivilStatus.classList.add('is-invalid')
  }

  if (employee.designation_id == null) {
    errors = errors + "Please Select Designation \n";
    selectDesignation.classList.add('is-invalid')
  }


  return errors;
}

//Create function for submit employee form
const employeeSubmit = () => {
  console.log("button Submit");
  console.log(employee);

  //1 Check form eroors
  const errors = checkFormEroor();

  if (errors == "") {

    //2 Need to get user confirm
    // let userConfirm = window.confirm("Are you sure to add following Employee.? \n" + "FUllname : " + employee.fullname + "\n Nic : " + employee.nic + '\n Gender :' + employee.gender+ "\n Email : " + employee.email);

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to Add employee " +
          "" + (employee.gender === "Male" ? "Mr. " : "Mrs. ") + employee.fullname + "?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E11D48",
      cancelButtonColor: "#3f3f44",
      confirmButtonText: "Yes, Add"
    }).then((result) => {
        let postServiceRequestResponse = ajaxRequestBody("/employee", "POST", employee)
        //Check Backend Service
        if (/^EMP-\d{4}$/.test(postServiceRequestResponse)) {

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
    })
  } else {
    //  Swal.fire({
    //    title: " Add Employee Not Successfully ...!",
    //    text: errors,
    //    icon: "error"
    //  });
    // }

  };
}


const refreshEmployeeForm = () =>{

  //Create empty object
  employee = new Object();


  designations = [];
  designations = ajaxGetRequest("/designation/findall");

  employeeStatus = [];
  employeeStatus = ajaxGetRequest("/employeestatus/findall")

  //need to empty all element
  // textNIC.value = "";
  // dateDOB.value="";

  //Set min Value
  //Home work
  //Current date
  //Min= current Date
  //Max= current Date + 14 days
  // dob.min = '2023-09-02';
  // dob.max = '2023-09-12';


  let currentDate = new Date();
  console.log('Date', currentDate);
  console.log('Year', currentDate.getFullYear());
  console.log('Month', currentDate.getMonth()); //Month array [0-11]
  console.log('Day', currentDate.getDate()); //Range 0-31

  let minDate = new Date();
  let maxDate = new Date();

  let minMonth = minDate.getMonth();

  if(minMonth<10){
    minMonth = '0' + minMonth;
  }

  let minDay = minDate.getDate();
  if(minDay<10){
    minDay = '0' + minDay;
  }

  minDate.setFullYear(minDate.getFullYear() -60);
  dateOfBirth.min = minDate.getFullYear() + '-' + minMonth+ '-'+ minDay;


  let maxMonth = maxDate.getMonth();

  if(maxMonth<10){
    maxMonth = '0' + maxMonth;
  }

  let maxDay = maxDate.getDate();
  if(maxDay<10){
    maxDay = '0' + maxDay;
  }
  maxDate.setFullYear(maxDate.getFullYear() -18);
  dateOfBirth.max = maxDate.getFullYear() + '-' + maxMonth+ '-'+ maxDay;





  //need to set default color

  console.log(employee)
  designations = [];
  designations = ajaxGetRequest("/designation/findall");

  employeeStatus = [];
  employeeStatus = ajaxGetRequest("/employeestatus/findall")

  const selectDesignation = document.getElementById("selectDesignation");
  fillDataIntoSelect(
      selectDesignation,
      "Select Designation",
      designations,
      "name",
);


  const selectStatus = document.getElementById("selectStatus");
  fillDataIntoSelect(
      selectStatus,
      "Select Status",
      employeeStatus,
      "name",
  );



}


