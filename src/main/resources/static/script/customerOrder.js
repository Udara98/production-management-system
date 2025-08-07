let OrderProductsTableInstance;
let cusOrderTableInstance;
let orderProducts = [];
let products = [];
let totalAmount = 0;



window.addEventListener('DOMContentLoaded', () => {
    // Clear All button logic
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function () {
            // Reset all form fields
            document.getElementById('add-co-cus').selectedIndex = 0;
            document.getElementById('add-co-reqDate').value = '';
            document.getElementById('add-co-status').selectedIndex = 0;
            document.getElementById('add-co-product').selectedIndex = 0;
            document.getElementById('add-co-qty').value = '';

            // Remove validation classes
            [
                'add-co-cus',
                'add-co-reqDate',
                'add-co-status',
                'add-co-product',
                'add-co-qty'
            ].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.remove('is-valid', 'is-invalid');
                }
            });

            // Clear orderProducts array and table
            orderProducts.length = 0;
            displayOrderProducts([]);

            // Reset total amount
            document.getElementById('tot-amount').innerHTML = '';
        });
    }


    const customerSelectElement = document.getElementById("add-co-cus");
    const productSelectElement = document.getElementById("add-co-product");
    const requiredDateElement = document.getElementById("add-co-reqDate");
    const orderStatusElement = document.getElementById("add-co-status");
    const quantityElement = document.getElementById("add-co-qty");

    const customers = ajaxGetRequest("/customer/getAllCustomers").filter((cus) => cus.customerStatus === "Active");
     products = ajaxGetRequest("/product/getAllProducts").filter((p) => p.productStatus !== "OutOfStock");


    //Call function for validation
    // customerOrderFormValidation();

    //call function for Customer order form refill
    customerOrderFormRefill();

    //Call function for reload order table
    reloadOrderTable();

    //Call function for validation
    customerOrderFormValidation();


    document.getElementById('product-add-btn').addEventListener('click', (event) => {

       event.preventDefault();

       
        let errors = checkCusOrderFormEroor();
        console.log(errors);
        if(errors === ""){
            const selectedProduct = products.filter((p) => p.productId  === parseInt(document.getElementById('add-co-product').value))[0]
            const quantity = parseInt(document.getElementById('add-co-qty').value)

            // Check for duplicate at the start
            const alreadyExists = orderProducts.some(op => (op.product.id || op.product.productId) === (selectedProduct.id || selectedProduct.productId));
            if (alreadyExists) {
                swal.fire({
                    title: "Product Already Added",
                    text: "You cannot add the same product more than once to this order.",
                    icon: "warning"
                });
                return;
            }

            // Proceed with add logic
            const orderProduct = {
                product: selectedProduct,
                quantity: quantity,
                productPrice: selectedProduct.salesPrice,
                productLinePrice: (selectedProduct.salesPrice * quantity)
            }

            const newOrderProducts = [...orderProducts, orderProduct]
            products.map((prod) => {
                if (prod.id === selectedProduct.id) {
                    prod.quantity = prod.quantity - quantity
                }
            })

            displayOrderProducts(newOrderProducts);
            totalAmount = totalAmount + (selectedProduct.salesPrice * quantity)
            document.getElementById('tot-amount').innerHTML = ''


            document.getElementById('tot-amount').innerHTML = `<h5>Total Amount : ${(totalAmount).toLocaleString("en-US", {
                style: "currency",
                currency: "LKR",
            })}</h5>`

            orderProducts.push(orderProduct);
        }else{

         quantityElement.value = "";
               quantityElement.classList.remove('is-invalid');
               quantityElement.classList.remove('is-valid');

               productSelectElement.value = "";
               productSelectElement.classList.remove('is-invalid');
               productSelectElement.classList.remove('is-valid');

       swal.fire({
            title: "Product Does not Added",
            text: errors,
            icon: "error"
        });
}
        quantityElement.value = "";
       quantityElement.classList.remove('is-invalid');
       quantityElement.classList.remove('is-valid');

       productSelectElement.value = "";
       productSelectElement.classList.remove('is-invalid');
       productSelectElement.classList.remove('is-valid');
    })

   

    document.getElementById('place-order-btn').onclick = function (event) {
        event.preventDefault();
        let errors = checkMainCusOrderFormEroor();
        console.log(errors);
        if(errors === ""){
        const customerId = parseInt(document.getElementById('add-co-cus').value);
        const requiredDate = new Date(document.getElementById('add-co-reqDate').value).toISOString();
        const orderStatus = document.getElementById('add-co-status').value;
        // Map orderProducts to only productId and quantity
        const customerOrderProducts = orderProducts.map(op => ({
            productId: op.product.id || op.product.productId, // support both naming conventions
            quantity: op.quantity
        }));
        const customerOrder = {
            customerId,
            requiredDate,
            customerOrderProducts,
            orderStatus
        };
        console.log(customerOrder);

        let response = ajaxRequestBody("/customerOrder/addNewCustomerOrder", "POST", customerOrder);
        if (response.status === 200) {
            console.log(response);
          
            
            swal.fire({
                title: response.responseText.responseText,
                icon: "success",
            });
            // Robust form and modal reset (like employee.js)
            const formCO = document.getElementById('COAddForm');
            if(formCO) formCO.reset();
            reloadOrderTable();
            orderProducts = [];
            customerOrderFormRefill();
            // Remove validation classes
            document.querySelectorAll('#COAddForm input, #COAddForm select, #COAddForm textarea').forEach((input) => {
                input.classList.remove('is-valid', 'is-invalid');
            });
            formCO.classList.remove('was-validated');
            $("#modalAddCO").modal("hide");

            if (response.responseText.orderId) {
                window.open('/customerOrder/invoice/' + response.responseText.orderId, '_blank');
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
    }}
})

