let currentIngredient = {};
let tableIngredientInstance;

window.addEventListener("load", () => {

    //Call form refresh function
     reloadIngredientsForm();

     //Call formValidation
     formValidation();

     //Call Ingredient Refresh function
      ingredientTableRefresh();

});

    //Define function for Ingredient form refresh
const reloadIngredientsForm = () =>{

 ingredient = new Object();
 oldIngredient = null;

 //Get all products
  let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");

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

    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/INGREDIENT");

    // Destroy the existing DataTable instance if it exists
    if (tableIngredientInstance) {
        tableIngredientInstance.destroy();
    }

    // Clear the table content
    $('#tableIngredient tbody').empty();

    //Define function for generate drop down
    const generateDropDown = (element,index) => {
        const dropdownMenu = document.createElement("ul");
        dropdownMenu.className = "dropdown-menu";

        const buttonList = [
            {name: "Edit", action: productFormRefill, icon: "fa-solid fa-edit me-2"},
            {name: "Delete", action: deleteIngredient, icon: "fa-solid fa-trash me-2"},
        ];
        if (element.ingredientStatus !== "InStock") {
            buttonList.push({name: "Send Quotation Request", action: sendQuotationRequest, icon: "fa-solid fa-file-lines me-2"});
        }
        buttonList.forEach((button) => {
            const buttonElement = document.createElement("button");
            buttonElement.className = "dropdown-item btn";
            buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
            buttonElement.onclick =  () => {
                button.action(element,index);
            };
            const liElement = document.createElement("li");
            liElement.appendChild(buttonElement);
            dropdownMenu.appendChild(liElement);
        });
        return dropdownMenu;
    };

    //Call function for fill date to table
    tableDataBinder(
        tableIngredient,
        ingredientList,
        displayProperty,
        true,
        generateDropDown,
        getPrivilege
    );

    // Initialize DataTable and store the instance
    tableIngredientInstance = $('#tableIngredient').DataTable();

}



//Define function for validation and object binding
const formValidation = () =>{

ingredientCode.addEventListener('keyup', () => {
        validation(ingredientCode, '', 'ingredient', 'ingredientCode');
});

quantity.addEventListener('keyup', () => {
            validation(quantity, '^(?:[1-9][0-9]?|1[0-9]{2}|200)$', 'ingredient', 'quantity');
});

ingredientName.addEventListener('keyup', () => {
                    validation(ingredientName, '', 'ingredient', 'ingredientName');
        });

unitType.addEventListener('change', () => {
selectFieldValidator(unitType,'','ingredient','unitType')
})

rop.addEventListener('keyup', () =>{
        validation(rop,'^[1-9][0-9]?$','ingredient','rop')
    })

roq.addEventListener('keyup', () =>{
        validation(roq,'^(?:[1-9][0-9]?|1[0-9]{2}|200)$','ingredient','roq')
    })


note.addEventListener('keyup', () =>{
             validation(note,'','ingredient','note')
     })


}



//document.getElementById('ingredientAddForm').onsubmit = function (event) {
//    event.preventDefault();
//
//    const ingredient = {
//        ingredientCode: document.getElementById('ingredientCode').value,
//        ingredientName: document.getElementById('ingredientName').value,
//        note: document.getElementById('note').value,
//        quantity: parseInt(document.getElementById('quantity').value, 10),
//        unitType: document.getElementById('unitType').value,
//        rop: parseInt(document.getElementById('rop').value, 10),
//        roq: parseInt(document.getElementById('roq').value, 10),
//    };
//
//    let response = ajaxRequestBody("/ingredient/addNewIngredient", "POST", ingredient);
//    if (response.status === 200) {
//        swal.fire({
//            title: response.responseText,
//            icon: "success"
//        });
//        $("#modelIngredientAdd").modal('hide');
//        getAllIngredients();
//    } else {
//        swal.fire({
//            title: "Something Went Wrong",
//            text: response.responseText,
//            icon: "error"
//        });
//    }
//};

//Check Ingredient form errors
const checkIngredientFormError = () => {
    let errors = '';

    if (ingredient.ingredientCode == null) {
        errors = errors + "ingredientCode can't be null \n";
        ingredientCode.classList.add('is-invalid')
    }

    if (ingredient.ingredientName == null) {
        errors = errors + "Ingredient name name can't be null \n";
        ingredientName.classList.add('is-invalid')
    }

    if (ingredient.quantity == null) {
        errors = errors + "Quantity can't be null \n";
        quantity.classList.add('is-invalid')
    }

    if (ingredient.unitType == null) {
        errors = errors + "Unit Type can't be null \n";
        quantity.classList.add('is-invalid')
    }


    if (ingredient.rop == null) {
        errors = errors + "ROP can't be null \n";
        rop.classList.add('is-invalid');
    }

    if (ingredient.roq == null) {
            errors = errors + "ROQ can't be null  \n";
            roq.classList.add('is-invalid');
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
                            $("#ingredientAddForm").modal('hide');
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

//Refill Product form fields
const productFormRefill = (ob, rowIndex) => {

    console.log(ob)
    console.log(rowIndex)
  $("#modelIngredientAdd").modal('show');
  ingredient = JSON.parse(JSON.stringify(ob));
  oldIngredient = JSON.parse(JSON.stringify(ob));


  ingredientCode.value = ingredient.ingredientCode ;
  ingredientName.value = ingredient.ingredientName;
  quantity.value = ingredient.quantity;
  rop.value = ingredient.rop;
  roq.value = ingredient.roq;
  unitType.value = ingredient.unitType;

  if(product.note !=null){
        note.value = ingredient.note;
      }else {
        note.value = '';
    }


};

const editIngredient = (ingredient) => {
    $("#modelIngredientEdit").modal('show');
    currentIngredient = ingredient;
    document.getElementById('edit-ingredientCode').value = ingredient.ingredientCode;
    document.getElementById('edit-ingredientName').value = ingredient.ingredientName;
    document.getElementById('edit-note').value = ingredient.note;
    document.getElementById('edit-quantity').value = ingredient.quantity;
    document.getElementById('edit-unitType').value = ingredient.unitType;
    document.getElementById('edit-rop').value = ingredient.rop;
    document.getElementById('edit-roq').value = ingredient.roq;
};

document.getElementById('ingredientEditForm').onsubmit = function (event) {
    event.preventDefault();

    currentIngredient.ingredientCode = document.getElementById('edit-ingredientCode').value;
    currentIngredient.ingredientName = document.getElementById('edit-ingredientName').value;
    currentIngredient.note = document.getElementById('edit-note').value;
    currentIngredient.quantity = parseInt(document.getElementById('edit-quantity').value, 10);
    currentIngredient.unitType = document.getElementById('edit-unitType').value;
    currentIngredient.rop = parseInt(document.getElementById('edit-rop').value, 10);
    currentIngredient.roq = parseInt(document.getElementById('edit-roq').value, 10);

    let response = ajaxRequestBody("/ingredient/updateIngredient", "PUT", currentIngredient);
    if (response.status === 200) {
        swal.fire({
            title: response.responseText,
            icon: "success"
        });
        $("#modelIngredientEdit").modal('hide');
        getAllIngredients();
    } else {
        swal.fire({
            title: "Something Went Wrong",
            text: response.responseText,
            icon: "error"
        });
    }
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

const sendQuotationRequest=(ingredient)=>{
    swal.fire({
        title: "Send Quotation Request",
        text: `Sending Quotation Requests for ${ingredient.ingredientName} (${ingredient.ingredientCode})`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Send"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxRequestBody(`/quotation-request/send-new/${ingredient.id}`, "POST", {})
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
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
}