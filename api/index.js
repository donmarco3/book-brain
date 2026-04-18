export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
    }

    if (req.method === 'POST') {
        const { body } = req
        console.log(body)
        res.status(200).send(`here is the card ${body}`)
    } else {
        res.status(405).send('Method not allowed')
    }
}

// curl -X POST "http://localhost:3000/api" \
//   -H "Content-Type: application/json" \
//   -d '{
//   "name": "Reader"
// }'