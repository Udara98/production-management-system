const fillDataIntoTable1 = (
  tableID,
  dataList,
  columnsList,
  editFunction,
  deleteFunction,
  printFuntion,
  buttonVisibility = true
) => {
  const tableBody = tableID.children[1];
  tableBody.innerHTML = "";

  dataList.forEach((element, index) => {
    const tr = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.innerText = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    columnsList.forEach((column) => {
      const td = document.createElement("td");

      if (column.dataType == "text") {
        td.innerText = element[column.propertyName];
      }
      if (column.dataType == "function") {
        td.innerHTML = column.propertyName(element);
      }
      tr.appendChild(td);
    });

    const tdButton = document.createElement("td");

    const buttonEdit = document.createElement("button");
    buttonEdit.className = "btn btn-warning fw-bold";
    buttonEdit.innerHTML = '<i class="fa-solid fa-edit fa-beat"></i> edit';
    tdButton.appendChild(buttonEdit);
    buttonEdit.onclick = function () {
      editFunction(element, index);
    };

    const buttonDelete = document.createElement("button");
    buttonDelete.className = "btn btn-danger ms-2 me-2";
    buttonDelete.innerHTML = '<i class="fa-solid fa-trash fa-beat"></i> delete';
    tdButton.appendChild(buttonDelete);
    buttonDelete.onclick = function () {
      deleteFunction(element, index);
      // console.log('delte');
      // confirm('are you sure to delete following employee');
    };

    const buttonPrint = document.createElement("button");
    buttonPrint.className = "btn btn-primary fw-bold";
    buttonPrint.innerHTML = '<i class="fa-solid fa-eye fa-beat"></i> print';
    tdButton.appendChild(buttonPrint);
    buttonPrint.onclick = function () {
      printFuntion(element, index);
    };

    if (buttonVisibility) {
      tr.appendChild(tdButton);
    }

    tableBody.appendChild(tr);
  });
};
const fillDataIntoTable6 = (
    tableID,
    dataList,
    columnsList,
    editFunction,
    deleteFunction,
    printFuntion,
    buttonVisibility = true,
    privilegeOb
) => {
  const tableBody = tableID.children[1];
  tableBody.innerHTML = "";

  dataList.forEach((element, index) => {
    const tr = document.createElement("tr");
    tr.className = "align-items-center";


    const tdIndex = document.createElement("td");
    tdIndex.className = "align-middle";
    tdIndex.innerText = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    columnsList.forEach((column) => {
      const td = document.createElement("td");
      td.className = "align-middle";


      if (column.dataType == "text") {
        td.innerText = element[column.propertyName];
      }
      if (column.dataType == "function") {
        td.innerHTML = column.propertyName(element);
      }
      if (column.dataType == 'photo') {
         let img = document.createElement('img');
         img.style.width = '40px';
         img.style.height = '40px';
         img.style.borderRadius = '50%';
         td.style.textAlign = "center";
         if (element[column.dataType] != null) {
         img.src = atob(element[column.dataType]);
//         console.log(element[column.dataType])
          } else {
                    img.src = '/image/userprofilephotos/userprofilephotodummy.png';
                }
                td.appendChild(img);
            }
        tr.appendChild(td);
        });

    const tdButton = document.createElement("td");
    tdButton.className = "align-middle";


    //Create Dropdown Container
    const divDropdownContainer = document.createElement("div");
    divDropdownContainer.className = "dropdown d-flex justify-content-center";

    //Create Icon Button
    const iconButton = document.createElement("button");
    iconButton.className = "btn dropdown-toggle";
    iconButton.type = "button";
    iconButton.id = "dropdownMenu";
    iconButton.setAttribute("data-bs-toggle","dropdown");
    iconButton.setAttribute("aria-expanded","false");

    //Set the Icon to the button
    iconButton.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';

    //Create Dropdown menu
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";


    //Append the IconButton and dropdownContainer
    divDropdownContainer.appendChild(iconButton);
    divDropdownContainer.appendChild(dropdownMenu);
    tdButton.appendChild(divDropdownContainer);


    const buttonEdit = document.createElement("button");
    buttonEdit.className = "dropdown-item btn";
    buttonEdit.innerHTML = '<i class="fa-solid fa-edit me-2"></i> Edit Employee';
    const liElementEdit = document.createElement("li");
    buttonEdit.onclick = function () {
      editFunction(element, index);
    };

    const buttonDelete = document.createElement("button");
    buttonDelete.className = "dropdown-item btn ";
    buttonDelete.innerHTML = '<i class="fa-solid fa-trash me-2"></i>Delete Employee';
    const liElementDelete = document.createElement("li");
    buttonDelete.onclick = function () {
      deleteFunction(element, index);
      // console.log('delte');
      // confirm('are you sure to delete following employee');
    };

    const buttonPrint = document.createElement("button");
    buttonPrint.className = "dropdown-item btn";
    buttonPrint.innerHTML = '<i class="fa-solid fa-eye me-2 "></i> print';
    const liElementPrint = document.createElement("li");
    liElementPrint.appendChild(buttonPrint);
    dropdownMenu.appendChild(liElementPrint);
    buttonPrint.onclick = function () {
      printFuntion(element, index);
    };

    if (buttonVisibility) {
      if(privilegeOb !== null && privilegeOb.update ){
        liElementEdit.appendChild(buttonEdit);
        dropdownMenu.appendChild(liElementEdit);

      }
      if(privilegeOb !== null && privilegeOb.delete  ){
        liElementDelete.appendChild(buttonDelete);
        dropdownMenu.appendChild(liElementDelete);
      }

      tr.appendChild(tdButton);
    }

    tableBody.appendChild(tr);
  });
};