const CalDiscountPrice = () => {

}

const customerOrderFormRefill = () => {

    const customers = ajaxGetRequest("/customer/getAllCustomers").filter((cus) => cus.customerStatus === "Active");
    const products = ajaxGetRequest("/product/getAllProducts").filter((p) => p.productStatus !== "OutOfStock");

    customerOrderValidation = new Object();
    olDcustomerOrderValidation = null;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;

    const customerSelectElement = document.getElementById("add-co-cus");
    const productSelectElement = document.getElementById("add-co-product");



      // For Add form
      const addCOReqDate = document.getElementById('add-co-reqDate');
      if (addCOReqDate) {
          addCOReqDate.setAttribute('min', minDate);
      }

      const cusOrderStatus = document.getElementById('add-co-status');
      cusOrderStatus.value = "Pending";
      cusOrderStatus.disabled = true;
      
  
      // For Edit form
      const editCOReqDate = document.getElementById('edit-co-reqDate');
      if (editCOReqDate) {
          editCOReqDate.setAttribute('min', minDate);
      }

    // Sort customers by regNo - Name or Company name
    customers.sort((a, b) => {
        // Compose display name for both
        const aName = a.companyName && a.companyName.trim() !== '' ? a.companyName : (a.firstName || '') + ' ' + (a.secondName || '');
        const bName = b.companyName && b.companyName.trim() !== '' ? b.companyName : (b.firstName || '') + ' ' + (b.secondName || '');
        const aDisplay = (a.regNo || '') + ' - ' + aName.trim();
        const bDisplay = (b.regNo || '') + ' - ' + bName.trim();
        return aDisplay.localeCompare(bDisplay);
    });

    // Sort customers by regNo - Name or Company name
    customers.forEach(cus => {
        const option = document.createElement('option');
        option.value = cus.id;
        let displayName = '';
        if (cus.companyName && cus.companyName.trim() !== '') {
            displayName = `${cus.regNo} - ${cus.companyName}`;
        } else {
            displayName = `${cus.regNo} - ${cus.firstName || ''} ${cus.secondName || ''}`.trim();
        }
        option.textContent = displayName;
        customerSelectElement.appendChild(option);
    });

    // Sort products by productCode - productName
    products.sort((a, b) => {
        const aDisplay = (a.productCode || '') + ' - ' + (a.productName || '');
        const bDisplay = (b.productCode || '') + ' - ' + (b.productName || '');
        return aDisplay.localeCompare(bDisplay);
    });

    // Sort products by productCode - productName
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.productId;
        option.textContent = `${product.productName}`;
        productSelectElement.appendChild(option);
    });
}

const displayOrderProducts = (products) => {
    const getProdCode = (ob) => ob.product.productCode
    const getProdName = (ob) => ob.product.productName
    const displayProperty = [
        {dataType: "function", propertyName:getProdCode},
        {dataType: "function", propertyName: getProdName },
        {dataType: "text", propertyName: "quantity"},
        {dataType: "price", propertyName: "productPrice"},
        {dataType: "price", propertyName: "productLinePrice"},
    ];
    if (OrderProductsTableInstance) {
        OrderProductsTableInstance.destroy();
    }
    $('#tableOPs tbody').empty();

    tableDataBinder(
        tableOPs,
        products,
        displayProperty,
        true,
        generateDropDown,
        null
    );
    OrderProductsTableInstance = $('#tableOPs').DataTable({
        searching: false,
        ordering: false,
        paging: false,
        info: false,
    });
}



