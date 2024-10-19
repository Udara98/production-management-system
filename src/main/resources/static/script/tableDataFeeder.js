function convertDateTimeToDate(dateTimeString) {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
const tableDataBinder = (
    tableID,
    dataList,
    columnsList,
    buttonVisibility = true,
    dropDown,
    privilegeOb
) => {
    const tableBody = tableID.children[1];
    tableBody.innerHTML = "";

    dataList.reverse().forEach((element, index) => {
        const tr = document.createElement("tr");
        tr.className = "align-items-center";

        const tdIndex = document.createElement("td");
        tdIndex.className = "align-middle";
        tdIndex.innerText = parseInt(index) + 1;
        tr.appendChild(tdIndex);

        columnsList.forEach((column) => {
            const td = document.createElement("td");
            td.className = "align-middle";
            if (column.dataType === "text") {
                td.innerText = element[column.propertyName];
            }
            if (column.dataType === "price") {
                td.innerText = parseFloat(element[column.propertyName]).toLocaleString("en-US", {
                    style: "currency",
                    currency: "LKR",
                });
            }
            if(column.dataType === "photo"){
                let img = document.createElement('img');
                img.style.width='10vh'
                img.style.height='10vh'

                img.src = `${element[column.propertyName]}`

                td.style.display='flex'
                td.style.justifyContent='center'
                td.style.alignItems='start'
                td.appendChild(img)
            }
            if (column.dataType === "date") {
                let leftAlignedEle  = document.createElement('span');
                leftAlignedEle.style.textAlign = 'left';  // Align text to the left
                leftAlignedEle.innerText=convertDateTimeToDate( element[column.propertyName]);
                td.appendChild(leftAlignedEle)
            }

            if (column.dataType === "function") {
                td.innerHTML = column.propertyName(element);
            }
            if (column.dataType === "List") {
                let ingList = document.createElement("ul");
                column.propertyName(element).forEach((item) => {
                    const liElement = document.createElement("li");

                    liElement.innerHTML = `${item}`
                    ingList.appendChild(liElement);
                })

                td.appendChild(ingList)
            }
            if (column.dataType === "button") {
                let btn = document.createElement('button');
                btn.className="btn btn-outline-primary w-75"
                btn.innerHTML=column.btnName
                btn.addEventListener('click',()=>{
                    column.propertyName(element)
                })
                let btnDiv = document.createElement('div');
                btnDiv.className='row justify-content-center'
                btnDiv.appendChild(btn)
                td.appendChild(btnDiv)
            }
            tr.appendChild(td);
        });

        if (buttonVisibility) {
            const tdButton = document.createElement("td");
            tdButton.className = "align-middle";

            const divDropdownContainer = document.createElement("div");
            divDropdownContainer.className = "dropdown d-flex justify-content-center";

            const iconButton = document.createElement("button");
            iconButton.className = "btn dropdown-toggle";
            iconButton.type = "button";
            iconButton.id = "dropdownMenu";
            iconButton.setAttribute("data-bs-toggle", "dropdown");
            iconButton.setAttribute("aria-expanded", "false");
            iconButton.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';

            const dropdownMenu = dropDown(element);

            divDropdownContainer.appendChild(iconButton);
            divDropdownContainer.appendChild(dropdownMenu);
            tdButton.appendChild(divDropdownContainer);
            tr.appendChild(tdButton);
        }

        tableBody.appendChild(tr);
    });
};
