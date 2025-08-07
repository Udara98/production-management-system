let recipeTableInstance;
let recipeItems=[]
let selectedRecipe;
let isEditMode = false;
let editingRecipeCode = null;
let oldRecipe;
let recipeIngTableInstance;
let receipeStatus;
let getPrivilege;


//Browser on load event
window.addEventListener("load",()=>{

    getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/RECIPE");
    
    if (!getPrivilege.insert) {
        $("#addRecipeBtn").prop("disabled", true);
    }

    let recipeTableInstance;

    //Create Recipe object
    recipe = {};

    //Call table refresh function
    refreshRecipeTable();

    //Call the form validation function
    formValidation();

    //Call the function to receipe form
    reloadRecipeForm();

    // Refresh the Recipe form to reset all fields and reload data
//    refreshRecipeForm()

});

const refreshRecipeTable = () =>{

const recipes = ajaxGetRequest("/recipe/getAllRecipes")
    console.log(recipes)
    const getStatus = (ob) => {
        if (ob.status === "Active") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Active</p>';
        }
        if (ob.status === "InActive") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">InActive</p>';
        }
    };
    const displayProperty = [
        {dataType: "text", propertyName: "recipeCode"},
        {dataType: "text", propertyName: "recipeName"},
        {dataType: "function", propertyName: getStatus},
        {dataType: "button", propertyName: displayRecipe, btnName:`<i class="fa-solid fa-eye mx-2"></i> View Recipe`},
    ];
    if (recipeTableInstance) {
        recipeTableInstance.destroy();
    }
    $("#tableRecipe tbody").empty();
    tableDataBinder(
        tableRecipe,
        recipes,
        displayProperty,
        true,
        generateRecipeDropDown,
        getPrivilege
    )
    recipeTableInstance = $("#tableRecipe").DataTable({
        responsive: true,
        autoWidth: false,
    });

    receipeStatus = document.getElementById("add-recipe-status");
    receipeStatus.value = "Active";
    receipeStatus.disabled = true;
    


}

const reloadRecipeForm = () =>{

    refreshRecipeTable();
    let selectedIng;

    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients");

    let flavourList = ajaxGetRequest("/flavour/getAllFlavours");

    const ingSelectElement = document.getElementById("recipe-ing-code");
    ingSelectElement.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = 'Select Ingredient';
    ingSelectElement.appendChild(defaultOption);

    ingredientList.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.ingredientCode;
        option.textContent = `${ing.ingredientName} - ${ing.ingredientCode}`;
        ingSelectElement.appendChild(option);
    });

    ingSelectElement.addEventListener('change', (event)=>{
        const  unitType = document.getElementById('recipe-unitType');
        selectedIng = ingredientList.filter((i)=> i.ingredientCode === event.target.value)[0];
        let selectedUnit = selectedIng.unitType;
        document.getElementById('recipe-ing-name').value = selectedIng.ingredientName;
         document.getElementById('recipe-ing-name').disabled = true;
        console.log(selectedUnit);
        if(selectedUnit==="L") {
            unitType.value = "ML";
        } else if(selectedUnit==="KG") {
            unitType.value= "G";
        }
        unitType.disabled = true;
    })

    const flavourSelectElement = document.getElementById("add-recipe-flavour");
    flavourSelectElement.innerHTML = '<option value="" selected disabled>Select Flavour</option>';
    flavourList.forEach(flavour => {
        const option = document.createElement('option');
        option.value = flavour.id;
        option.textContent = flavour.name;
        flavourSelectElement.appendChild(option);   
    });
    document.getElementById('btnRecipeUpdate').disabled = true;





}

const formValidation = () =>{

     // Recipe Name validation (at least 2 characters)
     const addRecipeName = document.getElementById("add-recipe-name");
     addRecipeName.addEventListener('input', () => {
         validation(addRecipeName, '^[A-Z][a-z]{1,25}( [A-Z][a-z]{1,25}){0,4}?$', 'recipe', 'recipeName');
     });
 
     // Status validation (must be selected)
     const addRecipeStatus = document.getElementById("add-recipe-status");
     addRecipeStatus.addEventListener('change', () => {
         selectFieldValidator(addRecipeStatus, '', 'recipe', 'status');
     });
 
     // Ingredient Code validation (must be selected)
     const ingCode = document.getElementById("recipe-ing-code");
     ingCode.addEventListener('change', () => {
         selectFieldValidator(ingCode, '', 'recipe', 'ingredientCode');
     });
 
     // Ingredient Name is auto-filled, so no need to validate
 
     // Quantity validation (must be positive number)
     const ingQty = document.getElementById("recipe-quantity");
     ingQty.addEventListener('input', () => {
         validation(ingQty, '^[1-9]([0-9]{1,2})?$', 'recipe', 'qty');
     });
 
     // Unit Type validation (must be selected)
     const unitType = document.getElementById("recipe-unitType");
     unitType.addEventListener('change', () => {
         selectFieldValidator(unitType, '', 'recipe', 'unitType');
     });

     // Flavour validation
     const flavourSelect = document.getElementById("add-recipe-flavour");
     flavourSelect.addEventListener('change', () => {
         selectFieldValidator(flavourSelect, '', 'recipe', 'flavour');
     });
}

