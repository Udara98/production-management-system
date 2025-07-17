package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerOrderDTO;
import com.AdwinsCom.AdwinsCom.DTO.CustomerSalesSummaryDTO;
import com.AdwinsCom.AdwinsCom.Repository.CustomerOrderRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductHasBatchRepository;
import com.AdwinsCom.AdwinsCom.Repository.CustomerRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductRepository;
import com.AdwinsCom.AdwinsCom.entity.CustomerOrder;
import com.AdwinsCom.AdwinsCom.entity.CustomerOrderProduct;
import com.AdwinsCom.AdwinsCom.entity.ProductHasBatch;
import com.AdwinsCom.AdwinsCom.entity.Customer;
import com.AdwinsCom.AdwinsCom.entity.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.AdwinsCom.AdwinsCom.entity.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerOrderService implements ICustomerOrderService{

    final CustomerOrderRepository customerOrderRepository;
    final ProductHasBatchRepository productHasBatchRepository;
    final CustomerRepository customerRepository;
    final ProductRepository productRepository;
    final com.AdwinsCom.AdwinsCom.Repository.CustomerPaymentHasOrderRepository customerPaymentHasOrderRepository; // removed unnecessary orderProducts field

    @Autowired
    private com.AdwinsCom.AdwinsCom.Repository.CustomerOrderProductRepository customerOrderProductRepository;

    @Autowired
    private com.AdwinsCom.AdwinsCom.Service.NotificationService notificationService;

    public CustomerOrderService(CustomerOrderRepository customerOrderRepository, ProductHasBatchRepository productHasBatchRepository, CustomerRepository customerRepository, ProductRepository productRepository, com.AdwinsCom.AdwinsCom.Repository.CustomerPaymentHasOrderRepository customerPaymentHasOrderRepository) {
        this.customerOrderRepository = customerOrderRepository;
        this.productHasBatchRepository = productHasBatchRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.customerPaymentHasOrderRepository = customerPaymentHasOrderRepository;
    }

    // Inside your class, but outside any other method:

    private String generateNextInvoiceNo() {
        String prefix = "INV-";
        List<CustomerOrder> allOrders = customerOrderRepository.findByInvoiceNoStartingWith(prefix);
        int maxSeq = 0;
        for (CustomerOrder order : allOrders) {
            String inv = order.getInvoiceNo();
            if (inv != null && inv.startsWith(prefix)) {
                String seqStr = inv.substring(prefix.length());
                try {
                    int seq = Integer.parseInt(seqStr);
                    if (seq > maxSeq) maxSeq = seq;
                } catch (NumberFormatException e) {
                    // handle exception
                }
            }
        }
        return prefix + String.format("%04d", maxSeq + 1);
    }

    @Override
    @Transactional
    public ResponseEntity<?> AddNewCustomerOrder(CustomerOrderDTO customerOrderDTO, String userName) throws NoSuchAlgorithmException {

   

        // Fetch customer entity by ID
        Customer customer = customerRepository.findById(customerOrderDTO.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with ID: " + customerOrderDTO.getCustomerId()));

        CustomerOrder newCustomerOrder = new CustomerOrder();
        newCustomerOrder.setOrderNo(QuotationRequest.generateUniqueId("ODR-"));
        newCustomerOrder.setAddedDate(LocalDateTime.now());
        newCustomerOrder.setAddedUser(userName);
        newCustomerOrder.setRequiredDate(customerOrderDTO.getRequiredDate());
        newCustomerOrder.setCustomer(customer);
        newCustomerOrder.setOrderStatus(customerOrderDTO.getOrderStatus());


        // Generate invoiceNo if not set
        if (newCustomerOrder.getInvoiceNo() == null || newCustomerOrder.getInvoiceNo().isEmpty()) {
            String invoiceNo = generateNextInvoiceNo();
            newCustomerOrder.setInvoiceNo(invoiceNo);
        }

        List<CustomerOrderProduct> orderProducts = new ArrayList<>();


        boolean allProductsHaveStock = true;
        for (CustomerOrderDTO.CustomerOrderProductDTO orderProductDTO : customerOrderDTO.getCustomerOrderProducts()) {
            Integer productId = orderProductDTO.getProductId();
            Integer requiredQty = orderProductDTO.getQuantity();

            // Fetch product entity by ID
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

            // Fetch batches for product, FIFO (oldest first)
            List<ProductHasBatch> batches = productHasBatchRepository.findAllByProductId(productId)
                    .stream()
                    .sorted(Comparator.comparing(ProductHasBatch::getManufacturingDate))
                    .collect(Collectors.toList());

            int remaining = requiredQty;
            boolean hasSufficientStock = false;
            Double latestBatchPrice = null;
            if (!batches.isEmpty()) {
                latestBatchPrice = batches.get(batches.size() - 1).getSalesPrice();
            }
            for (ProductHasBatch batch : batches) {
                if (batch.getQuantity() <= 0) continue;
                int takeQty = Math.min(remaining, batch.getQuantity());

                // Use batch price for this portion
                double productPrice = batch.getSalesPrice();

                // Create order product for this batch
                CustomerOrderProduct orderLine = new CustomerOrderProduct();
                orderLine.setProduct(product);
                orderLine.setQuantity(takeQty);
                orderLine.setProductPrice(productPrice);
                orderLine.setProductLinePrice(productPrice * takeQty);
                orderLine.setProductHasBatch(batch);
                orderProducts.add(orderLine);

                remaining -= takeQty;
                if (remaining <= 0) {
                    hasSufficientStock = true;
                    break;
                }
            }
            if (remaining > 0) {
                // Save the remaining as a product line with no batch
                CustomerOrderProduct orderLine = new CustomerOrderProduct();
                orderLine.setProduct(product);
                orderLine.setQuantity(remaining);
                orderLine.setProductPrice(latestBatchPrice); // could be null if no batch exists
                orderLine.setProductLinePrice(latestBatchPrice != null ? latestBatchPrice * remaining : null);
                orderLine.setProductHasBatch(null);
                orderProducts.add(orderLine);
                hasSufficientStock = false;
            }
            if (!hasSufficientStock) {
                allProductsHaveStock = false;
            }
        }
        // Calculate total amount (sum of all order line prices)
        double totalAmount = orderProducts.stream().mapToDouble(CustomerOrderProduct::getProductLinePrice).sum();
        newCustomerOrder.setCustomerOrderProducts(orderProducts);
        newCustomerOrder.setTotalAmount(totalAmount);

        // Dynamic credit limit check
        Double outstanding = customerOrderRepository.getTotalOutstandingByCustomerId(customer.getId());
        if (outstanding == null) outstanding = 0.0;
        boolean hasSufficientCredit = (outstanding + totalAmount <= customer.getCreditLimit());

        // Set order status based on stock/credit
        if (allProductsHaveStock && hasSufficientCredit) {
            newCustomerOrder.setOrderStatus(CustomerOrder.OrderStatus.Pending);
            // Deduct from batch quantities
            for (CustomerOrderProduct orderLine : orderProducts) {
                ProductHasBatch batch = orderLine.getProductHasBatch();
                if (batch != null) {
                    batch.setQuantity(batch.getQuantity() - orderLine.getQuantity());
                    productHasBatchRepository.save(batch);
                }
            }
        } else {
            newCustomerOrder.setOrderStatus(CustomerOrder.OrderStatus.NotAssigned);
            // Do NOT deduct from batch quantities
            // Send notification for NotAssigned order
            Notification notAssignedNotif = new Notification();
            notAssignedNotif.setType("OrderNotAssigned");
            notAssignedNotif.setTimestamp(LocalDateTime.now());
            notAssignedNotif.setResolved(false);
            notAssignedNotif.setReportedBy(userName);
            String dateStr = java.time.LocalDate.now().toString();
            notAssignedNotif.setMessage("Order " + newCustomerOrder.getOrderNo() + " for customer " + customer.getCompanyName() + " is not assigned due to insufficient stock or credit.\nReported By: " + userName + "\nDate: " + dateStr);
            notificationService.saveNotification(notAssignedNotif);
        }

        customerOrderRepository.save(newCustomerOrder);
        Map<String, Object> resp = new HashMap<>();
        resp.put("orderId", newCustomerOrder.getId());
        resp.put("orderStatus", newCustomerOrder.getOrderStatus().name());
        if (newCustomerOrder.getOrderStatus() == CustomerOrder.OrderStatus.NotAssigned) {
            resp.put("responseText", "Order placed but not assigned due to insufficient stock or credit.");
        } else {
            resp.put("responseText", "Customer Order Placed Successfully");
        }
        return ResponseEntity.ok(resp);
    }

    @Override
    public ResponseEntity<?> UpdateCustomerOrder(CustomerOrderDTO customerOrderDTO, String userName) {
        return null;
    }

    @Override
    public ResponseEntity<?> GetAllCustomerOrders() {
        List<CustomerOrder> customerOrders = customerOrderRepository.findAll();
        List<Map<String, Object>> dtoList = customerOrders.stream().map(order -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", order.getId());
            dto.put("orderNo", order.getOrderNo());
            dto.put("totalAmount", order.getTotalAmount());
            dto.put("requiredDate", order.getRequiredDate());
            dto.put("orderStatus", order.getOrderStatus());
            // Customer summary
            Map<String, Object> customer = new HashMap<>();
            if (order.getCustomer() != null) {
                customer.put("id", order.getCustomer().getId());
                customer.put("regNo", order.getCustomer().getRegNo());
                customer.put("companyName", order.getCustomer().getCompanyName());
                customer.put("firstName", order.getCustomer().getFirstName());
                customer.put("secondName", order.getCustomer().getSecondName());
            }
            dto.put("customer", customer);
            // Products
            List<Map<String, Object>> orderProducts = new ArrayList<>();
            if (order.getCustomerOrderProducts() != null) {
                for (CustomerOrderProduct op : order.getCustomerOrderProducts()) {
                    Map<String, Object> opDto = new HashMap<>();
                    if (op.getProduct() != null) {
                        opDto.put("productId", op.getProduct().getId());
                        opDto.put("productName", op.getProduct().getProductName());
                        opDto.put("productCode", op.getProduct().getProductCode());
                    }
                    opDto.put("quantity", op.getQuantity());
                    opDto.put("productPrice", op.getProductPrice());
                    opDto.put("productLinePrice", op.getProductLinePrice());
                    if (op.getProductHasBatch() != null) {
                        opDto.put("batchNo", op.getProductHasBatch().getBatch().getBatchNo());
                    }
                    orderProducts.add(opDto);
                }
            }
            dto.put("orderProducts", orderProducts);
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @Override
    public java.util.List<com.AdwinsCom.AdwinsCom.DTO.CustomerSalesSummaryDTO> getCustomerSalesSummary(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        java.util.List<Object[]> rawList = customerOrderRepository.getCustomerSalesSummary(startDate, endDate);
        java.util.List<com.AdwinsCom.AdwinsCom.DTO.CustomerSalesSummaryDTO> result = new java.util.ArrayList<>();
        System.out.println(rawList);
        for (Object[] row : rawList) {
            // regNo (String), customerName (String), totalAmount (Number), totalQuantity (Number)
            String regNo = row[0] != null ? row[0].toString() : null;
            String customerName = row[1] != null ? row[1].toString() : "";
            Double totalAmount = 0.0;
            Integer totalQuantity = 0;
            if (row[2] != null) {
                if (row[2] instanceof Number) {
                    totalAmount = ((Number) row[2]).doubleValue();
                } else {
                    try {
                        totalAmount = Double.parseDouble(row[2].toString());
                    } catch (Exception e) { totalAmount = 0.0; }
                }
            }
            if (row[3] != null) {
                if (row[3] instanceof Number) {
                    totalQuantity = ((Number) row[3]).intValue();
                } else {
                    try {
                        totalQuantity = Integer.parseInt(row[3].toString());
                    } catch (Exception e) { totalQuantity = 0; }
                }
            }
            result.add(new CustomerSalesSummaryDTO(regNo, customerName, totalAmount, totalQuantity));
        }
        return result;
    }


    public CustomerOrder getOrderEntityById(Integer id) {
        return customerOrderRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + id));
    }

    @Override
    public ResponseEntity<?> gtAllUnpaidCustomerOrders() {
        List<CustomerOrder> unpaidCustomerOrders = customerOrderRepository.gtAllUnpaidCustomerOrders();
        return ResponseEntity.ok(unpaidCustomerOrders);
    }

    @Override
    public ResponseEntity<?> getUnpaidOrdersByCustomer(Integer customerId) {
        List<CustomerOrder> unpaidOrders = customerOrderRepository.findUnpaidOrdersByCustomerId(customerId);
        for (CustomerOrder order : unpaidOrders) {
            Double paid = customerPaymentHasOrderRepository.sumPaidAmountByOrderId(order.getId());
            if (paid == null) paid = 0.0;
            order.setOutstanding(order.getTotalAmount() - paid);
        }
        return ResponseEntity.ok(unpaidOrders);
    }

    @Override
    public ResponseEntity<?> DeleteCustomerOrder(Integer id) {
        return null;
    }

    // Product Sales Summary
    public java.util.List<com.AdwinsCom.AdwinsCom.DTO.ProductSalesSummaryDTO> getProductSalesSummary(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        java.util.List<Object[]> rawList = customerOrderProductRepository.getProductSalesSummary(startDate, endDate);
        java.util.List<com.AdwinsCom.AdwinsCom.DTO.ProductSalesSummaryDTO> result = new java.util.ArrayList<>();
        long leadTime = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
for (Object[] row : rawList) {
    String productName = row[0] != null ? row[0].toString() : "";
    Integer totalQuantity = row[1] != null ? ((Number) row[1]).intValue() : 0;
    Double totalAmount = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
    Double avgDailySales = leadTime > 0 ? totalQuantity / (double)leadTime : 0.0;
    Double generatedRop = avgDailySales * (double)leadTime;
    com.AdwinsCom.AdwinsCom.DTO.ProductSalesSummaryDTO dto = new com.AdwinsCom.AdwinsCom.DTO.ProductSalesSummaryDTO();
    dto.setProductName(productName);
    dto.setTotalAmount(totalAmount);
    dto.setTotalQuantity(totalQuantity);
    dto.setGeneratedRop(generatedRop);
    result.add(dto);
}
        return result;
    }
}
