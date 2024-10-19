let quotationTableInstance;
let selectedQuotation;

window.addEventListener("load", function () {
    reloadQuotationTable();
    const qRequests = ajaxGetRequest("/quotation-request/getAllRequests");
    const qrnSelectElement = document.getElementById("qRequest_no");
    const supIdSelectElement = document.getElementById("quo-supId");

    qRequests.forEach(req => {
        const option = document.createElement('option');
        option.value = req.requestNo;
        option.textContent = req.requestNo;
        qrnSelectElement.appendChild(option);
    });

    qrnSelectElement.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        const request = qRequests.filter((r) => r.requestNo === selectedValue)[0];
        document.getElementById("quo-ingId").value = request.ingCode;
        supIdSelectElement.innerHTML = '';
        request.suppliers.forEach((sup) => {
            const option = document.createElement('option');
            option.value = sup;
            option.textContent = sup;
            supIdSelectElement.appendChild(option);
        });
    });

    const forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    document.getElementById("quotationAddForm").onsubmit = function (event) {
        event.preventDefault();
        if (this.checkValidity() === false) {
            event.stopPropagation();
        } else {
            const quotation = {
                quotationRequestNo: document.getElementById("qRequest_no").value,
                ingredientCode: document.getElementById("quo-ingId").value,
                supplierRegNo: document.getElementById("quo-supId").value,
                pricePerUnit: parseFloat(document.getElementById("add-pricePerUnit").value),
                receivedDate: new Date(document.getElementById("add-receivedDate").value),
                deadline: new Date(document.getElementById("add-deadline").value),
                quotationStatus: document.getElementById("add-quotationStatus").value,
            };
            let response = ajaxRequestBody("/quotation/addNewQuotation", "POST", quotation);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success",
                });
                reloadQuotationTable();
                $("#modalQuotationAdd").modal("hide");
            } else {
                swal.fire({
                    title: "Something Went Wrong",
                    text: response.responseText,
                    icon: "error",
                });
            }
        }
    };

    document.getElementById("quotationEditForm").onsubmit = function (event) {
        event.preventDefault();

        selectedQuotation.quotationRequestNo = document.getElementById("edit-qRequest_no").value;
        selectedQuotation.ingredientCode = document.getElementById("edit-quo-ingId").value;
        selectedQuotation.supplierRegNo = document.getElementById("edit-quo-supId").value;
        selectedQuotation.pricePerUnit = parseFloat(document.getElementById("edit-pricePerUnit").value);
        selectedQuotation.receivedDate = new Date(document.getElementById("edit-receivedDate").value);
        selectedQuotation.deadline = new Date(document.getElementById("edit-deadline").value);
        selectedQuotation.quotationStatus = document.getElementById("edit-quotationStatus").value;

        let response = ajaxRequestBody("/quotation/editQuotation", "PUT", selectedQuotation);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadQuotationTable();
            $("#modalQuotationEdit").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    };

    document.getElementById("purchaseOrderAddForm").onsubmit = function (event) {
        event.preventDefault();

        const total = selectedQuotation.pricePerUnit * parseInt(document.getElementById("add-po-qty").value)
        const purchaseOrder = {
            quotationNo: document.getElementById("add-po-qno").value,
            ingredientCode: document.getElementById("add-po-ingId").value,
            supplierRegNo: document.getElementById("add-po-supId").value,
            pricePerUnit: selectedQuotation.pricePerUnit,
            qty: document.getElementById("add-po-qty").value,
            totalPrice: total,
            requiredDate: new Date(document.getElementById("add-po-reqDate").value),
            notes: document.getElementById("add-po-note").value,
            purchaseOrderStatus: document.getElementById("add-po-status").value,
        }

        let response = ajaxRequestBody("/purchaseOrder/addNewPurchaseOrder", "POST", purchaseOrder);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            $("#modalSendPurchaseOrder").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",

            })
        }
    }
});

const reloadQuotationTable = function () {
    const quotations = ajaxGetRequest("/quotation/getAllQuotations");
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getStatus = (ob) => {
        if (ob.quotationStatus === "Accepted") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Accepted</p>';
        }
        if (ob.quotationStatus === "Pending") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Pending</p>';
        }
        if (ob.quotationStatus === "Rejected") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">Rejected</p>';
        }
        if (ob.quotationStatus === "Closed") {
            return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">Closed/p>';
        }
    };
    const displayProperty = [
        {dataType: "text", propertyName: "quotationNo"},
        {dataType: "text", propertyName: "quotationRequestNo"},
        {dataType: "text", propertyName: "ingredientCode"},
        {dataType: "text", propertyName: "supplierRegNo"},
        {dataType: "price", propertyName: "pricePerUnit"},
        {dataType: "date", propertyName: "receivedDate"},
        {dataType: "date", propertyName: "deadline"},
        {dataType: "function", propertyName: getStatus},
    ];

    if (quotationTableInstance) {
        quotationTableInstance.destroy();
    }
    $("#tableQuotations tbody").empty();
    tableDataBinder(
        tableQuotations,
        quotations,
        displayProperty,
        true,
        generateQuotationDropDown,
        getPrivilege
    );
    quotationTableInstance = $("#tableQuotations").DataTable();
};

const generateQuotationDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "Delete", action: deleteQuotation, icon: "fa-solid fa-trash me-2"},
    ];
    if (element.quotationStatus !== "Closed") {
        buttonList.push({
            name: "Edit",
            action: editQuotation,
            icon: "fa-solid fa-edit me-2",
        })
    }

    if (element.quotationStatus === "Accepted") {
        buttonList.push({
            name: "Send Perches Order",
            action: sendPerchesOrder,
            icon: "fa-solid fa-basket-shopping me-2"
        })
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

const editQuotation = (quotation) => {
    selectedQuotation = quotation;

    document.getElementById("edit-qRequest_no").value = quotation.quotationRequestNo;
    document.getElementById("edit-quo-ingId").value = quotation.ingredientCode;
    document.getElementById("edit-quo-supId").value = quotation.supplierRegNo;
    document.getElementById("edit-receivedDate").value = convertDateTimeToDate(quotation.receivedDate);
    document.getElementById("edit-deadline").value = convertDateTimeToDate(quotation.deadline);
    document.getElementById("edit-pricePerUnit").value = quotation.pricePerUnit;
    document.getElementById("edit-quotationStatus").value = quotation.quotationStatus;

    $("#modalQuotationEdit").modal("show");
};

const deleteQuotation = (quotation) => {
    swal.fire({
        title: "Delete Quotation",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/quotation/deleteQuotation/${quotation.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadQuotationTable();
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
const sendPerchesOrder = (quotation) => {
    selectedQuotation = quotation;
    $("#modalSendPurchaseOrder").modal("show");
    document.getElementById("add-po-qno").value = quotation.quotationNo;
    document.getElementById("add-po-ingId").value = quotation.ingredientCode;
    document.getElementById("add-po-supId").value = quotation.supplierRegNo;
    document.getElementById("add-po-pricePerUnit").value = quotation.pricePerUnit.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    });

}
document.getElementById("add-po-qty").addEventListener('change', (event) => {
    const total = selectedQuotation.pricePerUnit * parseInt(event.target.value);
    document.getElementById("add-po-total").value = total.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    })
})