const deleteSelectedProduct = (element) => {
    console.log(element);
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to remove ${element.product.productName} from the table?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Remove from orderProducts and restore quantity simply
            orderProducts = orderProducts.filter(p => (p.product.productId) !== (element.product.productId));
            totalAmount = totalAmount - (element.productPrice * element.quantity);
            console.log(totalAmount);
            document.getElementById('tot-amount').innerHTML = `<h5>Total Amount : ${(totalAmount).toLocaleString("en-US", {
                style: "currency",
                currency: "LKR",
            })}</h5>`;

            const prod = products.find(p => (p.productId) === (element.product.productId));
            if (prod) prod.quantity += element.quantity;
            displayOrderProducts(orderProducts);

            Swal.fire({ title: "Removed!", text: "Product removed from table.", icon: "success" });
        }
    });
};

// Dropdown menu for each row in the order products table
const generateDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    // Add a Delete button to remove product from order
    const buttonList = [
        {name: "Delete", action: deleteSelectedProduct, icon: "fa-solid fa-trash me-2"},
    ];
    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
        buttonElement.type = "button";
        buttonElement.onclick = function () {
            button.action(element);
        };
        const liElement = document.createElement("li");
        liElement.appendChild(buttonElement);
        dropdownMenu.appendChild(liElement);
    });
    return dropdownMenu;
};


const assignOrder = (element) => {
    const rsponseOrder = ajaxGetRequest(`/customerOrder/assign/${element.id}`)
    console.log(rsponseOrder);

    if (rsponseOrder.status === 200) {
        Swal.fire({
            title: "Assigned!",
            text: "Order assigned successfully.",
            icon: "success"
        });
        reloadOrderTable();
    }else{
        Swal.fire({
            title: "Failed!",
            html: rsponseOrder.message,
            icon: "error"
        });
    }
}

const reloadOrderTable=()=>{
    const cusOrders = ajaxGetRequest("/customerOrder/getAllCustomerOrders")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/CUSTOMER_ORDER");
    console.log(getPrivilege);

    const getCustomer =(ob)=> ob.customer.companyName?ob.customer.companyName:ob.customer.firstName+" "+ob.customer.secondName;

    const getOrderStatus = (ob) => {
        if (ob.orderStatus === "Pending") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Pending </p>';
        }
        if (ob.orderStatus === "Assigned") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">Assigned</p>';
        }
        if (ob.orderStatus === "NotAssigned") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">NotAssigned</p>';
        }
        if (ob.orderStatus === "not") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">Canceled</p>';
        }
        if (ob.orderStatus === "Removed") {
            return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">Removed</p>';
        }
};

    const displayProperty = [
        {dataType: "text", propertyName: "invoiceNo"},
        {dataType: "function", propertyName: getCustomer},
        {dataType: "date", propertyName: "requiredDate"},
        {dataType: "price", propertyName: "totalAmount"},
        {dataType: "function", propertyName: getOrderStatus},
    ];
    if (cusOrderTableInstance) {
        cusOrderTableInstance.destroy();
    }
    $("#tableCusOrder tbody").empty();
    tableDataBinder(
        tableCusOrder,
        cusOrders,
        displayProperty,
        true,
        generateCODropDown,
        getPrivilege
    );
    cusOrderTableInstance = $("#tableCusOrder").DataTable({
        responsive: true,
        autoWidth: false,
        searching: true,
        ordering: true,
        paging: true,
        info: true,
    });
}

const printCustomerOrder = (element) => {
    window.open(`/customerOrder/invoice/${element.id}`);
}

