// report.js

let cusSalesReportTableInstance;
let spReportTableInstance;
let pcReportTableInstance;

window.addEventListener('load', () => {
    reloadCusPayments();
    document.getElementById('saleReport').style.display = 'block';
    document.getElementById('supPayReport').style.display = 'none';
    document.getElementById('costReport').style.display = 'none';

    document.getElementById('add-report-type').addEventListener('change', (event) => {
        const reportType = event.target.value;

        if (reportType === "CSR") {
            reloadCusPayments();
            document.getElementById('saleReport').style.display = 'block';
            document.getElementById('supPayReport').style.display = 'none';
            document.getElementById('costReport').style.display = 'none';
        } else if (reportType === "SPR") {
            reloadSPTable();
            document.getElementById('saleReport').style.display = 'none';
            document.getElementById('supPayReport').style.display = 'block';
            document.getElementById('costReport').style.display = 'none';
        } else if (reportType === "PCR") {
            reloadPCRTable()
            document.getElementById('saleReport').style.display = 'none';
            document.getElementById('supPayReport').style.display = 'none';
            document.getElementById('costReport').style.display = 'block';
        }
    });

    document.getElementById('searchBtn').addEventListener('click', () => {
        const fromDate = document.getElementById('add-from').value;
        const toDate = document.getElementById('add-to').value;
        const reportType = document.getElementById('add-report-type').value;

        if (reportType === "CSR") {
            reloadCusPayments({ fromDate, toDate });
        }
        if (reportType === "SPR") {
            reloadSPTable({ fromDate, toDate });
        }
        if (reportType === "PCR") {
            reloadPCRTable({ fromDate, toDate });
        }
    });

    document.getElementById('downloadReportBtn').addEventListener('click', () => {
        const reportType = document.getElementById('add-report-type').value;
        if (reportType === "CSR") {
            downloadTableAsExcel('tableSR', 'CustomerSalesReport.xlsx');
        }
        if (reportType === "SPR") {
            downloadTableAsExcel('tableSPR', 'SupplierPaymentReport.xlsx');
        }
        if (reportType === "PCR") {
            downloadTableAsExcel('tableCR', 'ProductionCostReport.xlsx');
        }
    });
});

const reloadCusPayments = (filter) => {
    let cusPayments = ajaxGetRequest('/cusPayment/getAllCusPayments');

    if (filter && filter.fromDate && filter.toDate) {
        cusPayments = cusPayments.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate >= new Date(filter.fromDate) && paymentDate <= new Date(filter.toDate);
        });
    }

    const getOrderNO = (ob) => ob.order.orderNo;
    const getPaymentMethod = (ob) => {
        if (ob.paymentMethod === "VISA_CARD") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-brands fa-cc-visa fa-lg me-2" style="color: #194ca4;"></i><span>Visa Card</span></div> </div>';
        }
        if (ob.paymentMethod === "MASTER_CARD") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-brands fa-cc-mastercard fa-lg me-2" style="color: #ff4733;"></i><span>MASTER CARD</span></div> </div>';
        }
        if (ob.paymentMethod === "BANK_TRANSFER") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-bill-transfer fa-lg me-2" style="color: #6a9f5b;"></i><span>BANK TRANSFER</span></div> </div>';
        }
        if (ob.paymentMethod === "CASH") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-bill fa-lg me-2" style="color: #6a9f5b;"></i><span>CASH</span></div> </div>';
        }
        if (ob.paymentMethod === "CHEQUE") {
            return '<div style="display: flex;justify-content: start;"> <div><i class="fa-solid fa-money-check fa-lg me-2" style="color: #ace1fb;"></i><span>CHEQUE</span></div> </div>';
        }
    };

    const displayProperty = [
        { dataType: "text", propertyName: "invoiceNo" },
        { dataType: "function", propertyName: getOrderNO },
        { dataType: "date", propertyName: "paymentDate" },
        { dataType: "price", propertyName: "totalAmount" },
        { dataType: "function", propertyName:  getPaymentMethod },
    ];

    if (cusSalesReportTableInstance) {
        cusSalesReportTableInstance.destroy();
    }
    $("#tableSR tbody").empty();
    tableDataBinder(
        tableSR,
        cusPayments,
        displayProperty,
        false,
        null,
        null
    );
    cusSalesReportTableInstance = $("#tableSR").DataTable({
        responsive: true,
        autoWidth: false,
        searching: false,
        ordering: false,
        paging: false,
        info: false,
    });
};

const reloadSPTable = (filter) => {
    let supplierPayments = ajaxGetRequest("/supplier_payment/getAllSP");

    if (filter && filter.fromDate && filter.toDate) {
        supplierPayments = supplierPayments.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate >= new Date(filter.fromDate) && paymentDate <= new Date(filter.toDate);
        });
    }

    const getGRNNo = (ob) => ob.goodReceiveNote.grnNo;

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

    const displayProperty = [
        { dataType: "text", propertyName: "billNo" },
        { dataType: "function", propertyName: getGRNNo },
        { dataType: "price", propertyName: "totalAmount" },
        { dataType: "date", propertyName: "paymentDate" },
        { dataType: "function", propertyName: getPaymentMethod },
    ];

    if (spReportTableInstance) {
        spReportTableInstance.destroy();
    }
    $("#tableSPR tbody").empty();
    tableDataBinder(
        tableSPR,
        supplierPayments,
        displayProperty,
        false,
        null,
        null
    );
    spReportTableInstance = $("#tableSPR").DataTable({
        responsive: true,
        autoWidth: false,
        searching: false,
        ordering: false,
        paging: false,
        info: false,
    });
};

const reloadPCRTable = (filter)=>{
    let batchList = ajaxGetRequest("/batch/getAllBatches")
    if (filter && filter.fromDate && filter.toDate) {
        batchList = batchList.filter(batch => {
            const paymentDate = new Date(batch.manufactureDate);
            return paymentDate >= new Date(filter.fromDate) && paymentDate <= new Date(filter.toDate);
        });
    }
    const getStatus = (ob) => {
        if (ob.batchStatus === "InProduction") {
            return '<div style="display: flex;justify-content: center;"><button class="btn btn-warning btn-sm" style="width: 100%;" disabled >In-Production</button></div>';
        }
        if (ob.batchStatus === "ProductionDone") {
            return '<div style="display: flex;justify-content: center;"><button  class="btn btn-success btn-sm" style="width: 100%;" disabled >Production Done</button></div>';
        }

    };
    const displayProperty = [
        {dataType: "text", propertyName: "batchNo"},
        {dataType: "text", propertyName: "productionItemNo"},
        {dataType: "date", propertyName: "manufactureDate"},
        {dataType: "date", propertyName: "expireDate"},
        {dataType: "text", propertyName: "availableQuantity"},
        {dataType: "text", propertyName: "damagedQuantity"},
        {dataType: "price", propertyName: "totalCost"},
        {dataType: "function", propertyName: getStatus},
    ];
    if (pcReportTableInstance) {
        pcReportTableInstance.destroy();
    }
    $("#tableCR tbody").empty();
    tableDataBinder(
        tableCR,
        batchList,
        displayProperty,
        false,
        null,
        null
    )
    pcReportTableInstance = $("#tableCR").DataTable({
        responsive: true,
        autoWidth: false,
        searching: false,
        ordering: false,
        paging: false,
        info: false,
    })
}

const downloadTableAsExcel = (tableId, filename) => {
    const table = document.getElementById(tableId);
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, filename);
};