let productTableInstance;
let selectedProduct;
window.addEventListener('load', () => {

    //Call table Refresh function
    itemTableRefresh();

    //Call form refresh function
    reloadProductForm();

    //Call function for validation
    formValidation();

    //Call function for validation restock
    restockFormValidation();

    let userPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/ITEM");

    const batchList = ajaxGetRequest('/batch/getAllBatches')





//    document.getElementById('productAddForm').onsubmit = (event) => {
//        event.preventDefault();
//        const formData = new FormData();
//        const fileInput = document.getElementById('add-product-photo');
//        const file = fileInput.files[0];
//        console.log(file)
//        if (file) {
//            formData.append('file', file);
//        }
        const selectedBatch = batchList.filter((b) => b.id === parseInt(document.getElementById('addProductBatch').value))[0]
//        formData.append('batchId', selectedBatch.id);
//        formData.append('productName', document.getElementById('add-product-name').value);
//        formData.append('reorderPoint', document.getElementById('add-product-rop').value);
//        formData.append('reorderQuantity', document.getElementById('add-product-roq').value);
//        formData.append('quantity', document.getElementById('add-product-qty').value);
//        formData.append('salePrice', document.getElementById('add-product-price').value);
//        formData.append('unitType', document.getElementById('add-product-unitType').value);
//        formData.append('unitSize', document.getElementById('add-product-unitSize').value);
//        formData.append('note', document.getElementById('add-product-note').value);
//
//        let response = ajaxFormDataBody("/product/addNewProduct", 'POST', formData)
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            itemTableRefresh();
//            $("#modalAddProduct").modal("hide");
//
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//    }



//    document.getElementById('productEditForm').onsubmit = (event) => {
//        event.preventDefault();
//        const formData = new FormData();
//        const fileInput = document.getElementById('edit-product-photo');
//        const file = fileInput.files[0];
//        if (file) {
//            formData.append('file', file);
//        }else {
//            formData.append('file', null);
//        }
//        const selectedBatch = batchList.filter((b) => b.id === parseInt(document.getElementById('add_product_batch').value))[0] || selectedProduct.batch
//        formData.append('batchId', selectedBatch.id);
//        formData.append('id', selectedProduct.id);
//        formData.append('productName', document.getElementById('edit-product-name').value);
//        formData.append('reorderPoint', document.getElementById('edit-product-rop').value);
//        formData.append('reorderQuantity', document.getElementById('edit-product-roq').value);
//        formData.append('quantity', document.getElementById('edit-product-qty').value);
//        formData.append('salePrice', document.getElementById('edit-product-price').value);
//        formData.append('unitType', document.getElementById('edit-product-unitType').value);
//        formData.append('unitSize', document.getElementById('edit-product-unitSize').value);
//        formData.append('note', document.getElementById('edit-product-note').value);
//
//        let response = ajaxFormDataBody("/product/updateProduct", 'PUT', formData)
//        if (response.status === 200) {
//            swal.fire({
//                title: response.responseText,
//                icon: "success",
//            });
//            itemTableRefresh();
//            $("#modalEditProduct").modal("hide");
//
//        } else {
//            swal.fire({
//                title: "Something Went Wrong",
//                text: response.responseText,
//                icon: "error",
//            });
//        }
//    }

});

