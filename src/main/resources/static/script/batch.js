 let batchTableInstance;
let selectedBatch;
window.addEventListener('load',()=>{
    reloadBatchTable()

    document.getElementById('updateBatchForm').onsubmit=function (event){
        event.preventDefault();

        selectedBatch.manufactureDate = new Date(document.getElementById('edit-bt-mnf').value)
        selectedBatch.expireDate = new Date(document.getElementById('edit-bt-exp').value)
        selectedBatch.batchStatus=document.getElementById('edit-bt-status').value;
        selectedBatch.damagedQuantity=parseFloat(document.getElementById('edit-bt-dmg').value);
        selectedBatch.availableQuantity=parseFloat(document.getElementById('edit-bt-avb').value);
        selectedBatch.note=document.getElementById('edit-bt-note').value;

        let response = ajaxRequestBody("/batch/updateBatch", "PUT", selectedBatch);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadBatchTable();
            $("#modalEditPB").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }

})

const reloadBatchTable=()=>{

    const batchList = ajaxGetRequest("/batch/getAllBatches")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getStatus = (ob) => {
        if (ob.batchStatus === "InProduction") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">InProduction</p>';
        }
        if (ob.batchStatus === "ProductionDone") {
            return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">ProductionDone</p>';
        }

    };
    const displayProperty = [
        {dataType: "text", propertyName: "batchNo"},
        {dataType: "text", propertyName: "productionItemNo"},
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

const editBatch = (batch)=>{

    selectedBatch = batch;
    document.getElementById('edit-bt-mnf').value = convertDateTimeToDate(batch.manufactureDate)
    document.getElementById('edit-bt-exp').value = convertDateTimeToDate(batch.expireDate)
    document.getElementById('edit-bt-status').value = batch.batchStatus
    document.getElementById('edit-bt-dmg').value = batch.damagedQuantity
    document.getElementById('edit-bt-avb').value = batch.availableQuantity
    document.getElementById('edit-bt-total').value = parseInt(batch.totalCost).toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });
    document.getElementById('edit-bt-note').value = batch.note;

    document.getElementById('edit-bt-dmg').addEventListener('change',(event)=>{
        document.getElementById('edit-bt-avb').value = parseFloat(batch.availableQuantity)-parseFloat(event.target.value);

    })

    $("#modalEditPB").modal("show");

}

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