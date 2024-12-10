let productionItemTableInstance;
let selectedPI;
let totalCost;
const flavours = ajaxGetRequest("/flavour/getAllFlavours");
const packageTypes = ajaxGetRequest("/packageType/getAllPackageTypes")
const recipes = ajaxGetRequest("/recipe/getAllRecipes").filter((r) => r.status === "Active");

window.addEventListener('load', () => {

    //Call function to Reload the production table
    reloadPITable();

    //Call function to refresh the add production item form
    refreshProductionItemForm();

    //Call function to refresh the add new batch form

    //Call function to refresh the recipe form

    //Call Recipe form validation
    productionItemValidation();

//    const flavourSelectElement = document.getElementById("add_pi_flavourId");
//    const ptSelectElement = document.getElementById("add_pi_ptId");
//    const recipeSelectElement = document.getElementById("add_pi_recipeId");
//
//    flavours.forEach(flavour => {
//        const option = document.createElement('option');
//        option.value = flavour.id;
//        option.textContent = flavour.name;
//        flavourSelectElement.appendChild(option);
//    });
//
//    packageTypes.forEach(pt => {
//        const option = document.createElement('option');
//        option.value = pt.id;
//        option.textContent = pt.name;
//        ptSelectElement.appendChild(option);
//    });
//
//    recipes.forEach(rec => {
//        const option = document.createElement('option');
//        option.value = rec.recipeCode;
//        option.textContent = rec.recipeCode;
//        recipeSelectElement.appendChild(option);
//    });

//    document.getElementById("piAddForm").onsubmit = function (event) {
//        event.preventDefault();
//
//        const productionItem = {
//            productionItemName: document.getElementById("add-pi-name").value,
//            flavourId: document.getElementById("add_pi_flavourId").value,
//            packageTypeId: document.getElementById("add_pi_ptId").value,
//            recipeCode: document.getElementById("add_pi_recipeId").value,
//            status: document.getElementById("add-pi-status").value,
//        }
//
//        let response = ajaxRequestBody("/productionItem/addNewPI", "POST", productionItem);
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            reloadPITable();
//            $("#modalAddPI").modal("hide");
//
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//    }
//    document.getElementById('piEditForm').onsubmit = function (event) {
//        event.preventDefault();
//
//        selectedPI.productionItemName = document.getElementById('edit-pi-name').value;
//        selectedPI.flavourId = document.getElementById('edit_pi_flavourId').value;
//        selectedPI.packageTypeId = document.getElementById('edit_pi_ptId').value;
//        selectedPI.recipeCode = document.getElementById('edit_pi_recipeId').value;
//        selectedPI.status = document.getElementById('edit-pi-status').value;
//
//        let response = ajaxRequestBody("/productionItem/updatePI", "PUT", selectedPI);
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            reloadPITable();
//            $("#modalEditPI").modal("hide");
//
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//
//    }
    document.getElementById('makeNewBatchForm').onsubmit = function (event) {
        event.preventDefault()

        const batch = {
            productionItemNo: selectedPI.productionItemNo,
            totalQuantity: parseFloat(document.getElementById("add-batchSize").value),
            availableQuantity: parseFloat(document.getElementById("add-batchSize").value),
            manufactureDate: new Date(document.getElementById("add-bt-mnf").value),
            expireDate: new Date(document.getElementById("add-bt-exp").value),
            totalCost: totalCost,
            batchStatus: document.getElementById("add-bt-status").value,
            note: document.getElementById("add-bt-note").value,
        }
        let response = ajaxRequestBody("/batch/addNewBatch", "POST", batch);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadPITable();
            $("#modalMakeNewBatch").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }

    }
})

//Define the function to refresh the production item form
const refreshProductionItemForm = () =>{

    productionItem = new Object();
    oldProductionItem = null;

    //Get All Flavours/ PackageTypes/ Recipes
    const flavours = ajaxGetRequest("/flavour/getAllFlavours");
    const packageTypes = ajaxGetRequest("/packageType/getAllPackageTypes")
    const recipes = ajaxGetRequest("/recipe/getAllRecipes").filter((r) => r.status === "Active");

    //Fill data into Flavours/PackageTypes/ Recipes
    fillDataIntoSelect(
                 addPIFlavour,
                 "Select Flavour",
                 flavours,
                 "id",
            );

    fillDataIntoSelect(
                 addPIPackage,
                 "Select Package Type",
                 packageTypes,
                 "id",
            );
    fillDataIntoSelect(
                 addPIRecipe,
                 "Select Recipe",
                 recipes,
                 "recipeCode",
            );
}

