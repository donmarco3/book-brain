features:
ability to take photo of capture
change profile image
generate synthesis of cards using ai

bugs:
note stays on library page after deletion (need to re-render / revalidate)

wed 15 apr
distractions in our personal relationships

Query your cards — fetch all cards for that specific book from Supabase, filtered by book ID and user ID. That's your input data.

Create a Supabase Edge Function — this is your backend handler. It receives the book ID, fetches the cards, builds a prompt, calls the LLM API, and returns the synthesis text. API key stays here, off the client.

Build the prompt — inside the edge function, format the cards into something useful for the LLM. Something like: "Here are the notes a reader took from [book title] by [author]. Generate a one-paragraph synthesis of their key takeaways." Then list each card's quote and spark.

Add the button to the book page — on the expanded book page in React, add a "Generate Synthesis" button. Conditionally render it only if the book is finished and has at least a few cards.

Wire up the call — on button click, call the edge function with the book ID. Handle loading state while waiting for the response.

Display the result — render the returned synthesis text below the button. Optionally save it to Supabase so it doesn't need to be regenerated every time.

You'll need:

An OpenAI account with API access
An API key — goes in your Supabase Edge Function environment variables, never in your frontend code
When you get to the edge function, you'll use the openai npm package and call gpt-4o-mini — it's cheap, fast, and more than capable enough for this. No need for GPT-4 for a synthesis task.