const checkRecipeMainFormError = () => {
    let errors = "";

    const recipeName = document.getElementById("add-recipe-name");
    const recipeStatus = document.getElementById("add-recipe-status");
    const flavourSelect = document.getElementById("add-recipe-flavour");

    if (!recipeName.value || recipeName.value.trim().length < 2) {
        errors += "Recipe name is required and must be at least 2 characters.\n";
        recipeName.classList.add('is-invalid');
    } else {
        recipeName.classList.remove('is-invalid');
        recipeName.classList.add('is-valid');
    }
    if(!flavourSelect.value){
        errors += "Flavour is required.\n";
        flavourSelect.classList.add('is-invalid');
    } else {
        flavourSelect.classList.remove('is-invalid');
        flavourSelect.classList.add('is-valid');
    }

    if (!recipeStatus.value) {
        errors += "Recipe status is required.\n";
        recipeStatus.classList.add('is-invalid');
    } else {
        recipeStatus.classList.remove('is-invalid');
        recipeStatus.classList.add('is-valid');
    }

    if (recipeItems.length === 0) {
        errors += "At least one ingredient must be added to the recipe.\n";
    }

    return errors;
};

function recipeSubmit() {
    event.preventDefault();

    if(recipeItems.length <3){
        Swal.fire({
            title: "Recipe Not Added",
            text: "Recipe must have at least 3 ingredients.",
            icon: "error"
        });
        return;
    }

    // Validate form
    const errors = checkRecipeMainFormError();
    if (errors !== "") {
        Swal.fire({
            title: "Recipe Not Added",
            html: errors.replace(/\n/g, "<br>"),
            icon: "error"
        });
        return;
    }

    // Prepare recipe object
    const recipe = {
        recipeName: document.getElementById("add-recipe-name").value,
        status: document.getElementById("add-recipe-status").value,
        flavourId: document.getElementById("add-recipe-flavour").value,
        recipeItems: recipeItems
    };

    console.log(recipe);

    // Send to backend
    let response = ajaxRequestBody("/recipe/addNewRecipe", "POST", recipe);
    if (response.status === 200) {
        Swal.fire({ title: "Recipe Added Successfully!", icon: "success" });
        refreshRecipeTable();
        $("#modalAddRecipe").modal('hide');
        resetAddRecipeForm();
    } else {
        Swal.fire({ title: "Error", text: response.responseText, icon: "error" });
    }
}

// const recipeFormRefill = (ob,rowIndex) = {

// }

function recipeUpdate() {
    event.preventDefault();

    // Validate form
    const errors = checkRecipeMainFormError();
    if (errors !== "") {
        Swal.fire({
            title: "Recipe Not Updated",
            html: errors.replace(/\n/g, "<br>"),
            icon: "error"
        });
        return;
    }

    // Update selectedRecipe with new values
    selectedRecipe.recipeName = document.getElementById("add-recipe-name").value;
    selectedRecipe.status = document.getElementById("add-recipe-status").value;
    selectedRecipe.recipeItems = recipeItems;

    // Check for updates
    let updates = checkRecipeUpdates();

    if (updates !== "") {
        Swal.fire({
            title: "Do you want to update this recipe?",
            html: updates,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#cb421a",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Update"
        }).then((result) => {
            if (result.isConfirmed) {
                let response = ajaxRequestBody("/recipe/updateRecipe", "PUT", selectedRecipe);
                if (response.status === 200) {
                    Swal.fire({
                        title: "Recipe updated successfully!",
                        icon: "success"
                    });
                    refreshRecipeTable();
                    $("#modalAddRecipe").modal('hide');
                    isEditMode = false;
                    editingRecipeCode = null;
                    resetAddRecipeForm();
                } else {
                    Swal.fire({
                        title: "Update Not Successful",
                        text: response.responseText,
                        icon: "error"
                    });
                }
            }
        });
    } else {
        $("#modalAddRecipe").modal('hide');
        Swal.fire({
            title: "No updates found.",
            icon: "question"
        });
    }
}