//Define function to validate the Production form
const productionItemValidation =  () =>{

    addProdItem.addEventListener('keyup', () => {
          validation(addProdItem, '', 'productionItem', 'productionItemName');
       });

    addPIFlavour.addEventListener('change',  () => {
            DynamicSelectValidationOnlyValue(addPIFlavour, 'productionItem', 'flavourId','id');
        });

    addPIPackage.addEventListener('change',  () => {
                DynamicSelectValidationOnlyValue(addPIPackage, 'productionItem', 'packageTypeId','id');
         });

    addPIRecipe.addEventListener('change',  () => {
                DynamicSelectValidationOnlyValue(addPIRecipe, 'productionItem', 'recipeCode','recipeCode');
          });

    addPIStatus.addEventListener('change', () =>{
                selectFieldValidator(addPIStatus,'','productionItem','status')
           });
}


//Define function to reload the Production Item table
const reloadPITable = () => {
    const productionItems = ajaxGetRequest("/productionItem/getAllPIs")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/PRODUCTION_ITEM");

    const getStatus = (ob) => {
        if (ob.status === "Active") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Active</p>';
        }
        if (ob.status === "InActive") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">InActive</p>';
        }

    };
    const displayProperty = [
        {dataType: "text", propertyName: "productionItemNo"},
        {dataType: "text", propertyName: "productionItemName"},
        {dataType: "text", propertyName: "flavourId"},
        {dataType: "text", propertyName: "packageTypeId"},
        {dataType: "text", propertyName: "recipeCode"},
        {dataType: "function", propertyName: getStatus},
    ];
    if (productionItemTableInstance) {
        productionItemTableInstance.destroy();
    }
    $("#tablePIs tbody").empty();
    tableDataBinder(
        tablePIs,
        productionItems,
        displayProperty,
        true,
        generatePIDropDown,
        getPrivilege
    );
    productionItemTableInstance = $("#tablePIs").DataTable({
        responsive: true,
        autoWidth: false,

    });
}

//Define function to Generate the drop down
const generatePIDropDown = (element,index) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: productionItemFormRefill,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deleteProductionITem, icon: "fa-solid fa-trash me-2"},

    ];

    if (element.status === 'Active') {
        buttonList.push({name: "Make a New Batch", action: makeNewBatch, icon: "fa-solid fa-hands-holding-circle me-2"})
    }

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
        buttonElement.onclick =  () => {
            button.action(element);
        };
        const liElement = document.createElement("li");
        liElement.appendChild(buttonElement);
        dropdownMenu.appendChild(liElement);
    });
    return dropdownMenu;
};

