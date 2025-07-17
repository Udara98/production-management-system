let purchaseOrderTableInstance;
let selectedPO;
window.addEventListener("load", function () {
    reloadPOTable();

//    document.getElementById("purchaseOrderEditForm").onsubmit = function (event) {
//        event.preventDefault();
//        const total = selectedPO.pricePerUnit * parseInt(document.getElementById("edit-po-qty").value)
//        selectedPO.qty = document.getElementById("edit-po-qty").value;
//        selectedPO.totalPrice = total;
//        selectedPO.requiredDate = new Date(document.getElementById("edit-po-reqDate").value);
//        selectedPO.notes = document.getElementById("edit-po-note").value;
//        selectedPO.purchaseOrderStatus = document.getElementById("edit-po-status").value;
//
//        let response = ajaxRequestBody("/purchaseOrder/updatePurchaseOrder", "PUT", selectedPO);
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            reloadPOTable();
//            $("#modalPOEdit").modal("hide");
//
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//    }

})

//Declare function to refresh the table
const reloadPOTable =  () => {
    const purchaseOrders = ajaxGetRequest("/purchaseOrder/getAllPurchaseOrders");
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getStatus = (ob) => {
        if (ob.purchaseOrderStatus === "Pending") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Pending</p>';
        }
        if (ob.purchaseOrderStatus === "Canceled") {
            return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">Canceled</p>';
        }
        if (ob.purchaseOrderStatus === "Completed") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Completed </p>';
        }
        if (ob.purchaseOrderStatus === "Overdue") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">Overdue</p>';
        }
    };
    const getOrderDate = (ob) => ob.orderDate || '-';
    const displayProperty = [
        {dataType: "text", propertyName: "purchaseOrderNo"},
        {dataType: "text", propertyName: "quotationNo"},
        {dataType: "text", propertyName: "orderedDate"}, // Order Date column
        {dataType: "price", propertyName: "totalPrice"},
        {dataType: "date", propertyName: "proposedDeliveryDate"}, // Changed from requiredDate
        {dataType: "function", propertyName: getStatus},
    ];

    if (purchaseOrderTableInstance) {
        purchaseOrderTableInstance.destroy();
    }
    $("#tablePOs tbody").empty();
    tableDataBinder(
        tablePOs,
        purchaseOrders,
        displayProperty,
        true,
        generatePODropDown,
        getPrivilege
    )
    purchaseOrderTableInstance = $("#tablePOs").DataTable()
}

//Define the function to generate the dropdown
const generatePODropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "View", action: viewPO, icon: "fa-solid fa-eye me-2"},
        {
            name: "Edit",
            action: editPO,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deletePO, icon: "fa-solid fa-trash me-2"},

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

//Define function to view PO
const viewPO = function (purchaseOrder) {
    $("#modalViewPO").modal('show');
    document.getElementById('purchaseOrderNo').textContent = 'Purchase Order: ' + purchaseOrder.purchaseOrderNo;
    document.getElementById('quotationNo').textContent = purchaseOrder.quotationNo;
    document.getElementById('ingredientCode').textContent = purchaseOrder.ingredientCode;
    document.getElementById('supplierRegNo').textContent = purchaseOrder.supplierRegNo;
    document.getElementById('pricePerUnit').textContent = purchaseOrder.pricePerUnit.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });
    document.getElementById('qty').textContent = purchaseOrder.qty;
    document.getElementById('totalPrice').textContent = purchaseOrder.totalPrice.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });
    document.getElementById('requiredDate').textContent = purchaseOrder.requiredDate;
    document.getElementById('notes').textContent = purchaseOrder.notes;
    document.getElementById('purchaseOrderStatus').textContent = purchaseOrder.purchaseOrderStatus;
}
const editPO = function (purchaseOrder) {
    selectedPO = purchaseOrder;
    $("#modalPOEdit").modal('show');
    document.getElementById("edit-po-qno").value = purchaseOrder.quotationNo;
    document.getElementById("edit-po-ingId").value = purchaseOrder.ingredientCode;
    document.getElementById("edit-po-supId").value = purchaseOrder.supplierRegNo;
    document.getElementById("edit-po-pricePerUnit").value = purchaseOrder.pricePerUnit.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });
    document.getElementById("edit-po-qty").value = purchaseOrder.qty;
    document.getElementById("edit-po-total").value = purchaseOrder.totalPrice;
    document.getElementById("edit-po-reqDate").value = convertDateTimeToDate(purchaseOrder.requiredDate);
    document.getElementById("edit-po-status").value = purchaseOrder.purchaseOrderStatus;
    document.getElementById("edit-po-note").value = purchaseOrder.notes;

}

//Define function to Delete PO
const deletePO = function (purchaseOrder) {
    swal.fire({
        title: "Delete Purchase Order",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/purchaseOrder/deletePurchaseOrder/${purchaseOrder.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadPOTable();
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