//Define product submit function
 const productSubmit = () => {
    event.preventDefault();
    console.log("button Product Submit");
    console.log(product);

    // 1. Check form errors
    const errors = checkProductFormError();

    if (errors === "") {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to add the product " + product.productName + "?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E11D48",
            cancelButtonColor: "#3f3f44",
            confirmButtonText: "Yes, Add"
        }).then((result) => {
            if (result.isConfirmed) {
                // Create ProductDTO structure
                const productNew = {
                    productName: product.productName,
                    quantity: parseInt(product.quantity),
                    // salePrice: product.salePrice,
                    unitType: product.unitType,
                    unitSize: parseInt(product.unitSize),
                    reorderPoint: parseInt(product.reorderPoint),
                    reorderQuantity: parseInt(product.reorderQuantity),
                    note: product.note,
                    productPhoto: product.productPhoto,
                    productPhotoName: product.productPhotoName,
                    salesPrice: parseInt(product.salePrice),
                    batch:product.batch
                    
                };

                console.log(productNew)

                const postServiceRequestResponse = ajaxRequestBody("/product/addnew", "POST", productNew);

                // Check backend response
                if (postServiceRequestResponse.status === 200) {
                    $("#modalAddProduct").modal('hide');
                    productAddForm.reset();
                    itemTableRefresh();
                    reloadProductForm();

                    // Reset validation classes
                    Array.from(productAddForm.elements).forEach((field) => {
                        field.classList.remove('is-valid', 'is-invalid');
                    });

                    Swal.fire({
                        title: "Product Added Successfully!",
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
            title: "Product Not Added",
            text: errors,
            icon: "error"
        });
    }
};

//Reload product form
const reloadProductForm = () =>{

    product = new Object();
    oldProduct = null;

    //Get all products
    const products = ajaxGetRequest("/product/getAllProducts")


    //Get all batches
    const batchList = ajaxGetRequest('/batch/getAllBatches')

    //Get all package types
     const packageTypes = ajaxGetRequest('/packageType/getAllPackageTypes')

     //Get all flavour types
      const flavourTypes = ajaxGetRequest('/flavour/getAllFlavours')

    const batchSelect = document.getElementById('addProductBatch')

    const packageTypeSelect = document.getElementById('addPackageType')

    const flavourTypeSelect = document.getElementById('addFlavourType')

//    batchList.forEach((batch) => {
//        const option = document.createElement('option');
//        option.value = batch.id;
//        option.textContent = batch.batchNo;
//        batchSelect.appendChild(option);
//    })
//Auto refill all batches on dropdown
   fillDataIntoSelect(
       batchSelect,
       "Select Batch",
       batchList,
       "batchNo",
 );

//Auto refill all PackageTypes on dropdown
//  fillDataIntoSelect(
//        packageTypeSelect,
//        "Select Package Type",
//        packageTypes,
//        "name",
//  );

//Auto refill all PackageTypes on dropdown
//    fillDataIntoSelect(
//          flavourTypeSelect,
//          "Select Flavour Type",
//          flavourTypes.map(flavour => flavour.name ),
//          "name",
//    );

//Auto refill all flavourTypes on dropdown
flavourTypes.forEach(flavour => {
              const option = document.createElement('option');
              option.value = flavour.name;
              option.textContent = flavour.name;
              flavourTypeSelect.appendChild(option);
          });
//Auto refill all PackageTypes on dropdown
packageTypes.forEach(packageType => {
              const option = document.createElement('option');
              option.value = packageType.name;
              option.textContent = packageType.name;
              packageTypeSelect.appendChild(option);
          });
//    //Auto refill all PackageTypes on dropdown
//        fillDataIntoSelect(
//              flavourTypeSelect,
//              "Select Flavour Type",
//              packageTypes,
//              "name",
//        );




}

//Refill Product form fields
const productFormRefill = (ob, rowIndex) => {


  $("#modalAddProduct").modal('show');
  product = JSON.parse(JSON.stringify(ob));
  oldProduct = JSON.parse(JSON.stringify(ob));


  addProductName.value = product.productName ;
  addProductUnitSize.value = product.unitSize;
  addProductQty.value = product.quantity;
  addProductPrice.value = product.salePrice;
  addProductUnitType.value = product.unitType;


  if(product.productPhoto !=null){
    productPhoto.src = atob(product.productPhoto);

  }else {
     productPhoto.src = '/image/productimages/photo-icon-picture-icon.jpg';
  }

  if(product.reorderPoint !=null){
    addProductROP.value = product.reorderPoint;
  }else {
    addProductROP.value = '';
  }

  if(product.reorderQuantity !=null){
      addProductROQ.value = product.reorderQuantity;
    }else {
      addProductROQ.value = '';
  }

  if(product.note !=null){
        addProductNote.value = product.note;
      }else {
        addProductNote.value = '';
  }


  //refill  Batch No
  const batchList = ajaxGetRequest('/batch/getAllBatches')

  const batchSelect = document.getElementById('addProductBatch')

  fillDataIntoSelect(
         batchSelect,
         "Select Batch",
         batchList,
         "batchNo",
         product.batch.batchNo
   );


  //Select Valid Color for element

};

//Call function for validation and object binding
const formValidation = () =>{

    addProductBatch.addEventListener('change',  () => {
        DynamicSelectValidation(addProductBatch, 'product', 'batch');
    });

    addPackageType.addEventListener('change',  () => {
            selectFieldValidator(addPackageType,'', 'product', 'packageType');
        });

     addFlavourType.addEventListener('change',  () => {
                 selectFieldValidator(addFlavourType,'', 'product', 'flavour');
             });

    addProductName.addEventListener('input',  () => {
            validation(addProductName, '', 'product', 'productName');
    });

    addProductUnitSize.addEventListener('input',  () => {
                validation(addProductUnitSize, '^[1-9]$', 'product', 'unitSize');
    });

    addProductUnitType.addEventListener('input', () =>{
    selectFieldValidator(addProductUnitType,'','product','unitType')
    })

    addProductQty.addEventListener('input', () =>{
        validation(addProductQty,'^(?:[1-9][0-9]?|1[0-9]{2}|200)$','product','quantity')
    })

    addProductROP.addEventListener('input', () =>{
            validation(addProductROP,'^[1-9][0-9]?$','product','reorderPoint')
        })

    addProductROQ.addEventListener('input', () =>{
            validation(addProductROQ,'^(?:[1-9][0-9]?|1[0-9]{2}|200)$','product','reorderQuantity')
        })

    addProductPrice.addEventListener('input', () =>{
                validation(addProductPrice,'^(?:[1-9]|[1-9][0-9]|[1-9][0-9]{3}|[1-9][0-9]{2})$','product','salePrice')
         })

    addProductNote.addEventListener('input', () =>{
                 validation(addProductNote,'','product','note')
         })

    filePhoto.addEventListener('change', () =>{
                fileValidation(filePhoto, 'product', 'product_photo', 'productPhotoName', productPhoto);
    })

}

const generateProductName = function () {


    let flavourType = '';
    if (addFlavourType.value != '') {
        flavourType = addFlavourType.value;
    }
    let packageType = '';
    if (addPackageType.value != '') {
        packageType = addPackageType.value;
    }

    let unitSize = '';
        if (addProductUnitSize.value != '') {
            unitSize = addProductUnitSize.value;
        }

    let unitType = '';
        if (addProductUnitType.value != '') {
            unitType = addProductUnitType.value;
        }

    if ( flavourType != '' && packageType != '' && unitSize != '' && unitType != '') {
        addProductName.value = flavourType + 'Ice Cream' + ' - ' + unitSize + unitType + ' - ' + packageType;

        product.productName = addProductName.value;
        addProductName.classList.remove('is-invalid');
        addProductName.classList.add('is-valid');
    }
}


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
        if (ob.productStatus === "Removed") {
            return '<p class="align-middle GrayLabel mx-auto" style="width: 100px">Removed</p>';
        }
};


const getBatchNo = (ob) =>{
//    return ob.batch.batchNo;
return "BatchNO";
}

const getUnitAmount = (ob) =>{
return ob.unitSize + " " + ob.unitType;
}


//Define function for item Table Refresh
const itemTableRefresh = () => {

    product = new Object();

    const products = ajaxGetRequest("/product/getAllProducts")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/PRODUCT");

        const displayProperty = [
            {dataType: "photo", propertyName: "productPhoto"},
            {dataType: "text", propertyName: "productCode"},
            {dataType: "text", propertyName: "productName"},
            {dataType: "function", propertyName: getBatchNo},
            {dataType: "price", propertyName: "salePrice"},
            {dataType: "function", propertyName: getUnitAmount},
            {dataType: "text", propertyName: "quantity"},
            {dataType: "function", propertyName: getStatus},
        ];

//    let disProducts = []
//    products.forEach((product) => {
//        let prData = {...product};
//        prData.batchNo = product.batch.batchNo;
//        prData.unitAmount = product.unitSize + " " + product.unitType
//
//        disProducts.push(prData)
//    })




    if (productTableInstance) {
        productTableInstance.destroy();
    }
    $("#tableProduct tbody").empty();
    const dummyProductPhotoSrc = '/image/productimages/photo-icon-picture-icon.jpg';
    tableDataBinder(
        tableProduct,
        products,
        displayProperty,
        true,
        generateProductDropDown,
        getPrivilege,
        dummyProductPhotoSrc
    );

    productTableInstance = $("#tableProduct").DataTable({
        responsive: true,
        autoWidth: false,

    });
}

//Define function for Generate the dropdown
const generateProductDropDown = (element,index) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action:productFormRefill,
            icon: "fa-solid fa-edit me-2",
        },
        {   name: "Delete",
            action: deleteProduct,
            icon: "fa-solid fa-trash me-2",
         },
         {  name: "Add Stocks",
            action: stockAdditionFormRefill,
            icon: "fa-solid fa-plus me-2",
         },
         {  name: "Detail View ",
             action: viewProductDetailsTableRefill,
            icon: "fa-solid fa-eye me-2",
          }
    ];

    buttonList.forEach((button) => {
        const buttonElement = document.createElement("button");
        buttonElement.className = "dropdown-item btn";
        buttonElement.innerHTML = `<i class="${button.icon}"></i>${button.name}`;
        buttonElement.onclick = function () {
            button.action(element,index);
        };
        const liElement = document.createElement("li");
        liElement.appendChild(buttonElement);
        dropdownMenu.appendChild(liElement);
    });
    return dropdownMenu;
};