//Define function to Make new batch
const makeNewBatch = (pi) => {

    $("#modalMakeNewBatch").modal("show");

    document.getElementById("check-btn").addEventListener('click', () => {
        const batchSize = document.getElementById("add-batchSize").value
        const result = ajaxGetRequest(`/productionItem/checkIngAvailability/${pi.recipeCode}/${batchSize}`);

        const batchFormDiv = document.getElementById('batch-add-form');
        batchFormDiv.style.display = 'none'

        const resultDiv = document.getElementById("check-result")
        resultDiv.className = "d-flex flex-column align-items-center m-3 mt-5 "
        resultDiv.innerHTML = ''
        if (!result.isIngAvailable) {
            let naMessage = document.createElement('div');
            naMessage.style.color = "red";
            naMessage.style.fontSize = "20px";
            naMessage.innerText = "Some or All Ingredients are not Available";

            let viewResBtn = document.createElement('button');
            viewResBtn.className = "btn btn-primary mt-3";
            viewResBtn.innerText = "View Result";

            resultDiv.appendChild(naMessage);
            resultDiv.appendChild(viewResBtn);

            viewResBtn.addEventListener('click', () => {
                displayResult(result.availabilityDTOS)
            })

        } else {
            selectedPI = pi;
            let avaMessage = document.createElement('div');
            avaMessage.style.color = "green";
            avaMessage.style.fontSize = "20px";
            avaMessage.innerText = "All Ingredients are Available";

            let continueBtn = document.createElement('button');
            continueBtn.className = "btn btn-primary mt-3";
            continueBtn.innerText = "Continue";

            resultDiv.appendChild(avaMessage);
            resultDiv.appendChild(continueBtn);

            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                resultDiv.innerHTML = ''
                batchFormDiv.style.display = 'block';
                document.getElementById('add-bt-ingCost').value = result.totalCost.toLocaleString("en-US", {
                    style: "currency",
                    currency: "LKR",
                });
            })


            document.getElementById('add-bt-utilCost').addEventListener('change', (event) => {
                const labourCost = parseFloat(document.getElementById('add-bt-labourCost').value)
                const utilityCost = parseFloat(event.target.value)
                totalCost = parseFloat(result.totalCost + labourCost + utilityCost)
                document.getElementById('add-bt-total').value = totalCost.toLocaleString("en-US", {
                    style: "currency",
                    currency: "LKR",
                });

            })

        }
    })

}

