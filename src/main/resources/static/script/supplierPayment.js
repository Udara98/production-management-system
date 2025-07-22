let spTableInstance;
window.addEventListener('DOMContentLoaded',  () => {
    reloadSPTable();
    refreshSupplierPaymentForm();
    let selectedPO;
    supplierPaymentFormValidation();
    // No need to call SupplierPaymentFormValidation (now replaced)
});

   const supplierPaymentSubmit = (event) =>  {
    event.preventDefault();
    // Validate using new error function
    let errors = checkSupplierPaymentFormError();
    if(errors !== '') {
        swal.fire({
            title: 'Form has errors!',
            text: errors,
            icon: 'error'
        });
        return;
    }
    // Collect payment details from all GRN rows
    const paymentDetails = [];
    let totalPaymentAmount = 0;
    const grnRows = document.querySelectorAll('.grn-row');
    const supplierId = selectedSupplier;
    grnRows.forEach(row => {
        const paymentInput = row.querySelector('.payment-amount');
        const grnNo = row.querySelector('.grn-no').value;
        const paymentAmount = parseFloat(paymentInput.value) || 0;
        const newBalance = parseFloat(row.querySelector('.new-balance').value) || 0;
        if (paymentAmount > 0) {
            const grnId = ajaxGetRequest(`/grn/get-grn-id/${grnNo}`);
            totalPaymentAmount += paymentAmount;
            paymentDetails.push({
                goodReceiveNoteId: grnId,
                supplierId:parseInt(supplierId),
                amount: paymentAmount,
                balance: newBalance
            });
        }
    });
    // Calculate totals
    const totalAmount = parseFloat(document.getElementById('totalPaid').value);
    const totalBalanceAmount = totalAmount - totalPaymentAmount;
    supplierPayment.totalAmount = totalAmount;
    supplierPayment.totalPaymentAmount = totalPaymentAmount;
    supplierPayment.paymentMethod = document.getElementById("add-sp-paymentMethod").value.toUpperCase();
    supplierPayment.paymentMethodSupId = parseInt(selectedSupplier);
    supplierPayment.paymentDetails = paymentDetails;
    supplierPayment.supplierId = parseInt(supplierId);
    let response = ajaxRequestBody("/supplier_payment/addNewSP", "POST", supplierPayment);
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
    


//Refresh SupplierPayment form
const refreshSupplierPaymentForm = () =>{

    document.getElementById("supplierPaymentSubmitBtn").disabled = true;
   

    supplierPaymentFormValidation();


    //Get All Active Suppliers
     const suppliers = ajaxGetRequest("/supplier/getAllSuppliers").filter((supplier) => supplier.supplierStatus === "Active");

     const supplierSelectElement = document.getElementById("add_sp_supplier");

    supplierPayment = new Object();
    oldSupplierPayment = null;



   //Fill Dropdown of  select Supplier
      suppliers.forEach(sup => {
              const option = document.createElement('option');
              option.value = sup.id;
              option.textContent = sup.supplierName + " - " + sup.regNo;
              supplierSelectElement.appendChild(option);
       });

      const grnListSection = document.getElementById('grnListSection');
              const grnList = document.querySelector('.grn-list');
              const payTotalCheckbox = document.getElementById('payTotalCheckbox');


     supplierSelectElement.addEventListener('change', function() {

        selectedSupplier = this.value;
        grnList.innerHTML = '';
        payTotalCheckbox.checked = false;

        // --- Set min/max for payment date fields based on GRN dates ---
        const paymentDateInput = document.getElementById('add-sp-payDate');
        const cardDateInput = document.getElementById('inputCardDate');
        const chequeDateInput = document.getElementById('inputChequeDate');
        const bankTransferredDateInput = document.getElementById('inputBankTransferredDateTime');

        if (selectedSupplier) {
            const GRNs = ajaxGetRequest(`/grn/get-active-non-paid-grns/${selectedSupplier}`);
            console.log(GRNs);

            if (GRNs && GRNs.length > 0) {

                noOutstandingGRNs.classList.add('d-none');
                // Find earliest GRN date
                const grnDates = GRNs.map(grn => new Date(grn.addedDate || grn.addeddate));
                const minDate = new Date(Math.min(...grnDates));
                const minDateStr = minDate.toISOString().slice(0, 10);
                // Use today's date for max
                const today = new Date(Date.now());
                const todayStr = today.toISOString().slice(0, 10);
                if (paymentDateInput) { paymentDateInput.setAttribute('min', minDateStr); paymentDateInput.setAttribute('max', todayStr); }
                if (cardDateInput) { cardDateInput.setAttribute('min', minDateStr); cardDateInput.setAttribute('max', todayStr); }
                if (chequeDateInput) { chequeDateInput.setAttribute('min', minDateStr); chequeDateInput.setAttribute('max', todayStr); }
                if (bankTransferredDateInput) { bankTransferredDateInput.setAttribute('min', minDateStr); bankTransferredDateInput.setAttribute('max', todayStr); }

                
            } else {
                // No GRNs: remove min/max restrictions
                if (paymentDateInput) { paymentDateInput.removeAttribute('min'); paymentDateInput.removeAttribute('max'); }
                if (cardDateInput) { cardDateInput.removeAttribute('min'); cardDateInput.removeAttribute('max'); }
                if (chequeDateInput) { chequeDateInput.removeAttribute('min'); chequeDateInput.removeAttribute('max'); }
                if (bankTransferredDateInput) { bankTransferredDateInput.removeAttribute('min'); bankTransferredDateInput.removeAttribute('max'); }
            }
        } else {
            // No supplier selected: remove min/max restrictions
            if (paymentDateInput) { paymentDateInput.removeAttribute('min'); paymentDateInput.removeAttribute('max'); }
            if (cardDateInput) { cardDateInput.removeAttribute('min'); cardDateInput.removeAttribute('max'); }
            if (chequeDateInput) { chequeDateInput.removeAttribute('min'); chequeDateInput.removeAttribute('max'); }
            if (bankTransferredDateInput) { bankTransferredDateInput.removeAttribute('min'); bankTransferredDateInput.removeAttribute('max'); }
        }

        // --- End min/max logic ---

        if (selectedSupplier) {
            const GRNs = ajaxGetRequest(`/grn/get-active-non-paid-grns/${selectedSupplier}`);
            console.log(GRNs);

            if (GRNs) {
                     grnListSection.style.display = 'block';
                     document.getElementById("supplierPaymentSubmitBtn").disabled = false;
                     document.getElementById('PaymentDetailsSection').classList.remove('d-none');
                     GRNs.forEach(grn => {
                                    console.log(grn);
                                     const grnRow = document.createElement('tr');
                                     grnRow.className = 'grn-row';
                                     grnRow.innerHTML = `
                                         <td>
                                             <input type="text" class="form-control grn-no" value="${grn.grnNo}" disabled>
                                         </td>
                                         <td>
                                             <input type="text" class="form-control" value="${grn.purchaseOrder.ingredientCode}" disabled>
                                         </td>
                                         <td>
                                             <input type="number" class="form-control total-amount" value="${grn.totalAmount}" disabled>
                                         </td>
                                         <td>
                                             <input type="number" class="form-control balance" value="${grn.balance}" disabled>
                                         </td>
                                         <td>
                                             <input type="text" class="form-control payment-amount">
                                             <div class="invalid-feedback">Enter a valid pay amount</div>
                                         </td>
                                         <td>
                                             <input type="number" class="form-control new-balance" disabled>
                                         </td>`;
                                     grnList.appendChild(grnRow);
                                     // Attach event listeners to payment-amount fields after GRN rows are rendered
                                     grnRow.querySelector('.payment-amount').addEventListener('input', function() {
                                        const row = this.closest('.grn-row');
                                        const balanceInput = row.querySelector('.balance');
                                        const newBalanceInput = row.querySelector('.new-balance');
                                        const balance = parseFloat(balanceInput.value) || 0;
                                        let value = this.value;
                                        // Only allow positive numbers (whole or decimal)
                                        if (!/^\d+(\.\d{1,2})?$/.test(value) || value === '' || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
                                            this.classList.remove('is-valid');
                                            this.classList.add('is-invalid');
                                            newBalanceInput.value = balance.toFixed(2);
                                            return;
                                        }
                                        let payAmount = parseFloat(value) || 0;
                                        if (payAmount > balance) {
                                            this.value = balance;
                                            payAmount = balance;
                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Invalid Amount',
                                                text: 'Pay amount cannot exceed outstanding balance.',
                                                timer: 2000,
                                                showConfirmButton: false
                                            });
                                        }
                                        let newBal = balance - payAmount;
                                        newBalanceInput.value = newBal >= 0 ? newBal.toFixed(2) : balance.toFixed(2);
                                        // Mark valid if value is positive and ≤ balance
                                        if (payAmount >= 0 && payAmount <= balance) {
                                            this.classList.remove('is-invalid');
                                            this.classList.add('is-valid');
                                        } else {
                                            this.classList.remove('is-valid');
                                            this.classList.add('is-invalid');
                                        }
                                        updateTotals();
                                    });
                                 });
                     updateTotals();
                 } else {
                     grnListSection.style.display = 'none';
                     document.getElementById('PaymentDetailsSection').classList.add('d-none');
                     document.getElementById('noOutstandingGRNs').classList.remove('d-none');

                 }
                 }
             });

             document.querySelectorAll('.payment-amount').forEach(input => {
                input.addEventListener('input', function() {
                    const row = input.closest('.grn-row');
                    const balanceInput = row.querySelector('.balance');
                    const newBalanceInput = row.querySelector('.new-balance');
                    const balance = parseFloat(balanceInput.value) || 0;
                    let value = input.value;
                    // Only allow positive numbers (whole or decimal)
                    if (!/^\d+(\.\d{1,2})?$/.test(value) || value === '' || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
                        input.classList.remove('is-valid');
                        input.classList.add('is-invalid');
                        newBalanceInput.value = balance.toFixed(2);
                        return;
                    }
                    let payAmount = parseFloat(value) || 0;
                    if (payAmount > balance) {
                        input.value = balance;
                        payAmount = balance;
                        Swal.fire({
                            icon: 'warning',
                            title: 'Invalid Amount',
                            text: 'Pay amount cannot exceed outstanding balance.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                    let newBal = balance - payAmount;
                    newBalanceInput.value = newBal >= 0 ? newBal.toFixed(2) : balance.toFixed(2);
                    // Mark valid if value is positive and ≤ balance
                    if (payAmount >= 0 && payAmount <= balance) {
                        input.classList.remove('is-invalid');
                        input.classList.add('is-valid');
                    } else {
                        input.classList.remove('is-valid');
                        input.classList.add('is-invalid');
                    }
                    updateTotals();
                });
            });
     // Store original balances when the checkbox is checked
     let originalBalances = [];

     payTotalCheckbox.addEventListener('change', function () {
         const paymentInputs = document.querySelectorAll('.payment-amount');
         const isChecked = this.checked;

         if (isChecked) {
             // Store the original balances
             originalBalances = [];
             document.querySelectorAll('.grn-row').forEach(row => {
                 const balanceInput = row.querySelector('.balance');
                 originalBalances.push(parseFloat(balanceInput.value) || 0);
             });

             // Set payment amounts to the maximum allowed value
             paymentInputs.forEach((input, index) => {
                 input.value = originalBalances[index]; // Set payment to the original balance
                 input.disabled = true; // Disable the input
             });
         } else {
             // Reset payment amounts to their default values (empty or 0)
             paymentInputs.forEach((input, index) => {
                 input.value = ''; // Reset payment amount
                 input.disabled = false; // Enable the input
             });
         }

         // Update balances after changing payment amounts
         updateBalances();
     });

     window.updateBalances = function () {
         document.querySelectorAll('.grn-row').forEach((row, index) => {
             const balanceInput = row.querySelector('.balance');
             const paymentInput = row.querySelector('.payment-amount');
             const newBalanceInput = row.querySelector('.new-balance');

             const balance = parseFloat(balanceInput.value) || 0; // Ensure balance is a number
             const payment = parseFloat(paymentInput.value) || 0; // Ensure payment is a number

             // Validate payment amount
             if (payment > balance) {
                 paymentInput.value = balance; // Cap payment at the balance amount
                 newBalanceInput.value = 0; // Set new balance to 0
             } else {
                 newBalanceInput.value = (balance - payment).toFixed(2); // Calculate new balance
             }
         });

         // Update totals after updating individual balances
         updateTotals();
     };

       
    

     function updateTotals() {
         let totalPayable = 0;
         let totalPaid = 0;
         let totalBalance = 0;

         document.querySelectorAll('.grn-row').forEach(row => {
             const totalAmount = parseFloat(row.querySelector('.total-amount').value) || 0;
             const paymentAmount = parseFloat(row.querySelector('.payment-amount').value) || 0;
             const newBalance = parseFloat(row.querySelector('.new-balance').value) || 0;

             totalPayable += totalAmount;
             totalPaid += paymentAmount;
             totalBalance += newBalance;
         });

         // Update the total fields in the UI
         document.getElementById('totalPayable').value = totalPayable.toFixed(2);
         document.getElementById('totalPaid').value = totalPaid.toFixed(2);
         document.getElementById('remainingBalance').value = totalBalance.toFixed(2);
     }




}

// Supplier Payment Form Validation (matches customer payment pattern)
const supplierPaymentFormValidation = () => {
    // Get field references
    const supplierSelect = document.getElementById('add_sp_supplier');
    const payMethSelect = document.getElementById('add-sp-paymentMethod');
    const paymentDateInput = document.getElementById('add-sp-payDate');
    const inputCardRefNo = document.getElementById('inputCardRefNo');
    const inputChequeNo = document.getElementById('inputChequeNo');
    const inputBankRefNo = document.getElementById('inputBankTranferId');
    const cardDateInput = document.getElementById('inputCardDate');
    const chequeDateInput = document.getElementById('inputChequeDate');
    const bankTransferredDateInput = document.getElementById('inputBankTransferredDateTime');
    const totalPaidInput = document.getElementById('totalPaid');

    // Payment method
    payMethSelect.addEventListener('change', () => {
        payMethSelect.classList.remove('is-invalid');
        payMethSelect.classList.add('is-valid');
    });
    // Payment date
    paymentDateInput.addEventListener('change', () => {
        paymentDateInput.classList.remove('is-invalid');
        paymentDateInput.classList.add('is-valid');
    });
    // Card/Cheque/Bank Ref No fields
    inputCardRefNo.addEventListener('input', () => {
        if (/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputCardRefNo.value) && inputCardRefNo.value !== '') {
            inputCardRefNo.classList.remove('is-invalid');
            inputCardRefNo.classList.add('is-valid');
        } else {
            inputCardRefNo.classList.add('is-invalid');
        }
    });
    inputChequeNo.addEventListener('input', () => {
        if (/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputChequeNo.value) && inputChequeNo.value !== '') {
            inputChequeNo.classList.remove('is-invalid');
            inputChequeNo.classList.add('is-valid');
        } else {
            inputChequeNo.classList.add('is-invalid');
        }
    });
    inputBankRefNo.addEventListener('input', () => {
        if (/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputBankRefNo.value) && inputBankRefNo.value !== '') {
            inputBankRefNo.classList.remove('is-invalid');
            inputBankRefNo.classList.add('is-valid');
        } else {
            inputBankRefNo.classList.add('is-invalid');
        }
    });
    // Card/Cheque/Bank Date fields
    cardDateInput.addEventListener('input', () => {
        cardDateInput.classList.remove('is-invalid');
        cardDateInput.classList.add('is-valid');
    });
    chequeDateInput.addEventListener('input', () => {
        chequeDateInput.classList.remove('is-invalid');
        chequeDateInput.classList.add('is-valid');
    });
    bankTransferredDateInput.addEventListener('change', () => {
        bankTransferredDateInput.classList.remove('is-invalid');
        bankTransferredDateInput.classList.add('is-valid');
    });
    cardDateInput.addEventListener('change', () => {
        cardDateInput.classList.remove('is-invalid');
        cardDateInput.classList.add('is-valid');
    });
    chequeDateInput.addEventListener('change', () => {
        chequeDateInput.classList.remove('is-invalid');
        chequeDateInput.classList.add('is-valid');
    });
    bankTransferredDateInput.addEventListener('change', () => {
        bankTransferredDateInput.classList.remove('is-invalid');
        bankTransferredDateInput.classList.add('is-valid');
    });
};

