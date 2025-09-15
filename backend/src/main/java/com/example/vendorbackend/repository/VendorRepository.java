// src/main/java/com/example/vendorbackend/repository/VendorRepository.java
package com.example.vendorbackend.repository;

import com.example.vendorbackend.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, String> { }
