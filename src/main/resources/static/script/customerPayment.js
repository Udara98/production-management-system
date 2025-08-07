// Global variable declarations
let cusPaymentTableInstance;
let minDateStr;
let paymentDateInput;
let cardDateInput;
let chequeDateInput;
let bankTransferredDateInput;
let payMethSelect;
let inputChequeNo;
let totalPaidInput;
let inputCardRefNo;
let inputBankRefNo;
let customerSelect;
let customerOrdersSection;
let orderTableBody;
let customers;
let paymentMethodRow;
let paymentNoteRow;
let paymentStatusSelect;
let customerPaymentDummy;

window.addEventListener('DOMContentLoaded', () => {
    // Define all functions first to avoid reference errors
    const reloadCustomerPaymentTable = () => {
        const cusPayments = ajaxGetRequest('/cusPayment/getAllCusPayments');
        let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/CUSTOMER_PAYMENT");

        const getOrderNO = (ob) => {
            if (!ob.paymentDetails || ob.paymentDetails.length === 0) return "-";
            return ob.paymentDetails.map(pd => pd.order?.orderNo || "-").join(", ");
        };

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
            { dataType: "text", propertyName: "receiptNo" },
            { dataType: "function", propertyName: getOrderNO },
            { dataType: "date", propertyName: "paymentDate" },
            { dataType: "price", propertyName: "payAmount" },
            { dataType: "function", propertyName: getPaymentMethod },
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
    };

    const generateCPDropDown = (element, index, privilegeOb = null) => {
        const dropdownMenu = document.createElement("ul");
        dropdownMenu.className = "dropdown-menu";

        const buttonList = [
            {
                name: "Print",
                action: printCustomerPayment,
                icon: "fa-solid fa-print me-2",
                enabled: privilegeOb ? !!privilegeOb.select : true,
            },
        ];

        buttonList.forEach((button) => {
            const buttonElement = document.createElement("button");
            buttonElement.className = "dropdown-item btn";
            buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
            buttonElement.type = "button";
            buttonElement.disabled = !button.enabled;
            if (!button.enabled) {
                buttonElement.style.cursor = "not-allowed";
                buttonElement.classList.add("text-muted");
            }
            buttonElement.onclick = function() {
                if (button.enabled) {
                    button.action(element, index);
                }
            };
            const li = document.createElement("li");
            li.appendChild(buttonElement);
            dropdownMenu.appendChild(li);
        });

        return dropdownMenu;
    };

    const printCustomerPayment = (element) => {
        window.open(`/cusPayment/receipt/${element.id}`);
    };

    const formValidation = () => {
        if (!payMethSelect) console.error("Element 'add-cp-payMeth' not found.");
        if (!paymentDateInput) console.error("Element 'add-cp-payDate' not found.");
        if (!inputCardRefNo) console.error("Element 'inputCardRefNo' not found.");
        if (!inputChequeNo) console.error("Element 'inputChequeNo' not found.");
        if (!inputBankRefNo) console.error("Element 'inputBankTransferId' not found.");
        if (!cardDateInput) console.error("Element 'inputCardDate' not found.");
        if (!chequeDateInput) console.error("Element 'inputChequeDate' not found.");
        if (!bankTransferredDateInput) console.error("Element 'inputBankTransferredDateTime' not found.");

        if (payMethSelect) {
            payMethSelect.addEventListener('change', () => {
                payMethSelect.classList.remove('is-invalid');
                payMethSelect.classList.add('is-valid');
            });
        }

        if (paymentDateInput) {
            paymentDateInput.addEventListener('change', () => {
                paymentDateInput.classList.remove('is-invalid');
                paymentDateInput.classList.add('is-valid');
            });
        }

        if (inputCardRefNo) {
            inputCardRefNo.addEventListener('input', () => {
                if (/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputCardRefNo.value) && inputCardRefNo.value !== '') {
                    inputCardRefNo.classList.remove('is-invalid');
                    inputCardRefNo.classList.add('is-valid');
                } else {
                    inputCardRefNo.classList.add('is-invalid');
                }
            });
        }

        if (inputChequeNo) {
            inputChequeNo.addEventListener('input', () => {
                if (/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputChequeNo.value) && inputChequeNo.value !== '') {
                    inputChequeNo.classList.remove('is-invalid');
                    inputChequeNo.classList.add('is-valid');
                } else {
                    inputChequeNo.classList.add('is-invalid');
                }
            });
        }

        if (inputBankRefNo) {
            inputBankRefNo.addEventListener('input', () => {
                if (/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputBankRefNo.value) && inputBankRefNo.value !== '') {
                    inputBankRefNo.classList.remove('is-invalid');
                    inputBankRefNo.classList.add('is-valid');
                } else {
                    inputBankRefNo.classList.add('is-invalid');
                }
            });
        }

        if (cardDateInput) {
            cardDateInput.addEventListener('input', () => {
                cardDateInput.classList.remove('is-invalid');
                cardDateInput.classList.add('is-valid');
            });
            cardDateInput.addEventListener('change', () => {
                cardDateInput.classList.remove('is-invalid');
                cardDateInput.classList.add('is-valid');
            });
        }

        if (chequeDateInput) {
            chequeDateInput.addEventListener('input', () => {
                chequeDateInput.classList.remove('is-invalid');
                chequeDateInput.classList.add('is-valid');
            });
        }

        if (bankTransferredDateInput) {
            bankTransferredDateInput.addEventListener('change', () => {
                bankTransferredDateInput.classList.remove('is-invalid');
                bankTransferredDateInput.classList.add('is-valid');
            });
        }
    };

    const showPaymentOptionByMethod = () => {
        const paymentMthd = payMethSelect?.value;
        if (!paymentMthd) {
            console.error("payMethSelect is undefined or has no value.");
            return;
        }
        if (typeof bankTransferDivRow !== 'undefined') bankTransferDivRow.classList.add('d-none');
        if (typeof chequeDivRow !== 'undefined') chequeDivRow.classList.add('d-none');
        if (typeof cardDivRow !== 'undefined') cardDivRow.classList.add('d-none');
        if (paymentMthd === 'BANK_TRANSFER') {
            if (typeof bankTransferDivRow !== 'undefined') bankTransferDivRow.classList.remove('d-none');
        } else if (paymentMthd === 'CHEQUE') {
            if (typeof chequeDivRow !== 'undefined') chequeDivRow.classList.remove('d-none');
        } else if (paymentMthd === 'VISA_CARD' || paymentMthd === 'MASTER_CARD') {
            if (typeof cardDivRow !== 'undefined') cardDivRow.classList.remove('d-none');
        }
        const paymentDateRow = document.getElementById('paymentDateRow');
        if (paymentDateRow) {
            if (paymentMthd === 'CASH') {
                paymentDateRow.classList.remove('d-none');
            } else {
                paymentDateRow.classList.add('d-none');
            }
        }
    };

    const checkCustomerPaymentFormError = () => {
        let errors = '';
        if (!customerSelect || customerSelect.value === '') {
            if (customerSelect) customerSelect.classList.add('is-invalid');
            errors += 'Customer is required \n';
        }

        if (!payMethSelect || payMethSelect.value === '') {
            if (payMethSelect) payMethSelect.classList.add('is-invalid');
            errors += 'Payment Method is required \n';
        }

        if (!totalPaidInput || totalPaidInput.value === '') {
            if (totalPaidInput) totalPaidInput.classList.add('is-invalid');
            errors += 'Need to Enter pay Amount to above fields \n';
        }

        if (payMethSelect?.value === 'CASH') {
            if (!paymentDateInput || paymentDateInput.value === '') {
                if (paymentDateInput) paymentDateInput.classList.add('is-invalid');
                errors += 'Payment Date is required \n';
            }
        }

        if (payMethSelect?.value === 'CHEQUE') {
            if (!chequeDateInput || chequeDateInput.value === '') {
                if (chequeDateInput) chequeDateInput.classList.add('is-invalid');
                errors += 'Cheque Date is required \n';
            }

            if (!inputChequeNo || !/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputChequeNo.value) || inputChequeNo.value === '') {
                if (inputChequeNo) inputChequeNo.classList.add('is-invalid');
                errors += 'Enter Valid Cheque No \n';
            }
        }

        if (payMethSelect?.value === 'VISA_CARD' || payMethSelect?.value === 'MASTER_CARD') {
            if (!cardDateInput || cardDateInput.value === '') {
                if (cardDateInput) cardDateInput.classList.add('is-invalid');
                errors += 'Card Date is required \n';
            }

            if (!inputCardRefNo || !/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputCardRefNo.value) || inputCardRefNo.value === '') {
                if (inputCardRefNo) inputCardRefNo.classList.add('is-invalid');
                errors += 'Enter Valid Card Ref No \n';
            }
        }

        if (payMethSelect?.value === 'BANK_TRANSFER') {
            if (!bankTransferredDateInput || bankTransferredDateInput.value === '') {
                if (bankTransferredDateInput) bankTransferredDateInput.classList.add('is-invalid');
                errors += 'Bank Date is required \n';
            }

            if (!inputBankRefNo || !/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputBankRefNo.value) || inputBankRefNo.value === '') {
                if (inputBankRefNo) inputBankRefNo.classList.add('is-invalid');
                errors += 'Enter Valid Bank Ref No \n';
            }
        }

        return errors;
    };

    const updateTotalsSection = () => {
        let totalPayable = 0;
        let totalPaid = 0;
        let remainingBalance = 0;
        if (!orderTableBody) {
            console.error("orderTableBody is undefined. Check ID 'customerOrderPaymentTable' in HTML.");
            return;
        }
        orderTableBody.querySelectorAll('tr').forEach(row => {
            let outstanding = parseFloat(row.querySelector('.outstanding')?.textContent) || 0;
            let payAmount = parseFloat(row.querySelector('.pay-amount')?.value) || 0;
            let checked = row.querySelector('.order-checkbox')?.checked || false;
            if (checked) {
                totalPayable += outstanding;
                totalPaid += payAmount;
                remainingBalance += (outstanding - payAmount);
                if (totalPaidInput) totalPaidInput.classList.remove('is-invalid');
            }
        });
        const totalPayableInput = document.getElementById('totalPayable');
        const totalPaidInputElement = document.getElementById('totalPaid');
        const remainingBalanceInput = document.getElementById('remainingBalance');
        if (totalPayableInput) totalPayableInput.value = totalPayable.toFixed(2);
        if (totalPaidInputElement) totalPaidInputElement.value = totalPaid.toFixed(2);
        if (remainingBalanceInput) remainingBalanceInput.value = remainingBalance.toFixed(2);
    };

    const handleFormSubmission = () => {
        let errors = checkCustomerPaymentFormError();
        console.log(errors);

        if (errors === "") {
            console.log("No errors");

            let paymentDetails = [];
            let totalAmount = 0;
            let balanceSum = 0;
            if (orderTableBody) {
                document.querySelectorAll('#customerOrderPaymentTable tbody tr').forEach(row => {
                    if (row.querySelector('.order-checkbox')?.checked) {
                        let orderId = row.getAttribute('data-order-id');
                        let payAmount = parseFloat(row.querySelector('.pay-amount')?.value) || 0;
                        let outstanding = parseFloat(row.querySelector('.outstanding')?.textContent) || 0;
                        let balance = parseFloat(row.querySelector('.balance-cell')?.textContent) || (outstanding - payAmount);
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
            }

            if (paymentDetails.length === 0) {
                Swal.fire({ title: "Error", text: "Please select the customer to add payment", icon: "error" });
                return;
            }

            let transferid = '';
            let paymentDate = '';
            const paymentMethod = payMethSelect?.value || '';
            if (paymentMethod === 'BANK_TRANSFER') {
                paymentDate = bankTransferredDateInput?.value || '';
                transferid = inputBankRefNo?.value || '';
            } else if (paymentMethod === 'CHEQUE') {
                paymentDate = chequeDateInput?.value || '';
                transferid = inputChequeNo?.value || '';
            } else if (paymentMethod === 'VISA_CARD' || paymentMethod === 'MASTER_CARD') {
                paymentDate = cardDateInput?.value || '';
                transferid = inputCardRefNo?.value || '';
            } else if (paymentMethod === 'CASH') {
                paymentDate = paymentDateInput?.value || '';
                transferid = inputCardRefNo?.value || '';
            }

            let paymentStatus = paymentStatusSelect?.value || '';
            let dto = {
                payAmount: totalAmount,
                paidAmount: totalAmount,
                balance: balanceSum,
                paymentMethod: paymentMethod,
                paymentStatus: paymentStatus,
                transferid: transferid,
                note: document.getElementById('addCusPayNote')?.value || '',
                paymentDetails: paymentDetails,
                paymentDate: paymentDate
            };

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
                const formCP = document.getElementById('CPAddForm');
                if (formCP) {
                    formCP.reset();
                    document.querySelectorAll('#CPAddForm input, #CPAddForm select, #CPAddForm textarea').forEach((input) => {
                        input.classList.remove('is-valid', 'is-invalid');
                    });
                    formCP.classList.remove('was-validated');
                }
                reloadCustomerPaymentTable();
                $("#modalAddCusPayment").modal("hide");

                if (response.responseText.paymentId) {
                    window.open('/cusPayment/receipt/' + response.responseText.paymentId, '_blank');
                }

                if (OrderProductsTableInstance) {
                    OrderProductsTableInstance.clear().draw();
                }
                $("#tableOPs tbody").empty();

                if (document.getElementById('tot-amount')) {
                    document.getElementById('tot-amount').innerHTML = '';
                }
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

            reloadCustomerPaymentTable();
            if (formCP) formCP.reset();
            $('#modalAddCusPayment').modal('hide');
        }
    };

    // Main logic
    let userPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/CUSTOMER_PAYMENT");
    console.log(userPrivilege);

    if (!userPrivilege.select) {
        const payTabPane = document.getElementById('pay-tab-pane');
        if (payTabPane) {
            payTabPane.style.display = 'none';
            payTabPane.innerHTML = '<div class="alert alert-danger mt-3">You do not have access to Customer Payments. <i class="fa fa-lock"></i></div>';
        }
        return; // Exit if no privilege
    }

    const payTabPane = document.getElementById('pay-tab-pane');
    if (payTabPane) payTabPane.style.display = '';

    // Initialize DOM elements
    payMethSelect = document.getElementById('add-cp-payMeth');
    customerSelect = document.getElementById('add-cp-customer');
    customerOrdersSection = document.getElementById('customer-orders-section');
    orderTableBody = document.querySelector('#customerOrderPaymentTable tbody');
    paymentDateInput = document.getElementById('add-cp-payDate');
    cardDateInput = document.getElementById('inputCardDate');
    chequeDateInput = document.getElementById('inputChequeDate');
    bankTransferredDateInput = document.getElementById('inputBankTransferredDateTime');
    inputChequeNo = document.getElementById('inputChequeNo');
    inputCardRefNo = document.getElementById('inputCardRefNo');
    totalPaidInput = document.getElementById('totalPaid');
    inputBankRefNo = document.getElementById('inputBankTransferId'); // Fixed typo
    paymentMethodRow = document.getElementById('paymentMethodRow');
    paymentNoteRow = document.getElementById('paymentNoteRow');
    paymentStatusSelect = document.getElementById('add-cp-payStatus');

    // Log missing elements
    if (!payMethSelect) console.error("Element with ID 'add-cp-payMeth' not found.");
    if (!customerSelect) console.error("Element with ID 'add-cp-customer' not found.");
    if (!customerOrdersSection) console.error("Element with ID 'customer-orders-section' not found.");
    if (!orderTableBody) console.error("Element with ID 'customerOrderPaymentTable' tbody not found.");
    if (!paymentDateInput) console.error("Element with ID 'add-cp-payDate' not found.");
    if (!cardDateInput) console.error("Element with ID 'inputCardDate' not found.");
    if (!chequeDateInput) console.error("Element with ID 'inputChequeDate' not found.");
    if (!bankTransferredDateInput) console.error("Element with ID 'inputBankTransferredDateTime' not found.");
    if (!inputChequeNo) console.error("Element with ID 'inputChequeNo' not found.");
    if (!inputCardRefNo) console.error("Element with ID 'inputCardRefNo' not found.");
    if (!totalPaidInput) console.error("Element with ID 'totalPaid' not found.");
    if (!inputBankRefNo) console.error("Element with ID 'inputBankTransferId' not found.");
    if (!paymentMethodRow) console.error("Element with ID 'paymentMethodRow' not found.");
    if (!paymentNoteRow) console.error("Element with ID 'paymentNoteRow' not found.");
    if (!paymentStatusSelect) console.error("Element with ID 'add-cp-payStatus' not found.");

    // Initialize customer dropdown
    if (customerSelect) {
        customerSelect.innerHTML = '<option value="" disabled selected>Select Customer</option>';
        customers = ajaxGetRequest('/customer/getAllCustomers') || [];
        customers.filter(c => c.customerStatus === 'Active').forEach(c => {
            let opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.regNo + (c.companyName ? '  -  ' + c.companyName : '  -  ' + c.firstName + ' ' + c.secondName);
            console.log(opt);
            customerSelect.appendChild(opt);
        });
    }

    // Hide payment method and note rows
    if (paymentMethodRow) paymentMethodRow.style.display = 'none';
    if (paymentNoteRow) paymentNoteRow.style.display = 'none';
    if (paymentStatusSelect) {
        paymentStatusSelect.value = 'Completed';
        paymentStatusSelect.disabled = true;
    }

    // Customer selection logic
    if (customerSelect) {
        customerSelect.addEventListener('change', function() {
            if (customerSelect) {
                customerSelect.classList.remove('is-invalid');
                customerSelect.classList.add('is-valid');
            }
            if (orderTableBody) orderTableBody.innerHTML = '';
            if (customerOrdersSection) customerOrdersSection.style.display = 'none';
            let customerId = this.value;

            if (paymentMethodRow) paymentMethodRow.style.display = 'none';
            if (paymentNoteRow) paymentNoteRow.style.display = 'none';

            if (paymentStatusSelect) {
                paymentStatusSelect.value = 'Completed';
                paymentStatusSelect.disabled = true;
            }

            if (!customerId) return;
            let orders = ajaxGetRequest(`/customerOrder/unpaid?customerId=${customerId}`) || [];
            console.log(orders);

            if (orders.length > 0) {
                const minAddedDate = orders.reduce(
                    (min, order) => new Date(order.addeddate) < min ? new Date(order.addeddate) : min,
                    new Date(orders[0].addeddate)
                );
                console.log('Earliest unpaid order date:', minAddedDate);
                minDateStr = minAddedDate.toISOString().slice(0, 10);
                if (paymentDateInput) paymentDateInput.setAttribute('min', minDateStr);
                if (cardDateInput) cardDateInput.setAttribute('min', minDateStr);
                if (chequeDateInput) chequeDateInput.setAttribute('min', minDateStr);
                if (bankTransferredDateInput) bankTransferredDateInput.setAttribute('min', minDateStr);
            } else {
                if (paymentDateInput) paymentDateInput.removeAttribute('min');
                if (cardDateInput) cardDateInput.removeAttribute('min');
                if (chequeDateInput) chequeDateInput.removeAttribute('min');
                if (bankTransferredDateInput) bankTransferredDateInput.removeAttribute('min');
            }

            if (orders.length > 0) {
                const noUnpaidOrdersAlert = document.getElementById('noUnpaidOrdersAlert');
                if (noUnpaidOrdersAlert) noUnpaidOrdersAlert.style.display = 'none';
                orders.forEach(order => {
                    if (paymentMethodRow) paymentMethodRow.style.display = customerId ? '' : 'none';
                    if (paymentNoteRow) paymentNoteRow.style.display = customerId ? '' : 'none';
                    if (orderTableBody) {
                        let row = document.createElement('tr');
                        row.setAttribute('data-order-id', order.id);
                        row.innerHTML = `
                            <td><input type="checkbox" class="order-checkbox"></td>
                            <td>${order.orderNo}</td>
                            <td>${order.invoiceNo || ''}</td>
                            <td class="outstanding">${order.outstanding}</td>
                            <td><input type="text" class="pay-amount form-control" disabled></td>
                            <td class="balance-cell">${order.outstanding}</td>`;
                        orderTableBody.appendChild(row);
                    }
                });
                if (customerOrdersSection) customerOrdersSection.style.display = '';
            } else {
                console.log('No unpaid orders found for customer ' + customerId);
                const noUnpaidOrdersAlert = document.getElementById('noUnpaidOrdersAlert');
                if (noUnpaidOrdersAlert) noUnpaidOrdersAlert.style.display = '';
                if (orderTableBody) orderTableBody.innerHTML = '';
            }
        });
    }

    // Order table interactions
    if (orderTableBody) {
        orderTableBody.addEventListener('change', function(e) {
            if (e.target.classList.contains('order-checkbox')) {
                let row = e.target.closest('tr');
                let payAmountInput = row.querySelector('.pay-amount');
                if (payAmountInput) {
                    payAmountInput.disabled = !e.target.checked;
                    if (!e.target.checked) {
                        payAmountInput.value = '';
                        row.querySelector('.balance-cell').textContent = row.querySelector('.outstanding').textContent;
                    }
                }
                updateTotalsSection();
            }
        });

        orderTableBody.addEventListener('input', function(e) {
            if (e.target.classList.contains('pay-amount')) {
                let row = e.target.closest('tr');
                let outstanding = parseFloat(row.querySelector('.outstanding')?.textContent) || 0;
                let value = e.target.value;
                if (!/^\d+$/.test(value) || value === '' || isNaN(parseInt(value)) || parseInt(value) < 0) {
                    e.target.value = '';
                    row.querySelector('.balance-cell').textContent = outstanding;
                    Swal.fire({
                        icon: 'warning',
                        title: 'Invalid Input',
                        text: 'Please enter a positive whole number.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    updateTotalsSection();
                    return;
                }
                let payAmount = parseInt(value) || 0;
                if (payAmount > outstanding) {
                    e.target.value = outstanding;
                    payAmount = outstanding;
                    Swal.fire({
                        icon: 'warning',
                        title: 'Invalid Amount',
                        text: 'Pay amount cannot exceed outstanding amount.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
                let balance = outstanding - payAmount;
                row.querySelector('.balance-cell').textContent = balance >= 0 ? balance : outstanding;
                updateTotalsSection();
            }
        });

        orderTableBody.addEventListener('change', function(e) {
            if (e.target.classList.contains('order-checkbox')) {
                updateTotalsSection();
            }
        });
    }

    // Pay all outstanding checkbox
    const payAllOutstandingCheckbox = document.getElementById('payAllOutstandingCheckbox');
    if (payAllOutstandingCheckbox) {
        payAllOutstandingCheckbox.addEventListener('change', function() {
            updateTotalsSection();
        });

        payAllOutstandingCheckbox.addEventListener('change', function() {
            let checked = this.checked;
            if (orderTableBody) {
                orderTableBody.querySelectorAll('tr').forEach(row => {
                    let checkbox = row.querySelector('.order-checkbox');
                    let payAmountInput = row.querySelector('.pay-amount');
                    let outstanding = parseFloat(row.querySelector('.outstanding')?.textContent) || 0;
                    if (checkbox && payAmountInput) {
                        checkbox.checked = checked;
                        payAmountInput.disabled = !checked;
                        if (checked) {
                            payAmountInput.value = outstanding;
                            row.querySelector('.balance-cell').textContent = 0;
                        } else {
                            payAmountInput.value = '';
                            row.querySelector('.balance-cell').textContent = outstanding;
                        }
                    }
                });
            }
            updateTotalsSection();
        });
    }

    // Bind form submission
    const formCP = document.getElementById('CPAddForm');
    if (formCP) {
        formCP.addEventListener('submit', function(event) {
            event.preventDefault();
            handleFormSubmission();
        });
    } else {
        console.error("Form with ID 'CPAddForm' not found in the DOM. Check HTML for this element.");
    }

    // Fallback for dynamic submit button
    document.addEventListener('click', function(event) {
        if (event.target.id === 'add-cp-submit') {
            event.preventDefault();
            console.log("Submit button clicked via event delegation");
            handleFormSubmission();
        }
    });

    // Initialize table and form validation
    reloadCustomerPaymentTable();
    formValidation();
    if (payMethSelect) {
        payMethSelect.addEventListener('change', showPaymentOptionByMethod);
    }
});