// Dropdown menu for each customer order row (refactored to match product.js pattern)
const generateCODropDown = (element, index, privilegeOb = null) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    // Example privilege object usage: privilegeOb && privilegeOb.print, privilegeOb && privilegeOb.assign
    // If no privilegeOb is provided, default to enabled
    const buttonList = [
        {
            name: "Print Invoice",
            action: printCustomerOrder,
            icon: "fa-solid fa-print me-2",
            enabled: privilegeOb ? !!privilegeOb.select : true,
        },
        {
            name: "Assign Order",
            action: assignOrder,
            icon: "fa-solid fa-file-invoice me-2",
            enabled: privilegeOb ? !!privilegeOb.select : true,
        },
        // Future actions can be added here
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

//Call function for validation and object binding
const customerOrderFormValidation = () =>{

    const customerSelectElement = document.getElementById("add-co-cus");
    const productSelectElement = document.getElementById("add-co-product");
    const requiredDateElement = document.getElementById("add-co-reqDate");
    const orderStatusElement = document.getElementById("add-co-status");
    const quantityElement = document.getElementById("add-co-qty");
    const discountElement = document.getElementById("add-co-discount");

    customerSelectElement.addEventListener('change',  () => {
        DynamicSelectValidation(customerSelectElement, 'customerOrderValidation', 'customerName');
    });

    requiredDateElement.addEventListener('change',  () => {
        dateFeildValidator(requiredDateElement,'', 'customerOrderValidation', 'requiredDate');
    });

    orderStatusElement.addEventListener('change',  () => {
        selectFieldValidator(orderStatusElement,'', 'customerOrderValidation', 'orderStatus');
    });

     productSelectElement.addEventListener('change',  () => {
        selectFieldValidator(productSelectElement, '', 'customerOrderValidation', 'selectedProduct');
    });

    quantityElement.addEventListener('input',  () => {
                validation(quantityElement, '^[1-9][0-9]{0,3}$', 'customerOrderValidation', 'orderQuantity');
    });

}

const checkCusOrderFormEroor = () => {
    let errors = '';
    const customerSelectElement = document.getElementById("add-co-cus");
    const productSelectElement = document.getElementById("add-co-product");
    const requiredDateElement = document.getElementById("add-co-reqDate");
    const orderStatusElement = document.getElementById("add-co-status");
    const quantityElement = document.getElementById("add-co-qty");
    const discountElement = document.getElementById("add-co-discount");

    // Customer validation
    if (!customerSelectElement.value) {
        errors += 'Customer must be selected.\n';
        customerSelectElement.classList.add('is-invalid');
    } else {
        customerSelectElement.classList.remove('is-invalid');
        customerSelectElement.classList.add('is-valid');
    }
    // Product validation
    if (!productSelectElement.value && orderProducts.length<=0) {
        errors += 'Product must be selected.\n';
        productSelectElement.classList.add('is-invalid');
    } else {
        productSelectElement.classList.remove('is-invalid');
        productSelectElement.classList.add('is-valid');
    }
    // Required date validation
    if (!requiredDateElement.value) {
        errors += 'Required date is mandatory.\n';
        requiredDateElement.classList.add('is-invalid');
    } else {
        requiredDateElement.classList.remove('is-invalid');
        requiredDateElement.classList.add('is-valid');
    }
    // Order status validation
    if (!orderStatusElement.value) {
        errors += 'Order status must be selected.\n';
        orderStatusElement.classList.add('is-invalid');
    } else {
        orderStatusElement.classList.remove('is-invalid');
        orderStatusElement.classList.add('is-valid');
    }
    // Quantity validation
    if ( !quantityElement.value || !/^[1-9][0-9]{0,3}$/.test(quantityElement.value)) {
        errors += 'Quantity must be a valid number.\n';
        quantityElement.classList.add('is-invalid');
    } else {
        quantityElement.classList.remove('is-invalid');
        quantityElement.classList.add('is-valid');
    }


    return errors;
};


const checkMainCusOrderFormEroor = () => {
    let errors = '';
    const customerSelectElement = document.getElementById("add-co-cus");
    const productSelectElement = document.getElementById("add-co-product");
    const requiredDateElement = document.getElementById("add-co-reqDate");
    const orderStatusElement = document.getElementById("add-co-status");
    const quantityElement = document.getElementById("add-co-qty");
    const discountElement = document.getElementById("add-co-discount");

    // Customer validation
    if (!customerSelectElement.value) {
        errors += 'Customer must be selected.\n';
        customerSelectElement.classList.add('is-invalid');
    } else {
        customerSelectElement.classList.remove('is-invalid');
        customerSelectElement.classList.add('is-valid');
    }
    // Product validation
    if (!productSelectElement.value && orderProducts.length<=0) {
        errors += 'Product must be selected.\n';
        productSelectElement.classList.add('is-invalid');
    } else {
        productSelectElement.classList.remove('is-invalid');
        productSelectElement.classList.add('is-valid');
    }
    // Required date validation
    if (!requiredDateElement.value) {
        errors += 'Required date is mandatory.\n';
        requiredDateElement.classList.add('is-invalid');
    } else {
        requiredDateElement.classList.remove('is-invalid');
        requiredDateElement.classList.add('is-valid');
    }
    // Order status validation
    if (!orderStatusElement.value) {
        errors += 'Order status must be selected.\n';
        orderStatusElement.classList.add('is-invalid');
    } else {
        orderStatusElement.classList.remove('is-invalid');
        orderStatusElement.classList.add('is-valid');
    }
    // Quantity validation
    if ( !quantityElement.value && orderProducts.length<=0) {
        errors += 'Quantity must be a valid number.\n';
        quantityElement.classList.add('is-invalid');
    } else {
        quantityElement.classList.remove('is-invalid');
        quantityElement.classList.add('is-valid');
    }


    return errors;
};


