export default async function handler(req, res) {
    const { body } = req
    return res.send(`Hello, you just parsed the request body ${body}`)
}