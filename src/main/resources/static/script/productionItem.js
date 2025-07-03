let productionItemTableInstance;
let selectedPI;
let totalCost;
let recipeCode = "";
let recipeName = "";
const flavours = ajaxGetRequest("/flavour/getAllFlavours");
const packageTypes = ajaxGetRequest("/packageType/getAllPackageTypes")
const recipes = ajaxGetRequest("/recipe/getAllRecipes").filter((r) => r.status === "Active");

window.addEventListener('load', () => {

    //Call function to Reload the production table
//    reloadPITable();

    //Call function to refresh the add production item form
//    refreshProductionItemForm();

    //Call function to refresh the add new batch form

    //Call function to refresh the recipe form

    //Call Recipe form validation
//    productionItemValidation();

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


   const recipes = ajaxGetRequest("/recipe/getAllRecipes").filter((recipe) => recipe.status === "Active");

   const RecipeSelectElement = document.getElementById("sel-recipe");

    recipes.forEach(rec => {
        const option = document.createElement('option');
        option.value = rec.recipeName + "|" + rec.recipeCode;
        option.textContent = rec.recipeName + "-" + rec.recipeCode;
        RecipeSelectElement.appendChild(option);
    });

    document.getElementById('makeNewBatchForm').onsubmit = function (event) {
        event.preventDefault();
        
        // Validate form
        const form = this;
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        // Additional validation
        if (!recipeCode || !recipeName) {
            Swal.fire({
                title: "Recipe Error",
                text: "Please select a valid recipe.",
                icon: "error"
            });
            return;
        }
        
        if (totalCost <= 0) {
            Swal.fire({
                title: "Cost Error",
                text: "Total cost must be greater than zero.",
                icon: "error"
            });
            return;
        }
        
        // Validate dates
        const mfgDate = new Date(document.getElementById("add-bt-mnf").value);
        const expDate = new Date(document.getElementById("add-bt-exp").value);
        
        if (expDate <= mfgDate) {
            Swal.fire({
                title: "Date Error",
                text: "Expiry date must be after manufacture date.",
                icon: "error"
            });
            return;
        }
        
        // Prepare batch data
        const batch = {
            recipeCode: recipeCode,
            recipeName: recipeName,
            totalQuantity: parseFloat(document.getElementById("add-batchSize").value),
            availableQuantity: parseFloat(document.getElementById("add-batchSize").value),
            manufactureDate: mfgDate.toISOString(),
            expireDate: expDate.toISOString(),
            totalCost: totalCost,
            batchStatus: document.getElementById("add-bt-status").value,
            note: document.getElementById("add-bt-note").value || "",
        };
        
        console.log("Submitting batch:", batch);
        
        // Show confirmation dialog
        Swal.fire({
            title: "Create New Batch?",
            text: `Are you sure you want to create a new batch for ${recipeName}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, Create Batch",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: "Creating Batch...",
                    text: "Please wait while we create your batch.",
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                let response = ajaxRequestBody("/batch/addNewBatch", "POST", batch);
                
                if (response.status === 200) {
                    Swal.fire({
                        title: "Success!",
                        text: response.responseText,
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                    
                    // Reset form and close modal
                    resetBatchForm();
                    $("#modalMakeNewBatch").modal("hide");
                    
                    // Reload tables if they exist
                    if (typeof reloadPITable === 'function') {
                        reloadPITable();
                    }
                    if (typeof reloadBatchTable === 'function') {
                        reloadBatchTable();
                    }
                    
                } else {
                    Swal.fire({
                        title: "Error",
                        text: response.responseText || "Failed to create batch. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                }
            }
        });
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

//Define function to validate the Production form
function validateBatchSize() {
    const batchSizeInput = document.getElementById("add-batchSize");
    const batchSize = parseFloat(batchSizeInput.value);

    if (isNaN(batchSize) || batchSize <= 0 || batchSize > 1000) {
        batchSizeInput.classList.add('is-invalid');
        batchSizeInput.classList.remove('is-valid');
    } else {
        batchSizeInput.classList.remove('is-invalid');
        batchSizeInput.classList.add('is-valid');
    }
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

//    if (element.status === 'Active') {
//        buttonList.push({name: "Make a New Batch", action: makeNewBatch, icon: "fa-solid fa-hands-holding-circle me-2"})
//    }

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
const makeNewProdBatch = () => {
    // Reset form and show modal
    resetBatchForm();
    $("#modalMakeNewBatch").modal("show");
    
    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('add-bt-mnf').setAttribute('min', today);
    document.getElementById('add-bt-exp').setAttribute('min', today);
    
    // Set manufacture date to today by default
    document.getElementById('add-bt-mnf').value = today;
    
    // Add event listeners only once
    setupBatchFormEventListeners();
}

// Setup event listeners for batch form
const setupBatchFormEventListeners = () => {
    // Recipe selection
    const recipeSelect = document.getElementById("sel-recipe");
    if (recipeSelect) {
        // Remove existing listeners to prevent duplicates
        recipeSelect.removeEventListener('change', handleRecipeChange);
        recipeSelect.addEventListener('change', handleRecipeChange);
    }
    
    // Batch size input
    const batchSizeInput = document.getElementById("add-batchSize");
    if (batchSizeInput) {
        batchSizeInput.removeEventListener('input', updateCheckButtonState);
        batchSizeInput.addEventListener('input', updateCheckButtonState);
    }
    
    // Check ingredients button
    const checkBtn = document.getElementById("check-btn");
    if (checkBtn) {
        checkBtn.removeEventListener('click', handleCheckIngredients);
        checkBtn.addEventListener('click', handleCheckIngredients);
        // Initially disable the button
        checkBtn.disabled = true;
    }
    
    // Cost calculation listeners
    const labourCostInput = document.getElementById('add-bt-labourCost');
    const utilCostInput = document.getElementById('add-bt-utilCost');
    
    if (labourCostInput) {
        labourCostInput.removeEventListener('input', calculateTotalCost);
        labourCostInput.addEventListener('input', calculateTotalCost);
    }
    
    if (utilCostInput) {
        utilCostInput.removeEventListener('input', calculateTotalCost);
        utilCostInput.addEventListener('input', calculateTotalCost);
    }
    
    // Date validation
    const mfgDateInput = document.getElementById('add-bt-mnf');
    const expDateInput = document.getElementById('add-bt-exp');
    
    if (mfgDateInput) {
        mfgDateInput.removeEventListener('change', validateDates);
        mfgDateInput.addEventListener('change', validateDates);
    }
    
    if (expDateInput) {
        expDateInput.removeEventListener('change', validateDates);
        expDateInput.addEventListener('change', validateDates);
    }
}

// Update check button state based on form inputs
const updateCheckButtonState = () => {
    const batchSize = document.getElementById("add-batchSize").value;
    const recipeSelect = document.getElementById("sel-recipe");
    const checkBtn = document.getElementById("check-btn");
    
    if (checkBtn) {
        const isValid = batchSize && batchSize > 0 && recipeSelect && recipeSelect.value;
        checkBtn.disabled = !isValid;
        
        if (isValid) {
            checkBtn.classList.remove('btn-secondary');
            checkBtn.classList.add('addPrimaryBtn');
        } else {
            checkBtn.classList.remove('addPrimaryBtn');
            checkBtn.classList.add('btn-secondary');
        }
    }
}

// Handle recipe selection
const handleRecipeChange = function () {
    if (this.value) {
        let selectedData = this.value.split("|");
        recipeName = selectedData[0];
        recipeCode = selectedData[1];
    } else {
        recipeName = "";
        recipeCode = "";
    }
    
    // Update check button state
    updateCheckButtonState();
}

// Handle check ingredients button
const handleCheckIngredients = () => {
    const batchSize = document.getElementById("add-batchSize").value;
    const recipeSelect = document.getElementById("sel-recipe");
    
    // Validate inputs
    if (!batchSize || !recipeSelect.value) {
        Swal.fire({
            title: "Missing Information",
            text: "Please enter batch size and select a recipe first.",
            icon: "warning"
        });
        return;
    }
    
    if (!recipeCode) {
        Swal.fire({
            title: "Recipe Error",
            text: "Please select a valid recipe.",
            icon: "error"
        });
        return;
    }
    
    console.log("Checking ingredients for:", recipeName, recipeCode, batchSize);
    
    // Show loading state
    const checkBtn = document.getElementById("check-btn");
    const originalText = checkBtn.innerHTML;
    checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Checking...';
    checkBtn.disabled = true;
    
    const result = ajaxGetRequest(`/productionItem/checkIngAvailability/${recipeCode}/${batchSize}`);
    console.log("Check result:", result);
    
    // Reset button
    checkBtn.innerHTML = originalText;
    checkBtn.disabled = false;
    
    const batchFormDiv = document.getElementById('batch-add-form');
    batchFormDiv.style.display = 'none';
    
    const resultDiv = document.getElementById("check-result");
    resultDiv.className = "d-flex flex-column align-items-center m-3 mt-5";
    resultDiv.innerHTML = '';
    
    if (!result.isIngAvailable) {
        let naMessage = document.createElement('div');
        naMessage.style.color = "red";
        naMessage.style.fontSize = "20px";
        naMessage.innerText = "Some or All Ingredients are not Available";
        
        let viewResBtn = document.createElement('button');
        viewResBtn.className = "btn btn-primary mt-3";
        viewResBtn.innerText = "View Details";
        
        resultDiv.appendChild(naMessage);
        resultDiv.appendChild(viewResBtn);
        
        viewResBtn.addEventListener('click', () => {
            displayResult(result.availabilityDTOS, quotationRequests, quotations, purchaseOrders, grns);
        });
        
    } else {
        let avaMessage = document.createElement('div');
        avaMessage.style.color = "green";
        avaMessage.style.fontSize = "20px";
        avaMessage.innerText = "All Ingredients are Available";
        
        let continueBtn = document.createElement('button');
        continueBtn.className = "btn btn-success mt-3";
        continueBtn.innerHTML = '<i class="fas fa-check me-2"></i>Continue to Batch Details';
        
        resultDiv.appendChild(avaMessage);
        resultDiv.appendChild(continueBtn);
        
        continueBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resultDiv.innerHTML = '';
            batchFormDiv.style.display = 'block';
            
            // Set ingredient cost
            document.getElementById('add-bt-ingCost').value = result.totalCost.toLocaleString("en-US", {
                style: "currency",
                currency: "LKR",
            });
            
            // Initialize total cost calculation
            calculateTotalCost();
        });
    }
}

// Calculate total cost
const calculateTotalCost = () => {
    const ingredientCost = parseFloat(document.getElementById('add-bt-ingCost').value.replace(/[^0-9.-]+/g, "")) || 0;
    const labourCost = parseFloat(document.getElementById('add-bt-labourCost').value) || 0;
    const utilityCost = parseFloat(document.getElementById('add-bt-utilCost').value) || 0;
    
    totalCost = ingredientCost + labourCost + utilityCost;
    
    document.getElementById('add-bt-total').value = totalCost.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });
}

// Validate dates
const validateDates = () => {
    const mfgDate = document.getElementById('add-bt-mnf').value;
    const expDate = document.getElementById('add-bt-exp').value;
    
    if (mfgDate && expDate) {
        if (new Date(expDate) <= new Date(mfgDate)) {
            document.getElementById('add-bt-exp').setCustomValidity('Expiry date must be after manufacture date');
        } else {
            document.getElementById('add-bt-exp').setCustomValidity('');
        }
    }
}

// Reset batch form
const resetBatchForm = () => {
    const form = document.getElementById('makeNewBatchForm');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }
    
    // Clear result area
    const resultDiv = document.getElementById("check-result");
    if (resultDiv) {
        resultDiv.innerHTML = '';
    }
    
    // Hide batch form
    const batchFormDiv = document.getElementById('batch-add-form');
    if (batchFormDiv) {
        batchFormDiv.style.display = 'none';
    }
    
    // Reset variables
    recipeName = "";
    recipeCode = "";
    totalCost = 0;
    
    // Clear validation classes
    const inputs = form.querySelectorAll('.form-control, .form-select');
    inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });
}

//Define function to Display Results
//const displayResult = (result) => {
//    const resultDiv = document.getElementById("check-result")
//    resultDiv.className = "mt-5"
//    resultDiv.innerHTML = ''
//
//    const titleDiv = document.createElement('h4');
//    titleDiv.innerText = "Result"
//
//    resultDiv.appendChild(titleDiv)
//
//    result.forEach((res, index) => {
//        const rowDiv = document.createElement('div');
//        rowDiv.className = 'row mt-3';
//
//        const codeDiv = document.createElement('div');
//        codeDiv.className = 'col';
//        codeDiv.innerText = res.ingredientCode;
//        rowDiv.appendChild(codeDiv);
//
//        const nameDiv = document.createElement('div');
//        nameDiv.className = 'col';
//        nameDiv.innerText = res.ingredientName;
//        rowDiv.appendChild(nameDiv);
//
//        const quantityDiv = document.createElement('div');
//        quantityDiv.className = 'col';
//
//        const resBtn = document.createElement("button")
//        resBtn.className = res.isAvailable === true ? "btn  btn-outline-success btn-sm" : "btn  btn-outline-danger btn-sm";
//        resBtn.disabled = true
//        resBtn.style.cursor = "default"
//        resBtn.style.width = '100%'
//        resBtn.innerText = res.isAvailable === true ? "Stock Enough" : "Stock Not Enough";
//        quantityDiv.appendChild(resBtn)
//        rowDiv.appendChild(quantityDiv);
//
//
//        const removeBtn = document.createElement('button');
//        removeBtn.className = "btn btn-warning btn-sm ms-4"
//        removeBtn.innerHTML = `<i class="fa-solid fa-file-lines me-2"></i> Send Quotation Request`
//
//        const btnDiv = document.createElement('div');
//        btnDiv.className = 'col-4';
//        if (!res.isAvailable === true) {
//            btnDiv.appendChild(removeBtn)
//        }
//        rowDiv.appendChild(btnDiv);
//        resultDiv.appendChild(rowDiv);
//        resultDiv.appendChild(document.createElement('hr'))
//    })
//}

const quotationRequests = ajaxGetRequest("/quotation-request/getAllRequests");
const quotations = ajaxGetRequest("/quotation/getAllQuotations");
const purchaseOrders = ajaxGetRequest("/purchaseOrder/getAllPurchaseOrders");
const grns = ajaxGetRequest("/grn/getAllGRNs");

// Function to handle and display the fetched result
const displayResult = (ingredients, quotationRequests, quotations, purchaseOrders, grns) => {

    const resultDiv = document.getElementById("check-result");
    resultDiv.className = "mt-5";
    resultDiv.innerHTML = '';  // Clear any existing content

    const titleDiv = document.createElement('h4');
    titleDiv.innerText = "Result";
    resultDiv.appendChild(titleDiv);

    ingredients.forEach(res => {
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

        const resBtn = document.createElement("button");
        resBtn.className = res.isAvailable === true ? "btn btn-outline-success btn-sm" : "btn btn-outline-danger btn-sm";
        resBtn.disabled = true;
        resBtn.style.cursor = "default";
        resBtn.style.width = '100%';
        resBtn.innerText = res.isAvailable === true ? "Stock Enough" : "Stock Not Enough";
        quantityDiv.appendChild(resBtn);
        rowDiv.appendChild(quantityDiv);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'col-4';

        const btnDiv = document.createElement('div');
        btnDiv.className = 'col-3';

        // if (!res.isAvailable === true) {
        //     console.log(quotationRequests,res)
        //     const relatedRequest = quotationRequests.find(
        //         req => req.ingCode === res.ingredientCode && req.requestStatus === "Send"
        //     );

        //     const relatedQuotation = quotations.find(
        //         quo => quo.ingredientCode === res.ingredientCode &&  relatedRequest?.requestNo=== quo.quotationRequestNo
        //     );
        //     const relatedOrder = purchaseOrders.find(order => order.ingredientCode === res.ingredientCode && order.purchaseOrderStatus === "Pending");


        //     if (relatedOrder) {
        //         const infoText = document.createElement('span');
        //         infoText.textContent = `Please add a GRN for po ${relatedOrder.purchaseOrderNo}.`;
        //         infoText.style.color = 'red';

        //         const viewOrderBtn = document.createElement('button');
        //         viewOrderBtn.textContent = "Add GRN";
        //         viewOrderBtn.className = "btn btn-warning ms-2";
        //         viewOrderBtn.onclick = () => {
        //             window.location.href = `/purchase-order/${relatedOrder.id}`;
        //         };

        //         infoDiv.appendChild(infoText);
        //         btnDiv.appendChild(viewOrderBtn);
        //     } else if (relatedQuotation) {
        //         const infoText = document.createElement('span');
        //         infoText.textContent = `Please Send Purchase Order for ${relatedQuotation.quotationNo} .`;
        //         infoText.style.color = 'red';

        //         const viewQuotationBtn = document.createElement('button');
        //         viewQuotationBtn.textContent = "Send Purchase Order";
        //         viewQuotationBtn.className = "btn btn-warning ms-2";
        //         viewQuotationBtn.onclick = () => {
        //             window.location.href = `/quotation/${relatedQuotation.id}`;
        //         };

        //         infoDiv.appendChild(infoText);
        //         btnDiv.appendChild(viewQuotationBtn);
        //     } else if (relatedRequest) {
        //         const infoText = document.createElement('span');
        //         infoText.textContent = `Please add a quotation for Quotation Request No: ${relatedRequest.requestNo}.`;
        //         infoText.style.color = 'red';

        //         const viewRequestBtn = document.createElement('button');
        //         viewRequestBtn.textContent = "Add Quotation";
        //         viewRequestBtn.className = "btn btn-warning ms-2";
        //         viewRequestBtn.onclick = () => {
        //             window.location.href = `/quotation-request/${relatedRequest.id}`;
        //         };

        //         infoDiv.appendChild(infoText);
        //         btnDiv.appendChild(viewRequestBtn);
        //     } else {
        //         const infoText = document.createElement('span');
        //             infoText.textContent = `Please send Quotation Request for ingredient ${res.ingredientCode}.`;
        //             infoText.style.color = 'red';

        //             const sendQuoBtn = document.createElement('button');
        //             sendQuoBtn.className = "btn btn-warning ms-2";
        //             sendQuoBtn.innerHTML = `Send Quotation Request`;

        //             sendQuoBtn.onclick = () => {
        //             };

        //             infoDiv.appendChild(infoText);
        //             btnDiv.appendChild(sendQuoBtn);
        //     }
        // }

        if (!res.isAvailable === true) {
            const infoText = document.createElement('span');
            infoText.textContent = `Insufficient stock for ${res.ingredientName} (${res.ingredientCode}). Please notify Procurement.`;
            infoText.style.color = 'red';
            infoDiv.appendChild(infoText);

            console.log(currentUser)
            console.log(res)
        
            // Add Notify button
            const notifyBtn = document.createElement('button');
            notifyBtn.type = "button";
            notifyBtn.className = "btn btn-warning ms-2";
            notifyBtn.innerText = "Notify Procurement";
            notifyBtn.type = "button";
            notifyBtn.onclick = () => {
                ajaxRequestBody("/notification/ingredientShortage", "POST", {
                    ingredientCode: res.ingredientCode,
                    ingredientName: res.ingredientName,
                    requiredQty: res.requiredQty, // Make sure this is available in your result
                    reportedBy: currentUser, // Replace with your user variable/session
                    recipeName:recipeName,
                    recipeCode: recipeCode,
                    unitType: res.unitType
                });
                Swal.fire({
                    title: "Notification Sent",
                    text: "Procurement has been notified.",
                    icon: "success"
                });
            };
            btnDiv.appendChild(notifyBtn);
        }

        rowDiv.appendChild(infoDiv);
        rowDiv.appendChild(btnDiv);
        resultDiv.appendChild(rowDiv);
        resultDiv.appendChild(document.createElement('hr'));
    });
};



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

function validateBatchSize() {

    console.log("uuuuuuuuuuuu")
    const batchSizeInput = document.getElementById("add-batchSize");
    const batchSize = parseFloat(batchSizeInput.value);

    if (isNaN(batchSize) || batchSize <= 0 || batchSize > 1000) {
        batchSizeInput.classList.add('is-invalid');
        batchSizeInput.classList.remove('is-valid');
    } else {
        batchSizeInput.classList.remove('is-invalid');
        batchSizeInput.classList.add('is-valid');
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

function setupBatchSizeValidation() {
    const batchSizeInput = document.getElementById("add-batchSize");
    if (batchSizeInput) {
        batchSizeInput.addEventListener("input", validateBatchSize);
    }
}

// If using Bootstrap modal:
$('#modalMakeNewBatch').on('shown.bs.modal', function () {
    setupBatchSizeValidation();
});

