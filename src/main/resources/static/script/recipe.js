let recipeTableInstance;
let recipeItems=[]
let recipeIngTableInstance;
let selectedRecipe;
window.addEventListener('load', function (){
    reloadRecipes();
    let selectedIng;

    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients");

    const ingSelectElement = document.getElementById("recipe-ing-code");

    ingredientList.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.ingredientCode;
        option.textContent = ing.ingredientCode;
        ingSelectElement.appendChild(option);
    });

    ingSelectElement.addEventListener('change', (event)=>{
        selectedIng = ingredientList.filter((i)=> i.ingredientCode === event.target.value)[0];
        document.getElementById('recipe-ing-name').value = selectedIng.ingredientName
    })
    document.getElementById('recipe-add-btn').addEventListener('click',()=>{
        const recipeItem ={
            ingredientCode:document.getElementById("recipe-ing-code").value,
            ingredientName:document.getElementById("recipe-ing-name").value,
            qty:parseInt(document.getElementById("recipe-quantity").value),
            unitType:document.getElementById("recipe-unitType").value,
        }
        const newRecipeItems = [...recipeItems, recipeItem]
        displayRecipeItems("recipe-items",newRecipeItems)
        recipeItems.push(recipeItem)
    })



    document.getElementById('recipeAddForm').onsubmit=function (event){
        event.preventDefault()
        const recipe = {
            recipeName:document.getElementById("add-recipe-name").value,
            status:document.getElementById("add-recipe-status").value,
            recipeItems:recipeItems
        }

        let response = ajaxRequestBody("/recipe/addNewRecipe", "POST", recipe);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success"
            });
            reloadRecipes();
            $("#modalAddRecipe").modal('hide');

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error"
            });
        }
    }

    document.getElementById('recipeEditForm').onsubmit=function (event){
        event.preventDefault()

        selectedRecipe.recipeName = document.getElementById('edit-recipe-name').value
        selectedRecipe.status = document.getElementById('edit-recipe-status').value
        selectedRecipe.recipeItems = recipeItems

        let response = ajaxRequestBody("/recipe/updateRecipe", "PUT", selectedRecipe);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success"
            });
            reloadRecipes();
            $("#modalEditRecipe").modal('hide');

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error"
            });
        }
    }

})
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

const reloadRecipes =function (){
    const recipes = ajaxGetRequest("/recipe/getAllRecipes")
    console.log(recipes)
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");
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
}

const generateRecipeDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: editRecipe,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deleteRecipe, icon: "fa-solid fa-trash me-2"},

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
const displayRecipe = (recipe)=>{

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

const editRecipe = (recipe) => {
    document.getElementById('edit-recipe-items').innerHTML = '';
    document.getElementById('edit-recipe-name').value = recipe.recipeName;
    document.getElementById('edit-recipe-status').value = recipe.status;

    let selectedIng;
    selectedRecipe = recipe;
    recipeItems = [];
    recipeItems = recipe.recipeItems;
    displayRecipeItems("edit-recipe-items", recipe.recipeItems);

    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients");

    const ingSelectElement = document.getElementById("edit-recipe-ing-code");
    ingSelectElement.innerHTML=''
    ingredientList.forEach(ing => {
        const option = document.createElement('option');
        option.value = ing.ingredientCode;
        option.textContent = ing.ingredientCode;
        ingSelectElement.appendChild(option);
    });

    ingSelectElement.addEventListener('change', (event) => {
        selectedIng = ingredientList.filter((i) => i.ingredientCode === event.target.value)[0];
        document.getElementById('edit-recipe-ing-name').value = selectedIng.ingredientName;
    });

    document.getElementById('edit-recipe-add-btn').addEventListener('click', () => {
        const ingredientCode = document.getElementById("edit-recipe-ing-code").value;
        const existingItem = recipeItems.find(item => item.ingredientCode === ingredientCode);

        if (existingItem) {

        } else {
            const recipeItem = {
                ingredientCode: document.getElementById("edit-recipe-ing-code").value,
                ingredientName: document.getElementById("edit-recipe-ing-name").value,
                qty: parseInt(document.getElementById("edit-recipe-quantity").value),
                unitType: document.getElementById("edit-recipe-unitType").value,
            };
            recipeItems.push(recipeItem);
            displayRecipeItems("edit-recipe-items", recipeItems);
        }
    });

    $("#modalEditRecipe").modal('show');
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
                reloadRecipes();
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