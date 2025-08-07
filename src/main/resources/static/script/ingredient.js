let currentIngredient = {};
let tableIngredientInstance;
let privilegeOb


window.addEventListener("load", () => {

    //Get Privilege
    privilegeOb = ajaxGetRequest("/privilege/byloggedusermodule/INGREDIENT");

    //Call form refresh function
     reloadIngredientsForm();

     //Call formValidation
     formValidation();

     //Call Ingredient Refresh function
      ingredientTableRefresh();

    // Call this function on modal open or page load for quotation request form
    quotationRequestFormValidation();

   
    if (!privilegeOb.insert) {
        $("#addIngredientBtn").prop("disabled", true).attr("title", "You do not have permission to add new ingredients.");
    }



});

  //Define function for Ingredient form refresh
const reloadIngredientsForm = () =>{

 ingredient = new Object();
 oldIngredient = null;

 unitType.disabled = false;
 quantity.disabled = false;

 

 //Get all products
  let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");

  document.getElementById('btnIngredientUpdate').disabled = true;
  document.getElementById('btnIngredientSubmit').disabled = false;

}



//Define function for Ingredient Table Refresh
const ingredientTableRefresh = () =>{

//Get all Ingredients
const ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");

    const getQuantity = (ob) => ob.quantity + " " + ob.unitType;
    const getROP = (ob) => ob.rop + " " + ob.unitType;
    const getROQ = (ob) => ob.roq + " " + ob.unitType;
    const getStatus = (ob) => {
        if (ob.ingredientStatus === "InStock") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">In stock </p>';
        }
        if (ob.ingredientStatus === "LowStock") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Low stock</p>';
        }
        if (ob.ingredientStatus === "OutOfStock") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">Out of stock</p>';
        }
    };

    const displayProperty = [
        {dataType: "text", propertyName: "ingredientCode"},
        {dataType: "text", propertyName: "ingredientName"},
        {dataType: "function", propertyName: getQuantity},
        {dataType: "function", propertyName: getStatus},
        {dataType: "function", propertyName: getROP},
        {dataType: "function", propertyName: getROQ},
        {dataType: "price", propertyName: "avgCost"},
    ];


    // Destroy the existing DataTable instance if it exists
    if (tableIngredientInstance) {
        tableIngredientInstance.destroy();
    }

    // Clear the table content
    $('#tableIngredient tbody').empty();

    //Define function for generate drop down
    const generateIngredientDropDown = (element, index, privilegeOb) => {
        const dropdownMenu = document.createElement("ul");
        console.log(privilegeOb);
        dropdownMenu.className = "dropdown-menu";

        const buttonList = [
            {
                name: "Edit",
                action: ingredientFormRefill,
                icon: "fa-solid fa-edit me-2",
                enabled: privilegeOb ? !!privilegeOb.update : true,
            },
            {
                name: "Delete",
                action: deleteIngredient,
                icon: "fa-solid fa-trash me-2",
                enabled: privilegeOb ? !!privilegeOb.delete : true,
            },
            {
                name: "Send Quotation Request",
                action: quoRequestFormRefill,
                icon: "fa-solid fa-file-lines me-2",
                enabled: privilegeOb ? !!privilegeOb.select : true,
            }
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

    //Call function for fill date to table
    tableDataBinder(
        tableIngredient,
        ingredientList,
        displayProperty,
        true,
        generateIngredientDropDown,
        privilegeOb
    );

    // Initialize DataTable and store the instance
    tableIngredientInstance = $('#tableIngredient').DataTable();

}



// Reset validation states for quotation request form
function resetQuotationRequestValidation() {
    const form = document.getElementById('quotationRequestForm');
    if (!form) return;
    Array.from(form.elements).forEach(field => {
        if (field.classList) {
            field.classList.remove('is-valid', 'is-invalid');
        }
    });
}

// Modular validation for Quotation Request form (quotationRequest.html)
const quotationRequestFormValidation = () => {
    // Get all relevant fields
    const quoIngredientName = document.getElementById('quoIngredientName');
    const quoQuantity = document.getElementById('quoQuantity');
    const quoUnitType = document.getElementById('quoUnitType');
    const requiredDeliveryDate = document.getElementById('requiredDeliveryDate');
    const quoDeadline = document.getElementById('QuoDeadline');


   
    // Ingredient Name validation (letters, min 2)
    quoIngredientName.addEventListener('input', () => {
        validation(quoIngredientName, '^[A-Za-z]{2,25}( [A-Za-z]{2,25})?$', 'quoRequest', 'ingredientName');
    });
    // Quantity validation (positive number)
    quoQuantity.addEventListener('input', () => {
        validation(quoQuantity, '^([1-9][0-9]{0,3})$', 'quoRequest', 'quantity');
    });
    // Unit Type validation (select)
    quoUnitType.addEventListener('change', () => {
        selectFieldValidator(quoUnitType, '', 'quoRequest', 'unitType');
    });

    QuoDeadline.addEventListener('change', () => {
            dateFeildValidator(QuoDeadline, '', 'quoRequest', 'deadline');
     });


    requiredDeliveryDate.addEventListener('change', () => {
        dateFeildValidator(requiredDeliveryDate, '', 'quoRequest', 'requiredDeliveryDate');


        let requiredDeliveryDateValue = requiredDeliveryDate.value;

        console.log(requiredDeliveryDateValue)

        let requiredDeliveryDateValueDate = new Date(requiredDeliveryDateValue);

        requiredDeliveryDateValueDate.setDate(requiredDeliveryDateValueDate.getDate() -1);

        let maxDeadline = requiredDeliveryDateValueDate.toISOString().split('T')[0];

        quoDeadline.setAttribute('max', maxDeadline);

    });
    
    quoDeadline.addEventListener('change', () => {
        dateFeildValidator(quoDeadline, '', 'quoRequest', 'deadline');
    })

   
    }


// Existing ingredient form validation
const formValidation = () =>{

// console.log(ingredientCode)
// ingredientCode.addEventListener('input', () => {
//         validation(ingredientCode, '', 'ingredient', 'ingredientCode');
// });

quantity.addEventListener('input', () => {
            validation(quantity, '^([1-9][0-9]{0,3})$', 'ingredient', 'quantity');
});

ingredientName.addEventListener('input', () => {
validation(ingredientName, '^[A-Z][a-z]{1,25}( [A-Z][a-z]{1,25}){0,8}?$', 'ingredient', 'ingredientName');
 });

unitType.addEventListener('change', () => {
selectFieldValidator(unitType,'','ingredient','unitType')
})

rop.addEventListener('input', () =>{
        validation(rop,'^([1-9][0-9]{0,3})$','ingredient','rop')
    })

roq.addEventListener('input', () =>{
        validation(roq,'^([1-9][0-9]{0,3})$','ingredient','roq')
    })


note.addEventListener('input', () =>{
             validation(note,'','ingredient','note')
     })
     


}


//Check Ingredient form errors
const checkIngredientFormError = () => {
    let errors = '';

    // Ingredient Name validation
    if (!ingredientName.value || ingredientName.value.trim() === '') {
        errors += 'Ingredient name is required.\n';
        ingredientName.classList.add('is-invalid');
    } else {
        ingredientName.classList.remove('is-invalid');
        ingredientName.classList.add('is-valid');
    }

    // Quantity validation
    if (!quantity.value || isNaN(quantity.value) || Number(quantity.value) <= 0) {
        errors += 'Quantity must be a positive number.\n';
        quantity.classList.add('is-invalid');
    } else {
        quantity.classList.remove('is-invalid');
        quantity.classList.add('is-valid');
    }

    // Unit Type validation
    if (!unitType.value) {
        errors += 'Unit type is required.\n';
        unitType.classList.add('is-invalid');
    } else {
        unitType.classList.remove('is-invalid');
        unitType.classList.add('is-valid');
    }

    // ROP validation
    if (!rop.value || isNaN(rop.value) || Number(rop.value) <= 0) {
        errors += 'ROP (Reorder Point) must be a positive number.\n';
        rop.classList.add('is-invalid');
    } else {
        rop.classList.remove('is-invalid');
        rop.classList.add('is-valid');
    }

    // ROQ validation
    if (!roq.value || isNaN(roq.value) || Number(roq.value) <= 0) {
        errors += 'ROQ (Reorder Quantity) must be a positive number.\n';
        roq.classList.add('is-invalid');
    } else {
        roq.classList.remove('is-invalid');
        roq.classList.add('is-valid');
    }


    return errors;
}

//Define function for add Ingredient
 const ingredientSubmit = () => {
            event.preventDefault();
            console.log(ingredient);

            // 1. Check form errors
            const errors = checkIngredientFormError();

            if (errors === "") {
                Swal.fire({
                    title: "Are you sure?",
                    text: "Do you want to add the Ingredient " + ingredient.ingredientName  + "?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#E11D48",
                    cancelButtonColor: "#3f3f44",
                    confirmButtonText: "Yes, Add"
                }).then((result) => {
                    if (result.isConfirmed) {
                        const postServiceRequestResponse = ajaxRequestBody("/ingredient", "POST", ingredient);

                        // Check backend response
                        if (postServiceRequestResponse.status === 200) {
                            $("#modelIngredientAdd").modal('hide');
                            ingredientAddForm.reset();
                            ingredientTableRefresh();
                            reloadIngredientsForm();

                            // Reset validation classes
                            Array.from(ingredientAddForm.elements).forEach((field) => {
                                field.classList.remove('is-valid', 'is-invalid');
                            });

                            Swal.fire({
                                title: "Ingredient Added Successfully!",
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
                    title: "Ingredient Not Added",
                    text: errors,
                    icon: "error"
                });
            }
};

//Define function for Product update
  const ingredientUpdate = () => {
    event.preventDefault();
    ingredientAddForm.classList.add('needs-validation');

    //Check form Error
    let errors = checkIngredientFormError();

    if (errors === "") {
      //Check form update
      let updates = checkUpdates();
      console.log(updates);
      ingredientAddForm.classList.remove('was-validated')
      $('#modelIngredientAdd').modal("hide");
      if (updates !== "") {
        swal.fire({
          title: "Do you want to Update " + ingredient.ingredientName  + "?",
          html:updates,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#cb421a",
          cancelButtonColor: "#3f3f44",
          confirmButtonText: "Yes, Update"
        }).then((result) =>{
          if(result.isConfirmed){
            let updateServiceResponse = ajaxRequestBody("/ingredient", "PUT", ingredient);

            if (updateServiceResponse.status === 200) {
              // alert("Update successfully ...! \n");
              Swal.fire({
                title: "Update successfully ..! ",
                text: "",
                icon: "success"
              });
              //Need to refresh
              ingredientAddForm.reset();
              ingredientTableRefresh();
              reloadIngredientsForm();
              // Remove 'is-valid' and 'is-invalid' classes from all input fields
              document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
                input.classList.remove('is-valid', 'is-invalid');
              });
              productAddForm.classList.remove('was-validated');
              //Need hide modal
              $('#modelIngredientAdd').modal("hide");
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
        $('#modelIngredientAdd').modal("hide");
        Swal.fire({
          title: "No updates Found..!",
          text: '',
          icon: "question"
        });
      }

    } else {
      $('#modelIngredientAdd').modal("hide");
      Swal.fire({
        title: "Form has following errors!",
        text: errors,
        icon: "error"
      });
    }
  }

  //Define method for check updates
    const checkUpdates = () =>{
      let updates = "";

      if(ingredient.ingredientCode !== oldIngredient.ingredientCode){
        updates = updates + "Ingredient Code is changed " + oldIngredient.ingredientCode + " into " + ingredient.ingredientCode +"<br>";
      }

      if(ingredient.ingredientName !== oldIngredient.ingredientName){
        updates = updates + "Ingredient name is changed " + oldIngredient.ingredientName + " into " + ingredient.ingredientName + "<br>";
      }

      if(ingredient.quantity !== oldIngredient.quantity){
        updates = updates + "Quantity is changed " + oldIngredient.quantity + " into " + ingredient.quantity + "<br>";
      }

      if(ingredient.unitType !== oldIngredient.unitType){
        updates = updates + "Unit Type is changed " + oldIngredient.unitType + " into " + ingredient.unitType  + "<br>";
      }

      if(ingredient.rop  !== oldIngredient.rop){
        updates = updates + "ROP is changed " + oldIngredient.rop + " into " + ingredient.rop + "<br>";
      }

      if(ingredient.roq !== oldIngredient.roq){
        updates = updates + "ROQ is Changed " + oldIngredient.roq + " into "+ ingredient.roq +  "<br>";
      }

      if(ingredient.note !== oldIngredient.note){
        updates = updates + "Note is Changed " + oldIngredient.note + " into "+ ingredient.note+  "<br>";
      }

      return updates;
    }

//Refill Ingredient form fields
const ingredientFormRefill = (ob, rowIndex) => {
    // Set modal title to 'Edit Ingredient'
    const modalTitle = document.getElementById('ingredientModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Ingredient';
    }

    document.getElementById('btnIngredientUpdate').disabled = false;
    document.getElementById('btnIngredientSubmit').disabled = true;

    console.log(ob)
    console.log(rowIndex)
    $("#modelIngredientAdd").modal('show');
    ingredient = JSON.parse(JSON.stringify(ob));
    oldIngredient = JSON.parse(JSON.stringify(ob));

    ingredientName.value = ingredient.ingredientName;
    quantity.value = ingredient.quantity;
    rop.value = ingredient.rop;
    roq.value = ingredient.roq;
    unitType.disabled = true;
    quantity.disabled =true;

    


    if(ingredient.note !=null){
        note.value = ingredient.note;
    } else {
        note.value = '';
    }

    document.getElementById('btnIngredientUpdate').disabled = false;
    document.getElementById('btnIngredientSubmit').disabled = true;
};



const deleteIngredient = (ingredient) => {
    swal.fire({
        title: "Delete Ingredient",
        text: "Are you sure, you want to delete" + ingredient.ingredientName  + "?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/ingredient/deleteIngredient/${ingredient.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                //Call form refresh function
                 reloadIngredientsForm();
                 //Call Ingredient Refresh function
                 ingredientTableRefresh();
                 ingredientAddForm.reset();

                $("#modelIngredientEdit").modal('hide');
                getAllIngredients();
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

//Define Quotation request form errors
const checkQRFormError = () =>{

    let errors = '';

    if(quoRequest.quantity == null){
       errors = errors + "Quantity can't be null \n";
       quoQuantity.classList.add('is-invalid');
    }

    if (quoRequest.requiredDeliveryDate == null) {
         errors = errors + "Required Date can't be null \n";
         requiredDeliveryDate.classList.add('is-invalid');
    }

    if (quoRequest.deadline == null) {
        errors = errors + "Deadline can't be null \n";
        quoDeadline.classList.add('is-invalid');
   }

    return errors;

}

const sendQuotationRequest=()=>{
    event.preventDefault();
    console.log(quoRequest);

//    Check form errors
    const errors = checkQRFormError();
    if (errors === "") {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to Send the Quotation Req "+ "?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#E11D48",
                cancelButtonColor: "#3f3f44",
                confirmButtonText: "Yes, Add"
            }).then((result) => {
                if (result.isConfirmed) {
                    const postServiceRequestResponse = ajaxRequestBody("/quotation-request/send-new/" + quoRequestIng.id, "POST",quoRequest);
                    // Check backend response
                    console.log(postServiceRequestResponse)
                    if (postServiceRequestResponse.status === 200) {
                        $("#modelQuotationRequest").modal('hide');
;
                        Swal.fire({
                                title: "Quotation send Successfully!",
                                icon: "success"
                                    });

                        // Reset validation classes
                        Array.from(quotationRequestForm.elements).forEach((field) => {
                            field.classList.remove('is-valid', 'is-invalid');
                        });
                        // sendQuotationRequestEmail(
                        //     quoRequest.ingredientCode,
                        //     quoRequest.ingredientName,
                        //     quoRequest.unitType,
                        //     quoRequest.deadline,
                        //     quoRequest.requiredDate
                        // );

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
                title: "Quotation Req does not sent",
                text: errors,
                icon: "error"
            });
        }

}

//Refill Ingredient form fields
const quoRequestFormRefill = (ob, rowIndex) => {
    const quoDeadline = document.getElementById('QuoDeadline');

  $("#modelQuotationRequest").modal('show');
  quoRequestIng = JSON.parse(JSON.stringify(ob));
  oldQuoRequestIng = JSON.parse(JSON.stringify(ob));
  quoQuantity.value = "";
  quoQuantity.classList.remove('is-invalid');
  quoQuantity.classList.remove('is-valid');
  quoDeadline.value = "";
  quoDeadline.classList.remove('is-invalid');
  quoDeadline.classList.remove('is-valid');
  requiredDeliveryDate.value = "";
  requiredDeliveryDate.classList.remove('is-invalid');
  requiredDeliveryDate.classList.remove('is-valid');


  quoRequest = new Object();
  oldQuoRequest = null;



  quoRequest.ingredientCode = quoIngredientCode.value = quoRequestIng.ingredientCode;
  quoIngredientCode.disabled = true;
  quoRequest.ingredientName = quoIngredientName.value = quoRequestIng.ingredientName;
  quoIngredientName.disabled = true;
  quoRequest.unitType = quoUnitType.value = quoRequestIng.unitType;
  quoUnitType.disabled = true;

  const todayStr = new Date().toISOString().split('T')[0];
  document.getElementById('requiredDeliveryDate').setAttribute('min', todayStr);
  document.getElementById('QuoDeadline').setAttribute('min', todayStr);


};

////Define function to refresh the form
//const refreshQuotationReqForm = () =>{
//
//    quotationReq = new Object();
//    oldQuotationReq = null;
//
//
//}


function openAddIngredientForm() {
    // Reset the form fields
    document.getElementById('ingredientAddForm').reset();

    // Clear validation classes
    Array.from(document.getElementById('ingredientAddForm').elements).forEach((field) => {
        field.classList.remove('is-valid', 'is-invalid');
    });

    // Set modal title to 'Add New Ingredient'
    const modalTitle = document.getElementById('ingredientModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Ingredient';
    }

    // Set button states: enable Add, disable Update
    document.getElementById('btnIngredientUpdate').disabled = true;
    document.getElementById('btnIngredientSubmit').disabled = false;

    unitType.disabled = false;
    quantity.disabled = false;


    // Optionally, reset your JS ingredient object
    ingredient = {};
    oldIngredient = null;

    // Show the modal
    $('#modelIngredientAdd').modal('show');
}


const  sendQuotationRequestEmail = (ingredientCode, ingredientName, unit, deadline, deliveryDate) => {
    const qReq = {
        ingredientCode,
        ingredientName,
        unit,
        deadline,
        deliveryDate
    };
  

    const postEmailServiceRequestResponse = ajaxRequestBody("/quotation-request/sendToAllSuppliers","POST",qReq);
    // Check backend response
    console.log(postEmailServiceRequestResponse)
    if (postEmailServiceRequestResponse.status === 200) {
;
        Swal.fire({
                title: "Emails Sent Successfully!",
                icon: "success"
                    });
    } else {
        console.error(postEmailServiceRequestResponse);
        Swal.fire({
            title: "Error",
            text: postEmailServiceRequestResponse.responseText,
            icon: "error"
        });
    }
}