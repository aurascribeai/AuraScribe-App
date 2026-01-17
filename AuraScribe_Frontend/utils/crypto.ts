// AES encryption/decryption helpers using crypto-js
// Uses a device-specific key derived from available browser fingerprint data
import CryptoJS from 'crypto-js';

// Generate a device-specific key based on browser characteristics
// This provides better security than a static hardcoded key
function getDeviceKey(): string {
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width.toString(),
        screen.height.toString(),
        new Date().getTimezoneOffset().toString(),
        navigator.hardwareConcurrency?.toString() || '4',
    ];

    // Create a hash of the device fingerprint
    const fingerprint = components.join('|');
    const hash = CryptoJS.SHA256(fingerprint).toString();

    // Combine with app-specific salt
    return CryptoJS.SHA256(hash + 'AuraScribe_2026').toString();
}

// Cache the key to avoid recalculating on every operation
let cachedKey: string | null = null;

function getSecretKey(): string {
    if (!cachedKey) {
        cachedKey = getDeviceKey();
    }
    return cachedKey;
}

export function encryptData(data: any): string {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), getSecretKey()).toString();
    } catch {
        return '';
    }
}

export function decryptData(ciphertext: string): any {
    try {
        if (!ciphertext) return null;
        const bytes = CryptoJS.AES.decrypt(ciphertext, getSecretKey());
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) return null;
        return JSON.parse(decrypted);
    } catch {
        return null;
    }
}

// Function to clear cached key (useful for testing or key rotation)
export function clearCachedKey(): void {
    cachedKey = null;
}
