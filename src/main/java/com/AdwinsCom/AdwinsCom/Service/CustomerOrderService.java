package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.DTO.CustomerOrderDTO;
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

@Service
public class CustomerOrderService implements ICustomerOrderService{

    final CustomerOrderRepository customerOrderRepository;
    final ProductHasBatchRepository productHasBatchRepository;
    final CustomerRepository customerRepository;
    final ProductRepository productRepository;
    final com.AdwinsCom.AdwinsCom.Repository.CustomerPaymentHasOrderRepository customerPaymentHasOrderRepository;

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
            for (ProductHasBatch batch : batches) {
                if (batch.getQuantity() <= 0) continue;
                int takeQty = Math.min(remaining, batch.getQuantity());
                // Deduct from batch
                batch.setQuantity(batch.getQuantity() - takeQty);
                productHasBatchRepository.save(batch);

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
                if (remaining <= 0) break;
            }
            if (remaining > 0) {
                throw new IllegalStateException("Insufficient stock for product ID: " + productId);
            }
        }
        // Calculate total amount (sum of all order line prices)
        double totalAmount = orderProducts.stream().mapToDouble(CustomerOrderProduct::getProductLinePrice).sum();
        newCustomerOrder.setCustomerOrderProducts(orderProducts);
        newCustomerOrder.setTotalAmount(totalAmount);

        // Dynamic credit limit check
        Double outstanding = customerOrderRepository.getTotalOutstandingByCustomerId(customer.getId());
        if (outstanding == null) outstanding = 0.0;
        if (outstanding + totalAmount > customer.getCreditLimit()) {
            return ResponseEntity.status(400)
                .body("Order cannot be placed: Customer credit limit exceeded. <br> Outstanding: Rs. " + outstanding + ", Order Total: Rs. " + totalAmount + " <br> Credit Limit: Rs. " + customer.getCreditLimit());
        }

        customerOrderRepository.save(newCustomerOrder);
        Map<String, Object> resp = new HashMap<>();
        resp.put("orderId", newCustomerOrder.getId());
        resp.put("responseText", "Customer Order Placed Successfully");
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
}
