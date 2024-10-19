package com.AdwinsCom.AdwinsCom.Service;

import com.AdwinsCom.AdwinsCom.Repository.FlavourRepository;
import com.AdwinsCom.AdwinsCom.Repository.ProductionItemRepository;
import com.AdwinsCom.AdwinsCom.entity.Production.Flavour;
import com.AdwinsCom.AdwinsCom.entity.Production.ProductionItem;
import com.AdwinsCom.AdwinsCom.entity.QuotationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FlavourService implements IFlavourService{

    final FlavourRepository flavourRepository;
    final ProductionItemRepository productionItemRepository;

    public FlavourService(FlavourRepository flavourRepository, ProductionItemRepository productionItemRepository) {
        this.flavourRepository = flavourRepository;
        this.productionItemRepository = productionItemRepository;
    }

    @Override
    public ResponseEntity<?> AddNewFlavour(String flavourName, String userName) throws NoSuchAlgorithmException {

        Flavour newFlavour = new Flavour();
        newFlavour.setId(QuotationRequest.generateUniqueId("F-"));
        newFlavour.setName(flavourName);
        newFlavour.setAddedUser(userName);
        newFlavour.setAddedDate(LocalDateTime.now());

        flavourRepository.save(newFlavour);

        return ResponseEntity.ok("New Flavour Added");
    }

    @Override
    public ResponseEntity<?> UpdateFlavour(String id, String flavourName, String userName) {
        Flavour flavour = flavourRepository.findById(id).get();
        flavour.setName(flavourName);
        flavour.setUpdatedUser(userName);
        flavour.setUpdatedDate(LocalDateTime.now());

        flavourRepository.save(flavour);
        return ResponseEntity.ok("Flavour Updated Successfully");
    }


    @Override
    public ResponseEntity<?> GetAllFlavours() {
        List<Flavour> flavours = flavourRepository.findAll();
        return ResponseEntity.ok(flavours);
    }

    @Override
    @Transactional
    public ResponseEntity<?> DeleteFlavour(String id) {

        List<ProductionItem> productionItems = productionItemRepository.findByFlavourId(id);

        for (ProductionItem pi: productionItems
             ) {
            pi.setFlavourId("Removed");
            pi.setStatus(ProductionItem.ProductionItemStatus.InActive);
            productionItemRepository.save(pi);
        }

       flavourRepository.deleteById(id);
       return ResponseEntity.ok("Flavour Deleted");
    }
}