//Define Function for Edit the product
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


const detailView = (product) => {
    $("#modalViewProduct").modal("show");
}

// create function for delete User
const deleteProduct = (product) => {
    console.log("delete");

    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete Product " +
            "" + (product.productName) +"?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E11D48",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then(async (result) => {
        if(result.isConfirmed) {

            // Delete Service
            let deleteServiceRequestResponse = ajaxDeleteRequest(`/product/deleteProduct/${product.id}`);


            //Check Backend Service
            if (deleteServiceRequestResponse.status === 200) {
                            swal.fire({
                                title: deleteServiceRequestResponse.responseText,
                                icon: "success"
                            });
                            itemTableRefresh();
                        } else {
                            swal.fire({
                                title: "Something Went Wrong",
                                text: deleteServiceRequestResponse.responseText,
                                icon: "error"
                            });
                                        }
                                    }
                                });
                            } ;

// Function to preview the uploaded photo
    function previewPhoto(event) {
        const reader = new FileReader();
        reader.onload = function(){
            const output = document.getElementById('productPhoto');
            output.src = reader.result;  // Change the image src to the uploaded file
        };
        reader.readAsDataURL(event.target.files[0]);  // Convert the file to a data URL
    }

    // Function to reset the photo back to the default
    function clearPhoto() {
        document.getElementById('productPhoto').src = "/image/productimages/photo-icon-picture-icon.jpg";
        document.getElementById('filePhoto').value = "";  // Clear the file input value
        product.productPhoto = null;
    }

