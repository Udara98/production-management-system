let qRequestTableInstance;

window.addEventListener("load", function () {
    reloadQRequestTable();
});

const reloadQRequestTable = function (){
    const qRequests = ajaxGetRequest("/quotation-request/getAllRequests")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");

    const displayProperty = [
        {dataType: "text", propertyName: "requestNo"},
        {dataType: "text", propertyName: "ingCode"},
        {dataType: "date", propertyName: "requestDate"},
        {dataType: "List", propertyName: getSuppliers},
        {dataType: "text", propertyName: "requestStatus"},
    ];

    if(qRequestTableInstance){
        qRequestTableInstance.destroy();
    }
    $("#tableQRequests tbody").empty();
    tableDataBinder(
        tableQRequests,
        qRequests,
        displayProperty,
        true,
        generateQReqDropDown,
        getPrivilege
    )
    qRequestTableInstance = $("#tableQRequests").dataTable();
}
const generateQReqDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {name: "Delete", action: deleteQRequest, icon: "fa-solid fa-trash me-2"},
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

const getSuppliers = function (ob){
    const suppliers = [...ob.suppliers];
    const items = [];
    suppliers.forEach((sup)=>{
        items.push(sup)
    })
    return items;
}
const deleteQRequest=function (ob){
    swal.fire({
        title: "Delete Quotation Request",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/quotation-request/deleteQRequest/${ob.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadQRequestTable();
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