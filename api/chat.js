export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API não configurada na Vercel.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return res.status(200).json({ resposta: data.candidates[0].content.parts[0].text });
        } else if (data.error) {
            return res.status(500).json({ resposta: `Erro do Gemini: ${data.error.message}` });
        } else {
            return res.status(500).json({ resposta: 'Poxa, a IA respondeu num formato inesperado.' });
        }

    } catch (error) {
        return res.status(500).json({ resposta: 'Erro de conexão com o servidor do Gemini.' });
    }
}