//FillDataIntoPrivilege
const FillDataIntoPrivilege = (
    tableID,
    dataList,
    columnsList,
    editFunction,
    deleteFunction,
    printFuntion,
    buttonVisibility = true
) => {
  const tableBody = tableID.children[1];
  tableBody.innerHTML = "";

  dataList.forEach((element, index) => {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    const thTag = document.createElement("th");
    const divTag = document.createElement("div");




    tdIndex.className = "align-middle";
    tdIndex.innerText = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    columnsList.forEach((column) => {
      const td = document.createElement("td");
      td.className = "align-middle";


      if (column.dataType == "text") {
        td.innerText = element[column.propertyName];
      }
      if (column.dataType == "function") {
        td.innerHTML = column.propertyName(element);
      }
      tr.appendChild(td);
    });

    const tdButton = document.createElement("td");
    tdButton.className = "align-middle";


    //Create Dropdown Container
    const divDropdownContainer = document.createElement("div");
    divDropdownContainer.className = "dropdown d-flex justify-content-center";

    //Create Icon Button
    const iconButton = document.createElement("button");
    iconButton.className = "btn dropdown-toggle";
    iconButton.type = "button";
    iconButton.id = "dropdownMenu";
    iconButton.setAttribute("data-bs-toggle","dropdown");
    iconButton.setAttribute("aria-expanded","false");

    //Set the Icon to the button
    iconButton.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';

    //Create Dropdown menu
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";


    //Append the IconButton and dropdownContainer
    divDropdownContainer.appendChild(iconButton);
    divDropdownContainer.appendChild(dropdownMenu);
    tdButton.appendChild(divDropdownContainer);


    const buttonEdit = document.createElement("button");
    buttonEdit.className = "dropdown-item btn";
    buttonEdit.innerHTML = '<i class="fa-solid fa-edit me-2"></i> Edit Employee';
    const liElementEdit = document.createElement("li");
    liElementEdit.appendChild(buttonEdit);
    dropdownMenu.appendChild(liElementEdit);
    buttonEdit.onclick = function () {
      editFunction(element, index);
    };

    const buttonDelete = document.createElement("button");
    buttonDelete.className = "dropdown-item btn ";
    buttonDelete.innerHTML = '<i class="fa-solid fa-trash me-2"></i>Delete Employee';
    const liElementDelete = document.createElement("li");
    liElementDelete.appendChild(buttonDelete);
    dropdownMenu.appendChild(liElementDelete);
    buttonDelete.onclick = function () {
      deleteFunction(element, index);
      // console.log('delte');
      // confirm('are you sure to delete following employee');
    };

    const buttonPrint = document.createElement("button");
    buttonPrint.className = "dropdown-item btn";
    buttonPrint.innerHTML = '<i class="fa-solid fa-eye me-2 "></i> print';
    const liElementPrint = document.createElement("li");
    liElementPrint.appendChild(buttonPrint);
    dropdownMenu.appendChild(liElementPrint);
    buttonPrint.onclick = function () {
      printFuntion(element, index);
    };

    if (buttonVisibility) {
      tr.appendChild(tdButton);
    }

    tableBody.appendChild(tr);
  });
};
const fillDataIntoTable2 = (
  tableID,
  dataList,
  columnsList,
  editFunction,
  deleteFunction,
  printFuntion
) => {
  const tableBody = tableID.children[1];
  tableBody.innerHTML = "";

  dataList.forEach((element, index) => {
    const tr = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.innerText = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    columnsList.forEach((column) => {
      const td = document.createElement("td");

      if (column.dataType == "text") {
        td.innerText = element[column.propertyName];
      }
      if (column.dataType == "funtion") {
        td.innerHTML = column.propertyName(element);
      }
      tr.appendChild(td);
    });

    const tdButton = document.createElement("td");
    const dropDownDiv = document.createElement("div");
    dropDownDiv.className = "dropdown";

    const dropdownI = document.createElement("i");
    dropdownI.className = "fa-solid fa-ellipsis-vertical";
    dropdownI.setAttribute("data-bs-toggle", "dropdown");
    dropdownI.setAttribute("aria-expanded", "false");

    const dropdownUl = document.createElement("ul");
    dropdownUl.className = "dropdown-menu";

    const dropdownMenuLiEdit = document.createElement("li");
    dropdownMenuLiEdit.className = "dropdown-item";

    const buttonEdit = document.createElement("button");
    buttonEdit.className = "btn btn-warning fw-bold";
    buttonEdit.innerHTML = '<i class="fa-solid fa-edit fa-beat"></i> edit';
    tdButton.appendChild(buttonEdit);
    buttonEdit.onclick = function () {
      editFunction(element, index);
    };
    dropdownMenuLiEdit.appendChild(buttonEdit);

    const dropDownMenuLiDelete = document.createElement("li");
    dropDownMenuLiDelete.className = "dropdown-item";

    const buttonDelete = document.createElement("button");
    buttonDelete.className = "btn btn-danger ms-2 me-2";
    buttonDelete.innerHTML = '<i class="fa-solid fa-trash fa-beat"></i> delete';
    tdButton.appendChild(buttonDelete);
    buttonDelete.onclick = function () {
      deleteFunction(element, index);
      // console.log('delte');
      // confirm('are you sure to delete following employee');
    };
    dropDownMenuLiDelete.appendChild(buttonDelete);

    const dropDownMenuLiPrint = document.createElement("li");
    dropDownMenuLiPrint.className = "dropdown-item";
    const buttonPrint = document.createElement("button");
    buttonPrint.className = "btn btn-primary fw-bold";
    buttonPrint.innerHTML = '<i class="fa-solid fa-eye fa-beat"></i> print';
    tdButton.appendChild(buttonPrint);
    buttonPrint.onclick = function () {
      printFuntion(element, index);
    };
    dropDownMenuLiPrint.appendChild(buttonPrint);

    dropdownUl.appendChild(dropdownMenuLiEdit);
    dropdownUl.appendChild(dropDownMenuLiDelete);
    dropdownUl.appendChild(dropDownMenuLiPrint);

    dropDownDiv.appendChild(dropdownI);
    dropDownDiv.appendChild(dropdownUl);

    tdButton.appendChild(dropDownDiv);
    tr.appendChild(tdButton);

    tableBody.appendChild(tr);
  });
};

