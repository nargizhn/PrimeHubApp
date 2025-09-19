package com.example.vendorbackend.model;

/**
 * Firestore-backed per-user rating document.
 * Collection: ratings
 * Document id: userId_vendorId (or generated; we also store fields below)
 */
public class Rating {
    private String id;
    private String userId;
    private String vendorId;
    private Double value; // 0-5

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getVendorId() { return vendorId; }
    public void setVendorId(String vendorId) { this.vendorId = vendorId; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
}
