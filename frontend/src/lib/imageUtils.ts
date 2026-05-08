// Curated fitness photo IDs from Unsplash (no API key needed, free tier)
// Format: https://images.unsplash.com/photo-{ID}?w=600&h=400&fit=crop

const ROUTINE_PHOTOS: Record<string, string> = {
    push:        '1571019614242-c5c5dee9f50b', // bench press
    chest:       '1571019614242-c5c5dee9f50b',
    press:       '1571019614242-c5c5dee9f50b',
    pull:        '1532029837206-abbe2b7620e3', // pull-ups
    back:        '1532029837206-abbe2b7620e3',
    row:         '1532029837206-abbe2b7620e3',
    leg:         '1603287681836-b174ce5074c2', // squat rack
    squat:       '1603287681836-b174ce5074c2',
    lower:       '1603287681836-b174ce5074c2',
    glute:       '1571019613454-1cb2f99b2d8b', // hip thrust
    hip:         '1571019613454-1cb2f99b2d8b',
    hamstring:   '1571019613454-1cb2f99b2d8b',
    shoulder:    '1541534741688-6078c6bfb5c5', // shoulder press
    overhead:    '1541534741688-6078c6bfb5c5',
    ohp:         '1541534741688-6078c6bfb5c5',
    arm:         '1583454110551-21f2fa2afe61', // bicep curl
    bicep:       '1583454110551-21f2fa2afe61',
    tricep:      '1583454110551-21f2fa2afe61',
    curl:        '1583454110551-21f2fa2afe61',
    deadlift:    '1526506118085-60ce8714f8c5', // deadlift
    strength:    '1526506118085-60ce8714f8c5',
    power:       '1526506118085-60ce8714f8c5',
    cardio:      '1538805060514-97d9cc17730c', // running track
    run:         '1538805060514-97d9cc17730c',
    hiit:        '1434682881908-b43d0467b798', // HIIT
    circuit:     '1434682881908-b43d0467b798',
    yoga:        '1544367567-0f2fcb009e0b', // yoga
    mobility:    '1544367567-0f2fcb009e0b',
    stretch:     '1544367567-0f2fcb009e0b',
    full:        '1534438327276-14e5300c3a48', // gym general
    upper:       '1574680096145-d05b474e2155', // weights general
    arnold:      '1598971639058-fab3c3109a64', // bodybuilder
    hypertrophy: '1571019614242-c5c5dee9f50b',
    volume:      '1574680096145-d05b474e2155',
};

const DIET_PHOTOS: Record<string, string> = {
    protein:     '1490645935967-10de6ba17061', // meal prep
    high:        '1490645935967-10de6ba17061',
    cut:         '1498837167922-ddd27525d352', // veggies
    deficit:     '1498837167922-ddd27525d352',
    weight:      '1498837167922-ddd27525d352',
    keto:        '1490474418585-ba9bad8fd0ea', // avocado / keto
    low:         '1490474418585-ba9bad8fd0ea',
    carb:        '1490474418585-ba9bad8fd0ea',
    mediterranean: '1512621776951-a57141f2eefd', // salad bowl
    mediterranean2:'1512621776951-a57141f2eefd',
    bulk:        '1546069901-ba9599a7e63c', // food abundance
    mass:        '1546069901-ba9599a7e63c',
    calorie:     '1546069901-ba9599a7e63c',
    lean:        '1498837167922-ddd27525d352',
    vegan:       '1512621776951-a57141f2eefd',
    vegetarian:  '1512621776951-a57141f2eefd',
};

const FALLBACK_ROUTINE = [
    '1534438327276-14e5300c3a48',
    '1574680096145-d05b474e2155',
    '1571019614242-c5c5dee9f50b',
    '1526506118085-60ce8714f8c5',
    '1532029837206-abbe2b7620e3',
];

const FALLBACK_DIET = [
    '1504674900247-0877df9cc836',
    '1490645935967-10de6ba17061',
    '1512621776951-a57141f2eefd',
    '1546069901-ba9599a7e63c',
    '1498837167922-ddd27525d352',
];

const CACHE_KEY = 'gymtrack_img_cache_v1';

function loadCache(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}

