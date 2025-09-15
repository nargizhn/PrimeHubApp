package com.example.vendorbackend.service;

import com.example.vendorbackend.model.Vendor;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class VendorService {

    private static final String COLLECTION = "vendors";

    private Firestore db() {
        return FirestoreClient.getFirestore();
    }

    // LIST - Firestore'dan hepsini çek
    public List<Vendor> findAll() {
        try {
            ApiFuture<QuerySnapshot> future = db().collection(COLLECTION).get();
            List<QueryDocumentSnapshot> docs = future.get().getDocuments();
            List<Vendor> result = new ArrayList<>();
            for (QueryDocumentSnapshot d : docs) {
                Vendor v = d.toObject(Vendor.class);
                // id alanını belge id'siyle doldur
                v.setId(d.getId());
                result.add(v);
            }
            return result;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to read vendors from Firestore", e);
        }
    }

    // CREATE - Firestore'a yaz
    public Vendor create(Vendor v) {
        try {
            String id = (v.getId() == null || v.getId().isBlank())
                    ? UUID.randomUUID().toString()
                    : v.getId();

            v.setId(id);
            // Belge id’sini biz belirleyelim ki sonra kolay silelim/güncelleyelim
            ApiFuture<WriteResult> write = db().collection(COLLECTION).document(id).set(v);
            write.get(); // tamamlanmasını bekleyelim
            return v;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to create vendor in Firestore", e);
        }
    }

    // DELETE - Firestore'dan sil
    public void delete(String id) {
        try {
            db().collection(COLLECTION).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to delete vendor in Firestore", e);
        }
    }

    // (İleride lazım olursa) GET BY ID
    public Optional<Vendor> findById(String id) {
        try {
            DocumentSnapshot snap = db().collection(COLLECTION).document(id).get().get();
            if (snap.exists()) {
                Vendor v = snap.toObject(Vendor.class);
                if (v != null) v.setId(snap.getId());
                return Optional.ofNullable(v);
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to get vendor from Firestore", e);
        }
    }

    // (İleride lazım olursa) UPDATE
    public Vendor update(String id, Vendor payload) {
        try {
            payload.setId(id);
            db().collection(COLLECTION).document(id).set(payload).get();
            return payload;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to update vendor in Firestore", e);
        }
    }

    public Vendor updateRating(String id, double r) {
        return null;
    }
}
