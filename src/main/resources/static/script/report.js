// report.js
window.document.addEventListener('DOMContentLoaded', () => {
    // Update Product ROP
    const updateProductRopBtn = document.getElementById('updateProductRopBtn');
    if (updateProductRopBtn) {
        updateProductRopBtn.addEventListener('click', function() {
            const rows = Array.from(document.querySelectorAll('#tableProductSales tbody tr'));
            const data = rows.map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    productName: cells[1]?.textContent,
                    generatedRop: Number(cells[4]?.textContent)
                };
            });
            fetch('/report/updateProductRop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.ok ? alert('Product ROP updated!') : alert('Failed to update Product ROP'));
        });
    }
    // Update Ingredient ROP
    const updateIngredientRopBtn = document.getElementById('updateIngredientRopBtn');
    if (updateIngredientRopBtn) {
        updateIngredientRopBtn.addEventListener('click', function() {
            const rows = Array.from(document.querySelectorAll('#tableGrnIngredient tbody tr'));
            const data = rows.map(row => {
                console.log(row);
                const cells = row.querySelectorAll('td');
                // Find the ingredient code from the data-* attribute or hidden column if available
                // If not available, you need to add ingredientCode to your table rows (recommended)
                // For now, assume ingredient code is stored as a data-attribute on the row
                const ingredientCode = row.getAttribute('data-ingredient-code');
                console.log(ingredientCode);
                return {
                    ingredientCode: ingredientCode,
                    generatedRop: Number(cells[5]?.textContent)
                };
            }).filter(row => row.ingredientCode);
            console.log(data);
            fetch('/report/updateIngredientRop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.ok ? alert('Ingredient ROP updated!') : alert('Failed to update Ingredient ROP'));
        });
    }

    const saleReport = document.getElementById("saleReport");
    const supPayReport = document.getElementById("supPayReport");
    const batchProductionReport = document.getElementById("batchProductionReport");
    const productSalesReport = document.getElementById("productSalesReport");
    const grnIngredientReport = document.getElementById("grnIngredientReport");
    const productionCostReport = document.getElementById("productionCostReport");

    searchBtn.addEventListener('click', function() {
        const reportTypeDropdown = document.getElementById('add-report-type');
    
        const type = reportTypeDropdown.value;
        const from = document.getElementById('add-from').value;
        const to = document.getElementById('add-to').value;
        if (!from || !to) {
            alert('Please select both start and end dates.');
            return;
        }
        if (type === 'CSR') {
            fillCustomerSalesSummaryTable();
            supPayReport.style.display="none";
            batchProductionReport.style.display="none";
            productSalesReport.style.display="none";
            grnIngredientReport.style.display="none";

        } else if (type === 'PSR') {
            fillProductSalesSummaryTable();

            saleReport.style.display="none";
            supPayReport.style.display="none";
            batchProductionReport.style.display="none";
            grnIngredientReport.style.display="none";
        } else if (type === 'GRN') {
            fillGrnIngredientSummaryTable(from, to);
            saleReport.style.display="none";
            supPayReport.style.display="none";
            batchProductionReport.style.display="none";
            productSalesReport.style.display="none";
        } else if (type === 'PCR') {
            reloadBatchProductionTable();
            saleReport.style.display="none";
            supPayReport.style.display="none";
            productSalesReport.style.display="none";
        } else if (type === 'SPR') {
            reloadSupPayTable();
            saleReport.style.display="none";
            batchProductionReport.style.display="none";
            productSalesReport.style.display="none";
            grnIngredientReport.style.display="none";
        }
    });
   
});

