package com.example.vendorbackend.dto;

import lombok.Data;

@Data
public class VendorRequest {
    private String name;
    private String category;
    private String city;
    private String representative;
    private String contact;
    private String price;
    private String notes;
    private String agreementNumber;
    private String bankAccountNumber;
}
