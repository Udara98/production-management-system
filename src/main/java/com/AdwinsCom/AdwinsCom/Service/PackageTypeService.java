package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.PackageTypeRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductionItemRepository;
import com.AdwinsCom.AdwinsCom.entity.Production.PackageType;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PackageTypeService implements IPackageTypeService{

    final PackageTypeRepository packageTypeRepository;
    final ProductionItemRepository productionItemRepository;

    public PackageTypeService(PackageTypeRepository packageTypeRepository, ProductionItemRepository productionItemRepository) {
        this.packageTypeRepository = packageTypeRepository;
        this.productionItemRepository = productionItemRepository;
    }

    @Override
    public ResponseEntity<?> AddNewPackageType(String packageType, String userName) throws NoSuchAlgorithmException {
        PackageType newPackageType = new PackageType();
         newPackageType.setId(QuotationRequest.generateUniqueId("PT-"));
        newPackageType.setName(packageType);
        newPackageType.setAddedUser(userName);
        newPackageType.setAddedDate(LocalDateTime.now());

        packageTypeRepository.save(newPackageType);

        return ResponseEntity.ok("New Package Type Added");
    }

    @Override
    public ResponseEntity<?> UpdatePackageType(String id,String packageType, String userName) {
        PackageType type = packageTypeRepository.findById(id).get();
        type.setName(packageType);
        type.setUpdatedUser(userName);
        type.setUpdatedDate(LocalDateTime.now());

        packageTypeRepository.save(type);
        return ResponseEntity.ok("Package Type Updated Successfully");
    }

    @Override
    public ResponseEntity<?> GetAllPackageTypes() {
        List<PackageType> packageTypes = packageTypeRepository.findAll();
        return ResponseEntity.ok(packageTypes);
    }

    @Override
    @Transactional
    public ResponseEntity<?> DeletePackageType(String id) {
        List<ProductionItem> productionItems = productionItemRepository.findByPackageTypeId(id);

        for (ProductionItem pi: productionItems
        ) {
            pi.setPackageTypeId("Removed");
            pi.setStatus(ProductionItem.ProductionItemStatus.InActive);
            productionItemRepository.save(pi);
        }

        packageTypeRepository.deleteById(id);
        return ResponseEntity.ok("Package Type Deleted");
    }
}
