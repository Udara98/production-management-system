let cusPaymentTableInstance;
window.addEventListener('load', () => {

    reloadCustomerPaymentTable();

    reloadCustomerPaymentForm();

     //Call function for validation
     formValidation();


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

        document.getElementById("add-cp-pa").value = "";
        document.getElementById("add-cp-balance").value = "";


        const order = document.getElementById("add-cp-ord").value;
        const orderId = JSON.parse(order).id

        latestCusPayment = ajaxGetRequest("/cusPayment/latest-completed?orderid=" + orderId);

         if(latestCusPayment){
         document.getElementById("add-cp-tot-label").textContent = "Previous Balance";
         document.getElementById("add-cp-tot").value = latestCusPayment.balance;
         customerPayment.totalAmount = latestCusPayment.totalAmount;
         document.getElementById("add-cp-tot").classList.add('is-valid');


         }else{
         document.getElementById("add-cp-tot-label").textContent = "Total Amount";
         document.getElementById("add-cp-tot").value = JSON.parse(order).totalAmount;
         document.getElementById("add-cp-tot").classList.add('is-valid');
         customerPayment.totalAmount = JSON.parse(order).totalAmount;

         }


}

const calculateAdvancePayBalance = () => {
    const addCpPa = document.getElementById("add-cp-pa");
    const addCpTot = document.getElementById("add-cp-tot");
    const addCpBalance = document.getElementById("add-cp-balance");

    // calculate balance when pay amount entered
    if (new RegExp(/^[1-9][0-9]{0,5}([.][0-9]{2})?$/).test(addCpPa.value) && (parseFloat(addCpPa.value) < parseFloat(addCpTot.value))) {

        customerPayment.payAmount =parseFloat(addCpPa.value);
        // Validating the input
        addCpPa.classList.remove('is-invalid');
        addCpPa.classList.add('is-valid');

        // Calculating the balance
        addCpBalance.value = (parseFloat(addCpTot.value) - parseFloat(addCpPa.value)).toFixed(2);
        customerPayment.balance =addCpBalance.value;
        // Validating the balance input
        addCpBalance.classList.remove('is-invalid');
        addCpBalance.classList.add('is-valid');
    } else {
        // Invalid input handling
        addCpPa.classList.remove('is-valid');
        addCpPa.classList.add('is-invalid');

        // Clear balance if invalid
        addCpBalance.value = '';

        // Remove validation classes for balance input
        addCpBalance.classList.remove('is-invalid');
        addCpBalance.classList.remove('is-valid');
    }
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



const formValidation = () =>{

    const addCpOrd = document.getElementById('add-cp-ord')

    addCpOrd.addEventListener('change', () => {
        DynamicSelectValidation(addCpOrd, 'customerPayment', 'order');
    });

    const addCpInv = document.getElementById('add-cp-inv')

    addCpInv.addEventListener('keyup',  () => {
            validation(addCpInv, '', 'customerPayment', 'invoiceNo');
    });

    const addCpPayMeth = document.getElementById('add-cp-payMeth')

    addCpPayMeth.addEventListener('change', () =>{
        selectFieldValidator(addCpPayMeth,'','customerPayment','paymentMethod')
        });

    const addCPayDate = document.getElementById('add-cp-payDate')

    addCPayDate.addEventListener('change', () =>{
    dateFeildValidator(addCPayDate,'','customerPayment','paymentDate')
    })

    //Total value added in fillDataIntoTotal function
    //Balance and PayAmount added in calculateAdvancePayBalance


    const addCpStatus = document.getElementById('add-cp-status')

    addCpStatus.addEventListener('change', () =>{
            selectFieldValidator(addCpStatus,'','customerPayment','paymentStatus')
    });

    const addCusPayNote = document.getElementById('addCusPayNote')
    addCusPayNote.addEventListener('keyup',  () => {
                validation(addCusPayNote, '', 'customerPayment', 'note');
    });



    const inputCardRefNo = document.getElementById('inputCardRefNo')
        inputCardRefNo.addEventListener('keyup',  () => {
                    validation(inputCardRefNo, '', 'customerPayment', 'transferid');
    });

    const inputChequeNo = document.getElementById('inputChequeNo')
            inputChequeNo.addEventListener('keyup',  () => {
                        validation(inputChequeNo, '', 'customerPayment', 'transferid');
    });

    const inputTransferId = document.getElementById('inputChequeNo')
            inputTransferId.addEventListener('keyup',  () => {
                        validation(inputBankTranferId, '', 'customerPayment', 'transferid');
        });


    const inputBankTransferredDateTime = document.getElementById('inputBankTransferredDateTime')
            inputBankTransferredDateTime.addEventListener('keyup',  () => {
                     dateFeildValidator(inputBankTransferredDateTime,'','customerPayment','paymentDate')
        });

    const inputChequeDate = document.getElementById('inputChequeDate')
                inputChequeDate.addEventListener('keyup',  () => {
                         dateFeildValidator(inputChequeDate,'','customerPayment','paymentDate')
            });

    const inputCardDate = document.getElementById('inputCardDate')
                inputBankTransferredDateTime.addEventListener('keyup',  () => {
                         dateFeildValidator(inputCardDate,'','customerPayment','paymentDate')
            });






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
    inputBankTranferId.value = '';     // when payment changes from check to transfer , still might have a value in check
    inputChequeNo.value = '';
    inputCardRefNo.value = '';
    inputBankTransferredDateTime.value = '';
    inputChequeDate.value = '';
    inputCardDate.value = '';
//    customerPayment.transferid = null;
//    customerPayment.transferreddatetime = null;
//    customerPayment.checkno = null;
//    customerPayment.checkdate = null;


 const paymentMthd = document.getElementById('add-cp-payMeth').value;

// Hide all payment method rows initially
bankTranferDivRow.classList.add('d-none');
chequeDivRow.classList.add('d-none');
cardDivRow.classList.add('d-none');

// Check if payment method is not "CASH"
        if (paymentMthd !== 'CASH') {
            console.log("Not Cash")
            paymentDateCol.classList.add('d-none');
            paymentStatusCol.classList.replace('col-6', 'col-4'); // Adjusting from col-6 to col-4 if needed
        } else {
            console.log("Cash")
            paymentDateCol.classList.remove('d-none');
            paymentStatusCol.classList.replace('col-4', 'col-6'); // Revert back to original size if needed
        }

// Show the appropriate row based on payment method
if (paymentMthd === 'BANK_TRANSFER') {
    bankTranferDivRow.classList.remove('d-none');
} else if (paymentMthd === 'CHEQUE') {
    chequeDivRow.classList.remove('d-none');
} else if (paymentMthd === 'VISA_CARD' || paymentMthd === 'MASTER_CARD') {
    cardDivRow.classList.remove('d-none');
}


}

//Declare product submit function
const customerPaymentSubmit = () => {
            event.preventDefault();
            console.log("Customer payment Submit");
            console.log(customerPayment);

            // 1. Check form errors
            const errors = checkCustomerFormError();

            if (errors === "") {
                Swal.fire({
                    title: "Are you sure?",
                    text: "Do you want to add the Customer Payment " + customerPayment.invoiceNo + "?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#E11D48",
                    cancelButtonColor: "#3f3f44",
                    confirmButtonText: "Yes, Add"
                }).then((result) => {
                    if (result.isConfirmed) {
                        const postServiceRequestResponse = ajaxRequestBody("/cusPayment", "POST", customerPayment);

                        // Check backend response
                        if (postServiceRequestResponse.status === 200) {
                            $("#modalAddCusPayment").modal('hide');
                            CPAddForm.reset();
                            reloadCustomerPaymentTable();
                            reloadCustomerPaymentForm();

                            // Reset validation classes
                            Array.from(CPAddForm.elements).forEach((field) => {
                                field.classList.remove('is-valid', 'is-invalid');
                            });

                            Swal.fire({
                                title: "Payment Added Successfully!",
                                icon: "success"
                            });

                        } else {
                            console.error(postServiceRequestResponse);
                            Swal.fire({
                                title: "Error",
                                text: postServiceRequestResponse.responseText,
                                icon: "error"
                            });
                        }
                    }
                });
            } else {
                Swal.fire({
                    title: "Payment Not Added",
                    text: errors,
                    icon: "error"
                });
            }
        };

//Check product form errors
const checkCustomerFormError = () => {
    let errors = '';

    if (customerPayment.invoiceNo == null) {
            errors = errors + "invoice No can't be null \n";
            add-cp-inv.classList.add('is-invalid')
        }

    if (customerPayment.order == null) {
        errors = errors + "Order can't be null \n";
        addProductBatch.classList.add('is-invalid')
    }

    if (customerPayment.paymentMethod == null) {
        errors = errors + " Payment Method can't be null \n";
        add-cp-payMeth.classList.add('is-invalid')
    }


    if (customerPayment.totalAmount == null) {
        errors = errors + "Please Enter Total Amount \n";
        add-cp-tot.classList.add('is-invalid')
    }


    if (customerPayment.balance == null) {
        errors = errors + "Balance can't be null \n";
        add-cp-balance.classList.add('is-invalid')
    }


    if (customerPayment.paymentStatus == null) {
        errors = errors + "Please Select the Payment Status \n";
            add-cp-status.classList.add('is-invalid');
    }

    if (customerPayment.paymentMethod !== 'CASH') {


    if (customerPayment.transferid == null) {
                errors = errors + "Transfer ID can't be null \n";
                inputChequeNo.classList.add('is-invalid');
                inputCardRefNo.classList.add('is-invalid')
                inputBankTranferId.classList.add('is-invalid')
            }
    }

    if (customerPayment.paymentDate == null) {
                errors = errors + "Payment Date Can't be null \n";
                inputCardDate.classList.add('is-invalid');
                inputChequeDate.classList.add('is-invalid');
                inputBankTransferredDateTime.classList.add('is-invalid');
            }


    return errors;
}