const fillDataIntoTable3 = (
  tableID,
  dataList,
  columnsList,
  buttonVisibility = true
) => {
  const tableBody = tableID.children[1];
  tableBody.innerHTML = "";

  dataList.forEach((element, index) => {
    const tr = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.innerText = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    columnsList.forEach((column) => {
      const td = document.createElement("td");

      if (column.dataType == "text") {
        td.innerText = element[column.propertyName];
      }
      if (column.dataType == "funtion") {
        td.innerHTML = column.propertyName(element);
      }
      tr.appendChild(td);
    });

    const tdButton = document.createElement("td");
    tdButton.className = "text-center";

    const inputRadio = document.createElement("input");
    inputRadio.className = "form-check-input mt-3";
    inputRadio.name = "modify";
    inputRadio.type = "radio";

    inputRadio.onchange = function () {
      window["editOb"] = element;
      window["editRow"] = index;
      divModify.className = "d-block";
    };

    tdButton.appendChild(inputRadio);

    if (buttonVisibility) {
      tr.appendChild(tdButton);
    }

    tableBody.appendChild(tr);
  });
};

const fillDataIntoTable4 = (
  tableID,
  dataList,
  columnsList,
  buttonVisibility = true
) => {
  const tableBody = tableID.children[1];
  tableBody.innerHTML = "";

  dataList.forEach((element, index) => {
    const tr = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.innerText = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    columnsList.forEach((column) => {
      const td = document.createElement("td");

      if (column.dataType == "text") {
        td.innerText = element[column.propertyName];
      }
      if (column.dataType == "funtion") {
        td.innerHTML = column.propertyName(element);
      }
      tr.appendChild(td);
    });

    tr.onclick = function () {
      window["editOb"] = element;
      window["editRow"] = index;

      divModify.className = "d-block";
    };

    tableBody.appendChild(tr);
  });
};

