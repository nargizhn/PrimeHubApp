package com.example.vendorbackend.controller;

import com.example.vendorbackend.dto.RatingUpdateRequest;
import com.example.vendorbackend.model.Vendor;
import com.example.vendorbackend.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = "http://localhost:3000")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    // LIST (aynı kaldı)
    @GetMapping
    public List<Vendor> list() {
        return vendorService.findAll();
    }

    // GET BY ID — service'ten bulunur
    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getById(@PathVariable String id) {
        Optional<Vendor> opt = vendorService.findAll()
                .stream()
                .filter(v -> id.equals(v.getId()))
                .findFirst();
        return opt.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE (aynı kaldı)
    @PostMapping
    public ResponseEntity<Vendor> create(@RequestBody Vendor v) {
        Vendor saved = vendorService.create(v);
        return ResponseEntity.created(URI.create("/api/vendors/" + saved.getId())).body(saved);
    }

    // UPDATE (merge) — service'e yazılır (upsert mantığı)
    @PutMapping("/{id}")
    public ResponseEntity<Vendor> update(@PathVariable String id, @RequestBody Vendor req) {
        Optional<Vendor> opt = vendorService.findAll()
                .stream()
                .filter(v -> id.equals(v.getId()))
                .findFirst();

        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Vendor existing = opt.get();
        // Alan bazında merge — id sabit kalır
        if (req.getName() != null) existing.setName(req.getName());
        if (req.getCategory() != null) existing.setCategory(req.getCategory());
        if (req.getCity() != null) existing.setCity(req.getCity());
        if (req.getRepresentative() != null) existing.setRepresentative(req.getRepresentative());
        if (req.getContact() != null) existing.setContact(req.getContact());
        if (req.getPrice() != null) existing.setPrice(req.getPrice());
        if (req.getNotes() != null) existing.setNotes(req.getNotes());
        if (req.getAgreementNumber() != null) existing.setAgreementNumber(req.getAgreementNumber());
        if (req.getBankAccount() != null) existing.setBankAccount(req.getBankAccount());
        if (req.getImages() != null) existing.setImages(req.getImages());
        if (req.getRating() != null) existing.setRating(req.getRating());

        Vendor saved = vendorService.create(existing); // service tek kaynağımız
        return ResponseEntity.ok(saved);
    }

    // DELETE (aynı kaldı)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        vendorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // UPDATE RATING — service'ten bul, service'e yaz
    @PutMapping("/{id}/rating")
    public ResponseEntity<Vendor> updateRating(@PathVariable String id,
                                               @RequestBody RatingUpdateRequest req) {
        if (req == null || req.getRating() == null) {
            return ResponseEntity.badRequest().build();
        }
        double r = req.getRating();
        if (r < 0.0 || r > 5.0) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Vendor> opt = vendorService.findAll()
                .stream()
                .filter(v -> id.equals(v.getId()))
                .findFirst();

        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Vendor v = opt.get();
        v.setRating(r);
        Vendor saved = vendorService.create(v); // upsert
        return ResponseEntity.ok(saved);
    }
}
