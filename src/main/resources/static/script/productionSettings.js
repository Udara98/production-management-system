let flavourTableInstance;
let ptTableInstance;
let selectedFlavour;
let selectedPT;
window.addEventListener('load', () => {
    reloadSettingTables()
    document.getElementById('flavourAddForm').onsubmit = function (event) {

        event.preventDefault();

        const flavourName = document.getElementById("flavour-name").value;

        let response = ajaxRequestBody(`/flavour/addNewFlavour/${flavourName}`, "POST", {});
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadSettingTables();
            $("#modalFlavourAdd").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
    document.getElementById('flavourEditForm').onsubmit = function (event) {
        event.preventDefault();
        const newName = document.getElementById('edit-flavour-name').value
        let response = ajaxRequestBody(`/flavour/updateFlavour/${selectedFlavour.id}/${newName}`, "PUT", {});
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadSettingTables()
            $("#modalFlavourEdit").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }

    document.getElementById('ptAddForm').onsubmit = function (event) {
        event.preventDefault();

        const ptName = document.getElementById("pt-name").value;

        let response = ajaxRequestBody(`/packageType/addNewPackageType/${ptName}`, "POST", {});
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadSettingTables();
            $("#modalPTAdd").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
    document.getElementById('ptEditForm').onsubmit = function (event) {
        event.preventDefault();
        const newName = document.getElementById('edit-pt-name').value
        let response = ajaxRequestBody(`/packageType/updatePT/${selectedPT.id}/${newName}`, "PUT", {});
        if (response.status === 200) {
            swal.fire({
                title: response.responseText,
                icon: "success",
            });
            reloadSettingTables()
            $("#modalPTEdit").modal("hide");

        } else {
            swal.fire({
                title: "Something Went Wrong",
                text: response.responseText,
                icon: "error",
            });
        }
    }
})

const reloadSettingTables = () => {
    const flavours = ajaxGetRequest("/flavour/getAllFlavours")
    const packageTypes = ajaxGetRequest("/packageType/getAllPackageTypes")
    let getPrivilege = ajaxGetRequest("/privilege/byloggedusermodule/SUPPLIER");


    const displayProperty = [
        {dataType: "text", propertyName: "id"},
        {dataType: "text", propertyName: "name"},
    ];
    if (flavourTableInstance) {
        flavourTableInstance.destroy();
    }

    $("#tableFlavour tbody").empty();

    tableDataBinder(
        tableFlavour,
        flavours,
        displayProperty,
        true,
        generateFlavourDropDown,
        getPrivilege
    )
    flavourTableInstance = $("#tableFlavour").DataTable({
        responsive: true,
        autoWidth: false,
    });

    if (ptTableInstance) {
        ptTableInstance.destroy();
    }
    $("#tablePTs tbody").empty();
    tableDataBinder(
        tablePTs,
        packageTypes,
        displayProperty,
        true,
        generatePTDropDown,
        getPrivilege
    )
    ptTableInstance = $("#tablePTs").DataTable({
        responsive: true,
        autoWidth: false,
    });
}
const generateFlavourDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: editFlavour,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deleteFlavour, icon: "fa-solid fa-trash me-2"},

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

const editFlavour = (flavour) => {
    selectedFlavour = flavour
    document.getElementById("edit-flavour-name").value = flavour.name
    $("#modalFlavourEdit").modal("show");
}
const deleteFlavour = (flavour) => {
    swal.fire({
        title: "Delete Flavour",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/flavour/deleteFlavour/${flavour.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadSettingTables();
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

const generatePTDropDown = (element) => {
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const buttonList = [
        {
            name: "Edit",
            action: editPT,
            icon: "fa-solid fa-edit me-2",
        },
        {name: "Delete", action: deletePT, icon: "fa-solid fa-trash me-2"},

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

const editPT = (pt) => {
    selectedPT = pt;
    document.getElementById("edit-pt-name").value = pt.name
    $("#modalPTEdit").modal("show");
}
const deletePT = (pt) => {
    swal.fire({
        title: "Delete Package Type",
        text: "Are you sure, you want to delete this?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#cb421a",
        cancelButtonColor: "#3f3f44",
        confirmButtonText: "Yes, Delete"
    }).then((result) => {
        if (result.isConfirmed) {
            let response = ajaxDeleteRequest(`/packageType/deletePT/${pt.id}`);
            if (response.status === 200) {
                swal.fire({
                    title: response.responseText,
                    icon: "success"
                });
                reloadSettingTables();
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