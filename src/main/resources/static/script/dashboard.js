// window.addEventListener('load', async () => {
//     try {
//         // Show loading spinner
//         document.getElementById('dashboardLoading').style.display = 'block';
//         document.getElementById('dashboardContent').style.display = 'none';

//         // Fetch data
//         await getData();
//         // await reloadTable();

//         // Initialize charts
//         const ctx = document.getElementById('barchart');
//         const itx = document.getElementById('incomeChart');
//         const stx = document.getElementById('salesChart');

//         const cusPayments = await ajaxGetRequest('/cusPayment/getAllCusPayments');
//         const batches = await ajaxGetRequest("/batch/getAllBatches");

//         // Chart configuration
//         const chartConfig = {
//             type: 'line',
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         position: 'top',
//                     },
//                     title: {
//                         display: true,
//                         font: {
//                             size: 16
//                         }
//                     }
//                 },
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         ticks: {
//                             callback: function(value) {
//                                 return 'Rs. ' + value.toLocaleString();
//                             }
//                         }
//                     }
//                 }
//             }
//         };

//         // Monthly Sales Comparison Chart
//         const daysArray = Array.from({length: 31}, (v, k) => k + 1);
//         let thisMonth = [];
//         let prevMonth = [];

//         cusPayments.forEach((cp) => {
//             const month = new Date(cp.paymentDate).getMonth();
//             if (month === new Date().getMonth()) {
//                 const day = new Date(cp.paymentDate).getDate();
//                 let amount = 0.0;
//                 let newThisMonth = [];
//                 if (thisMonth.length !== 0) {
//                     let selected = thisMonth.filter((s) => s.x === day);
//                     if (selected.length !== 0) {
//                         amount = parseFloat(selected[0].y);
//                         newThisMonth = thisMonth.filter((s) => s.x !== day);
//                     } else {
//                         newThisMonth = thisMonth;
//                     }
//                 }
//                 newThisMonth.push({x: day, y: (parseFloat(cp.totalAmount) + amount)});
//                 thisMonth = newThisMonth;
//             }
//             if (month === new Date().getMonth() - 1) {
//                 const day = new Date(cp.paymentDate).getDate();
//                 let amount = 0.0;
//                 let newPrevMonth = [];
//                 if (prevMonth.length !== 0) {
//                     let selected = prevMonth.filter((s) => s.x === day);
//                     if (selected.length !== 0) {
//                         amount = parseFloat(selected[0].y);
//                         newPrevMonth = prevMonth.filter((s) => s.x !== day);
//                     } else {
//                         newPrevMonth = prevMonth;
//                     }
//                 }
//                 newPrevMonth.push({x: day, y: (parseFloat(cp.totalAmount) + amount)});
//                 prevMonth = newPrevMonth;
//             }
//         });

//         new Chart(stx, {
//             ...chartConfig,
//             data: {
//                 labels: daysArray,
//                 datasets: [{
//                     label: 'This Month Sales',
//                     data: thisMonth,
//                     fill: false,
//                     borderColor: 'rgb(75, 192, 192)',
//                     tension: 0.1
//                 },
//                 {
//                     label: 'Previous Month Sales',
//                     data: prevMonth,
//                     fill: false,
//                     borderColor: 'rgb(255, 99, 132)',
//                     tension: 0.1
//                 }]
//             }
//         });

//         // Sales Income vs Cost Chart
//         const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//         let sales = [];
//         let cost = [];

//         cusPayments.forEach((cp) => {
//             const month = new Date(cp.paymentDate).getMonth();
//             let amount = 0.0;
//             let newSales = [];
//             if (sales.length !== 0) {
//                 let selected = sales.filter((s) => s.x === labels[month]);
//                 if (selected.length !== 0) {
//                     amount = parseFloat(selected[0].y);
//                     newSales = sales.filter((s) => s.x !== labels[month]);
//                 } else {
//                     newSales = sales;
//                 }
//             }
//             newSales.push({x: labels[month], y: (parseFloat(cp.totalAmount) + amount)});
//             sales = newSales;
//         });

//         batches.forEach((batch) => {
//             const month = new Date(batch.manufactureDate).getMonth();
//             let amount = 0.0;
//             let newCost = [];
//             if (cost.length !== 0) {
//                 let selected = cost.filter((s) => s.x === labels[month]);
//                 if (selected.length !== 0) {
//                     amount = parseFloat(selected[0].y);
//                     newCost = cost.filter((s) => s.x !== labels[month]);
//                 } else {
//                     newCost = cost;
//                 }
//             }
//             newCost.push({x: labels[month], y: (parseFloat(batch.totalCost) + amount)});
//             cost = newCost;
//         });

//         new Chart(itx, {
//             ...chartConfig,
//             data: {
//                 labels: labels,
//                 datasets: [{
//                     label: 'Sales',
//                     data: sales,
//                     fill: false,
//                     borderColor: 'rgb(75, 192, 192)',
//                     tension: 0.1
//                 },
//                 {
//                     label: 'Cost',
//                     data: cost,
//                     fill: false,
//                     borderColor: 'rgb(255, 99, 132)',
//                     tension: 0.1
//                 }]
//             }
//         });

//         // Ingredient Stock Level Chart
//         const ingredientList = await ajaxGetRequest("/ingredient/getAllIngredients", "GET");
//         let stockLevels = [];
//         let insCount = 0;
//         let lsCount = 0;
//         let osCount = 0;

//         ingredientList.forEach((ing) => {
//             if (ing.ingredientStatus === "InStock") insCount++;
//             if (ing.ingredientStatus === "LowStock") lsCount++;
//             if (ing.ingredientStatus === "OutOfStock") osCount++;
//         });

//         stockLevels = [
//             {x: "In Stock", y: insCount},
//             {x: "Low Stock", y: lsCount},
//             {x: "Out of Stock", y: osCount}
//         ];

//         new Chart(ctx, {
//             type: 'bar',
//             data: {
//                 labels: ['In Stock', 'Low Stock', 'Out of Stock'],
//                 datasets: [{
//                     label: 'Ingredient Stock Level',
//                     data: stockLevels,
//                     borderWidth: 1,
//                     backgroundColor: [
//                         'rgba(75, 192, 192, 0.4)',
//                         'rgba(255, 159, 64, 0.4)',
//                         'rgba(255, 99, 132, 0.4)',
//                     ]
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         position: 'top',
//                     },
//                     title: {
//                         display: true,
//                         text: 'Ingredient Stock Level',
//                         font: {
//                             size: 16
//                         }
//                     }
//                 },
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         ticks: {
//                             stepSize: 1
//                         }
//                     }
//                 }
//             }
//         });

//         // Hide loading spinner and show content
//         document.getElementById('dashboardLoading').style.display = 'none';
//         document.getElementById('dashboardContent').style.display = 'block';

//     } catch (error) {
//         console.error('Error loading dashboard:', error);
//         // Show error message
//         document.getElementById('dashboardLoading').innerHTML = `
//             <div class="alert alert-danger" role="alert">
//                 Error loading dashboard data. Please try refreshing the page.
//             </div>
//         `;
//     }
// });

window.addEventListener('DOMContentLoaded', async () => {
    getData();
    // reloadTable();
});

const getData = async () => {
    try {
        const quotations = (await ajaxGetRequest("/quotation/getAllQuotations")).filter((q) => q.quotationStatus === "Pending");
        const grnList = (await ajaxGetRequest("/grn/getAllGRNs")).filter((g) => g.grnStatus === "Pending");
        const batchList = (await ajaxGetRequest("/batch/getAllBatches")).filter((b) => b.batchStatus === "InProduction");
        const cusOrders = (await ajaxGetRequest("/customerOrder/getAllCustomerOrders")).filter((o) => o.orderStatus === "Pending");

        document.getElementById('pq-num').innerText = quotations.length;
        document.getElementById('pg-num').innerText = grnList.length;
        document.getElementById('pb-num').innerText = batchList.length;
        document.getElementById('po-num').innerText = cusOrders.length;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

const reloadTable = async () => {
    try {
        const tableData = [];
        const cusPayments = await ajaxGetRequest('/cusPayment/getAllCusPayments');
        const supplierPayments = await ajaxGetRequest("/supplier_payment/getAllSP");

        const getPaymentMethod = (ob) => {
            const methods = {
                'VISA_CARD': { icon: 'fa-cc-visa', color: '#194ca4', text: 'Visa Card' },
                'MASTER_CARD': { icon: 'fa-cc-mastercard', color: '#ff4733', text: 'Master Card' },
                'BANK_TRANSFER': { icon: 'fa-money-bill-transfer', color: '#6a9f5b', text: 'Bank Transfer' },
                'CASH': { icon: 'fa-money-bill', color: '#6a9f5b', text: 'Cash' },
                'CHEQUE': { icon: 'fa-money-check', color: '#ace1fb', text: 'Cheque' }
            };

            const method = methods[ob.paymentMethod] || { icon: 'fa-question', color: '#666', text: ob.paymentMethod };
            return `
                <div class="d-flex justify-content-center align-items-center">
                    <i class="fa-brands ${method.icon} fa-lg me-2" style="color: ${method.color};"></i>
                    <span>${method.text}</span>
                </div>
            `;
        };

        const today = convertDateTimeToDate(new Date());

        cusPayments.forEach((cp) => {
            if (convertDateTimeToDate(new Date(cp.paymentDate)) === today) {
                tableData.push({
                    type: "Customer Order",
                    transId: cp.invoiceNo,
                    amount: cp.totalAmount,
                    paymentMethod: getPaymentMethod(cp)
                });
            }
        });

        supplierPayments.forEach((sp) => {
            if (convertDateTimeToDate(new Date(sp.paymentDate)) === today) {
                tableData.push({
                    type: "Supplier Payment",
                    transId: sp.billNo,
                    amount: sp.totalAmount,
                    paymentMethod: getPaymentMethod(sp)
                });
            }
        });

        const transTableBody = document.getElementById('trans-table');
        transTableBody.innerHTML = '';

        if (tableData.length === 0) {
            transTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No transactions for today</td>
                </tr>
            `;
            return;
        }

        tableData.slice(-5).forEach((data, index) => {
            const trEle = document.createElement('tr');
            trEle.innerHTML = `
                <td>${index + 1}</td>
                <td>${data.type}</td>
                <td>${data.transId}</td>
                <td>Rs. ${parseFloat(data.amount).toLocaleString()}</td>
                <td>${data.paymentMethod}</td>
            `;
            transTableBody.appendChild(trEle);
        });
    } catch (error) {
        console.error('Error reloading transaction table:', error);
        throw error;
    }
};