function resetAddRecipeForm() {
    // Clear input fields
    document.getElementById("add-recipe-name").value = "";
    document.getElementById("add-recipe-status").value = "Active";
    document.getElementById("recipe-ing-code").selectedIndex = 0;
    document.getElementById("recipe-ing-name").value = "";
    document.getElementById("recipe-quantity").value = "";
    document.getElementById("add-recipe-flavour").value = "";
    document.getElementById("recipe-unitType").selectedIndex = 0;

    // Remove validation classes
    [
        "add-recipe-name",
        "add-recipe-status",
        "add-recipe-flavour",
        "recipe-ing-code",
        "recipe-ing-name",
        "recipe-quantity",
        "recipe-unitType"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("is-valid", "is-invalid");
            el.style.border = ""; // Optional: reset border style
        }
    });

    // Clear ingredient items
    recipeItems = [];
    displayRecipeItems("recipe-items", recipeItems);

    // Disable Update, Enable Add
    document.getElementById('btnRecipeUpdate').disabled = true;
    document.getElementById('btnRecipeSubmit').disabled = false;
}

const checkRecipeFormError = () =>{
    let errors = "";

    const recipeName = document.getElementById("add-recipe-name");
    const ingCode = document.getElementById("recipe-ing-code");
    const ingName = document.getElementById("recipe-ing-name");
    const ingQty = document.getElementById("recipe-quantity");
    const unitType = document.getElementById("recipe-unitType");
    const flavourSelect = document.getElementById("add-recipe-flavour");


    //Check Recipe Name
    if (!recipeName.value || recipeName.value.trim().length < 2) {
        errors += "Recipe name is required and must be at least 2 characters.\n";
        recipeName.classList.add('is-invalid');
    } else {
        recipeName.classList.remove('is-invalid');
        recipeName.classList.add('is-valid');
    }

    //Check Flavour select
    if(!flavourSelect.value){
        errors += "Flavour is required.\n";
        flavourSelect.classList.add('is-invalid');
    } else {
        flavourSelect.classList.remove('is-invalid');
        flavourSelect.classList.add('is-valid');
    }

    // Ingredient Code
    if (!ingCode.value || ingCode.value === "Select Ingredient") {
        errors += "Please select an ingredient code.\n";
        ingCode.classList.add('is-invalid');
    } else {
        ingCode.classList.remove('is-invalid');
        ingCode.classList.add('is-valid');
    }

    // Ingredient Name (should be auto-filled, but check)
    if (!ingName.value) {
        errors += "Ingredient name is missing.\n";
        ingName.classList.add('is-invalid');
    } else {
        ingName.classList.remove('is-invalid');
        ingName.classList.add('is-valid');
    }

    // Quantity
    if (!ingQty.value || !/^[1-9][0-9]*$/.test(ingQty.value)) {
        errors += "Please enter a valid quantity (positive integer).\n";
        ingQty.classList.add('is-invalid');
    } else {
        ingQty.classList.remove('is-invalid');
        ingQty.classList.add('is-valid');
    }

    // Unit Type
    if (!unitType.value) {
        errors += "Please select a unit type.\n";
        unitType.classList.add('is-invalid');
    } else {
        unitType.classList.remove('is-invalid');
        unitType.classList.add('is-valid');
    }

    return errors;

}

const addRecipe = () => {

    const errors = checkRecipeFormError();

    if (errors) {
        Swal.fire({ title: "Ingredient Error", text: errors, icon: "error" });
        return; // Stop if validation fails
    }

    // Disable update button when adding new ingredient
    document.getElementById('btnRecipeUpdate').disabled = true;
    document.getElementById('btnRecipeSubmit').disabled = false;

    const ingredientCode = document.getElementById("recipe-ing-code").value;

    // Prevent duplicate ingredient
    const alreadyExists = recipeItems.some(item => item.ingredientCode === ingredientCode);
    if (alreadyExists) {
        Swal.fire({
            title: "Duplicate Ingredient",
            text: "This ingredient is already added to the recipe.",
            icon: "warning"
        });
        return;
    }

    const recipeItem = {
        ingredientCode: document.getElementById("recipe-ing-code").value,
        ingredientName: document.getElementById("recipe-ing-name").value,
        qty: parseInt(document.getElementById("recipe-quantity").value),
        unitType: document.getElementById("recipe-unitType").value,
    };
    const newRecipeItems = [...recipeItems, recipeItem];
    displayRecipeItems("recipe-items", newRecipeItems);
    recipeItems.push(recipeItem);

    // Optionally, reset ingredient fields after adding
    document.getElementById("recipe-ing-code").selectedIndex = 0;
    document.getElementById("recipe-ing-name").value = "";
    document.getElementById("recipe-quantity").value = "";
    document.getElementById("recipe-unitType").selectedIndex = 0;

    [
        "recipe-ing-code",
        "recipe-ing-name",
        "recipe-quantity",
        "recipe-unitType"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("is-valid", "is-invalid");
            el.style.border = ""; // Optional: reset border style
        }
    });

    // Ensure update button is disabled after adding
    document.getElementById('btnRecipeUpdate').disabled = true;
    document.getElementById('btnRecipeSubmit').disabled = false;
}

