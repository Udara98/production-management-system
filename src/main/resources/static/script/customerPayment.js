let cusPaymentTableInstance;
window.addEventListener('load', () => {

    reloadCustomerPaymentTable();

    reloadCustomerPaymentForm();




    let selectedOrder;
    const cusOrders = ajaxGetRequest("/customerOrder/getAllCustomerOrders")
    const orderSelect = document.getElementById('add-cp-ord')

//    cusOrders.forEach(ord => {
//        const option = document.createElement('option');
//        option.value = ord.id;
//        option.textContent = ord.orderNo;
//        orderSelect.appendChild(option);
//    });
//    orderSelect.addEventListener('change', (event) => {
//        selectedOrder = cusOrders.filter((o) => o.id === parseInt(event.target.value))[0]
//        document.getElementById('add-cp-tot').value = selectedOrder.totalAmount.toLocaleString("en-US", {
//            style: "currency",
//            currency: "LKR",
//        });
//    })

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

const fillDataIntoTotal = () =>{

        const orderId = document.getElementById("add-cp-ord").value;
        const Orders = JSON.parse(orderId)
        console.log(Orders.totalAmount);


}

//Reload product form
const reloadCustomerPaymentForm = () =>{

    customerPayment = new Object();
    oldCustomerPayment = null;

    //Get all products
    const cusOrders = ajaxGetRequest("/customerOrder/unpaidCustomerOrders")

    const orderSelect = document.getElementById('add-cp-ord')


   fillDataIntoSelect(
       orderSelect,
       "Select Order",
       cusOrders,
       "orderNo",
 );




}

const reloadCustomerPaymentTable = () => {
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


// show payment options according to selected payment method - ex- show bank transfer option
const showPaymentOptionByMethod =  () => {
    inputTranferId.value = '';     // when payment changes from check to transfer , still might have a value in check
    inputTransferredDateTime.value = '';
    inputChequeDate.value = '';
    inputChequeNo.value = '';
//    customerPayment.transferid = null;
//    customerPayment.transferreddatetime = null;
//    customerPayment.checkno = null;
//    customerPayment.checkdate = null;


 const paymentMthd = document.getElementById('add-cp-payMeth').value;

// Hide all payment method rows initially
bankTranferDivRow.classList.add('d-none');
chequeDivRow.classList.add('d-none');
cardDivRow.classList.add('d-none');

// Show the appropriate row based on payment method
if (paymentMthd === 'BANK_TRANSFER') {
    bankTranferDivRow.classList.remove('d-none');
} else if (paymentMthd === 'CHEQUE') {
    chequeDivRow.classList.remove('d-none');
} else if (paymentMthd === 'VISA_CARD' || paymentMthd === 'MASTER_CARD') {
    cardDivRow.classList.remove('d-none');
}


}


//Declare function for fill balance fields
const calculateAdvancePayBalance =  () => {
    // calculate balance when paid amount enter

//        if (new RegExp(/^[1-9][0-9]{0,5}([.][0-9]{2})?$/).test(add-cp-pa.value) && (parseFloat(add-cp-pa.value) < parseFloat(add-cp-tot.value))) {
//            customerPayment.paidamount = inputPaidAmount.value;
//            customerPayment.classList.remove('is-invalid');
//            add-cp-pa.classList.add('is-valid');
//
//            add-cp-balance.value = (parseFloat(add-cp-tot.value) - parseFloat(add-cp-pa.value)).toFixed(2);
//            customerPayment.balance = add-cp-balance.value;
//            add-cp-balance.classList.remove('is-invalid');
//            add-cp-balance.classList.add('is-valid');
//        } else {
//            customerPayment.paidamount = null;
//            add-cp-pa.classList.remove('is-valid');
//            add-cp-pa.classList.add('is-invalid');
//
//            add-cp-balance.value = '';
//            customerPayment.balance = null;
//            add-cp-balance.classList.remove('is-invalid');
//            add-cp-balance.classList.remove('is-valid');
//        }



}