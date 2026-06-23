export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = process.env.LINE_NOTIFY_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'LINE_NOTIFY_TOKEN not configured' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'message is required' });
    }

    try {
        const params = new URLSearchParams();
        params.append('message', message);

        const response = await fetch('https://notify-api.line.me/api/notify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.message || 'LINE API error' });
        }

        return res.status(200).json({ success: true, status: data.status });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