// Supplier Payment Form Error Checking (matches customer payment pattern)
function checkSupplierPaymentFormError() {
    let errors = '';
    const supplierSelect = document.getElementById('add_sp_supplier');
    const payMethSelect = document.getElementById('add-sp-paymentMethod');
    const paymentDateInput = document.getElementById('add-sp-payDate');
    const inputCardRefNo = document.getElementById('inputCardRefNo');
    const inputChequeNo = document.getElementById('inputChequeNo');
    const inputBankRefNo = document.getElementById('inputBankTranferId');
    const cardDateInput = document.getElementById('inputCardDate');
    const chequeDateInput = document.getElementById('inputChequeDate');
    const bankTransferredDateInput = document.getElementById('inputBankTransferredDateTime');
    const totalPaidInput = document.getElementById('totalPaid');

    if (supplierSelect.value === '') {
        supplierSelect.classList.add('is-invalid');
        errors += "Supplier is required.\n";
    }
    if (payMethSelect.value === '') {
        payMethSelect.classList.add('is-invalid');
        errors += "Payment Method is required. \n";
    }
    if (totalPaidInput.value === '' || parseFloat(totalPaidInput.value) <= 0) {
        totalPaidInput.classList.add('is-invalid');
        errors += "Total paid amount is required. \n";
    }
    if (payMethSelect.value === 'CASH') {
        if (paymentDateInput.value === '') {
            paymentDateInput.classList.add('is-invalid');
            errors += "Payment Date is required. \n";
        }
    }
    if (payMethSelect.value === 'CHEQUE') {
        if (chequeDateInput.value === '') {
            chequeDateInput.classList.add('is-invalid');
            errors += "Cheque Date is required. \n";
        }
        if (!/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputChequeNo.value) || inputChequeNo.value === '') {
            inputChequeNo.classList.add('is-invalid');
            errors += "Enter Valid Cheque No. \n";
        }
    }
    if (payMethSelect.value === 'VISA_CARD' || payMethSelect.value === 'MASTER_CARD') {
        if (cardDateInput.value === '') {
            cardDateInput.classList.add('is-invalid');
            errors += "Card Date is required. \n";
        }
        if (!/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputCardRefNo.value) || inputCardRefNo.value === '') {
            inputCardRefNo.classList.add('is-invalid');
            errors += "Enter Valid Card Ref No. \n";
        }
    }
    if (payMethSelect.value === 'BANK_TRANSFER') {
        if (bankTransferredDateInput.value === '') {
            bankTransferredDateInput.classList.add('is-invalid');
            errors += "Bank Date is required. \n";
        }
        if (!/^(?=.*\d)[A-Za-z0-9-_]{6,50}$/.test(inputBankRefNo.value) || inputBankRefNo.value === '') {
            inputBankRefNo.classList.add('is-invalid');
            errors += "Enter Valid Bank Ref No. \n";
        }
    }
    return errors;
}


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


 const paymentMthd = document.getElementById('add-sp-paymentMethod').value;

