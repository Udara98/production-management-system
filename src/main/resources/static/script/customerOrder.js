let OrderProductsTableInstance;
let cusOrderTableInstance;


window.addEventListener('DOMContentLoaded', () => {

    const customerSelectElement = document.getElementById("add-co-cus");
    const productSelectElement = document.getElementById("add-co-product");
    const requiredDateElement = document.getElementById("add-co-reqDate");
    const orderStatusElement = document.getElementById("add-co-status");
    const quantityElement = document.getElementById("add-co-qty");

    const customers = ajaxGetRequest("/customer/getAllCustomers").filter((cus) => cus.customerStatus === "Active");
    const products = ajaxGetRequest("/product/getAllProducts").filter((p) => p.productStatus !== "OutOfStock");


    //Call function for validation
    // customerOrderFormValidation();

    //call function for Customer order form refill
    customerOrderFormRefill();

    //Call function for reload order table
    reloadOrderTable();

    //Call function for validation
    customerOrderFormValidation();



  

    let orderProducts = []
    let totalAmount = 0


    // const produtAdd = (customerOrderValidation) => {

    // }
    

    document.getElementById('product-add-btn').addEventListener('click', (event) => {

               event.preventDefault();


        let errors = checkCusOrderFormEroor();
        console.log(errors);
        if(errors === ""){
        const selectedProduct = products.filter((p) => p.id === parseInt(document.getElementById('add-co-product').value))[0]
        const quantity = parseInt(document.getElementById('add-co-qty').value)

        // document.getElementById('add-co-product').value = ''
        // document.getElementById('add-co-qty').value = ''
        // document.getElementById('add-co-reqDate').value = ''
        // document.getElementById('add-co-status').value = 'Pending'
        // document.getElementById('add-co-cus').value = ''


    

        if (selectedProduct.quantity < quantity) {
            swal.fire({
                title: "Insufficient Quantity ",
                text: 'Would You like to add more products?',
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#cb421a",
                cancelButtonColor: "#3f3f44",
                confirmButtonText: "Yes"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location = "/product"
                }
            });
        } else {


            const orderProduct = {
                product: selectedProduct,
                quantity: quantity,
                productPrice: selectedProduct.salePrice,
                productLinePrice: (selectedProduct.salePrice * quantity)
            }

            const newOrderProducts = [...orderProducts, orderProduct]
            products.map((prod) => {
                if (prod.id === selectedProduct.id) {
                    prod.quantity = prod.quantity - quantity
                }
            })
            displayOrderProducts(newOrderProducts);
            totalAmount = totalAmount + (selectedProduct.salePrice * quantity)
            document.getElementById('tot-amount').innerHTML = ''
            document.getElementById('tot-amount').innerHTML = `<h5>Total Amount : ${(totalAmount).toLocaleString("en-US", {
                style: "currency",
                currency: "LKR",
            })}</h5>`

            orderProducts.push(orderProduct)
        }}
    })


    document.getElementById('COAddForm').onsubmit = function (event) {
        event.preventDefault();
        const selectedCustomer = customers.filter((cus) => cus.id === parseInt(document.getElementById('add-co-cus').value))[0];
        const customerOrder = {
            customer: selectedCustomer,
            requiredDate:new Date(document.getElementById('add-co-reqDate').value).toISOString(),
            totalAmount:totalAmount,
            customerOrderProducts: orderProducts,
            orderStatus:document.getElementById('add-co-status').value
        }

        console.log(customerOrder);

        let response = ajaxRequestBody("/customerOrder/addNewCustomerOrder", "POST", customerOrder);
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadOrderDetails();
            $("#modalAddCO").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
})


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
    const requiredDateElement = document.getElementById("add-co-reqDate");
    const orderStatusElement = document.getElementById("add-co-status");
    const quantityElement = document.getElementById("add-co-qty");


      // For Add form
      const addCOReqDate = document.getElementById('add-co-reqDate');
      if (addCOReqDate) {
          addCOReqDate.setAttribute('min', minDate);
      }
  
      // For Edit form
      const editCOReqDate = document.getElementById('edit-co-reqDate');
      if (editCOReqDate) {
          editCOReqDate.setAttribute('min', minDate);
      }

    customers.forEach(cus => {
        const option = document.createElement('option');
        option.value = cus.id;
        option.textContent = cus.regNo;
        customerSelectElement.appendChild(option);
    });
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.productCode;
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

const generateDropDown = (element) => {
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

const reloadOrderTable=()=>{
    const cusOrders = ajaxGetRequest("/customerOrder/getAllCustomerOrders")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getCustomer =(ob)=> ob.customer.regNo;
    const displayProperty = [
        {dataType: "text", propertyName: "orderNo"},
        {dataType: "function", propertyName: getCustomer},
        {dataType: "date", propertyName: "requiredDate"},
        {dataType: "price", propertyName: "totalAmount"},
        {dataType: "text", propertyName: "orderStatus"},
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

const generateCODropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "View", action: null, icon: "fa-solid fa-eye me-2"},

        {
            name: "Edit",
            action: null,
            icon: "fa-solid fa-edit me-2",
        },
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

//Call function for validation and object binding
const customerOrderFormValidation = () =>{

    const customerSelectElement = document.getElementById("add-co-cus");
    const productSelectElement = document.getElementById("add-co-product");
    const requiredDateElement = document.getElementById("add-co-reqDate");
    const orderStatusElement = document.getElementById("add-co-status");
    const quantityElement = document.getElementById("add-co-qty");

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
                validation(quantityElement, '^[1-9][0-9]{0,2}$', 'customerOrderValidation', 'orderQuantity');
    });

}

const checkCusOrderFormEroor = () => {
    let errors = '';
  
    if (customerOrderValidation.selectedProduct == null) {
      errors = errors + "Product Must be selected \n";
    //   textFullName.classList.add('is-invalid')
    }
  
    if (customerOrderValidation.orderQuantity == null) {
      errors = errors + "quantity can't be null \n";
    //   txtCallingName.classList.add('is-invalid')
    }
  
  
    // if (customerOrderValidation.productPrice == null) {
    //   errors = errors + "Prodcut Price can't be null \n";
    // //   textFullName.classList.add('is-invalid')
    // }
  
    // if (orderProduct.productLinePrice == null) {
    //   errors = errors + "Product Price can't be null \n";
    // //   txtNic.classList.add('is-invalid')
    // }
  
  
  
    return errors;
  }