function reloadBatchProductionTable() {
    const batchProductionReport = document.getElementById("batchProductionReport");
    const productionTableN = document.getElementById('tableBatchProductionReport');
    const from = document.getElementById('add-from').value;
    const to = document.getElementById('add-to').value;
    let url = '/report/batchProduction';
    if (from && to) {
        url += `?startDate=${from}&endDate=${to}`;
    }
    const data = ajaxGetRequest(url) || [];
    // Calculate total quantity
    let totalQuantity = 0;
    data.forEach(row => {
        totalQuantity += Number(row.totalQuantity) || 0;
    });
    const totalQuantitySpan = document.getElementById('batchProductionTotalQuantity');
    if (totalQuantitySpan) totalQuantitySpan.textContent = totalQuantity;
    const displayProperty = [
        { dataType: 'text', propertyName: 'batchNo' },
        { dataType: 'text', propertyName: 'totalQuantity' },
        { dataType: 'text', propertyName: 'availableQuantity' },
        { dataType: 'text', propertyName: 'damagedQuantity' },
        { dataType: 'price', propertyName: 'totalCost' }
    ];
    if (batchProductionTableInstance) {
        batchProductionTableInstance.destroy();
    }
    $("#tableBatchProductionReport tbody").empty();
    tableDataBinder(productionTableN, data, displayProperty, false);
    batchProductionTableInstance = $("#tableBatchProductionReport").DataTable({
        responsive: true,
        autoWidth: false
    });
    // Render pie chart by flavor
    renderBatchProductionPieChart(data);
    // Show the batch production report section
    if(batchProductionReport) batchProductionReport.style.display = '';
}


async function fetchSupplierPaymentReport() {
    const response = await fetch('/report/supplierPayment');
    if (!response.ok) return [];
    return await response.json();
}

// This function binds the supplier payment data to the table
function bindSupplierPaymentTable(data) {
    const tbody = document.querySelector('#tableSupPayReport tbody');
    tbody.innerHTML = '';
    let totalPaid = 0;
    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No supplier payment data found.</td></tr>';
        document.getElementById('supPayTotalAmount').textContent = '0.00';
        return;
    }
    data.forEach((row, idx) => {
        totalPaid += row.amountPaid || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${row.supNo || ''}</td>
            <td>${row.supplierName || ''}</td>
            <td>${row.amountPaid != null ? row.amountPaid.toFixed(2) : ''}</td>
            <td>${row.outstandingAmount != null ? row.outstandingAmount.toFixed(2) : ''}</td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('supPayTotalAmount').textContent = totalPaid.toFixed(2);
}

// This function renders the supplier payment bar chart
function renderSupplierPaymentBarChart(data) {
    const ctx = document.getElementById('supPayBarChart').getContext('2d');
    if (window.supPayBarChartInstance) window.supPayBarChartInstance.destroy();
    // Aggregate total paid by supplier
    const supplierTotals = {};
    data.forEach(row => {
        if (!supplierTotals[row.supplierName]) supplierTotals[row.supplierName] = 0;
        supplierTotals[row.supplierName] += row.amountPaid || 0;
    });
    const labels = Object.keys(supplierTotals);
    const values = Object.values(supplierTotals);
    window.supPayBarChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Paid',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

let batchProductionTableInstance;
function reloadSupPayTable() {
    const supPayReport = document.getElementById("supPayReport");
    const from = document.getElementById('add-from').value;
    const to = document.getElementById('add-to').value;
    let url = '/report/supplierPayment';
    if (from && to) {
        url += `?startDate=${from}&endDate=${to}`;
    }
    fetch(url)
        .then(res => res.json())
        .then(data => {
            bindSupplierPaymentTable(data);
            renderSupplierPaymentBarChart(data);
        })
        .catch(err => {
            alert('Failed to load Supplier Payment data.');
            console.error(err);
        });

    supPayReport.style.display="";
}


// Function to render the batch production pie chart
function renderBatchProductionPieChart(data) {
    // Render a bar chart: x = batchNo, y = totalQuantity
    const labels = data.map(row => row.batchNo || '');
    const values = data.map(row => Number(row.totalQuantity) || 0);
    const ctx = document.getElementById('batchProductionPieChart').getContext('2d');
    if (window.batchProductionPieChartInstance) {
        window.batchProductionPieChartInstance.destroy();
    }
    window.batchProductionPieChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Quantity',
                data: values,
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Total Quantity per Batch' }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Batch No' },
                    ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
                },
                y: {
                    title: { display: true, text: 'Quantity' },
                    beginAtZero: true
                }
            }
        }
    });
}



    //         reloadPCRTable();
    //     } else if (reportType === "PSR") {
    //         fillProductSalesSummaryTable();
    //     }
    // });

    // document.getElementById('searchBtn').addEventListener('click', () => {
    //     const fromDate = document.getElementById('add-from').value;
    //     const toDate = document.getElementById('add-to').value;
    //     const reportType = document.getElementById('add-report-type').value;
