import OpenAI from "openai";
const client = new OpenAI()
const booksApi = process.env.GOOGLE_BOOKS_API_KEY

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
         if (!req.body.title && !req.body.author) {
             let paragraphLength
             if (req.body.type === "Short") {
                 paragraphLength = "short, 1 paragraph, 2-4 sentences"
             } else if (req.body.type === "Detailed") {
                 paragraphLength = "detailed, 5 paragraphs"
             } else {
                 paragraphLength = "medium-length, 3 paragraphs"
             }
     
             const prompt = `
                 You are a reading synthesis engine. Your job is to generate a meaningful, 
                 synthesis of a book based exclusively on the notes a user has taken while 
                 reading it.
     
                 The length of the synthesis is ${paragraphLength}. Don't make each paragraph
                 too long.
     
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
     
             const cards = req.body.cards.map(card => {
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
            const title = req.body.title
            const author = req.body.author

            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}+inauthor:${author}&key=${booksApi}`)
            const data = await response.json()

            res.status(200).json({ image: data.items[0].volumeInfo.imageLinks.thumbnail, pages: data.items[0].volumeInfo.pageCount })
         }

    } else {
        res.status(405).send('Method not allowed')
    }
}