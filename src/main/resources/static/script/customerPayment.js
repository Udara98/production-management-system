let cusPaymentTableInstance;
window.addEventListener('load', () => {
    // Show/hide payment input sections based on payment method
    // const payMethSelect = document.getElementById('add-cp-payMeth');
    // if (payMethSelect) {
    //     payMethSelect.addEventListener('change', showPaymentOptionByMethod);
    //     // Call once on load to set initial state
    //     showPaymentOptionByMethod();
    // }
    reloadCustomerPaymentTable();
    // reloadCustomerPaymentForm();
    // formValidation();

    // 1. Populate customer dropdown
    const customerSelect = document.getElementById('add-cp-customer');
    const customerOrdersSection = document.getElementById('customer-orders-section');
    const orderTableBody = document.querySelector('#customerOrderPaymentTable tbody');
    customerSelect.innerHTML = '<option value="" selected>Select Customer</option>';
    let customers = ajaxGetRequest('/customer/getAllCustomers') || [];
    customers.filter(c => c.customerStatus === 'Active').forEach(c => {
        let opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.regNo + (c.companyName ? '  -  ' + c.companyName : c.firstName + ' ' + c.secondName);
        console.log(opt);
        customerSelect.appendChild(opt);
    });

    // Hide payment method and note fields by default
    const paymentMethodRow = document.getElementById('paymentMethodRow');
    const paymentNoteRow = document.getElementById('paymentNoteRow');
    if (paymentMethodRow) paymentMethodRow.style.display = 'none';
    if (paymentNoteRow) paymentNoteRow.style.display = 'none';

    // 2. On customer select, fetch and show unpaid orders
    customerSelect.addEventListener('change', function() {
        orderTableBody.innerHTML = '';
        customerOrdersSection.style.display = 'none';
        let customerId = this.value;

        if (!customerId) return;
        let orders = ajaxGetRequest(`/customerOrder/unpaid?customerId=${customerId}`) || [];
        if (orders.length > 0) {
            document.getElementById('noUnpaidOrdersAlert').classList.add('d-none');
            orders.forEach(order => {
        // Show/hide payment method and note fields
        if (paymentMethodRow) paymentMethodRow.style.display = customerId ? '' : 'none';
        if (paymentNoteRow) paymentNoteRow.style.display = customerId ? '' : 'none';
                let row = document.createElement('tr');
                row.setAttribute('data-order-id', order.id);
                row.innerHTML = `
      <td><input type="checkbox" class="order-checkbox"></td>
      <td>${order.orderNo}</td>
      <td>${order.invoiceNo || ''}</td>
      <td class="outstanding">${order.outstanding}</td>
      <td><input type="number" min="0" max="${order.outstanding}" class="pay-amount form-control" disabled></td>
      <td class="balance-cell">${order.outstanding}</td>
    `;
    orderTableBody.appendChild(row);
});
            customerOrdersSection.style.display = '';
        } else {
            document.getElementById('noUnpaidOrdersAlert').classList.remove('d-none');
            orderTableBody.innerHTML = '';
        }
    });

    // Enable/disable pay-amount input based on checkbox
    orderTableBody.addEventListener('change', function(e) {
        if (e.target.classList.contains('order-checkbox')) {
            let row = e.target.closest('tr');
            let payAmountInput = row.querySelector('.pay-amount');
            payAmountInput.disabled = !e.target.checked;
            if (!e.target.checked) {
                payAmountInput.value = '';
                row.querySelector('.balance-cell').textContent = row.querySelector('.outstanding').textContent;
            }
            updateTotalsSection();
        }
    });

    
    // Update balance on pay-amount input
    orderTableBody.addEventListener('input', function(e) {
        if (e.target.classList.contains('pay-amount')) {
            let row = e.target.closest('tr');
            let outstanding = parseFloat(row.querySelector('.outstanding').textContent) || 0;
            let payAmount = parseFloat(e.target.value) || 0;
            if (payAmount > outstanding) {
                e.target.value = outstanding;
                payAmount = outstanding;
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Amount',
                    text: 'Pay amount cannot exceed outstanding amount.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            let balance = outstanding - payAmount;
            row.querySelector('.balance-cell').textContent = balance >= 0 ? balance : outstanding;
            updateTotalsSection();
        }
    });

    // Update totals when checkboxes change
    orderTableBody.addEventListener('change', function(e) {
        if (e.target.classList.contains('order-checkbox')) {
            updateTotalsSection();
        }
    });

    // Update totals when Pay All Outstanding is toggled
    document.getElementById('payAllOutstandingCheckbox').addEventListener('change', function() {
        updateTotalsSection();
    });

    function updateTotalsSection() {
        let totalPayable = 0;
        let totalPaid = 0;
        let remainingBalance = 0;
        orderTableBody.querySelectorAll('tr').forEach(row => {
            let outstanding = parseFloat(row.querySelector('.outstanding').textContent) || 0;
            let payAmount = parseFloat(row.querySelector('.pay-amount').value) || 0;
            let checked = row.querySelector('.order-checkbox').checked;
            if (checked) {
                totalPayable += outstanding;
                totalPaid += payAmount;
                remainingBalance += (outstanding - payAmount);
            }
        });
        document.getElementById('totalPayable').value = totalPayable.toFixed(2);
        document.getElementById('totalPaid').value = totalPaid.toFixed(2);
        document.getElementById('remainingBalance').value = remainingBalance.toFixed(2);
    }

    // Pay All Outstanding checkbox logic
    document.getElementById('payAllOutstandingCheckbox').addEventListener('change', function() {
        let checked = this.checked;
        orderTableBody.querySelectorAll('tr').forEach(row => {
            let checkbox = row.querySelector('.order-checkbox');
            let payAmountInput = row.querySelector('.pay-amount');
            let outstanding = parseFloat(row.querySelector('.outstanding').textContent) || 0;
            checkbox.checked = checked;
            payAmountInput.disabled = !checked;
            if (checked) {
                payAmountInput.value = outstanding;
                row.querySelector('.balance-cell').textContent = 0;
            } else {
                payAmountInput.value = '';
                row.querySelector('.balance-cell').textContent = outstanding;
            }
        });
        updateTotalsSection();
    });

    // 3. On form submit, collect payment details and submit as DTO
    document.getElementById('add-cp-submit').onclick = function(event) {
        event.preventDefault();

        // Collect payment details from table
        let paymentDetails = [];
        let totalAmount = 0;
        let balanceSum = 0;
        document.querySelectorAll('#customerOrderPaymentTable tbody tr').forEach(row => {
            if (row.querySelector('.order-checkbox').checked) {
                let orderId = row.getAttribute('data-order-id');
                let payAmount = parseFloat(row.querySelector('.pay-amount').value) || 0;
                let outstanding = parseFloat(row.querySelector('.outstanding').textContent) || 0;
                let balance = parseFloat(row.querySelector('.balance-cell').textContent) || (outstanding - payAmount);
                if (payAmount > 0 && payAmount <= outstanding) {
                    paymentDetails.push({
                        orderId: Number(orderId),
                        paidAmount: payAmount,
                        balance: balance
                    });
                    totalAmount += payAmount;
                    balanceSum += balance;
                }
            }
        });

        if (paymentDetails.length === 0) {
            Swal.fire({ title: "Error", text: "Please select the customer to add payment", icon: "error" });
            return;
        }

        // Determine transferid based on visible input for selected payment method
        let transferid = '';
        const paymentMethod = document.getElementById('add-cp-payMeth').value;
        if (paymentMethod === 'BANK_TRANSFER') {
            transferid = document.getElementById('inputBankTranferId')?.value || '';
        } else if (paymentMethod === 'CHEQUE') {
            transferid = document.getElementById('inputChequeNo')?.value || '';
        } else if (paymentMethod === 'VISA_CARD' || paymentMethod === 'MASTER_CARD') {
            transferid = document.getElementById('inputCardRefNo')?.value || '';
        }

        // Add paymentDate if present and visible
        let paymentDate = null;
        const paymentDateRow = document.getElementById('paymentDateRow');
        const paymentDateInput = document.getElementById('add-cp-payDate');
        if (paymentDateRow && !paymentDateRow.classList.contains('d-none') && paymentDateInput && paymentDateInput.value) {
            paymentDate = paymentDateInput.value;
        }

        let paymentStatus = document.getElementById('add-cp-payStatus')?.value || '';
        let dto = {
            payAmount: totalAmount,
            paidAmount:totalAmount,
            balance: balanceSum,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            transferid: transferid,
            note: document.getElementById('addCusPayNote').value,
            paymentDetails: paymentDetails,
            paymentDate: paymentDate
        };

        // Validate paymentDate for CASH method
        if (paymentMethod === 'CASH' && !paymentDate) {
            Swal.fire({ title: "Error", text: "Please select a payment date for CASH payments.", icon: "error" });
            return;
        }

        console.log(dto);

        let response = ajaxRequestBody("/cusPayment", "POST", dto);
        if (response.status === 200) {
            console.log(response);
          
            
            swal.fire({
                title: response.responseText.responseText,
                icon: "success",
            });
            // Robust form and modal reset (like employee.js)
            const formCP = document.getElementById('CPAddForm');
            if(formCP) formCP.reset();
            reloadCustomerPaymentTable();
            // customerPaymentFormRefill();
            // Remove validation classes
            document.querySelectorAll('#CPAddForm input, #CPAddForm select, #CPAddForm textarea').forEach((input) => {
                input.classList.remove('is-valid', 'is-invalid');
            });
            formCP.classList.remove('was-validated');
            $("#modalAddCusPayment").modal("hide");

            if (response.responseText.paymentId) {
                window.open('/cusPayment/receipt/' + response.responseText.paymentId, '_blank');
            }

            // Clear the order products table (tableOPs)
            if (OrderProductsTableInstance) {
                OrderProductsTableInstance.clear().draw();
            }
            $("#tableOPs tbody").empty();

          
            if (document.getElementById('tot-amount')) {
                document.getElementById('tot-amount').innerHTML = '';
            }
            // Clear orderProducts array if present
            if (typeof orderProducts !== 'undefined') {
                orderProducts.length = 0;
            }

        } else {
            swal.fire({
                title: "Something Went Wrong",
                html: response.responseText,
                icon: "error",
            });
        }

        // $.ajax({
        //     url: '/cusPayment',
        //     type: 'POST',
        //     contentType: 'application/json',
        //     data: JSON.stringify(dto),
        //     success: function(response) {
        //         // If backend returns payment ID, open receipt
        //         if (response && response.paymentId) {
        //             window.open('/cusPayment/receipt/' + response.paymentId, '_blank');
        //             Swal.fire({ title: "Success", text: "Payment Made Successfully", icon: "success" });
        //         } else {
        //             Swal.fire({ title: "Success", text: response, icon: "success" });
        //         }
        //         reloadCustomerPaymentTable();
        //         document.getElementById('CPAddForm').reset();
        //         // Clear the orders table body
        //         document.querySelector('#customerOrderPaymentTable tbody').innerHTML = '';
        //         // Optionally reset totals fields if present
        //         if (document.getElementById('totalPayable')) document.getElementById('totalPayable').value = '';
        //         if (document.getElementById('totalPaid')) document.getElementById('totalPaid').value = '';
        //         if (document.getElementById('remainingBalance')) document.getElementById('remainingBalance').value = '';
        //         $('#modalAddCusPayment').modal('hide');
        //     },
        //     error: function(xhr) {
        //         Swal.fire({ title: "Error", text: xhr.responseText, icon: "error" });
        //     }

            
        // });

        reloadCustomerPaymentTable();
        document.getElementById('CPAddForm').reset();
        $('#modalAddCusPayment').modal('hide');
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

const printCustomerPayment = (element) => {
    window.open(`/cusPayment/receipt/${element.id}`);
};

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


//Reload CustomerPayment form
// const reloadCustomerPaymentForm = () =>{

//     customerPayment = new Object();
//     oldCustomerPayment = null;

//     //Get all products
//     const cusOrders = ajaxGetRequest("/customerOrder/unpaidCustomerOrders")

//     const orderSelect = document.getElementById('add-cp-ord')


//    fillDataIntoSelect(
//        orderSelect,
//        "Select Order",
//        cusOrders,
//        "orderNo",
//  );







const formValidation = () =>{

    const addCpOrd = document.getElementById('add-cp-ord')

    addCpOrd.addEventListener('change', () => {
        DynamicSelectValidation(addCpOrd, 'customerPayment', 'order');
    });

    const addCpInv = document.getElementById('add-cp-inv')

    addCpInv.addEventListener('keyup',  () => {
            validation(addCpInv, '', 'customerPayment', 'receiptNo');
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

            const inputPaymentDate = document.getElementById('add-cp-payDate')
            inputPaymentDate.addEventListener('keyup',  () => {
                dateFeildValidator(inputPaymentDate,'','customerPayment','paymentDate')
            });






}


const reloadCustomerPaymentTable = () => {
    const cusPayments = ajaxGetRequest('/cusPayment/getAllCusPayments')
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getOrderNO = (ob) => {
        if (!ob.paymentDetails || ob.paymentDetails.length === 0) return "-";
        return ob.paymentDetails.map(pd => pd.order?.orderNo || "-").join(", ");
    }
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
        {dataType: "text", propertyName: "receiptNo"},
        {dataType: "function", propertyName: getOrderNO},
        {dataType: "date", propertyName: "paymentDate"},
        {dataType: "price", propertyName: "payAmount"},
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
        {name: "Print", action: printCustomerPayment, icon: "fa-solid fa-print me-2"},
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


// Show payment options according to selected payment method - ex- show bank transfer/card/cheque option
const showPaymentOptionByMethod =  () => {
    const paymentMthd = document.getElementById('add-cp-payMeth').value;
    // Hide all payment method rows initially
    if (typeof bankTranferDivRow !== 'undefined') bankTranferDivRow.classList.add('d-none');
    if (typeof chequeDivRow !== 'undefined') chequeDivRow.classList.add('d-none');
    if (typeof cardDivRow !== 'undefined') cardDivRow.classList.add('d-none');
    // Show row depending on method
    if (paymentMthd === 'BANK_TRANSFER') {
        if (typeof bankTranferDivRow !== 'undefined') bankTranferDivRow.classList.remove('d-none');
    } else if (paymentMthd === 'CHEQUE') {
        if (typeof chequeDivRow !== 'undefined') chequeDivRow.classList.remove('d-none');
    } else if (paymentMthd === 'VISA_CARD' || paymentMthd === 'MASTER_CARD') {
        if (typeof cardDivRow !== 'undefined') cardDivRow.classList.remove('d-none');
    }
    // Show payment date only for CASH
    const paymentDateRow = document.getElementById('paymentDateRow');
    if (paymentDateRow) {
        if (paymentMthd === 'CASH') {
            paymentDateRow.classList.remove('d-none');
        } else {
            paymentDateRow.classList.add('d-none');
        }
    }
};
//             paymentStatusCol.classList.replace('col-4', 'col-6'); // Revert back to original size if needed
//         }

// // Show the appropriate row based on payment method
// if (paymentMthd === 'BANK_TRANSFER') {
//     bankTranferDivRow.classList.remove('d-none');
// } else if (paymentMthd === 'CHEQUE') {
//     chequeDivRow.classList.remove('d-none');
// } else if (paymentMthd === 'VISA_CARD' || paymentMthd === 'MASTER_CARD') {
//     cardDivRow.classList.remove('d-none');
// }


// }

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
                    text: "Do you want to add the Customer Payment " + customerPayment.receiptNo + "?",
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

    if (customerPayment.receiptNo == null) {
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
