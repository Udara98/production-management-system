let grnTableInstance;
let selectedGRN;
window.addEventListener('load', () => {
    reloadGRN()
    let selectedPO;
    const purchaseOrders = ajaxGetRequest("/purchaseOrder/getAllPurchaseOrders").filter((po) => po.purchaseOrderStatus === 'Pending');
    const poSelectElement = document.getElementById("add_grn_poNo");

    purchaseOrders.forEach(po => {
        const option = document.createElement('option');
        option.value = po.purchaseOrderNo;
        option.textContent = po.purchaseOrderNo;
        poSelectElement.appendChild(option);
    });
    poSelectElement.addEventListener('change', (event) => {
        const val = event.target.value;
        selectedPO = purchaseOrders.filter((po) => po.purchaseOrderNo === val)[0];
        document.getElementById("add-grn-tot").value = parseInt(selectedPO.totalPrice).toLocaleString("en-US", {
            style: "currency",
            currency: "LKR",
        });
    });

    document.getElementById('grnAddForm').onsubmit = function (event) {
        event.preventDefault();
        const grn = {
            purchaseOrder: selectedPO,
            totalAmount: selectedPO.totalPrice,
            grnStatus: document.getElementById('add-grn-status').value,
            receivedDate: new Date(document.getElementById('add-grn-recDate').value)
        }

        let response = ajaxRequestBody("/grn/addNewGRN", "POST", grn);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadGRN()
            $("#modalGRNAdd").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
    document.getElementById('grnEditForm').onsubmit = function (event){
        event.preventDefault();

        selectedGRN.receivedDate = new Date(document.getElementById('edit-grn-recDate').value);
        selectedGRN.grnStatus = document.getElementById('edit-grn-status').value

        let response = ajaxRequestBody("/grn/updateGRN", "PUT", selectedGRN);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadGRN()
            $("#modalGRNEdit").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
})

const reloadGRN = () => {
    const grnList = ajaxGetRequest("/grn/getAllGRNs")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getPONo = (ob) => ob.purchaseOrder.purchaseOrderNo;
    const getStatus = (ob) => {
        if (ob.grnStatus === "Pending") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Pending</p>';
        }
        if (ob.grnStatus === "Approved") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Approved</p>';
        }
        if (ob.grnStatus === "Rejected") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">Rejected</p>';
        }
        if (ob.grnStatus === "Closed") {
            return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">Closed</p>';
        }
    };
    const displayProperty = [
        {dataType: "text", propertyName: "grnNo"},
        {dataType: "function", propertyName: getPONo},
        {dataType: "price", propertyName: "totalAmount"},
        {dataType: "date", propertyName: "receivedDate"},
        {dataType: "function", propertyName: getStatus},
    ];

    if (grnTableInstance) {
        grnTableInstance.destroy();
    }
    $("#tableGRN tbody").empty();
    tableDataBinder(
        tableGRN,
        grnList,
        displayProperty,
        true,
        generateGRNDropDown,
        getPrivilege
    )
    grnTableInstance = $("#tableGRN").DataTable({
        responsive: true,
        autoWidth: false,
    })

}

const generateGRNDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: editGRN,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deleteGRN, icon: "fa-solid fa-trash me-2"},

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

const editGRN = (grn) => {
    selectedGRN = grn;
    document.getElementById('edit_grn_poNo').value = grn.purchaseOrder.purchaseOrderNo;
    document.getElementById('edit-grn-status').value = grn.grnStatus;
    document.getElementById('edit-grn-tot').value = grn.purchaseOrder.totalPrice.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });
    document.getElementById('edit-grn-recDate').value = convertDateTimeToDate(grn.receivedDate);

    $("#modalGRNEdit").modal("show");
}
const deleteGRN = (grn) => {
    swal.fire({
        title: "Delete GRN",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/grn/deleteGrn/${grn.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadGRN();
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