//         } else if (reportType === "PCR") {
//             reloadPCRTable()
//             document.getElementById('saleReport').style.display = 'none';
//             document.getElementById('supPayReport').style.display = 'none';
//             document.getElementById('costReport').style.display = 'block';
//         }
//     });

//     document.getElementById('searchBtn').addEventListener('click', () => {
//         const fromDate = document.getElementById('add-from').value;
//         const toDate = document.getElementById('add-to').value;
//         const reportType = document.getElementById('add-report-type').value;

//         if (reportType === "CSR") {
//             reloadCusPayments({ fromDate, toDate });
//         }
//         if (reportType === "SPR") {
//             reloadSPTable({ fromDate, toDate });
//         }
//         if (reportType === "PCR") {
//             reloadPCRTable({ fromDate, toDate });
//         }
//     });

//     document.getElementById('downloadReportBtn').addEventListener('click', () => {
//         const reportType = document.getElementById('add-report-type').value;
//         if (reportType === "CSR") {
//             downloadTableAsExcel('tableSR', 'CustomerSalesReport.xlsx');
//         }
//         if (reportType === "SPR") {
//             downloadTableAsExcel('tableSPR', 'SupplierPaymentReport.xlsx');
//         }
//         if (reportType === "PCR") {
//             downloadTableAsExcel('tableCR', 'ProductionCostReport.xlsx');
//         }
//     });
// });

// const reloadCusPayments = (filter) => {
//     let cusPayments = ajaxGetRequest('/cusPayment/getAllCusPayments');

//     if (filter && filter.fromDate && filter.toDate) {
//         cusPayments = cusPayments.filter(payment => {
//             const paymentDate = new Date(payment.paymentDate);
//             return paymentDate >= new Date(filter.fromDate) && paymentDate <= new Date(filter.toDate);
//         });
//     }

//     const getOrderNO = (ob) => ob.order.orderNo;
//     const getPaymentMethod = (ob) => {
//         if (ob.paymentMethod === "VISA_CARD") {
//             return '<div style="display: flex;justify-content: start;"> <div><i class="fa-brands fa-cc-visa fa-lg me-2" style="color: #194ca4;"></i><span>Visa Card</span></div> </div>';
//         }
//         if (ob.paymentMethod === "MASTER_CARD") {
//             return '<div style="display: flex;justify-content: start;"> <div><i class="fa-brands fa-cc-mastercard fa-lg me-2" style="color: #ff4733;"></i><span>MASTER CARD</span></div> </div>';
//         }
//         if (ob.paymentMethod === "BANK_TRANSFER") {
//             return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-bill-transfer fa-lg me-2" style="color: #6a9f5b;"></i><span>BANK TRANSFER</span></div> </div>';
//         }
//         if (ob.paymentMethod === "CASH") {
//             return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-bill fa-lg me-2" style="color: #6a9f5b;"></i><span>CASH</span></div> </div>';
//         }
//         if (ob.paymentMethod === "CHEQUE") {
//             return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-check fa-lg me-2" style="color: #ace1fb;"></i><span>CHEQUE</span></div> </div>';
//         }
//     };

