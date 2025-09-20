package com.example.vendorbackend.service;

import com.example.vendorbackend.model.Vendor;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class RatingService {

    private static final String RATINGS = "ratings";
    private static final String VENDORS = "vendors";

    private Firestore db() {
        return FirestoreClient.getFirestore();
    }

    /**
     * Upsert user rating and maintain vendor's average using running sum/count inside vendor doc.
     * This method runs in a Firestore transaction to avoid race conditions.
     */
    public Vendor submitRating(String userId, String vendorId, double value) {
        if (value < 0.0 || value > 5.0) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }

        try {
            ApiFuture<Vendor> future = db().runTransaction(transaction -> {
                DocumentReference vendorRef = db().collection(VENDORS).document(vendorId);
                DocumentSnapshot vendorSnap = transaction.get(vendorRef).get();
                if (!vendorSnap.exists()) {
                    throw new RuntimeException("Vendor not found: " + vendorId);
                }

                // Prepare rating doc id as user_vendor for easy upsert
                String ratingId = userId + "_" + vendorId;
                DocumentReference ratingRef = db().collection(RATINGS).document(ratingId);

                Double previousValue = null;
                DocumentSnapshot ratingSnap = transaction.get(ratingRef).get();
                if (ratingSnap.exists()) {
                    previousValue = ratingSnap.getDouble("value");
                }

                Double ratingSum = vendorSnap.getDouble("ratingSum");
                Long ratingCount = vendorSnap.getLong("ratingCount");

                if (ratingSum == null) ratingSum = 0.0;
                if (ratingCount == null) ratingCount = 0L;

                if (previousValue == null) {
                    // New rating
                    ratingSum += value;
                    ratingCount += 1;
                } else {
                    // Update existing user's rating
                    ratingSum += (value - previousValue);
                }

                double average = ratingCount == 0 ? 0.0 : ratingSum / ratingCount;

                Map<String, Object> vendorUpdates = new HashMap<>();
                vendorUpdates.put("ratingSum", ratingSum);
                vendorUpdates.put("ratingCount", ratingCount);
                vendorUpdates.put("rating", average);
                transaction.update(vendorRef, vendorUpdates);

                Map<String, Object> ratingDoc = new HashMap<>();
                ratingDoc.put("id", ratingId);
                ratingDoc.put("userId", userId);
                ratingDoc.put("vendorId", vendorId);
                ratingDoc.put("value", value);
                if (ratingSnap.exists()) {
                    transaction.update(ratingRef, ratingDoc);
                } else {
                    transaction.set(ratingRef, ratingDoc);
                }

                // Return updated vendor snapshot mapped to Vendor
                DocumentSnapshot updated = transaction.get(vendorRef).get();
                Vendor v = updated.toObject(Vendor.class);
                if (v != null) v.setId(updated.getId());
                return v;
            });

            return future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to submit rating", e);
        }
    }
}
