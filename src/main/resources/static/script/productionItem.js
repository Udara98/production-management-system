let productionItemTableInstance;
let selectedPI;
let totalCost;
const flavours = ajaxGetRequest("/flavour/getAllFlavours");
const packageTypes = ajaxGetRequest("/packageType/getAllPackageTypes")
const recipes = ajaxGetRequest("/recipe/getAllRecipes").filter((r) => r.status === "Active");
window.addEventListener('load', () => {
    reloadPITable();

    const flavourSelectElement = document.getElementById("add_pi_flavourId");
    const ptSelectElement = document.getElementById("add_pi_ptId");
    const recipeSelectElement = document.getElementById("add_pi_recipeId");

    flavours.forEach(flavour => {
        const option = document.createElement('option');
        option.value = flavour.id;
        option.textContent = flavour.name;
        flavourSelectElement.appendChild(option);
    });

    packageTypes.forEach(pt => {
        const option = document.createElement('option');
        option.value = pt.id;
        option.textContent = pt.name;
        ptSelectElement.appendChild(option);
    });

    recipes.forEach(rec => {
        const option = document.createElement('option');
        option.value = rec.recipeCode;
        option.textContent = rec.recipeCode;
        recipeSelectElement.appendChild(option);
    });

    document.getElementById("piAddForm").onsubmit = function (event) {
        event.preventDefault();

        const productionItem = {
            productionItemName: document.getElementById("add-pi-name").value,
            flavourId: document.getElementById("add_pi_flavourId").value,
            packageTypeId: document.getElementById("add_pi_ptId").value,
            recipeCode: document.getElementById("add_pi_recipeId").value,
            status: document.getElementById("add-pi-status").value,
        }

        let response = ajaxRequestBody("/productionItem/addNewPI", "POST", productionItem);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadPITable();
            $("#modalAddPI").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
    document.getElementById('piEditForm').onsubmit = function (event) {
        event.preventDefault();

        selectedPI.productionItemName = document.getElementById('edit-pi-name').value;
        selectedPI.flavourId = document.getElementById('edit_pi_flavourId').value;
        selectedPI.packageTypeId = document.getElementById('edit_pi_ptId').value;
        selectedPI.recipeCode = document.getElementById('edit_pi_recipeId').value;
        selectedPI.status = document.getElementById('edit-pi-status').value;

        let response = ajaxRequestBody("/productionItem/updatePI", "PUT", selectedPI);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadPITable();
            $("#modalEditPI").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }

    }
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
const reloadPITable = () => {
    const productionItems = ajaxGetRequest("/productionItem/getAllPIs")
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
const generatePIDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: editPI,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deletePI, icon: "fa-solid fa-trash me-2"},

    ];

    if (element.status === 'Active') {
        buttonList.push({name: "Make a New Batch", action: makeNewBatch, icon: "fa-solid fa-hands-holding-circle me-2"})
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

const editPI = (pi) => {

    selectedPI = pi
    const flavourSelectElement = document.getElementById("edit_pi_flavourId");
    const ptSelectElement = document.getElementById("edit_pi_ptId");
    const recipeSelectElement = document.getElementById("edit_pi_recipeId");
    flavourSelectElement.innerHTML=''
    ptSelectElement.innerHTML=''
    recipeSelectElement.innerHTML=''
    flavours.forEach(flavour => {
        const option = document.createElement('option');
        option.value = flavour.id;
        option.textContent = `${flavour.name} (${flavour.id})` ;
        flavourSelectElement.appendChild(option);
    });

    packageTypes.forEach(pt => {
        const option = document.createElement('option');
        option.value = pt.id;
        option.textContent = `${pt.name} (${pt.id})`;
        ptSelectElement.appendChild(option);
    });

    recipes.forEach(rec => {
        const option = document.createElement('option');
        option.value = rec.recipeCode;
        option.textContent = rec.recipeCode;
        recipeSelectElement.appendChild(option);
    });

    document.getElementById('edit-pi-name').value = pi.productionItemName;
    document.getElementById('edit_pi_flavourId').value = pi.flavourId;
    document.getElementById('edit_pi_ptId').value = pi.packageTypeId;
    document.getElementById('edit_pi_recipeId').value = pi.recipeCode;
    document.getElementById('edit-pi-status').value = pi.status;

    $("#modalEditPI").modal("show");

}

const deletePI = (pi) => {
    swal.fire({
        title: "Delete Production Item",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/productionItem/deletePI/${pi.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadPITable();
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