//     const displayProperty = [
//         { dataType: "text", propertyName: "invoiceNo" },
//         { dataType: "function", propertyName: getOrderNO },
//         { dataType: "date", propertyName: "paymentDate" },
//         { dataType: "price", propertyName: "totalAmount" },
//         { dataType: "function", propertyName:  getPaymentMethod },
//     ];

//     if (cusSalesReportTableInstance) {
//         cusSalesReportTableInstance.destroy();
//     }
//     $("#tableSR tbody").empty();
//     tableDataBinder(
//         tableSR,
//         cusPayments,
//         displayProperty,
//         false,
//         null,
//         null
//     );
//     cusSalesReportTableInstance = $("#tableSR").DataTable({
//         responsive: true,
//         autoWidth: false,
//         searching: false,
//         ordering: false,
//         paging: false,
//         info: false,
//     });
// };

// const reloadSPTable = (filter) => {
//     let supplierPayments = ajaxGetRequest("/supplier_payment/getAllSP");

//     if (filter && filter.fromDate && filter.toDate) {
//         supplierPayments = supplierPayments.filter(payment => {
//             const paymentDate = new Date(payment.paymentDate);
//             return paymentDate >= new Date(filter.fromDate) && paymentDate <= new Date(filter.toDate);
//         });
//     }

//     const getGRNNo = (ob) => ob.goodReceiveNote.grnNo;

//     const getPaymentMethod = (ob) => {
//         if (ob.paymentMethod === "VISA_CARD") {
//             return '<div style="display: flex;justify-content: center;"> <div><i class="fa-brands fa-cc-visa fa-lg me-2" style="color: #194ca4;"></i><span>Visa Card</span></div> </div>';
//         }
//         if (ob.paymentMethod === "MASTER_CARD") {
//             return '<div style="display: flex;justify-content: center;"> <div><i class="fa-brands fa-cc-mastercard fa-lg me-2" style="color: #ff4733;"></i><span>MASTER CARD</span></div> </div>';
//         }
//         if (ob.paymentMethod === "BANK_TRANSFER") {
//             return '<div style="display: flex;justify-content: center;"> <div><i class="fa-solid fa-money-bill-transfer fa-lg me-2" style="color: #6a9f5b;"></i><span>BANK TRANSFER</span></div> </div>';
//         }
//         if (ob.paymentMethod === "CASH") {
//             return '<div style="display: flex;justify-content: center;"> <div><i class="fa-solid fa-money-bill fa-lg me-2" style="color: #6a9f5b;"></i><span>CASH</span></div> </div>';
//         }
//         if (ob.paymentMethod === "CHEQUE") {
//             return '<div style="display: flex;justify-content: center;"> <div><i class="fa-solid fa-money-check fa-lg me-2" style="color: #ace1fb;"></i><span>CHEQUE</span></div> </div>';
//         }
//     };

//     const displayProperty = [
//         { dataType: "text", propertyName: "billNo" },
//         { dataType: "function", propertyName: getGRNNo },
//         { dataType: "price", propertyName: "totalAmount" },
//         { dataType: "date", propertyName: "paymentDate" },
//         { dataType: "function", propertyName: getPaymentMethod },
//     ];

//     if (spReportTableInstance) {
//         spReportTableInstance.destroy();
//     }
//     $("#tableSPR tbody").empty();
//     tableDataBinder(
//         tableSPR,
//         supplierPayments,
//         displayProperty,
//         false,
//         null,
//         null
//     );
//     spReportTableInstance = $("#tableSPR").DataTable({
//         responsive: true,
//         autoWidth: false,
//         searching: false,
//         ordering: false,
//         paging: false,
//         info: false,
//     });
// };

