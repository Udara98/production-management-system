let productionItemTableInstance;
let selectedPI;
let totalCost;
let recipeCode = "";
let recipeName = "";
let checkBtn;
let resultDiv;
let viewResBtn;
let recipeSelect;
let batchStatusSelect;
let batchTotalCost;

const flavours = ajaxGetRequest("/flavour/getAllFlavours");
const packageTypes = ajaxGetRequest("/packageType/getAllPackageTypes")
const recipes = ajaxGetRequest("/recipe/getAllRecipes").filter((r) => r.status === "Active");


window.addEventListener('load', () => {

   const RecipeSelectElement = document.getElementById("sel-recipe");

   checkBtn = document.getElementById("check-btn");

   resultDiv = document.getElementById("check-result");

   viewResBtn = document.getElementById("viewResBtn");

   batchStatusSelect = document.getElementById("add-bt-status");

   recipeSelect = document.getElementById("sel-recipe");
   recipeSelect.classList.remove("invalid-feedback")
   recipeSelect.classList.remove("is-invalid")

   setupBatchSizeValidation();


   // If using Bootstrap modal:
    $('#modalMakeNewBatch').on('shown.bs.modal', function () {
        setupBatchSizeValidation();
    });

    recipes.forEach(rec => {
        const option = document.createElement('option');
        option.value = rec.recipeName + "|" + rec.recipeCode;
        option.textContent = rec.recipeName + "-" + rec.recipeCode;
        RecipeSelectElement.appendChild(option);
    });

   
})

    //Define function for
    const createBatch = (e) => {
        e.preventDefault();
        
        // Validate form
        const form = this;
        if (!form.checkValidity()) {
            e.stopPropagation();
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
        
        if (batchTotalCost <= 0) {
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
            totalCost: batchTotalCost,
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
        labourCostInput.addEventListener('input', validateCosts);
    }
    
    if (utilCostInput) {
        utilCostInput.removeEventListener('input', calculateTotalCost);
        utilCostInput.addEventListener('input', calculateTotalCost);
        utilCostInput.addEventListener('input', validateCosts);
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

        if(resultDiv){resultDiv.innerHTML = '';
        resultDiv.classList.add('d-none');
        if(viewResBtn){viewResBtn.classList.add('d-none');}
    }

        const batchSizeInput = document.getElementById("add-batchSize");
        const recipeSelect = document.getElementById("sel-recipe");
        const checkBtn = document.getElementById("check-btn");
    
        // Use the same validation as validatefdsywddBatchSize
        const batchSize = parseFloat(batchSizeInput.value);
        const batchValid = !isNaN(batchSize) && batchSize > 0 && batchSize <= 1000;
    
        const recipeValid = recipeSelect && recipeSelect.value;
    
        // Only enable if BOTH are valid
        if (batchValid && recipeValid) {
            checkBtn.disabled = false;
            checkBtn.classList.remove('btn-secondary');
            checkBtn.classList.add('addPrimaryBtn');
        } else {
            checkBtn.disabled = true;
            checkBtn.classList.remove('addPrimaryBtn');
            checkBtn.classList.add('btn-secondary');
        
    };
}

// Handle recipe selection
const handleRecipeChange = function () {
    checkBtn.classList.remove('d-none');
    if (this.value) {
        recipeSelect.classList.remove('is-invalid');
        recipeSelect.classList.add('is-valid');
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
    
    
    resultDiv.className = "d-flex flex-column align-items-center m-2";
    resultDiv.innerHTML = '';
    
    if (!result.isIngAvailable) {
        
        checkBtn.classList.add('d-none');
        
        let naMessage = document.createElement('div');
        naMessage.className = "alert alert-warning w-100 text-center";
        naMessage.role = "alert";
        naMessage.innerText = "Some or All Ingredients are not Available";
        
        let viewResBtn = document.createElement('button');
        viewResBtn.className = "btn btn-update w-100 mx-auto fw-semibold";
        viewResBtn.style.color = "white";
        viewResBtn.innerHTML = '<i class="fa-solid fa-eye me-2"></i>View Details';
        viewResBtn.type = "button";
        viewResBtn.id = "viewResBtn";
        resultDiv.appendChild(naMessage);
        resultDiv.appendChild(viewResBtn);
        resultDiv.classList.remove('d-none');
        viewResBtn.classList.remove('d-none');
        
        viewResBtn.addEventListener('click', () => {
            displayResult(result.availabilityDTOS, quotationRequests, quotations, purchaseOrders, grns);
        });
        
    } else {

        checkBtn.classList.add('d-none');

        let avaMessage = document.createElement('div');
        avaMessage.className = "alert alert-success w-100 text-center";
        avaMessage.role = "alert";
        avaMessage.innerText = "All Ingredients are Available";
        
        let continueBtn = document.createElement('button');
        continueBtn.className = "btn addPrimaryBtn w-100 mx-auto fw-semibold";
        continueBtn.innerHTML = '<i class="fas fa-check me-2"></i>Continue to Batch Details';
        
        resultDiv.appendChild(avaMessage);
        resultDiv.appendChild(continueBtn);
        
        continueBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resultDiv.innerHTML = '';
            batchFormDiv.style.display = 'block';
            
            // Set ingredient cost
            document.getElementById('add-bt-ingCost').value = parseInt(result.totalCost);
            
            // Initialize total cost calculation
            calculateTotalCost();

            //Set Batch Status
            batchStatusSelect.value = "InProduction";
            batchStatusSelect.classList.remove("invalid-feedback")
            batchStatusSelect.disabled = true;

            // Set min/max for Manufacture Date field (10 days before/after today)
            const mfgDateInput = document.getElementById('add-bt-mnf');
            const today = new Date();
            const minDate = new Date(today);
            minDate.setDate(today.getDate() - 10);
            const maxDate = new Date(today);
            maxDate.setDate(today.getDate() + 10);
            // Format to yyyy-mm-dd
            const fmt = d => d.toISOString().split('T')[0];
            mfgDateInput.min = fmt(minDate);
            mfgDateInput.max = fmt(maxDate);
            // Optionally, set default value to today
            mfgDateInput.value = fmt(today);
        
        });
    }
}

// Calculate total cost
const calculateTotalCost = () => {
    const ingredientCost = parseInt(document.getElementById('add-bt-ingCost').value);
    const labourCostInput = document.getElementById('add-bt-labourCost');
    const utilityCostInput = document.getElementById('add-bt-utilCost');
    const totalField = document.getElementById('add-bt-total');

    const digitRegex = /^\d{1,5}$/;
    // Only calculate if both are valid
    if (digitRegex.test(labourCostInput.value) && digitRegex.test(utilityCostInput.value)) {
        const labourCost = parseInt(labourCostInput.value);
        const utilityCost = parseInt(utilityCostInput.value);
         batchTotalCost = ingredientCost + labourCost + utilityCost;
        totalField.value = parseInt(batchTotalCost);
    } else {
        // Optionally clear or mark total as invalid
        totalField.value = '';
    }
}


const validateCosts = () =>{
    // Add input restrictions for Labour Cost and Utility Cost
    const labourCostInput = document.getElementById('add-bt-labourCost');
    const utilCostInput = document.getElementById('add-bt-utilCost');
    
    const digitRegex = /^\d{0,5}$/; // allows 0-5 digits for typing
    [labourCostInput, utilCostInput].forEach(input => {
        if (!input) return;
        input.addEventListener('input', function(e) {
            if (!digitRegex.test(this.value)) {
                // Remove last entered character if it makes value invalid
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });
        });
}

// Validate dates
const validateDates = () => {
    const mfgDateInput = document.getElementById('add-bt-mnf');
    const expDateInput = document.getElementById('add-bt-exp');
    const mfgDate = mfgDateInput.value;
    const expDate = expDateInput.value;

    if (mfgDate) {
        expDateInput.classList.remove('is-invalid');
        expDateInput.classList.add('is-valid');
        const mfg = new Date(mfgDate);
        // Min = manufacture date + 1 day
        const minExp = new Date(mfg);
        minExp.setDate(minExp.getDate() + 1);
        // Max = manufacture date + 4 months
        const maxExp = new Date(mfg);
        maxExp.setMonth(maxExp.getMonth() + 4);
        // Format yyyy-mm-dd
        const fmt = d => d.toISOString().split('T')[0];
        expDateInput.min = fmt(minExp);
        expDateInput.max = fmt(maxExp);

        expDateInput.classList.remove('is-invalid');
        expDateInput.classList.add('is-valid');
    }

    if (mfgDate && expDate) {
        if (new Date(expDate) <= new Date(mfgDate)) {
            expDateInput.setCustomValidity('Expiry date must be after manufacture date');
        } else {
            expDateInput.setCustomValidity('');
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

const quotationRequests = ajaxGetRequest("/quotation-request/getAllRequests");

// Function to handle and display the fetched result
const displayResult = (ingredients) => {

    const resultDiv = document.getElementById("check-result");
    resultDiv.className = "mt-3";
    resultDiv.innerHTML = '';  // Clear any existing content

    const titleDiv = document.createElement('h4');
    titleDiv.innerText = "Result";
    resultDiv.appendChild(titleDiv);

    ingredients.forEach(res => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row mt-3';

        const codeDiv = document.createElement('div');
        codeDiv.className = 'col-2';
        codeDiv.innerText = res.ingredientCode;
        rowDiv.appendChild(codeDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'col-2';
        nameDiv.innerText = res.ingredientName;
        rowDiv.appendChild(nameDiv);

        const quantityDiv = document.createElement('div');
        quantityDiv.className = 'col-2';

        const resBtn = document.createElement("p");
        resBtn.className = res.isAvailable === true ? "btn align-middle greenLabel" : "btn align-middle redLabel";
        resBtn.style.width = '100%';
        resBtn.innerText = res.isAvailable === true ? "Stock Enough" : "Stock Not Enough";
        quantityDiv.appendChild(resBtn);
        rowDiv.appendChild(quantityDiv);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'col-4';

        const btnDiv = document.createElement('div');
        btnDiv.className = 'col-2';


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
            notifyBtn.style = "color: white;"
            notifyBtn.className = "btn btn-update";
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



function validateBatchSize() {

    checkBtn.classList.remove('d-none');



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


function setupBatchSizeValidation() {
    const batchSizeInput = document.getElementById("add-batchSize");
    if (batchSizeInput) {
        batchSizeInput.addEventListener("input", validateBatchSize);
        updateCheckButtonState();

    }
}