const fillDataIntoTable5 = (
  tableID,
  dataList,
  columnsList,
  editFunction,
  buttonVisibility = true
) => {
  const tableBody = tableID.children[1];
  tableBody.innerHTML = "";

  dataList.forEach((element, index) => {
    const tr = document.createElement("tr");
    tr.className = "align-items-center";

    const tdIndex = document.createElement("td");
    tdIndex.innerText = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    columnsList.forEach((column) => {
      const td = document.createElement("td");
      td.className = "align-middle";

      if (column.dataType == "text") {
        td.innerText = element[column.propertyName];
      }
      if (column.dataType == "funtion") {
        td.innerHTML = column.propertyName(element);
      }
      tr.appendChild(td);
    });

    tr.onclick = function () {
      editFunction(element, index);
      window["editOb"] = element;
      window["editRow"] = index;

      divModify.className = "d-block";
    };

    tableBody.appendChild(tr);
  });
};


//Define fill data into select element
const fillDataIntoSelect = (fieldId, message, dataList, property, selectedValue) =>{

  fieldId.innerHTML = "";
  let optionMsg = document.createElement("option");

  if(message!=="") {
    optionMsg.value = '';
    optionMsg.selected = true;
    optionMsg.disabled = true;
    optionMsg.innerText = message;
    fieldId.appendChild(optionMsg);
  }
  dataList.forEach(element =>{
    const option = document.createElement("option");
    option.innerHTML = element[property];
    option.value = JSON.stringify(element);
    if(selectedValue === element[property]){
      option.selected = 'selected';
``    }
    fieldId.appendChild(option);
  })


}


const fillDataIntoSelectTwo = (fieldId, message, dataList, property, propertyTwo, selectedValue) =>{
  fieldId.innerHTML = "";

  if(message!=""){
  let optionMsg = document.createElement("option");
  optionMsg.value= '';
  optionMsg.selected = "selected";
  optionMsg.disabled = "Disabled";
  optionMsg.innerText = message;
  fieldId.appendChild(optionMsg);

  }

  dataList.forEach(element =>{
    const option = document.createElement("option");
    option.innerText = "(" + element[property] + ")"+ [propertyTwo];
    option.value = JSON.stringify(element);
    console.log(option.value);
    if(selectedValue === element[property]){
      option.selected = 'selected';
      ``    }
    fieldId.appendChild(option);
  })


}