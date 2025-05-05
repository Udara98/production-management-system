let OrderProductsEditTableInstance;
let OrderProductsViewTableInstance;
let orderProducts = []
let totalAmount = 0
let selectedCO;
const products = ajaxGetRequest("/product/getAllProducts").filter((p) => p.productStatus !== "OutOfStock");
const customers = ajaxGetRequest("/customer/getAllCustomers").filter((cus) => cus.customerStatus === "Active");

window.addEventListener('load', () => {
    reloadOrderDetails()


    const customerSelectElement = document.getElementById("add-co-cus");
    const productSelectElement = document.getElementById("add-co-product");

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
    document.getElementById('product-add-btn').addEventListener('click', (event) => {
        event.preventDefault();
        const selectedProduct = products.filter((p) => p.id === parseInt(document.getElementById('add-co-product').value))[0]
        const quantity = parseInt(document.getElementById('add-co-qty').value)

        document.getElementById('add-co-product').value = ''
        document.getElementById('add-co-qty').value = ''

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
            let orderProduct = {
                product: selectedProduct,
                quantity: quantity,
                productPrice: selectedProduct.salePrice,
                productLinePrice: (selectedProduct.salePrice * quantity)
            }

            let newOrderProducts = [...orderProducts]
            if (orderProducts.length !== 0) {
                orderProducts.map((op) => {
                    if (op.product.id === selectedProduct.id) {
                        orderProduct.quantity = op.quantity + orderProduct.quantity;
                        orderProduct.productPrice = op.productPrice + orderProduct.productPrice;
                        orderProduct.productLinePrice = op.productLinePrice + orderProduct.productLinePrice;
                        console.log(orderProduct)
                        newOrderProducts = newOrderProducts.filter((o) => o.product.id !== selectedProduct.id);
                        console.log(newOrderProducts)

                    }
                    newOrderProducts.push(orderProduct)
                })
            }else {
                newOrderProducts.push(orderProduct)
            }

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

            orderProducts = newOrderProducts
        }
    })
    document.getElementById('product-edit-btn').addEventListener('click', (event) => {
        event.preventDefault();
        const selectedProduct = products.filter((p) => p.id === parseInt(document.getElementById('edit-co-product').value))[0]
        const quantity = parseInt(document.getElementById('edit-co-qty').value)

        document.getElementById('edit-co-product').value = ''
        document.getElementById('edit-co-qty').value = ''

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
            let orderProduct = {
                product: selectedProduct,
                quantity: quantity,
                productPrice: selectedProduct.salePrice,
                productLinePrice: (selectedProduct.salePrice * quantity)
            }

            let newOrderProducts = [...orderProducts]
            if (orderProducts.length !== 0) {
                orderProducts.map((op) => {
                    if (op.product.id === selectedProduct.id) {
                        orderProduct.quantity = op.quantity + orderProduct.quantity;
                        orderProduct.productPrice = op.productPrice + orderProduct.productPrice;
                        orderProduct.productLinePrice = op.productLinePrice + orderProduct.productLinePrice;
                        console.log(orderProduct)
                        newOrderProducts = newOrderProducts.filter((o) => o.product.id !== selectedProduct.id);
                        console.log(newOrderProducts)

                    }
                    newOrderProducts.push(orderProduct)
                })
            }else {
                newOrderProducts.push(orderProduct)
            }

            products.map((prod) => {
                if (prod.id === selectedProduct.id) {
                    prod.quantity = prod.quantity - quantity
                }
            })
            displayEditOrderProducts(newOrderProducts);
            totalAmount = totalAmount + (selectedProduct.salePrice * quantity)
            document.getElementById('edit-tot-amount').innerHTML = ''
            document.getElementById('edit-tot-amount').innerHTML = `<h5>Total Amount : ${(totalAmount).toLocaleString("en-US", {
                style: "currency",
                currency: "LKR",
            })}</h5>`

            orderProducts = newOrderProducts
        }
    })

    document.getElementById('COAddForm').onsubmit = function (event) {
        event.preventDefault();
        const selectedCustomer = customers.filter((cus) => cus.id === parseInt(document.getElementById('add-co-cus').value))[0];
        const customerOrder = {
            customer: selectedCustomer,
            requiredDate: new Date(document.getElementById('add-co-reqDate').value),
            totalAmount: totalAmount,
            customerOrderProducts: orderProducts,
            orderStatus: document.getElementById('add-co-status').value
        }
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
    document.getElementById('COEditForm').onsubmit = function (event) {
        event.preventDefault();
        const selectedCustomer = customers.filter((cus) => cus.id === parseInt(document.getElementById('edit-co-cus').value))[0];
        const customerOrder = {
            customer: selectedCustomer,
            requiredDate: new Date(document.getElementById('add-co-reqDate').value),
            totalAmount: totalAmount,
            customerOrderProducts: orderProducts,
            orderStatus: document.getElementById('add-co-status').value
        }
        selectedCO.customer = selectedCustomer
        selectedCO.requiredDate = new Date(document.getElementById('edit-co-reqDate').value)
        selectedCO.totalAmount = totalAmount
        selectedCO.customerOrderProducts = orderProducts
        selectedCO.orderStatus = document.getElementById('edit-co-status').value

        let response = ajaxRequestBody("/customerOrder/", "PUT", customerOrder);
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

//const displayOrderProducts = (products) => {
//    const getProdCode = (ob) => ob.product.productCode
//    const getProdName = (ob) => ob.product.productName
//    const displayProperty = [
//        {dataType: "function", propertyName: getProdCode},
//        {dataType: "function", propertyName: getProdName},
//        {dataType: "text", propertyName: "quantity"},
//        {dataType: "price", propertyName: "productPrice"},
//        {dataType: "price", propertyName: "productLinePrice"},
//    ];
//    if (OrderProductsTableInstance) {
//        OrderProductsTableInstance.destroy();
//    }
//    $('#tableOPs tbody').empty();
//
//    tableDataBinder(
//        tableOPs,
//        products,
//        displayProperty,
//        true,
//        generateDropDown,
//        null
//    );
//    OrderProductsTableInstance = $('#tableOPs').DataTable({
//        searching: false,
//        ordering: false,
//        paging: false,
//        info: false,
//    });
//}
const generateDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "Delete", action: deleteOrderItem, icon: "fa-solid fa-trash me-2"},
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
const deleteOrderItem =(item)=>{
    let upOIs = orderProducts.filter((i)=> i.product.id !== item.product.id)
    totalAmount = totalAmount - (item.productLinePrice)
    document.getElementById('tot-amount').innerHTML = ''
    document.getElementById('tot-amount').innerHTML = `<h5>Total Amount : ${(totalAmount).toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    })}</h5>`
    products.map((prod) => {
        if (prod.id === item.product.id) {
            prod.quantity = prod.quantity + item.quantity
        }
    })
    orderProducts = upOIs
    displayOrderProducts(upOIs)
}


const reloadOrderDetails = () => {
    const cusOrders = ajaxGetRequest("/customerOrder/getAllCustomerOrders")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const getCustomer = (ob) => ob.customer.regNo;
    const getStatus = (ob) => {
        if (ob.orderStatus === "Pending") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 90px">Pending</p>';
        }
        if (ob.orderStatus === "Completed") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 90px">Completed </p>';
        }
        if (ob.orderStatus === "Canceled") {
            return '<p class="align-middle redLabel mx-auto" style="width: 90px">Canceled</p>';
        }
    };
    const displayProperty = [
        {dataType: "text", propertyName: "orderNo"},
        {dataType: "function", propertyName: getCustomer},
        {dataType: "date", propertyName: "requiredDate"},
        {dataType: "price", propertyName: "totalAmount"},
        {dataType: "button", propertyName: viewCO, btnName:`<i class="fa-solid fa-eye mx-2"></i> View Order`},
        {dataType: "function", propertyName: getStatus},
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
        {
            name: "Edit",
            action:editCO,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deleteCO, icon: "fa-solid fa-trash me-2"},
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

const viewCO = (co)=>{
    const getProdCode = (ob) => ob.product.productCode
    const getProdName = (ob) => ob.product.productName
    const displayProperty = [
        {dataType: "function", propertyName: getProdCode},
        {dataType: "function", propertyName: getProdName},
        {dataType: "text", propertyName: "quantity"},
        {dataType: "price", propertyName: "productPrice"},
        {dataType: "price", propertyName: "productLinePrice"},
    ];
    if (OrderProductsViewTableInstance) {
        OrderProductsViewTableInstance.destroy();
    }
    $('#tableViewOPs tbody').empty();

    tableDataBinder(
        tableViewOPs,
        co.customerOrderProducts,
        displayProperty,
        false,
        null,
        null
    );
    OrderProductsViewTableInstance = $('#tableViewOPs').DataTable({
        responsive: true,
        autoWidth: false,
        searching: false,
        ordering: false,
        paging: false,
        info: false,
    });

    document.getElementById('view-tot-amount').innerHTML = ''
    document.getElementById('view-tot-amount').innerHTML = `<h5>Total Amount : ${(co.totalAmount).toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    })}</h5>`
    $("#modalViewCO").modal("show");

}
const editCO = (co)=>{
    selectedCO = co
    const customerSelectElement = document.getElementById("edit-co-cus");
    const productSelectElement = document.getElementById("edit-co-product");

    customers.forEach(cus => {
        const option = document.createElement('option');
        option.value = cus.id;
        option.textContent = cus.regNo;
        if(co.customer.id === cus.id) option.selected=true;
        customerSelectElement.appendChild(option);
    });
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.productCode;
        productSelectElement.appendChild(option);
    });
    document.getElementById('edit-co-reqDate').value = convertDateTimeToDate(co.requiredDate)
    orderProducts = co.customerOrderProducts
    totalAmount = co.totalAmount
    displayEditOrderProducts(co.customerOrderProducts)
    document.getElementById('edit-co-status').value = co.orderStatus

    document.getElementById('edit-tot-amount').innerHTML = ''
    document.getElementById('edit-tot-amount').innerHTML = `<h5>Total Amount : ${(totalAmount).toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    })}</h5>`
    $("#modalEditCO").modal("show");

}
const displayEditOrderProducts = (products) => {
    const getProdCode = (ob) => ob.product.productCode
    const getProdName = (ob) => ob.product.productName
    const displayProperty = [
        {dataType: "function", propertyName: getProdCode},
        {dataType: "function", propertyName: getProdName},
        {dataType: "text", propertyName: "quantity"},
        {dataType: "price", propertyName: "productPrice"},
        {dataType: "price", propertyName: "productLinePrice"},
    ];
    if (OrderProductsEditTableInstance) {
        OrderProductsEditTableInstance.destroy();
    }
    $('#tableEditOPs tbody').empty();

    tableDataBinder(
        tableEditOPs,
        products,
        displayProperty,
        true,
        generateEditDropDown,
        null
    );
    OrderProductsEditTableInstance = $('#tableEditOPs').DataTable({
        responsive: true,
        autoWidth: false,
        searching: false,
        ordering: false,
        paging: false,
        info: false,
    });
}
const generateEditDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "Delete", action: deleteEditOrderItem, icon: "fa-solid fa-trash me-2"},
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
const deleteEditOrderItem =(item)=>{
    let upOIs = orderProducts.filter((i)=> i.product.id !== item.product.id)
    totalAmount = totalAmount - (item.productLinePrice)
    document.getElementById('edit-tot-amount').innerHTML = ''
    document.getElementById('edit-tot-amount').innerHTML = `<h5>Total Amount : ${(totalAmount).toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
    })}</h5>`
    products.map((prod) => {
        if (prod.id === item.product.id) {
            prod.quantity = prod.quantity + item.quantity
        }
    })
    orderProducts = upOIs
    displayEditOrderProducts(upOIs)
}


const deleteCO = (co)=>{
    swal.fire({
        title: "Delete Customer Order",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/recipe/deleteRecipe/${recipe.recipeCode}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadRecipes();
            } else {
                swal.fire({
                    title: "Something Went Wrong",
                    text: response.responseText,
                    icon: "error"
                });
            }
        }
    });
}