// const reloadPCRTable = (filter)=>{
//     let batchList = ajaxGetRequest("/batch/getAllBatches")
//     if (filter && filter.fromDate && filter.toDate) {
//         batchList = batchList.filter(batch => {
//             const paymentDate = new Date(batch.manufactureDate);
//             return paymentDate >= new Date(filter.fromDate) && paymentDate <= new Date(filter.toDate);
//         });
//     }
//     const getStatus = (ob) => {
//         if (ob.batchStatus === "InProduction") {
//             return '<div style="display: flex;justify-content: center;"><button class="btn btn-warning btn-sm" style="width: 100%;" disabled >In-Production</button></div>';
//         }
//         if (ob.batchStatus === "ProductionDone") {
//             return '<div style="display: flex;justify-content: center;"><button  class="btn btn-success btn-sm" style="width: 100%;" disabled >Production Done</button></div>';
//         }

//     };
//     const displayProperty = [
//         {dataType: "text", propertyName: "batchNo"},
//         {dataType: "text", propertyName: "productionItemNo"},
//         {dataType: "date", propertyName: "manufactureDate"},
//         {dataType: "date", propertyName: "expireDate"},
//         {dataType: "text", propertyName: "availableQuantity"},
//         {dataType: "text", propertyName: "damagedQuantity"},
//         {dataType: "price", propertyName: "totalCost"},
//         {dataType: "function", propertyName: getStatus},
//     ];
//     if (pcReportTableInstance) {
//         pcReportTableInstance.destroy();
//     }
//     $("#tableCR tbody").empty();
//     tableDataBinder(
//         tableCR,
//         batchList,
//         displayProperty,
//         false,
//         null,
//         null
//     )
//     pcReportTableInstance = $("#tableCR").DataTable({
//         responsive: true,
//         autoWidth: false,
//         searching: false,
//         ordering: false,
//         paging: false,
//         info: false,
//     })
// }

// const downloadTableAsExcel = (tableId, filename) => {
//     const table = document.getElementById(tableId);
//     const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
//     XLSX.writeFile(wb, filename);
// };

// Dropdown and Search logic
// function showReportSection(type) {
//     var sale = document.getElementById('saleReport');
//     var product = document.getElementById('productSalesReport');
//     var grn = document.getElementById('grnIngredientReport');
//     var sup = document.getElementById('supPayReport');
//     var cost = document.getElementById('costReport');
//     if (sale) sale.style.display = (type === 'CSR') ? '' : 'none';
//     if (product) product.style.display = (type === 'PSR') ? '' : 'none';
//     if (grn) grn.style.display = (type === 'GRN') ? '' : 'none';
//     if (sup) sup.style.display = (type === 'SPR') ? '' : 'none';
//     if (cost) cost.style.display = (type === 'PCR') ? '' : 'none';
// }

//Fill Customer Sales Summary Table
let tableCusSalesInstance;
function fillCustomerSalesSummaryTable() {
    const tableCusSales = document.getElementById("tableCusSales");
    const saleReport = document.getElementById("saleReport");



    const startDate = document.getElementById('add-from').value;
    const endDate = document.getElementById('add-to').value;

    const data = ajaxGetRequest(`/report/customerSalesSummary?startDate=${startDate}&endDate=${endDate}`);
    console.log('Fetched CustomerSalesSummary:', data);
    const displayProperty = [
        { dataType: "text", propertyName: "customerName" },
        { dataType: "text", propertyName: "totalQuantity" },
        { dataType: "price", propertyName: "totalAmount", format: (v) => Number(v).toFixed(2) }
    ];
    if (window.tableCusSalesInstance) {
        window.tableCusSalesInstance.destroy();
    }

    data.forEach((row,index) => {
   let totalAmountCus = 0;
    totalAmountCus += Number(row.totalAmount);
    const amountSpanCustomer = document.getElementById('customerOrdersTotalAmount');
        if (amountSpanCustomer) amountSpanCustomer.textContent = totalAmountCus.toFixed(2);

    })
    $("#tableCusSales tbody").empty();
    tableDataBinder(
        tableCusSales,
        data,
        displayProperty,
        false // paging enabled
    );
    window.tableCusSalesInstance = $("#tableCusSales").DataTable({
        responsive: true,
        autoWidth: false,
    });
    saleReport.style.display="";
    
    renderCustomerSalesSummaryChart(data);
}

