// src/utils/vendorFiles.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * Tek dosyayı Storage'a yükler ve Firestore'a metadata kaydeder.
 * Doküman yolu: vendorFiles/{vendorId}
 */
export async function uploadVendorAttachment(vendorId, file) {
    const safeName = String(file.name || "attachment").replace(/\s+/g, "_");
    const path = `vendors/${vendorId}/attachments/${Date.now()}_${safeName}`;

    try {
        const storageRef = ref(storage, path);
        const snap = await uploadBytes(storageRef, file, { contentType: file.type || "application/octet-stream" });
        const url = await getDownloadURL(snap.ref);

        const meta = {
            name: file.name,
            url,
            size: file.size,
            type: file.type,
            path,
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "vendorFiles", String(vendorId)), meta, { merge: true });
        return meta;
    } catch (e) {
        console.error("[uploadVendorAttachment] failed:", e);
        throw e;
    }
}

/** Firestore'dan tek dosya metadata'sını okur. Yoksa null döner. */
export async function getVendorAttachment(vendorId) {
    const d = await getDoc(doc(db, "vendorFiles", String(vendorId)));
    return d.exists() ? d.data() : null;
}

/** Güvenli indirme (blob) – CORS doğru ise direkt indirir. */
export async function downloadFile(url, suggestedName = "file") {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
}