//Define function to Display Results
const displayResult = (result) => {
    const resultDiv = document.getElementById("check-result")
    resultDiv.className = "mt-5"
    resultDiv.innerHTML = ''

    const titleDiv = document.createElement('h4');
    titleDiv.innerText = "Result"

    resultDiv.appendChild(titleDiv)

    result.forEach((res, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row mt-3';

        const codeDiv = document.createElement('div');
        codeDiv.className = 'col';
        codeDiv.innerText = res.ingredientCode;
        rowDiv.appendChild(codeDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'col';
        nameDiv.innerText = res.ingredientName;
        rowDiv.appendChild(nameDiv);

        const quantityDiv = document.createElement('div');
        quantityDiv.className = 'col';

        const resBtn = document.createElement("button")
        resBtn.className = res.isAvailable === true ? "btn  btn-outline-success btn-sm" : "btn  btn-outline-danger btn-sm";
        resBtn.disabled = true
        resBtn.style.cursor = "default"
        resBtn.style.width = '100%'
        resBtn.innerText = res.isAvailable === true ? "Stock Enough" : "Stock Not Enough";
        quantityDiv.appendChild(resBtn)
        rowDiv.appendChild(quantityDiv);


        const removeBtn = document.createElement('button');
        removeBtn.className = "btn btn-warning btn-sm ms-4"
        removeBtn.innerHTML = `<i class="fa-solid fa-file-lines me-2"></i> Send Quotation Request`

        const btnDiv = document.createElement('div');
        btnDiv.className = 'col-4';
        if (!res.isAvailable === true) {
            btnDiv.appendChild(removeBtn)
        }
        rowDiv.appendChild(btnDiv);
        resultDiv.appendChild(rowDiv);
        resultDiv.appendChild(document.createElement('hr'))
    })
}

//Define function for Product update
  const productionItemUpdate = () => {
    event.preventDefault();
    piAddForm.classList.add('needs-validation');

    //Check form Error
    let errors = checkProductionItemFormError();

    if (errors === "") {
      //Check form update
      let updates = checkProductionItemUpdates();
      console.log(updates);
      piAddForm.classList.remove('was-validated')
      $('#modalAddPI').modal("hide");
      if (updates !== "") {
        swal.fire({
          title: "Do you want to Update " + productionItem.productionItemName  + "?",
          html:updates,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#cb421a",
          cancelButtonColor: "#3f3f44",
          confirmButtonText: "Yes, Update"
        }).then((result) =>{
          if(result.isConfirmed){
            let updateServiceResponse = ajaxRequestBody("/productionItem", "PUT", productionItem);

            if (updateServiceResponse.status === 200) {

              // alert("Update successfully ...! \n");
              Swal.fire({
                title: "Update successfully ..! ",
                text: "",
                icon: "success"
              });

              //Need to refresh
              piAddForm.reset();
              reloadPITable();
              refreshProductionItemForm();

              // Remove 'is-valid' and 'is-invalid' classes from all input fields
              document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
                input.classList.remove('is-valid', 'is-invalid');
              });
              piAddForm.classList.remove('was-validated');

              //Need hide modal
              $('#modalAddPI').modal("hide");
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
        $('#modalAddPI').modal("hide");
        Swal.fire({
          title: "No updates Found..!",
          text: '',
          icon: "question"
        });
      }

    } else {
      $('#modalAddPI').modal("hide");
      Swal.fire({
        title: "Form has following errors!",
        text: errors,
        icon: "error"
      });
    }
  }

//Define function to Check Updates
const checkProductionItemUpdates = () =>{
let updates = "";

    if(productionItem.productionItemName !== oldProductionItem.productionItemName){
      updates = updates + "Production Item Name is changed " + oldProductionItem.productionItemName + " into " + productionItem.productionItemName +"<br>";
    }

    if(productionItem.flavourId !== oldProductionItem.flavourId){
      updates = updates + "Flavour is changed " + oldProductionItem.flavourId + " into " + productionItem.flavourId + "<br>";
    }

    if(productionItem.packageTypeId !== oldProductionItem.packageTypeId){
      updates = updates + "Package Type is changed " + oldProductionItem.packageTypeId + " into " + productionItem.packageTypeId + "<br>";
    }

    if(productionItem.recipeCode !== oldProductionItem.recipeCode){
          updates = updates + " Status is changed " + oldProductionItem.quotationStatus + " into " + productionItem.quotationStatus  + "<br>";
        }

    if(productionItem.status !== oldProductionItem.status){
      updates = updates + " Status is changed " + oldProductionItem.status + " into " + productionItem.status  + "<br>";
    }

return updates;

}
//const editPI = (pi) => {
//
//    selectedPI = pi
//    const flavourSelectElement = document.getElementById("edit_pi_flavourId");
//    const ptSelectElement = document.getElementById("edit_pi_ptId");
//    const recipeSelectElement = document.getElementById("edit_pi_recipeId");
//    flavourSelectElement.innerHTML=''
//    ptSelectElement.innerHTML=''
//    recipeSelectElement.innerHTML=''
//    flavours.forEach(flavour => {
//        const option = document.createElement('option');
//        option.value = flavour.id;
//        option.textContent = `${flavour.name} (${flavour.id})` ;
//        flavourSelectElement.appendChild(option);
//    });
//
//    packageTypes.forEach(pt => {
//        const option = document.createElement('option');
//        option.value = pt.id;
//        option.textContent = `${pt.name} (${pt.id})`;
//        ptSelectElement.appendChild(option);
//    });
//
//    recipes.forEach(rec => {
//        const option = document.createElement('option');
//        option.value = rec.recipeCode;
//        option.textContent = rec.recipeCode;
//        recipeSelectElement.appendChild(option);
//    });
//
//    document.getElementById('edit-pi-name').value = pi.productionItemName;
//    document.getElementById('edit_pi_flavourId').value = pi.flavourId;
//    document.getElementById('edit_pi_ptId').value = pi.packageTypeId;
//    document.getElementById('edit_pi_recipeId').value = pi.recipeCode;
//    document.getElementById('edit-pi-status').value = pi.status;
//
//    $("#modalEditPI").modal("show");
//
//}

//const deletePI = (pi) => {
//    swal.fire({
//        title: "Delete Production Item",
//        text: "Are you sure, you want to delete this?",
//        icon: "warning",
//        showCancelButton: true,
//        confirmButtonColor: "#cb421a",
//        cancelButtonColor: "#3f3f44",
//        confirmButtonText: "Yes, Delete"
//    }).then((result) => {
//        if (result.isConfirmed) {
//            let response = ajaxDeleteRequest(`/productionItem/deletePI/${pi.id}`);
//            if (response.status === 200) {
//                swal.fire({
//                    title: response.responseText,
//                    icon: "success"
//                });
//                reloadPITable();
//            } else {
//                swal.fire({
//                    title: "Something Went Wrong",
//                    text: response.responseText,
//                    icon: "error"
//                });
//            }
//        }
//    });
//}

//Define method for ProductionItem Delete
const deleteProductionITem= (ob, rowIndex) => {
    console.log("delete");

    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete Production Item " +
            "" + (ob.productionItemName) +"?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E11D48",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then(async (result) => {
        if(result.isConfirmed) {

            console.log(ob.id)

            // Delete Service
            let deleteServiceRequestResponse =  ajaxRequestBody("/productionItem/deletePI/"+ ob.id, "DELETE", ob)

            //Check Backend Service
            if (deleteServiceRequestResponse.status === 200) {
                swal.fire({
                    title: "Deleted!",
                    text: "Production Item has been deleted.",
                    icon: "success"
                });
                piAddForm.reset();
                reloadPITable();
                refreshProductionItemForm();

            } else {
                swal.fire({
                    title: "Delete Not Successfully",
                    text: deleteServiceRequestResponse,
                    icon: "error"
                });
            }
        }
    })
}
//Check production Item form errors
const checkProductionItemFormError = () => {
    let errors = '';

    if (productionItem.productionItemName == null) {
        errors = errors + "Production ItemNo can't be null \n";
        addProdItem.classList.add('is-invalid')
    }

    if (productionItem.flavourId == null) {
        errors = errors + "Flavour can't be null \n";
        addPIFlavour.classList.add('is-invalid')
    }


    if (productionItem.packageTypeId == null) {
        errors = errors + "Package Type can't be null \n";
        addPIPackage.classList.add('is-invalid')
    }


    if (productionItem.recipeCode == null) {
        errors = errors + "Recipe can't be null\n";
        addPIRecipe.classList.add('is-invalid')
    }


    if (productionItem.status == null) {
        errors = errors + "Status can't be null\n";
        addPIStatus.classList.add('is-invalid');
    }


    return errors;
}

//Define Production Item submit Function
const ProductionItemSubmit = () =>{

    event.preventDefault();
        console.log(productionItem);

        // 1. Check form errors
        const errors = checkProductionItemFormError();

        if (errors === "") {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to add the production Item " + productionItem.productionItemName + "?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#E11D48",
                cancelButtonColor: "#3f3f44",
                confirmButtonText: "Yes, Add"
            }).then((result) => {
                if (result.isConfirmed) {
                    const postServiceRequestResponse = ajaxRequestBody("/productionItem", "POST", productionItem);

                    // Check backend response
                    if (postServiceRequestResponse.status === 200) {
                        $("#modalAddPI").modal('hide');
                        piAddForm.reset();
                        reloadPITable();
                        refreshProductionItemForm();

                        // Reset validation classes
                        Array.from(piAddForm.elements).forEach((field) => {
                            field.classList.remove('is-valid', 'is-invalid');
                        });

                        Swal.fire({
                            title: "Production Item Added Successfully!",
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
                title: "Production Item Not Added",
                text: errors,
                icon: "error"
            });
        }
}

//Refill Product form fields
const productionItemFormRefill = (ob, rowIndex) => {


  $("#modalAddPI").modal('show');
  productionItem = JSON.parse(JSON.stringify(ob));
  oldProductionItem = JSON.parse(JSON.stringify(ob));


  addProdItem.value = productionItem.productionItemName ;
  addPIStatus.value = productionItem.status;

  //Get All Flavours/ PackageTypes/ Recipes
      const flavours = ajaxGetRequest("/flavour/getAllFlavours");
      const packageTypes = ajaxGetRequest("/packageType/getAllPackageTypes")
      const recipes = ajaxGetRequest("/recipe/getAllRecipes").filter((r) => r.status === "Active");

      //Fill data into Flavours/PackageTypes/ Recipes
      fillDataIntoSelect(
                   addPIFlavour,
                   "Select Flavour",
                   flavours,
                   "id",
                   productionItem.flavourId
              );

      fillDataIntoSelect(
                   addPIPackage,
                   "Select Package Type",
                   packageTypes,
                   "id",
                   productionItem.packageTypeId
              );
      fillDataIntoSelect(
                   addPIRecipe,
                   "Select Recipe",
                   recipes,
                   "recipeCode",
                   productionItem.recipeCode
              );

};