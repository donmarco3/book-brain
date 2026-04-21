import OpenAI from "openai";
const client = new OpenAI()

const prompt = `
    You are a reading synthesis engine. Your job is to generate a meaningful, 
    medium-length synthesis (3–5 paragraphs) of a book based exclusively on 
    the notes a user has taken while reading it.

    Each note contains some or all of the following fields:
    - Note title
    - Context for that note
    - A quote or passage of text from the book
    - The user's reaction or thought about the quote
    - How it connects to their life
    - How it connects to their life or another book or idea they know

    Your synthesis should:
    - Be grounded in the book's core ideas, but filtered through the user's 
    perspective and what resonated with them personally
    - Prioritize the user's reflections, reactions, and life connections — 
    these are the signal, not decoration
    - Identify recurring themes or tensions across the notes, even if the 
    user didn't name them explicitly
    - Feel like a thoughtful essay written about this specific reader's 
    experience of this book — not a generic book summary anyone could find 
    online
    - Be written in clear, intelligent prose — no bullet points, no headers

    Do not invent ideas or quotes not present in the notes. If the notes are 
    sparse, synthesize honestly from what is there.
`

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
        const cards = req.body.map(card => {
            return (
                `
                    Note title: ${card.card_title}
                    Context: ${card.context}
                    Quote / Passage from the book: ${card.capture}
                    User's reaction to the quote / passage: ${card.spark}
                    ${card.question1}: ${card.response1}
                    ${card.question2}: ${card.response2}
                `
            )
        })

        const completion = await client.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Here are all the notes from the user: ${cards}` }
            ],
        })
        // console.log(completion.choices[0].message.content)

        res.status(200).send(completion.choices[0].message.content)
    } else {
        res.status(405).send('Method not allowed')
    }
}