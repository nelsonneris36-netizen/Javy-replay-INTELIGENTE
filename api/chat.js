export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API não configurada na Vercel.' });
    }

    const modelos = ['gemini-2.5-flash', 'gemini-1.5-flash'];

    for (const modelo of modelos) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`, {
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
            }
        } catch (e) {
            // Se falhar, tenta o próximo modelo da lista
        }
    }

    return res.status(500).json({ resposta: 'Poxa, o Gemini está com alta demanda agora. Tente mandar a mensagem de novo em instantes!' });
}
