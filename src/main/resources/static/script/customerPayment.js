let cusPaymentTableInstance;
window.addEventListener('load', () => {
    reloadCusPayments()
    let selectedOrder;
    const cusOrders = ajaxGetRequest("/customerOrder/getAllCustomerOrders")
    const orderSelect = document.getElementById('add-cp-ord')

    cusOrders.forEach(ord => {
        const option = document.createElement('option');
        option.value = ord.id;
        option.textContent = ord.orderNo;
        orderSelect.appendChild(option);
    });
    orderSelect.addEventListener('change', (event) => {
        selectedOrder = cusOrders.filter((o) => o.id === parseInt(event.target.value))[0]
        document.getElementById('add-cp-tot').value = selectedOrder.totalAmount.toLocaleString("en-US", {
            style: "currency",
            currency: "LKR",
        });
    })

    document.getElementById('CPAddForm').onsubmit = function (event) {
        event.preventDefault();

        const payment = {
            invoiceNo: `INV-${document.getElementById("add-cp-inv").value}`,
            order: selectedOrder,
            paymentDate: new Date(document.getElementById("add-cp-payDate").value),
            totalAmount: selectedOrder.totalAmount,
            paymentStatus: document.getElementById('add-cp-status').value,
            paymentMethod: document.getElementById('add-cp-payMeth').value
        }

        let response = ajaxRequestBody("/cusPayment/addNewCusPayment", "POST", payment);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadCusPayments();
            $("#modalAddCusPayment").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
})

const reloadCusPayments = () => {
    const cusPayments = ajaxGetRequest('/cusPayment/getAllCusPayments')
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getOrderNO=(ob)=>ob.order.orderNo
    const getPaymentMethod = (ob) => {
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
    };

    const displayProperty = [
        {dataType: "text", propertyName: "invoiceNo"},
        {dataType: "function", propertyName: getOrderNO},
        {dataType: "date", propertyName: "paymentDate"},
        {dataType: "price", propertyName: "totalAmount"},
        {dataType: "function", propertyName:  getPaymentMethod},
    ];
    if (cusPaymentTableInstance) {
        cusPaymentTableInstance.destroy();
    }
    $("#tableCusPayments tbody").empty();
    tableDataBinder(
        tableCusPayments,
        cusPayments,
        displayProperty,
        true,
        generateCPDropDown,
        getPrivilege
    );
    cusPaymentTableInstance = $("#tableCusPayments").DataTable({
        responsive: true,
        autoWidth: false,
    });
}
const generateCPDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "Delete", action: null, icon: "fa-solid fa-trash me-2"},
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