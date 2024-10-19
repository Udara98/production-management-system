let productTableInstance;
let selectedProduct;
window.addEventListener('load', () => {
    itemTableRefresh();
    let userPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/ITEM");
    const batchList = ajaxGetRequest('/batch/getAllBatches')

    const batchSelect = document.getElementById('add_product_batch')

    batchList.forEach((batch) => {
        const option = document.createElement('option');
        option.value = batch.id;
        option.textContent = batch.batchNo;
        batchSelect.appendChild(option);
    })

    document.getElementById('add-product-photo').addEventListener('change', (event) => {
        const photoLabel = document.getElementById('photo-label');
        photoLabel.style.display = 'none'
        const file = event.target.files[0];

        const imgContainer = document.getElementById('img-container');
        imgContainer.style.display = 'block'
        let imageUrlDiv = document.createElement('div')

        let image = document.createElement('img')
        image.style.minWidth = '20vh'
        image.style.maxWidth = '20vh'
        image.style.minHeight = '20vh'
        image.style.maxHeight = '20vh'
        image.style.border = '1px solid #C7C9CE'
        const reader = new FileReader();
        if (file) {
            reader.onload = () => {
                image.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
        let removeBtn = document.createElement('button');
        removeBtn.className = "btn btn-danger btn-sm"
        removeBtn.style.width = '100%'
        removeBtn.innerText = "remove Image"

        removeBtn.addEventListener('click', () => {
            photoLabel.style.display = 'block'
            imgContainer.innerHTML = ''
            imgContainer.style.display = 'none'

        })

        imageUrlDiv.appendChild(image);
        imageUrlDiv.appendChild(removeBtn)
        imgContainer.appendChild(imageUrlDiv)

    })
    document.getElementById('edit-product-photo').addEventListener('change', (event) => {
        const photoLabel = document.getElementById('edit-photo-label');
        photoLabel.style.display = 'none'
        const file = event.target.files[0];

        const imgContainer = document.getElementById('edit-img-container');
        imgContainer.style.display = 'block'
        let imageUrlDiv = document.createElement('div')

        let image = document.createElement('img')
        image.style.minWidth = '20vh'
        image.style.maxWidth = '20vh'
        image.style.minHeight = '20vh'
        image.style.maxHeight = '20vh'
        image.style.border = '1px solid #C7C9CE'
        const reader = new FileReader();
        if (file) {
            reader.onload = () => {
                image.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
        let removeBtn = document.createElement('button');
        removeBtn.className = "btn btn-danger btn-sm"
        removeBtn.style.width = '100%'
        removeBtn.innerText = "remove Image"

        removeBtn.addEventListener('click', () => {
            photoLabel.style.display = 'block'
            imgContainer.innerHTML = ''
            imgContainer.style.display = 'none'

        })

        imageUrlDiv.appendChild(image);
        imageUrlDiv.appendChild(removeBtn)
        imgContainer.appendChild(imageUrlDiv)

    })

    document.getElementById('productAddForm').onsubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        const fileInput = document.getElementById('add-product-photo');
        const file = fileInput.files[0];
        console.log(file)
        if (file) {
            formData.append('file', file);
        }
        const selectedBatch = batchList.filter((b) => b.id === parseInt(document.getElementById('add_product_batch').value))[0]
        formData.append('batchId', selectedBatch.id);
        formData.append('productName', document.getElementById('add-product-name').value);
        formData.append('reorderPoint', document.getElementById('add-product-rop').value);
        formData.append('reorderQuantity', document.getElementById('add-product-roq').value);
        formData.append('quantity', document.getElementById('add-product-qty').value);
        formData.append('salePrice', document.getElementById('add-product-price').value);
        formData.append('unitType', document.getElementById('add-product-unitType').value);
        formData.append('unitSize', document.getElementById('add-product-unitSize').value);
        formData.append('note', document.getElementById('add-product-note').value);

        let response = ajaxFormDataBody("/product/addNewProduct", 'POST', formData)
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            itemTableRefresh();
            $("#modalAddProduct").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
    document.getElementById('productEditForm').onsubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        const fileInput = document.getElementById('edit-product-photo');
        const file = fileInput.files[0];
        if (file) {
            formData.append('file', file);
        }else {
            formData.append('file', null);
        }
        const selectedBatch = batchList.filter((b) => b.id === parseInt(document.getElementById('add_product_batch').value))[0] || selectedProduct.batch
        formData.append('batchId', selectedBatch.id);
        formData.append('id', selectedProduct.id);
        formData.append('productName', document.getElementById('edit-product-name').value);
        formData.append('reorderPoint', document.getElementById('edit-product-rop').value);
        formData.append('reorderQuantity', document.getElementById('edit-product-roq').value);
        formData.append('quantity', document.getElementById('edit-product-qty').value);
        formData.append('salePrice', document.getElementById('edit-product-price').value);
        formData.append('unitType', document.getElementById('edit-product-unitType').value);
        formData.append('unitSize', document.getElementById('edit-product-unitSize').value);
        formData.append('note', document.getElementById('edit-product-note').value);

        let response = ajaxFormDataBody("/product/updateProduct", 'PUT', formData)
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            itemTableRefresh();
            $("#modalEditProduct").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }

});


//Define function for add item
const buttonUpdateItem = () => {
    console.log("Submit");
    console.log(item);

    //Check form errors
    let errors = checkFormError();
    if (errors === '') {
        let userConfirm = confirm("Are you sure to submit following item details \n" + "item name : " + item.itemname + "\n Item Sale Price : " + item.salesprice);

        if (userConfirm) {
            let postServiceResponse = ajaxRequestBody("/item", "POST", item);
            if (postServiceResponse === "OK") {
                alert("Save Successfully..!")
                formItem.reset();
                itemFormRefresh();
            } else {
                alert("Failed to submit..!\n" + errors);
            }
        }
    } else {
        alert("form has following error..\n" + errors);
    }
}


//Define function for item Table Refresh
const itemTableRefresh = () => {
    const products = ajaxGetRequest("/product/getAllProducts")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    let disProducts = []
    products.forEach((product) => {
        let prData = {...product};
        prData.batchNo = product.batch.batchNo;
        prData.unitAmount = product.unitSize + " " + product.unitType

        disProducts.push(prData)
    })

    const getStatus = (ob) => {
        if (ob.productStatus === "InStock") {
            return '<p class="align-middle greenLabel mx-auto" style="width: 100px">In stock </p>';
        }
        if (ob.productStatus === "LowStock") {
            return '<p class="align-middle yellowLabel mx-auto" style="width: 100px">Low stock</p>';
        }
        if (ob.productStatus === "OutOfStock") {
            return '<p class="align-middle redLabel mx-auto" style="width: 100px">Out of stock</p>';
        }
    };

    const displayProperty = [
        {dataType: "photo", propertyName: "photoPath"},
        {dataType: "text", propertyName: "productCode"},
        {dataType: "text", propertyName: "productName"},
        {dataType: "text", propertyName: "batchNo"},
        {dataType: "price", propertyName: "salePrice"},
        {dataType: "text", propertyName: "unitAmount"},
        {dataType: "text", propertyName: "quantity"},
        {dataType: "function", propertyName: getStatus},
    ];
    if (productTableInstance) {
        productTableInstance.destroy();
    }
    $("#tableProduct tbody").empty();
    tableDataBinder(
        tableProduct,
        disProducts,
        displayProperty,
        true,
        generateProductDropDown,
        getPrivilege
    );
    productTableInstance = $("#tableProduct").DataTable({
        responsive: true,
        autoWidth: false,

    });
}

const generateProductDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action:editProduct,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: null, icon: "fa-solid fa-trash me-2"}
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


const editProduct = (product) => {
    selectedProduct = product
    const photoLabel = document.getElementById('edit-photo-label');
    photoLabel.style.display = 'none'

    const imgContainer = document.getElementById('edit-img-container');
    imgContainer.style.display = 'block'
    let imageUrlDiv = document.createElement('div')

    let image = document.createElement('img')
    image.style.minWidth = '20vh'
    image.style.maxWidth = '20vh'
    image.style.minHeight = '20vh'
    image.style.maxHeight = '20vh'
    image.style.border = '1px solid #C7C9CE'
    image.src=product.photoPath;

    let removeBtn = document.createElement('button');
    removeBtn.className = "btn btn-danger btn-sm"
    removeBtn.style.width = '100%'
    removeBtn.innerText = "remove Image"

    removeBtn.addEventListener('click', () => {
        photoLabel.style.display = 'block'
        imgContainer.innerHTML = ''
        imgContainer.style.display = 'none'

    })

    imageUrlDiv.appendChild(image);
    imageUrlDiv.appendChild(removeBtn)
    imgContainer.appendChild(imageUrlDiv)

    const batchList = ajaxGetRequest('/batch/getAllBatches')

    const batchSelect = document.getElementById('edit_product_batch')

    batchList.forEach((batch) => {
        const option = document.createElement('option');
        option.value = batch.id;
        option.textContent = batch.batchNo;
        if(batch.id === product.batch.id ) option.selected = true;
        batchSelect.appendChild(option);
    })

    document.getElementById('edit-product-name').value = product.productName
    document.getElementById('edit-product-rop').value = product.reorderPoint
    document.getElementById('edit-product-roq').value = product.reorderQuantity
    document.getElementById('edit-product-qty').value = product.quantity
    document.getElementById('edit-product-price').value = product.salePrice
    document.getElementById('edit-product-unitType').value = product.unitType
    document.getElementById('edit-product-unitSize').value = product.unitSize
    document.getElementById('edit-product-note').value = product.note

    $("#modalEditProduct").modal("show");

}
const deleteProduct = (product) => {

}