// Hide all payment method rows initially
bankTranferDivRow.classList.add('d-none');
chequeDivRow.classList.add('d-none');
cardDivRow.classList.add('d-none');

// Check if payment method is not "CASH"
        if (paymentMthd !== 'CASH') {
            console.log("Not Cash")
            paymentDateCol.classList.add('d-none');
            paymentMethodCol.classList.replace('col-md-6', 'col-md-4'); // Adjusting from col-6 to col-4 if needed
        } else {
            console.log("Cash")
            paymentDateCol.classList.remove('d-none');
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

const reloadSPTable = function () {
    let supplierPayments = ajaxGetRequest("/supplier_payment/getAllSP");
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER_PAYMENT");
    let grnNos = ajaxGetRequest("/SupplierPaymentHasGoodReceiveNote/32/grn-numbers");

    const getGRNNos = (ob) => {
        const response = ajaxGetRequest(`/SupplierPaymentHasGoodReceiveNote/${ob.id}/grn-numbers`);
        if (response && response.length > 0) {
            return response.join(", "); // Join the array elements into a single string separated by commas
        } else {
            return "No GRNs found";
        }
    };

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
        { dataType: "function", propertyName: getGRNNos },
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

// Dropdown menu for each supplier payment row (refactored to match product.js pattern)
const generateSPDropDown = (element, index, privilegeOb = null) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Print",
            action: printSupplierPayment,
            icon: "fa-solid fa-print me-2",
            enabled: privilegeOb ? !!privilegeOb.select : true,
        },
    ];

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class=\"${button.icon}\"></i>${button.name}`;
        buttonElement.type = "button";
        buttonElement.disabled = !button.enabled;
        if (!button.enabled) {
            buttonElement.style.cursor = "not-allowed";
            buttonElement.classList.add("text-muted");
        }
        buttonElement.onclick = function () {
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

const deleteSP=(sp)=>{

}

