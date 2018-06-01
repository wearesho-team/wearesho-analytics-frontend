import Fingerprint2 from "fingerprintjs2";

export type FingerprintFallback = (error: string) => void;

export interface Fingerprint {
    components: Array<{ key: string, value: string }>;
    token: string;
}

export function fingerprintGenerator(cacheKey: string, fingerprintFallback?: FingerprintFallback): Fingerprint {
    const cacheFingerprint = JSON.parse(localStorage.getItem(cacheKey));

    if (cacheFingerprint) {
        return cacheFingerprint;
    }

    let fingerprint: Fingerprint;
    try {
        (new Fingerprint2()).get((token, components) => {
            fingerprint = { token, components };
        });
    } catch (error) {
        fingerprintFallback && fingerprintFallback(error);
        fingerprint = {
            token: btoa((Date.now() + Math.random()).toString().replace(/\./g, "")),
            components: [{ key: "user_agent", value: navigator.userAgent }]
        };
    }

    localStorage.setItem(cacheKey, JSON.stringify(fingerprint));

    return fingerprint;
}