//

//Check product form errors
const checkProductFormError = () => {
    let errors = '';

    if (product.batch == null) {
        errors = errors + "Batch No can't be null \n";
        addProductBatch.classList.add('is-invalid')
    }

    if (product.productName == null) {
        errors = errors + "Product name can't be null \n";
        addProductName.classList.add('is-invalid')
    }


    if (product.quantity == null) {
        errors = errors + "Please Enter Quantity \n";
        addProductQty.classList.add('is-invalid')
    }


    if (product.salePrice == null) {
        errors = errors + "Email Enter Valid Sales price \n";
        addProductPrice.classList.add('is-invalid')
    }


    if (product.unitType == null) {
        errors = errors + "Please Select the Unit Type \n";
        addProductUnitType.classList.add('is-invalid');
    }

    if (product.unitSize == null) {
            errors = errors + "Please Enter the Unit Size \n";
            addProductUnitSize.classList.add('is-invalid');
        }

    return errors;
}

//Define function for Product update
  const productUpdate = () => {
    event.preventDefault();
    productAddForm.classList.add('needs-validation');
    console.log("Product update Button");
    console.log(product);

    //Check form Error
    let errors = checkProductFormError();

    if (errors === "") {
      //Check form update
      let updates = checkUpdates();
      console.log(updates);
      productAddForm.classList.remove('was-validated')
      $('#modalAddProduct').modal("hide");
      if (updates !== "") {
        swal.fire({
          title: "Do you want to Update product",
          html:updates,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#cb421a",
          cancelButtonColor: "#3f3f44",
          confirmButtonText: "Yes, Update"
        }).then((result) =>{
          if(result.isConfirmed){
            // Create ProductDTO structure
            const productDTO = {
                id: product.id,
                productName: product.productName,
                quantity: product.quantity,
                salePrice: product.salePrice,
                unitType: product.unitType,
                unitSize: product.unitSize,
                reorderPoint: product.reorderPoint,
                reorderQuantity: product.reorderQuantity,
                note: product.note,
                productPhoto: product.productPhoto,
                productPhotoName: product.productPhotoName,
                // Create the batches array in DTO format
                batches: [{
                    batchId: product.batch.id,
                    quantity: product.quantity,
                    salesPrice: product.salePrice
                }]
            };

            let updateServiceResponse = ajaxRequestBody("/product", "PUT", productDTO);

            if (updateServiceResponse.status === 200) {
              // alert("Update successfully ...! \n");
              Swal.fire({
                title: "Update successfully ..! ",
                text: "",
                icon: "success"
              });
              //Need to refresh
              productAddForm.reset();
              itemTableRefresh();
              reloadProductForm();
              // Remove 'is-valid' and 'is-invalid' classes from all input fields
              document.querySelectorAll('.needs-validation input,.needs-validation select, .needs-validation textarea ').forEach((input) => {
                input.classList.remove('is-valid', 'is-invalid');
              });
              productAddForm.classList.remove('was-validated');
              //Need hide modal
              $('#modalAddProduct').modal("hide");
            } else {
              Swal.fire({
                title: "Update Not Successfully ...!",
                text: updateServiceResponse.responseText,
                icon: "error"
              });
            }
          }

        })

      } else {
        $('#modalAddProduct').modal("hide");
        Swal.fire({
          title: "No updates Found..!",
          text: '',
          icon: "question"
        });
      }

    } else {
      $('#modalAddProduct').modal("hide");
      Swal.fire({
        title: "Form has following errors!",
        text: errors,
        icon: "error"
      });
    }
  }

  //Define method for check updates
    const checkUpdates = () =>{
      let updates = "";

      if(product.batch.batchNo !== oldProduct.batch.batchNo){
        updates = updates + "Batch No is changed" + oldProduct.batchNo + " into " + product.batchNo + "<br>";
      }

      if(product.productName !== oldProduct.productName){
        updates = updates + "Product Name is changed" + oldProduct.productName + " into " + product.productName +"<br>";
      }

      if(product.quantity !== oldProduct.quantity){
        updates = updates + "Quantity is changed" + oldProduct.quantity + " into " + product.quantity + "<br>";
      }

      if(product.unitSize !== oldProduct.unitSize){
        updates = updates + "UnitSize is changed" + oldProduct.unitSize + " into " + product.unitSize + "<br>";
      }

      if(product.reorderPoint !== oldProduct.reorderPoint){
        updates = updates + "ROP is changed" + oldProduct.reorderPoint + " into " + product.reorderPoint + "<br>";
      }

      if(product.reorderQuantity !== oldProduct.reorderQuantity){
        updates = updates + "ROQ is changed" + oldProduct.reorderQuantity + " into " + product.reorderQuantity + "<br>";
      }

      if(product.salePrice !== oldProduct.salePrice){
        updates = updates + "Sales Price is Change " + oldProduct.salePrice + " into "+ product.salePrice+  "<br>";
      }

      if(product.note !== oldProduct.note){
        updates = updates + "Note is Change " + oldProduct.note + " into "+ product.note+  "<br>";
      }

      if(product.productPhoto !== oldProduct.productPhoto){
              updates = updates + "Product Image is Change " + oldProduct.productPhotoName + " into "+ product.productPhotoName+  "<br>";
            }

      return updates;
    }


    //Refill Ingredient form fields
    const stockAdditionFormRefill = (ob, rowIndex) => {
      $("#modalAddStockProduct").modal('show');
      product = JSON.parse(JSON.stringify(ob));
      console.log(product);
      oldProduct = JSON.parse(JSON.stringify(ob));

        const stockBatchSelect = document.getElementById('stockBatchSelect');

        const stockProductName = document.getElementById('stockProductName');

        const addStockQty = document.getElementById('addStockQty');

        const stockUnitCost = document.getElementById('stockUnitCost');


     const restockBatchList = ajaxGetRequest(`batch/getBatchesForProduct/${product.id}/true`)

     console.log(restockBatchList);

     //Fill Dropdown of  select Supplier
       restockBatchList.forEach(batch => {
               const option = document.createElement('option');
               option.value = batch.id;
               option.textContent = batch.batchNo;
               stockBatchSelect.appendChild(option);
        });


      stockAdd = new Object();
      oldStockAdd = null;

      stockAdd.productId = product.id;


      stockProductName.value = product.productName;
      stockProductName.disabled = true;

      currentStock.value = product.quantity;
      currentStock.disabled = true;

    };

  const restockFormValidation = () => {
    // Batch validation
    stockBatchSelect.addEventListener('change', () => {
        selectFieldValidator(stockBatchSelect, '', 'stockAdd', 'batchId');
    });

    // Quantity validation - must be between 1 and 200
    addStockQty.addEventListener('input', () => {
        validation(addStockQty, '^(?:[1-9][0-9]?|1[0-9]{2}|200)$', 'stockAdd', 'quantity');
    });

    // Sales Price validation - must be a positive number
    stockUnitCost.addEventListener('input', () => {
        validation(stockUnitCost, '^(?:[1-9]|[1-9][0-9]|[1-9][0-9]{3}|[1-9][0-9]{2})$', 'stockAdd', 'salesPrice');
    });

    // Notes validation - optional text field
    stockAdditionNote.addEventListener('input', () => {
        validation(stockAdditionNote, '', 'stockAdd', 'note');
    });
  };

  //Define product submit function
   const productRestockSubmit = () => {
      event.preventDefault();
      console.log(stockAdd);

      // 1. Check form errors
      const errors = checkProductRestockFormError();

      if (errors === "") {
          Swal.fire({
              title: "Are you sure?",
              text: "Do you want to add the Stocks? "  + "?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#E11D48",
              cancelButtonColor: "#3f3f44",
              confirmButtonText: "Yes, Add"
          }).then((result) => {
              if (result.isConfirmed) {
                  const postServiceRequestResponse = ajaxRequestBody("/product/restock", "POST", stockAdd);

                  // Check backend response
                  if (postServiceRequestResponse.status === 200) {
                      $("#modalAddStockProduct").modal('hide');
                      stockAddForm.reset();

                      // Refresh the product table
                      itemTableRefresh();

                      // Reset validation classes
                      Array.from(stockAddForm.elements).forEach((field) => {
                          field.classList.remove('is-valid', 'is-invalid');
                      });

                      // Clear the stockAdd object
                      stockAdd = new Object();
                      oldStockAdd = null;

                      Swal.fire({
                          title: "Stock Added Successfully!",
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
              title: "Stock Not Added",
              text: errors,
              icon: "error"
          });
      }
  };



//Check product form errors
const checkProductRestockFormError = () => {
    let errors = '';

    // Validate Batch
    if (stockAdd.batchId == null) {
        errors = errors + "Please select a Batch\n";
        stockBatchSelect.classList.add('is-invalid');
    }

    // Validate Quantity
    if (stockAdd.quantity == null) {
        errors = errors + "Please enter a valid quantity (1-200)\n";
        addStockQty.classList.add('is-invalid');
    }

    // Validate Sales Price (required)
    if (stockAdd.salesPrice == null) {
        errors = errors + "Please enter a valid sales price\n";
        stockUnitCost.classList.add('is-invalid');
    } else if (!/^(?:[1-9]|[1-9][0-9]|[1-9][0-9]{3}|[1-9][0-9]{2})$/.test(stockAdd.salesPrice)) {
        errors = errors + "Please enter a valid sales price\n";
        stockUnitCost.classList.add('is-invalid');
    }

    return errors;
};


 //Refill Ingredient form fields
    const viewProductDetailsTableRefill = (ob, rowIndex) => {
      $("#modalViewProduct").modal('show');
      product = JSON.parse(JSON.stringify(ob));
      console.log(product);

        const detailProductImageThumbnail = document.getElementById('detailProductImageThumbnail');

        const detailProductName = document.getElementById('detailProductName');

        const detailProductCode = document.getElementById('detailProductCode');

        const detailProductStatus = document.getElementById('detailProductStatus');

        const detailQuantity = document.getElementById('detailQuantity');


         if(product.productPhoto !=null){
            detailProductImageThumbnail.src = atob(product.productPhoto);

          }else {
             productPhoto.src = '/image/productimages/photo-icon-picture-icon.jpg';
          }

          detailProductName.innerText = product.productName;
          detailProductCode.innerText = product.productCode;
          detailProductStatus.innerHTML = getStatus(product);
          detailQuantity.innerText = product.quantity;

          const getBatchNo = (ob) =>{
                      return ob.batch.batchNo;
                      }


           const displayProperty = [
                      {dataType: "function", propertyName: getBatchNo},
                      {dataType: "text", propertyName: "quantity"},
                      {dataType: "text", propertyName: "expireDate"},
                      {dataType: "price", propertyName: "salesPrice"},
                  ];

         let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/PRODUCT");

         const productHasBatches = ajaxGetRequest(`/productHasBatch/getByProductId/${product.id}`)


         tableDataBinder(
             batchDetailsTable,
             productHasBatches,
             displayProperty,
             null,
             null,
             getPrivilege,
             null
         );

//        const stockUnitCost = document.getElementById('stockUnitCost');
//
//
//     const restockBatchList = ajaxGetRequest(`batch/getBatchesForProduct/${product.id}/true`)
//
//     console.log(restockBatchList);
//
//     //Fill Dropdown of  select Supplier
//       restockBatchList.forEach(batch => {
//               const option = document.createElement('option');
//               option.value = batch.id;
//               option.textContent = batch.batchNo;
//               stockBatchSelect.appendChild(option);
//        });
//
//
//      stockAdd = new Object();
//      oldStockAdd = null;
//
//      stockAdd.productId = product.id;
//
//
//      stockProductName.value = product.productName;
//      stockProductName.disabled = true;
//
//      currentStock.value = product.quantity;
//      currentStock.disabled = true;

    };