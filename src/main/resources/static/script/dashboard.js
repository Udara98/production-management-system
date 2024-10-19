window.addEventListener('load', () => {
    getData();
    reloadTable();
    const ctx = document.getElementById('barchart');
    const itx = document.getElementById('incomeChart');
    const stx = document.getElementById('salesChart');

    const cusPayments = ajaxGetRequest('/cusPayment/getAllCusPayments')
    const batches = ajaxGetRequest("/batch/getAllBatches")


    const daysArray = Array.from({length: 31}, (v, k) => k + 1);

    let thisMonth = []
    let prevMonth = []

    cusPayments.map((cp) => {
        const month = new Date(cp.paymentDate).getMonth();
        if (month === new Date().getMonth()) {
            const day = new Date(cp.paymentDate).getDate()
            let amount = 0.0;
            let newThisMonth = [];
            if (thisMonth.length !== 0) {
                let selected = thisMonth.filter((s) => s.x === day)

                if (selected.length !== 0) {
                    amount = parseFloat(selected[0].y)
                    newThisMonth = thisMonth.filter((s) => s.x !== day)
                } else {
                    newThisMonth = thisMonth;
                }

            }
            newThisMonth.push({x: day, y: (parseFloat(cp.totalAmount) + amount)})
            thisMonth = newThisMonth;
        }
        if (month === new Date().getMonth() - 1) {
            const day = new Date(cp.paymentDate).getDate()
            let amount = 0.0;
            let newPrevMonth = [];
            if (prevMonth.length !== 0) {
                let selected = prevMonth.filter((s) => s.x === day)

                if (selected.length !== 0) {
                    amount = parseFloat(selected[0].y)
                    newPrevMonth = prevMonth.filter((s) => s.x !== day)
                } else {
                    newPrevMonth = prevMonth;
                }

            }
            newPrevMonth.push({x: day, y: (parseFloat(cp.totalAmount) + amount)})
            prevMonth = newPrevMonth;
        }

    })

    new Chart(stx, {
        type: 'line',
        data: {
            labels: daysArray,
            datasets: [{
                label: 'This Month Sales',
                data: thisMonth,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
                {
                    label: 'Previous Month Sales',
                    data: prevMonth,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
        },
    });

    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let sales = [];
    let cost = [];
    cusPayments.map((cp) => {
        const month = new Date(cp.paymentDate).getMonth();
        let amount = 0.0;
        let newSales = [];
        if (sales.length !== 0) {
            let selected = sales.filter((s) => s.x === labels[month])
            if (selected.length !== 0) {
                amount = parseFloat(selected[0].y)
                newSales = sales.filter((s) => s.x !== labels[month])
            } else {
                newSales = sales
            }

        }
        newSales.push({x: labels[month], y: (parseFloat(cp.totalAmount) + amount)})
        sales = newSales;
    })
    batches.map((batch) => {
        const month = new Date(batch.manufactureDate).getMonth();
        let amount = 0.0;
        let newCost = [];
        if (cost.length !== 0) {
            let selected = cost.filter((s) => s.x === labels[month])
            if (selected.length !== 0) {
                amount = parseFloat(selected[0].y)
                newCost = cost.filter((s) => s.x !== labels[month])
            } else {
                newCost = sales
            }

        }
        newCost.push({x: labels[month], y: (parseFloat(batch.totalCost) + amount)})
        cost = newCost;
    })
    new Chart(itx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales',
                data: sales,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
                {
                    label: 'Cost',
                    data: cost,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
        }
    });

    let ingredientList = ajaxGetRequest("/ingredient/getAllIngredients", "GET");
    let stockLevels = []
    let insCount = 0;
    let lsCount = 0;
    let osCount = 0;
    ingredientList.map((ing) => {

        let updatingSL = []
        if (ing.ingredientStatus === "InStock") {
            insCount = insCount + 1
        }
        if (ing.ingredientStatus === "LowStock") {
            lsCount = lsCount + 1
        }
        if (ing.ingredientStatus === "OutOfStock") {
            osCount = osCount + 1
        }
        updatingSL.push({x:"In Stock",y:insCount})
        updatingSL.push({x:"Low Stock",y:lsCount})
        updatingSL.push({x:"Out of Stock",y:osCount})
        stockLevels = updatingSL

    })

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                label: 'Ingredient Stock Level',
                data: stockLevels,
                borderWidth: 1,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.4)',
                    'rgba(255, 159, 64, 0.4)',
                    'rgba(255, 99, 132, 0.4)',
                ]
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
})

