let batchTableInstance;
let selectedBatch;
let oldBatch;

window.addEventListener('load',()=>{
    reloadBatchTable()
    document.getElementById('updateBatchForm').onsubmit = productionBatchUpdate;
})

const reloadBatchTable=()=>{

    const batchList = ajaxGetRequest("/batch/getAllBatches")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getStatus = (ob) => {
        if (ob.batchStatus === "InProduction") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 150px">InProduction</p>';
        }
        if (ob.batchStatus === "ProductionDone") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 150px">ProductionDone</p>';
        }

    };
    const displayProperty = [
        {dataType: "text", propertyName: "batchNo"},
        {dataType: "text", propertyName: "recipeCode"},
        {dataType: "text", propertyName: "recipeName"},
        {dataType: "date", propertyName: "manufactureDate"},
        {dataType: "date", propertyName: "expireDate"},
        {dataType: "text", propertyName: "availableQuantity"},
        {dataType: "text", propertyName: "damagedQuantity"},
        {dataType: "function", propertyName: getStatus},
    ];
    if (batchTableInstance) {
        batchTableInstance.destroy();
    }
    $("#tablePB tbody").empty();
    tableDataBinder(
        tablePB,
        batchList,
        displayProperty,
        true,
        generateBatchDropDown,
        getPrivilege
    )
    batchTableInstance = $("#tablePB").DataTable({
        responsive: true,
        autoWidth: false,
    })
}
const generateBatchDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: editBatch,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deleteBatch, icon: "fa-solid fa-trash me-2"},

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

const editBatch = (batch) => {
    selectedBatch = batch;
    oldBatch = JSON.parse(JSON.stringify(batch));
    selectedBatch = batch;
    const totalQuantity = batch.availableQuantity + batch.damagedQuantity; // Store total quantity

    document.getElementById('edit-bt-mnf').value = convertDateTimeToDate(batch.manufactureDate);
    document.getElementById('edit-bt-exp').value = convertDateTimeToDate(batch.expireDate);
    document.getElementById('edit-bt-status').value = batch.batchStatus;
    document.getElementById('edit-bt-dmg').value = batch.damagedQuantity;
    document.getElementById('edit-bt-avb').value = batch.availableQuantity;
    document.getElementById('edit-bt-total').value = parseInt(batch.totalCost).toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });
    document.getElementById('edit-bt-note').value = batch.note;

    // Make all fields except status, damaged quantity, and note read-only/disabled
    document.getElementById('edit-bt-mnf').setAttribute('disabled', true);
    document.getElementById('edit-bt-exp').setAttribute('disabled', true);
    document.getElementById('edit-bt-dmg').removeAttribute('disabled');
    document.getElementById('edit-bt-avb').setAttribute('disabled', true);
    document.getElementById('edit-bt-total').setAttribute('disabled', true);
    document.getElementById('edit-bt-note').removeAttribute('disabled');
    document.getElementById('edit-bt-status').removeAttribute('disabled');

    // Set min and max for damaged quantity input
    const dmgInput = document.getElementById('edit-bt-dmg');
    dmgInput.setAttribute('min', '0');
    dmgInput.setAttribute('max', totalQuantity);

    // Update available quantity in real time when damaged quantity changes
    dmgInput.oninput = function() {
        let dmg = parseFloat(this.value);
        
        // Validate input
        if (isNaN(dmg) || dmg < 0) {
            dmg = 0;
            this.value = 0;
            swal.fire({
                title: "Invalid Input",
                text: "Damaged quantity cannot be negative",
                icon: "warning"
            });
        } else if (dmg > totalQuantity) {
            dmg = totalQuantity;
            this.value = totalQuantity;
            swal.fire({
                title: "Invalid Input",
                text: "Damaged quantity cannot exceed total quantity of " + totalQuantity,
                icon: "warning"
            });
        }

        // Update available quantity
        document.getElementById('edit-bt-avb').value = totalQuantity - dmg;
    };

    $("#modalEditPB").modal("show");
};

const deleteBatch = (batch)=>{
    swal.fire({
        title: "Delete Batch",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/batch/deleteBatch/${batch.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadBatchTable();
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

// Function to check updates for production batch
const checkProductionBatchUpdates = () => {
    let updates = "";
    if (!selectedBatch || !oldBatch) return updates;
    if (selectedBatch.batchStatus !== oldBatch.batchStatus) {
        updates += `Batch Status changed from <b>${oldBatch.batchStatus}</b> to <b>${selectedBatch.batchStatus}</b>.<br>`;
    }
    if (selectedBatch.damagedQuantity !== oldBatch.damagedQuantity) {
        updates += `Damaged Quantity changed from <b>${oldBatch.damagedQuantity}</b> to <b>${selectedBatch.damagedQuantity}</b>.<br>`;
    }
    if (selectedBatch.note !== oldBatch.note) {
        updates += `Note changed.<br>`;
    }
    return updates;
};

// Function to update production batch
function productionBatchUpdate(event) {
    event.preventDefault();
    // Save old batch for comparison
    if (!window.oldBatch) {
        window.oldBatch = JSON.parse(JSON.stringify(selectedBatch));
    }
    // Validate damaged quantity
    const dmgQty = parseFloat(document.getElementById('edit-bt-dmg').value);
    const totalQty = oldBatch.availableQuantity + oldBatch.damagedQuantity;
    if (isNaN(dmgQty) || dmgQty < 0) {
        swal.fire({
            title: "Invalid Input",
            text: "Damaged quantity cannot be negative",
            icon: "error"
        });
        return;
    }
    if (dmgQty > totalQty) {
        swal.fire({
            title: "Invalid Input",
            text: "Damaged quantity cannot exceed total quantity of " + totalQty,
            icon: "error"
        });
        return;
    }
    // Update selectedBatch with new values
    selectedBatch.batchStatus = document.getElementById('edit-bt-status').value;
    selectedBatch.damagedQuantity = dmgQty;
    selectedBatch.availableQuantity = totalQty - dmgQty;
    selectedBatch.note = document.getElementById('edit-bt-note').value;
    // Check for updates
    let updates = checkProductionBatchUpdates();
    if (updates !== "") {
        swal.fire({
            title: "Do you want to update this batch?",
            html: updates,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#cb421a",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Update"
        }).then((result) => {
            if (result.isConfirmed) {
                let response = ajaxRequestBody("/batch/updateBatch", "PUT", selectedBatch);
                if (response.status === 200) {
                    swal.fire({
                        title: "Batch updated successfully!",
                        icon: "success"
                    });
                    reloadBatchTable();
                    $("#modalEditPB").modal('hide');
                    window.oldBatch = null;
                } else {
                    swal.fire({
                        title: "Update Not Successful",
                        text: response.responseText,
                        icon: "error"
                    });
                }
            }
        });
    } else {
        $("#modalEditPB").modal('hide');
        swal.fire({
            title: "No updates found.",
            icon: "question"
        });
    }
}