function checkRecipeUpdates() {
    let updates = "";

    if (!oldRecipe) return updates;

    if (selectedRecipe.recipeName !== oldRecipe.recipeName) {
        updates += `Recipe Name changed from <b>${oldRecipe.recipeName}</b> to <b>${selectedRecipe.recipeName}</b>.<br>`;
    }
    if (selectedRecipe.status !== oldRecipe.status) {
        updates += `Status changed from <b>${oldRecipe.status}</b> to <b>${selectedRecipe.status}</b>.<br>`;
    }
    // Compare ingredients (simple version: just compare stringified arrays)
    if (JSON.stringify(selectedRecipe.recipeItems) !== JSON.stringify(oldRecipe.recipeItems)) {
        updates += `Ingredients list has been changed.<br>`;
    }
    return updates;
}


const displayRecipeItems =(id,recipeItems)=>{
    document.getElementById(id).innerHTML=''
    recipeItems.forEach((recipe, index)=>{
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row mt-3 align-items-center';

        const indexDiv = document.createElement('div');
        indexDiv.className = 'col mx-3 d-flex justify-content-center';
        indexDiv.innerText = index+1;
        rowDiv.appendChild(indexDiv);

        const codeDiv = document.createElement('div');
        codeDiv.className = 'col';
        codeDiv.innerText = recipe.ingredientCode;
        rowDiv.appendChild(codeDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'col';
        nameDiv.innerText = recipe.ingredientName;
        rowDiv.appendChild(nameDiv);

        const quantityDiv = document.createElement('div');
        quantityDiv.className = 'col';
        quantityDiv.innerText = recipe.qty +" "+recipe.unitType ;
        rowDiv.appendChild(quantityDiv);

        const removeBtn = document.createElement('div');
        removeBtn.id="add-ing-remove-btn"
        removeBtn.style.cursor='pointer';
        removeBtn.innerHTML=`<i class="fa-solid fa-square-minus fa-lg " style="color: #e52731;"></i>`

        removeBtn.addEventListener('click',()=>{
            removeIng(id,index)
        })

        const btnDiv = document.createElement('div');
        btnDiv.className = 'col';
        btnDiv.appendChild(removeBtn)
        rowDiv.appendChild(btnDiv);

        document.getElementById(id).appendChild(rowDiv);
    })
}



const removeIng = (id,index)=>{
    recipeItems.splice(index,1)
    displayRecipeItems(id,recipeItems)
}


const generateRecipeDropDown = (element, index, privilegeOb = null) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: editRecipe,
            icon: "fa-solid fa-edit me-2",
            enabled: privilegeOb ? !!privilegeOb.update : true,
        },
        {
            name: "Delete",
            action: deleteRecipe,
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

const displayRecipe = (recipe) => {
    if (!recipe || !recipe.recipeCode) {
        console.error("displayRecipe called with invalid recipe:", recipe);
        Swal.fire({
            title: "Error",
            text: "Recipe data is missing or invalid.",
            icon: "error"
        });
        return;
    }

    const rCodeDiv = document.getElementById('recipe-code')
    rCodeDiv.innerText = `Recipe (${recipe.recipeCode})`

    const displayProperty = [
        {dataType: "text", propertyName: "ingredientCode"},
        {dataType: "text", propertyName: "ingredientName"},
        {dataType: "text", propertyName: "qty"},
        {dataType: "text", propertyName: "unitType"},
    ];
    if (recipeIngTableInstance) {
        recipeIngTableInstance.destroy();
    }
    $("#tableRecipeIng tbody").empty();
    tableDataBinder(
        tableRecipeIng,
        recipe.recipeItems,
        displayProperty,
        false,
        null,
        null
    )
    recipeIngTableInstance = $("#tableRecipeIng").DataTable({
        responsive: true,
        autoWidth: false,
        searching: false,
        ordering: false,
        paging: false,
        info: false,
    });
    $("#modalViewRecipe").modal('show');
}

function checkRecipeUpdates() {
    let updates = "";

    if (!oldRecipe) return updates;

    if (selectedRecipe.recipeName !== oldRecipe.recipeName) {
        updates += `Recipe Name changed from <b>${oldRecipe.recipeName}</b> to <b>${selectedRecipe.recipeName}</b>.<br>`;
    }
    if (selectedRecipe.status !== oldRecipe.status) {
        updates += `Status changed from <b>${oldRecipe.status}</b> to <b>${selectedRecipe.status}</b>.<br>`;
    }
    if (JSON.stringify(selectedRecipe.recipeItems) !== JSON.stringify(oldRecipe.recipeItems)) {
        updates += `Ingredients list has been changed.<br>`;
    }
    return updates;
}

const editRecipe = (recipe) => {
    isEditMode = true;
    editingRecipeCode = recipe.recipeCode;
    oldRecipe = JSON.parse(JSON.stringify(recipe));
    selectedRecipe = recipe;

    console.log(recipe)

    document.getElementById('modalTitleRec').innerText = `Edit Recipe`;

    document.getElementById('btnRecipeUpdate').disabled = false;
    document.getElementById('btnRecipeSubmit').disabled = true;

    // Enable/disable relevant fields
    document.getElementById('add-recipe-flavour').disabled = true;
    document.getElementById('add-recipe-status').disabled = false;
    document.getElementById('add-recipe-name').disabled = false;

    // Fill form fields
    document.getElementById('add-recipe-name').value = recipe.recipeName;
    document.getElementById('add-recipe-status').value = recipe.status;
    document.getElementById('add-recipe-flavour').value = recipe.flavour.id;

    // Remove validation classes and reset borders
    [
        "add-recipe-name",
        "add-recipe-status",
        "add-recipe-flavour",
        "recipe-ing-code",
        "recipe-ing-name",
        "recipe-quantity",
        "recipe-unitType"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove("is-valid", "is-invalid");
            el.style.border = "";
        }
    });

    // Fill ingredients and display
    recipeItems = [...recipe.recipeItems];
    displayRecipeItems("recipe-items", recipeItems);

    // Set ingredient dropdown and unit type if editing a specific ingredient (optional)
    // If you want to pre-fill ingredient fields for the first item:
    if (recipeItems.length > 0) {
        const firstIng = recipeItems[0];
        const ingSelect = document.getElementById('recipe-ing-code');
        if (ingSelect) ingSelect.value = firstIng.ingredientCode;
        const ingName = document.getElementById('recipe-ing-name');
        if (ingName) {
            ingName.value = firstIng.ingredientName;
            ingName.disabled = true;
        }
        const unitType = document.getElementById('recipe-unitType');
        if (unitType) {
            if (firstIng.unitType === "L") unitType.value = "ML";
            else if (firstIng.unitType === "KG") unitType.value = "G";
            else unitType.value = firstIng.unitType;
            unitType.disabled = true;
        }
    } else {
        // Reset ingredient fields if no items
        document.getElementById('recipe-ing-code').selectedIndex = 0;
        document.getElementById('recipe-ing-name').value = "";
        document.getElementById('recipe-quantity').value = "";
        document.getElementById('recipe-unitType').selectedIndex = 0;
    }

    // Change button text and enable/disable buttons
    document.querySelector('.btn-submit').innerHTML = '<i class="fa-solid fa-edit me-2"></i>Update';
    document.getElementById('btnRecipeUpdate').disabled = false;
    document.getElementById('btnRecipeSubmit').disabled = true;

    // Show modal
    $("#modalAddRecipe").modal('show');
};

const deleteRecipe = (recipe)=>{
    swal.fire({
        title: "Delete Recipe",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/recipe/deleteRecipe/${recipe.recipeCode}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                refreshRecipeTable();
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

$('#modalAddRecipe').on('hidden.bs.modal', function () {
    isEditMode = false;
    editingRecipeCode = null;
    resetAddRecipeForm();
});

function openAddRecipeForm() {
    resetAddRecipeForm();
    isEditMode = false;
    document.getElementById('btnRecipeUpdate').disabled = true;
    document.getElementById('btnRecipeSubmit').disabled = false;
    $("#modalAddRecipe").modal('show');
}