const getData = () => {
    const quotations = ajaxGetRequest("/quotation/getAllQuotations").filter((q) => q.quotationStatus === "Pending");
    const grnList = ajaxGetRequest("/grn/getAllGRNs").filter((g) => g.grnStatus === "Pending");
    const batchList = ajaxGetRequest("/batch/getAllBatches").filter((b) => b.batchStatus === "InProduction");
    const cusOrders = ajaxGetRequest("/customerOrder/getAllCustomerOrders").filter((o) => o.orderStatus === "Pending");

    document.getElementById('pq-num').innerText = quotations.length;
    document.getElementById('pg-num').innerText = grnList.length;
    document.getElementById('pb-num').innerText = batchList.length;
    document.getElementById('po-num').innerText = cusOrders.length;

}

const reloadTable = ()=>{
    let tableData = []
    const cusPayments = ajaxGetRequest('/cusPayment/getAllCusPayments')
    const supplierPayments = ajaxGetRequest("/supplier_payment/getAllSP");
    const getPaymentMethod = (ob) => {
        if (ob.paymentMethod === "VISA_CARD") {
            return '<div style="display: flex;justify-content: center;"> <div><i class="fa-brands fa-cc-visa fa-lg me-2" style="color: #194ca4;"></i><span>Visa Card</span></div> </div>';
        }
        if (ob.paymentMethod === "MASTER_CARD") {
            return '<div style="display: flex;justify-content: center;"> <div><i class="fa-brands fa-cc-mastercard fa-lg me-2" style="color: #ff4733;"></i><span>MASTER CARD</span></div> </div>';
        }
        if (ob.paymentMethod === "BANK_TRANSFER") {
            return '<div style="display: flex;justify-content: center;"> <div><i class="fa-solid fa-money-bill-transfer fa-lg me-2" style="color: #6a9f5b;"></i><span>BANK TRANSFER</span></div> </div>';
        }
        if (ob.paymentMethod === "CASH") {
            return '<div style="display: flex;justify-content: center;"> <div><i class="fa-solid fa-money-bill fa-lg me-2" style="color: #6a9f5b;"></i><span>CASH</span></div> </div>';
        }
        if (ob.paymentMethod === "CHEQUE") {
            return '<div style="display: flex;justify-content: center;"> <div><i class="fa-solid fa-money-check fa-lg me-2" style="color: #ace1fb;"></i><span>CHEQUE</span></div> </div>';
        }
    };
    cusPayments.map((cp)=>{
        if(convertDateTimeToDate(new Date(cp.paymentDate)) === convertDateTimeToDate(new Date())){
            let obj ={
                type:"Customer Order",
                transId:cp.invoiceNo,
                amount:cp.totalAmount,
                paymentMethod: getPaymentMethod(cp)
            }
            tableData.push(obj)
        }

    })

    supplierPayments.map((sp)=>{
        if(convertDateTimeToDate(new Date(sp.paymentDate)) === convertDateTimeToDate(new Date())){
            let obj ={
                type:"Supplier Payment",
                transId:sp.billNo,
                amount:sp.totalAmount,
                paymentMethod: getPaymentMethod(sp)
            }
            tableData.push(obj)
        }

    })

   const transTableBody =  document.getElementById('trans-table');
    transTableBody.innerHTML = ''
    tableData.slice(-5).forEach((data, index)=>{
        let trEle = document.createElement('tr')
        let thEle =document.createElement('th')
        thEle.scope='row'
        thEle.innerText = `${index +1}`;
        let tdEle1 = document.createElement('td')
        tdEle1.innerText = data.type
        let tdEle2 = document.createElement('td')
        tdEle2.innerText = data.transId
        let tdEle3 = document.createElement('td')
        tdEle3.innerText = data.amount
        let tdEle4 = document.createElement('td')
        tdEle4.innerHTML = data.paymentMethod
        trEle.appendChild(thEle)
        trEle.appendChild(tdEle1)
        trEle.appendChild(tdEle2)
        trEle.appendChild(tdEle3)
        trEle.appendChild(tdEle4)

        transTableBody.appendChild(trEle);
    })

}