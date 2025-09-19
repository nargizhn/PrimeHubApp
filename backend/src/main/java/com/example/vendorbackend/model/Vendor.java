package com.example.vendorbackend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendors")
public class Vendor {
    @Id
    private String id; // Firestore docId ya da UUID

    private String name;
    private String category;
    private String city;
    private String representative;
    private String contact;

    @Column(precision = 19, scale = 2)
    private BigDecimal price;

    @Column(length = 2000)
    private String notes;

    private String agreementNumber;
    private String bankAccount;

    // ⭐ Ortalama puan (0–5 arası)
    private Double rating = 0.0;
    private Integer ratingCount = 0; // ⭐ Puan sayısı, başlangıçta 0

    // Ortalama hesaplamak için kümülatif alanlar
    private Long ratingCount;
    private Double ratingSum;

    @ElementCollection
    @CollectionTable(name = "vendor_images", joinColumns = @JoinColumn(name = "vendor_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    // ---- getters / setters ----
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getRepresentative() { return representative; }
    public void setRepresentative(String representative) { this.representative = representative; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAgreementNumber() { return agreementNumber; }
    public void setAgreementNumber(String agreementNumber) { this.agreementNumber = agreementNumber; }

    public String getBankAccount() { return bankAccount; }
    public void setBankAccount(String bankAccount) { this.bankAccount = bankAccount; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }
    public void increaseRatingCount() { this.ratingCount++; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