// This function fills the product sales summary table
function fillProductSalesSummaryTable() {
    const productSalesReport = document.getElementById("productSalesReport");
    const tableProductSales = document.getElementById("tableProductSales");
    const startDate = document.getElementById('add-from').value;
    const endDate = document.getElementById('add-to').value;
    const data = ajaxGetRequest(`/report/productSalesSummary?startDate=${startDate}&endDate=${endDate}`);
    const displayProperty = [
        { dataType: "text", propertyName: "productName" },
        { dataType: "text", propertyName: "totalQuantity" },
        { dataType: "price", propertyName: "totalAmount", format: (v) => Number(v).toFixed(2) },
        { dataType: "text", propertyName: "generatedRop", format: (v) => Number(v).toFixed(2) }
    ];
    if (window.tablProductSalesInstance) {
        window.tablProductSalesInstance.destroy();
    }
    $("#tableProductSales tbody").empty();
    tableDataBinder(
        tableProductSales,
        data,
        displayProperty,
        false // paging enabled
    );
    window.tablProductSalesInstance = $("#tableProductSales").DataTable({
        responsive: true,
        autoWidth: false,
    });
    // Totals
    let totalAmount = 0;
    let totalQuantity = 0;
    console.log(data);
     data.forEach((row, idx) => {
         totalAmount += Number(row.totalAmount) || 0;
         totalQuantity += Number(row.totalQuantity) || 0;
//         const tr = document.createElement('tr');
//         tr.innerHTML = `<td>${idx + 1}</td><td>${row.productName}</td><td>${row.totalQuantity != null ? row.totalQuantity : ''}</td><td>${row.totalAmount != null ? Number(row.totalAmount).toFixed(2) : ''}</td><td>${row.generatedRop != null ? Number(row.generatedRop).toFixed(2) : ''}</td>`;
//         tableProductSales.querySelector('tbody').appendChild(tr);
     });
    const amountSpan = document.getElementById('productSalesTotalAmount');
    if (amountSpan) amountSpan.textContent = totalAmount.toFixed(2);
    const qtySpan = document.getElementById('productSalesTotalQuantity');
    if (qtySpan) qtySpan.textContent = totalQuantity;
    productSalesReport.style.display="";
    renderProductSalesSummaryChart(data);
}

function renderProductSalesSummaryChart(data) {
    const ctx = document.getElementById('productSalesChart').getContext('2d');
    const labels = data.map(row => row.productName);
    const totalAmounts = data.map(row => row.totalAmount);
    if (window.productSalesChartInstance) {
        window.productSalesChartInstance.destroy();
    }
    window.productSalesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Amount',
                    data: totalAmounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


function renderCustomerSalesSummaryChart(data) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const labels = data.map(row => row.customerName);
    const totalAmounts = data.map(row => row.totalAmount);
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }
    window.salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Amount',
                    data: totalAmounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}



searchBtn.addEventListener('click', function() {
    const reportTypeDropdown = document.getElementById('add-report-type');

    const type = reportTypeDropdown.value;
    const from = document.getElementById('add-from').value;
    const to = document.getElementById('add-to').value;
    if (!from || !to) {
        alert('Please select both start and end dates.');
        return;
    }
    if (type === 'CSR') {
        fillCustomerSalesSummaryTable();
    } else if (type === 'PSR') {
        fillProductSalesSummaryTable();
    } else if (type === 'GRN') {
        fillGrnIngredientSummaryTable(from, to);
    } else if (type === 'PCR') {
        reloadPCRTable();
    } else if (type === 'SPR') {
        reloadSupPayTable();
    }
});

