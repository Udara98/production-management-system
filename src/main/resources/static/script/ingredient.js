let currentIngredient = {};
let tableIngredientInstance;

window.addEventListener("load", () => {
    getAllIngredients();
});

document.getElementById('ingredientAddForm').onsubmit = function (event) {
    event.preventDefault();

    const ingredient = {
        ingredientCode: document.getElementById('ingredientCode').value,
        ingredientName: document.getElementById('ingredientName').value,
        note: document.getElementById('note').value,
        quantity: parseInt(document.getElementById('quantity').value, 10),
        unitType: document.getElementById('unitType').value,
        rop: parseInt(document.getElementById('rop').value, 10),
        roq: parseInt(document.getElementById('roq').value, 10),
    };

    let response = ajaxRequestBody("/ingredient/addNewIngredient", "POST", ingredient);
    if (response.status === 200) {
        swal.fire({
            title: response.responseText,
            icon: "success"
        });
        $("#modelIngredientAdd").modal('hide');
        getAllIngredients();
    } else {
        swal.fire({
            title: "Something Went Wrong",
            text: response.responseText,
            icon: "error"
        });
    }
};

const getAllIngredients = () => {
    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");
    console.log(ingredientList);

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

    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/EMPLOYEE");

    // Destroy the existing DataTable instance if it exists
    if (tableIngredientInstance) {
        tableIngredientInstance.destroy();
    }

    // Clear the table content
    $('#tableIngredient tbody').empty();

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
};

const generateDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "Edit", action: editIngredient, icon: "fa-solid fa-edit me-2"},
        {name: "Delete", action: deleteIngredient, icon: "fa-solid fa-trash me-2"},
    ];
    if (element.ingredientStatus !== "InStock") {
        buttonList.push({name: "Send Quotation Request", action: sendQuotationRequest, icon: "fa-solid fa-file-lines me-2"});
    }
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
        text: "Are you sure, you want to delete this?",
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