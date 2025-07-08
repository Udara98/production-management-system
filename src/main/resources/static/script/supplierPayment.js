let spTableInstance;
window.addEventListener('DOMContentLoaded',  () => {
    

    reloadSPTable();
    refreshSupplierPaymentForm();
    let selectedPO;
    SupplierPaymentFormValidation();


     const supplierSelectElement = document.getElementById("add_sp_supplier");



});

   const supplierPaymentSubmit = () =>  {
        event.preventDefault();

       // Collect payment details from all GRN rows
        const paymentDetails = [];
        let totalPaymentAmount = 0;
        const grnRows = document.querySelectorAll('.grn-row');
        const supplierId = selectedSupplier;

        grnRows.forEach(row => {
                const paymentInput = row.querySelector('.payment-amount');
                const grnNo = row.querySelector('.grn-no').value;
                console.log(grnNo);
                const paymentAmount = parseFloat(paymentInput.value) || 0;
                const newBalance = parseFloat(row.querySelector('.new-balance').value) || 0;

                if (paymentAmount > 0) {
//                    const grnId = row.dataset.grn-no;
//                    console.log(grnId);
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
        supplierPayment.totalPaymentAmount = totalPaymentAmount;
        supplierPayment.paymentMethod = document.getElementById("add-sp-paymentMethod").value.toUpperCase();
        supplierPayment.paymentMethodSupId = parseInt(selectedSupplier);
        supplierPayment.paymentDetails = paymentDetails;
        supplierPayment.supplierId = parseInt(supplierId);

        console.log(supplierPayment);


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
   

    SupplierPaymentFormValidation();


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

                 if (selectedSupplier) {

                 const GRNs = ajaxGetRequest(`/grn/get-active-non-paid-grns/${selectedSupplier}`);

                 console.log(GRNs);

                    if (GRNs) {
                     grnListSection.style.display = 'block';
                     document.getElementById("supplierPaymentSubmitBtn").disabled = false;
                     document.getElementById('PaymentDetailsSection').classList.remove('d-none');
                     GRNs.forEach(grn => {
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
                                             <input type="number" class="form-control payment-amount"
                                                    min="0" max="${grn.totalAmount}"
                                                    oninput="updateBalances()">
                                         </td>
                                         <td>
                                             <input type="number" class="form-control new-balance" disabled>
                                         </td>`;
                                     grnList.appendChild(grnRow);
                                 });
                     updateTotals();
                 } else {
                     grnListSection.style.display = 'none';
                     document.getElementById('PaymentDetailsSection').classList.add('d-none');
                     document.getElementById('noOutstandingGRNs').classList.remove('d-none');

                 }
                 }
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

const SupplierPaymentFormValidation = () =>{

const supplierSelectElement = document.getElementById("add_sp_supplier");


    const addSPayDate = document.getElementById('add-sp-payDate')

    addSPayDate.addEventListener('change', () =>{
        dateFeildValidator(addSPayDate,'','supplierPayment','paymentDate')
        })


    const inputCardRefNo = document.getElementById('inputCardRefNo')
        inputCardRefNo.addEventListener('keyup',  () => {
                    validation(inputCardRefNo, '', 'supplierPayment', 'transferid');
    });

    const inputChequeNo = document.getElementById('inputChequeNo')
            inputChequeNo.addEventListener('keyup',  () => {
                        validation(inputChequeNo, '', 'supplierPayment', 'transferid');
    });

       console.log(document.getElementById('inputBankTranferId'));
            document.getElementById('inputBankTranferId').addEventListener('keyup',  () => {
                        validation(inputTransferId, '', 'supplierPayment', 'transferid');
        });


    const inputBankTransferredDateTime = document.getElementById('inputBankTransferredDateTime')
            inputBankTransferredDateTime.addEventListener('change',  () => {
                     dateFeildValidator(inputBankTransferredDateTime,'','supplierPayment','paymentDate')
        });

    const inputChequeDate = document.getElementById('inputChequeDate')
                inputChequeDate.addEventListener('change',  () => {
                         dateFeildValidator(inputChequeDate,'','supplierPayment','paymentDate')
            });

    const inputCardDate = document.getElementById('inputCardDate')
                inputCardDate.addEventListener('change',  () => {
                         dateFeildValidator(inputCardDate,'','supplierPayment','paymentDate')
            });

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
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");
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