function saveCache(cache: Record<string, string>) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
}

function buildUrl(photoId: string, w = 600, h = 400): string {
    return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

function pickPhotoId(name: string, table: Record<string, string>, fallbacks: string[], seed: number): string {
    const lower = name.toLowerCase();
    for (const [keyword, id] of Object.entries(table)) {
        if (lower.includes(keyword)) return id;
    }
    return fallbacks[seed % fallbacks.length];
}

/** Returns a cached Unsplash image URL for a routine by name + stable seed (index or id hash). */
export function getRoutineImage(name: string, seed: number = 0, w = 600, h = 400): string {
    const cacheKey = `r:${name}:${w}x${h}`;
    const cache = loadCache();
    if (cache[cacheKey]) return cache[cacheKey];

    const photoId = pickPhotoId(name, ROUTINE_PHOTOS, FALLBACK_ROUTINE, seed);
    const url = buildUrl(photoId, w, h);
    cache[cacheKey] = url;
    saveCache(cache);
    return url;
}

/** Returns a cached Unsplash image URL for a diet plan by name + stable seed. */
export function getDietImage(name: string, seed: number = 0, w = 600, h = 400): string {
    const cacheKey = `d:${name}:${w}x${h}`;
    const cache = loadCache();
    if (cache[cacheKey]) return cache[cacheKey];

    const photoId = pickPhotoId(name, DIET_PHOTOS, FALLBACK_DIET, seed);
    const url = buildUrl(photoId, w, h);
    cache[cacheKey] = url;
    saveCache(cache);
    return url;
}

/** Returns a stable seed from a string (routine/diet id or name). */
export function seedFrom(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}

// ── Manual image overrides ──────────────────────────────────────────────────
const OVERRIDE_KEY = 'gymtrack_img_overrides_v1';

function loadOverrides(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}'); } catch { return {}; }
}

/** Save a manual image override for a routine or diet by id. */
export function setImageOverride(id: string, url: string): void {
    const overrides = loadOverrides();
    overrides[id] = url;
    try { localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides)); } catch {}
}

/** Get the manual override URL for a given id, or null if none set. */
export function getImageOverride(id: string): string | null {
    return loadOverrides()[id] ?? null;
}

/** Curated preset photos for the picker (fitness + nutrition) */
export const PRESET_ROUTINE_PHOTOS = [
    { id: '1571019614242-c5c5dee9f50b', label: 'Bench Press' },
    { id: '1532029837206-abbe2b7620e3', label: 'Pull-Ups' },
    { id: '1603287681836-b174ce5074c2', label: 'Squats' },
    { id: '1571019613454-1cb2f99b2d8b', label: 'Hip Thrust' },
    { id: '1541534741688-6078c6bfb5c5', label: 'Shoulders' },
    { id: '1526506118085-60ce8714f8c5', label: 'Deadlift' },
    { id: '1583454110551-21f2fa2afe61', label: 'Curls' },
    { id: '1538805060514-97d9cc17730c', label: 'Cardio' },
    { id: '1434682881908-b43d0467b798', label: 'HIIT' },
    { id: '1544367567-0f2fcb009e0b', label: 'Yoga' },
    { id: '1574680096145-d05b474e2155', label: 'Weights' },
    { id: '1534438327276-14e5300c3a48', label: 'Gym' },
].map(p => ({ ...p, url: buildUrl(p.id, 300, 200) }));

export const PRESET_DIET_PHOTOS = [
    { id: '1490645935967-10de6ba17061', label: 'Meal Prep' },
    { id: '1512621776951-a57141f2eefd', label: 'Salad Bowl' },
    { id: '1490474418585-ba9bad8fd0ea', label: 'Keto' },
    { id: '1546069901-ba9599a7e63c', label: 'Bulk Plate' },
    { id: '1498837167922-ddd27525d352', label: 'Veggies' },
    { id: '1504674900247-0877df9cc836', label: 'Healthy Food' },
    { id: '1567620905732-2d1ec7ab7445', label: 'Protein Bowl' },
    { id: '1494390248081-4e521a5940db', label: 'Smoothie' },
].map(p => ({ ...p, url: buildUrl(p.id, 300, 200) }));