// Function to fill the GRN Ingredient Summary table
let tableIngredientGrnInstance;
function fillGrnIngredientSummaryTable(from, to) {
    const grnIngredientReport = document.getElementById("grnIngredientReport");
    const tableGrnIngredient = document.getElementById("tableGrnIngredient");

//     const startDate = document.getElementById('add-from').value;
//        const endDate = document.getElementById('add-to').value;
    const grnIngredientData = ajaxGetRequest(`/report/grnIngredientSummary?startDate=${from}&endDate=${to}`);

     const displayProperty = [
            { dataType: "text", propertyName: "ingredientCode" },
            { dataType: "text", propertyName: "ingredientName" },
            { dataType: "text", propertyName: "totalQuantity" },
            { dataType: "price", propertyName: "totalCost", format: (v) => Number(v).toFixed(2) },
            { dataType: "text", propertyName: "generatedRop",format: (v) => Number(v).toFixed(2) }
        ];
        if (window.tableIngredientGrnInstance) {
            window.tableIngredientGrnInstance.destroy();
        }
        $("#tableGrnIngredient tbody").empty();
        tableDataBinder(
            tableGrnIngredient,
            grnIngredientData,
            displayProperty,
            false // paging enabled
        );
        window.tableIngredientGrnInstance = $("#tableGrnIngredient").DataTable({
            responsive: true,
            autoWidth: false,
        });
        // Totals
        let totalAmount = 0;
        let totalQuantity = 0;
//         grnIngredientData.forEach((row, idx) => {
//             totalAmount += Number(row.totalAmount) || 0;
//             totalQuantity += Number(row.totalQuantity) || 0;
//    //         const tr = document.createElement('tr');
//    //         tr.innerHTML = `<td>${idx + 1}</td><td>${row.productName}</td><td>${row.totalQuantity != null ? row.totalQuantity : ''}</td><td>${row.totalAmount != null ? Number(row.totalAmount).toFixed(2) : ''}</td><td>${row.generatedRop != null ? Number(row.generatedRop).toFixed(2) : ''}</td>`;
//    //         tableProductSales.querySelector('tbody').appendChild(tr);
//         });

       let totalValue = 0;
       grnIngredientData.forEach((row, idx) => {
                       totalValue += Number(row.totalCost) || 0;
                   });
                   const totalSpan = document.getElementById('grnIngredientTotalAmount');
                   if (totalSpan) totalSpan.textContent = totalValue.toFixed(2);


        grnIngredientReport.style.display="";
        renderProductSalesSummaryChart(data);
        renderGrnIngredientPieChart(grnIngredientData);
}

//
function renderGrnIngredientPieChart(data) {
    // Aggregate total cost by ingredient name
    const ingredientTotals = {};
    data.forEach(row => {
        if (!ingredientTotals[row.ingredientName]) ingredientTotals[row.ingredientName] = 0;
        ingredientTotals[row.ingredientName] += Number(row.totalCost) || 0;
    });
    const labels = Object.keys(ingredientTotals);
    const values = Object.values(ingredientTotals);
    const ctx = document.getElementById('grnIngredientPieChart').getContext('2d');
    if (window.grnIngredientPieChartInstance) {
        window.grnIngredientPieChartInstance.destroy();
    }
    window.grnIngredientPieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Cost by Ingredient',
                data: values,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    '#8dd3c7', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Ingredient Pie Chart (Total Cost)' }
            }
        }
    });
}

function renderCustomerSalesSummaryChart(data) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const labels = data.map(row => row.customerName);
    const totalAmounts = data.map(row => row.totalAmount);
    const totalQuantities = data.map(row => row.totalQuantity);
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }
    window.salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Amount',
                    data: totalAmounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                },
                {
                    label: 'Total Quantity',
                    data: totalQuantities,
                    backgroundColor: 'rgba(255, 206, 86, 0.6)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Example: Call this with your actual start/end dates (or hook to your date picker)
// fetchCustomerSalesSummary('2025-07-01', '2025-07-12');
