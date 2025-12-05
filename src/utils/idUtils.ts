import Hashids from 'hashids';

const hashids = new Hashids('CLUBT-TI-TP2-SECURE-SALT', 8); // Salt and min length

export const idUtils = {
    encode: (id: number | string | undefined | null): string => {
        if (id === undefined || id === null) return '';
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        if (isNaN(numericId)) return '';
        return hashids.encode(numericId);
    },

    decode: (hash: string | undefined | null): number | null => {
        if (!hash) return null;

        // Fallback: Check if it's already a number (for legacy URLs or transition)
        const pureNumber = parseInt(hash, 10);
        if (!isNaN(pureNumber) && String(pureNumber) === hash) {
            return pureNumber;
        }

        const decoded = hashids.decode(hash);
        if (decoded.length === 0) return null;
        return Number(decoded[0]);
    }
};
