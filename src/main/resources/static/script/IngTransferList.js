const getTransferList = (left = [], right = [], getIng, prefix = 'default') => {
    const leftList = document.getElementById(`${prefix}-left-list`);
    const rightList = document.getElementById(`${prefix}-right-list`);

    const moveAllRightButton = document.getElementById(`${prefix}-move-all-right`);
    const moveSelectedRightButton = document.getElementById(`${prefix}-move-selected-right`);
    const moveSelectedLeftButton = document.getElementById(`${prefix}-move-selected-left`);
    const moveAllLeftButton = document.getElementById(`${prefix}-move-all-left`);

    let leftItems = [...left];
    let rightItems = [...right];
    let checked = [];

    function updateList(list, items) {
        list.innerHTML = "";
        items.forEach(item => {
            const listItem = document.createElement("li");
            listItem.className = "list-item";
            listItem.innerHTML = `
                <input type="checkbox" value="${item}" />
                ${item.ingredientName} (${item.ingredientCode})
            `;
            list.appendChild(listItem);

            listItem.addEventListener("click", (e) => {
                if (e.target.tagName !== "INPUT") {
                    const checkbox = listItem.querySelector("input[type='checkbox']");
                    checkbox.checked = !checkbox.checked;
                }
                handleToggle(item);
            });
        });
    }

    function handleToggle(value) {
        const currentIndex = checked.indexOf(value);
        if (currentIndex === -1) {
            checked.push(value);
        } else {
            checked.splice(currentIndex, 1);
        }
        updateButtons();
    }

    function not(a, b) {
        return a.filter(value => b.indexOf(value) === -1);
    }

    function intersection(a, b) {
        return a.filter(value => b.indexOf(value) !== -1);
    }

    function moveAllRight() {
        rightItems = rightItems.concat(leftItems);
        leftItems = [];
        checked = [];
        updateUI();
    }

    function moveCheckedRight() {
        const leftChecked = intersection(checked, leftItems);
        rightItems = rightItems.concat(leftChecked);
        leftItems = not(leftItems, leftChecked);
        checked = not(checked, leftChecked);
        updateUI();
    }

    function moveCheckedLeft() {
        const rightChecked = intersection(checked, rightItems);
        leftItems = leftItems.concat(rightChecked);
        rightItems = not(rightItems, rightChecked);
        checked = not(checked, rightChecked);
        updateUI();
    }

    function moveAllLeft() {
        leftItems = leftItems.concat(rightItems);
        rightItems = [];
        checked = [];
        updateUI();
    }

    function updateUI() {
        updateList(leftList, leftItems);
        updateList(rightList, rightItems);
        updateButtons();
        getIng(rightItems);
    }

    function updateButtons() {
        moveAllRightButton.disabled = leftItems.length === 0;
        moveSelectedRightButton.disabled = intersection(checked, leftItems).length === 0;
        moveSelectedLeftButton.disabled = intersection(checked, rightItems).length === 0;
        moveAllLeftButton.disabled = rightItems.length === 0;
    }

    moveAllRightButton.addEventListener("click", moveAllRight);
    moveSelectedRightButton.addEventListener("click", moveCheckedRight);
    moveSelectedLeftButton.addEventListener("click", moveCheckedLeft);
    moveAllLeftButton.addEventListener("click", moveAllLeft);

    updateUI();
};
