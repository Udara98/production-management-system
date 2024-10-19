let spTableInstance;
window.addEventListener('load', function () {
    reloadSPTable();
    let selectedPO;
    const grnList = ajaxGetRequest("/grn/getAllGRNs").filter((grn)=>grn.grnStatus === "Approved");
    const grnSelectElement = document.getElementById("add_sp_grn");

    grnList.forEach(po => {
        const option = document.createElement('option');
        option.value = po.id;
        option.textContent = po.grnNo;
        grnSelectElement.appendChild(option);
    });

    grnSelectElement.addEventListener('change', (event) => {
        const val = event.target.value;
        selectedPO = grnList.filter((po) => po.id === parseInt(val))[0];
        document.getElementById("add_sp_spId").value = selectedPO.purchaseOrder.supplierRegNo;
        document.getElementById("add_sp_ingId").value = selectedPO.purchaseOrder.ingredientCode;
        document.getElementById("add-sp-total").value = parseInt(selectedPO.purchaseOrder.totalPrice).toLocaleString("en-US", {
            style: "currency",
            currency: "LKR",
        });
    });
    document.getElementById("add-sp-paidAmount").addEventListener('change', (event) => {
        document.getElementById("add-sp-balanceAmount").value = (parseInt(event.target.value) - selectedPO.purchaseOrder.totalPrice).toLocaleString("en-US", {
            style: "currency",
            currency: "LKR",
        });
    });

    document.getElementById('spAddForm').onsubmit = function (event) {
        event.preventDefault();


        const payment = {
            goodReceiveNote: selectedPO,
            totalAmount: parseFloat(selectedPO.purchaseOrder.totalPrice),
            totalPaymentAmount: document.getElementById("add-sp-paidAmount").value,
            totalBalanceAmount: parseInt(document.getElementById("add-sp-paidAmount").value) - selectedPO.purchaseOrder.totalPrice,
            paymentDate: new Date(document.getElementById("add-sp-payDate").value),
            paymentMethod: document.getElementById("add-sp-paymentMethod").value,
        };

        let response = ajaxRequestBody("/supplier_payment/addNewSP", "POST", payment);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadSPTable()
            $("#modalSPAdd").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    };
});

const reloadSPTable = function () {
    let supplierPayments = ajaxGetRequest("/supplier_payment/getAllSP");
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");
    const getGRNNo=(ob)=>ob.goodReceiveNote.grnNo;

    const getPaymentMethod=(ob)=>{
        if (ob.paymentMethod === "VISA_CARD") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-brands fa-cc-visa fa-lg me-2" style="color: #194ca4;"></i><span>Visa Card</span></div> </div>';
        }
        if (ob.paymentMethod === "MASTER_CARD") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-brands fa-cc-mastercard fa-lg me-2" style="color: #ff4733;"></i><span>MASTER CARD</span></div> </div>';
        }
        if (ob.paymentMethod === "BANK_TRANSFER") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-bill-transfer fa-lg me-2" style="color: #6a9f5b;"></i><span>BANK TRANSFER</span></div> </div>';
        }
        if (ob.paymentMethod === "CASH") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-bill fa-lg me-2" style="color: #6a9f5b;"></i><span>CASH</span></div> </div>';
        }
        if (ob.paymentMethod === "CHEQUE") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-check fa-lg me-2" style="color: #ace1fb;"></i><span>CHEQUE</span></div> </div>';
        }
    }

    const displayProperty = [
        { dataType: "text", propertyName: "billNo" },
        { dataType: "function", propertyName: getGRNNo },
        { dataType: "price", propertyName: "totalAmount" },
        { dataType: "date", propertyName: "paymentDate" },
        { dataType: "function", propertyName: getPaymentMethod },
    ];

    if (spTableInstance) {
        spTableInstance.destroy();
    }
    $("#tableSP tbody").empty();
    tableDataBinder(
        tableSP,
        supplierPayments,
        displayProperty,
        false,
        generateSPDropDown,
        getPrivilege
    );
    spTableInstance = $("#tableSP").DataTable({
        responsive: true,
        autoWidth: false,

    });
};

const generateSPDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        { name: "Delete", action: deleteSP, icon: "fa-solid fa-trash me-2" },
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

const deleteSP=(sp)=>{

}