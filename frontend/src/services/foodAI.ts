export interface FoodAnalysis {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: 'alta' | 'media' | 'baja';
}

// Compress image to max 768px and JPEG 80% before sending
async function compressImage(dataUrl: string): Promise<string> {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const MAX = 768;
            let w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else { w = Math.round(w * MAX / h); h = MAX; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
    });
}

export async function analyzeFoodImage(dataUrl: string): Promise<FoodAnalysis> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error('NO_KEY');

    const compressed = await compressImage(dataUrl);

    const prompt = `Analiza esta imagen de comida. Responde ÚNICAMENTE con un objeto JSON válido, sin texto extra ni markdown:
{"name":"nombre del plato en español","description":"descripción breve en 1 frase","calories":número,"protein":gramos proteína,"carbs":gramos carbohidratos,"fat":gramos grasa,"confidence":"alta|media|baja"}
Si no ves comida: name "No identificado" y ceros en los números.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: compressed } },
                ],
            }],
            max_tokens: 300,
            temperature: 0.1,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json();
    const raw = (data.choices?.[0]?.message?.content ?? '').trim();
    const clean = raw.replace(/^```json?\n?/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(clean);

    return {
        name:        String(parsed.name        || 'Desconocido'),
        description: String(parsed.description || ''),
        calories:    Math.round(Number(parsed.calories) || 0),
        protein:     Math.round(Number(parsed.protein)  || 0),
        carbs:       Math.round(Number(parsed.carbs)    || 0),
        fat:         Math.round(Number(parsed.fat)      || 0),
        confidence:  (['alta','media','baja'].includes(parsed.confidence) ? parsed.confidence : 'media') as FoodAnalysis['confidence'],
    };
}

export function getMealByHour(): string {
    const h = new Date().getHours();
    if (h >= 6  && h < 11) return 'Desayuno';
    if (h >= 11 && h < 15) return 'Almuerzo';
    if (h >= 15 && h < 19) return 'Merienda';
    if (h >= 19 && h < 24) return 'Cena';
    return 'Snack';
}
