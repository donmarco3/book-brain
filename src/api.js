import supabase from "./supabaseClient.js"

// AUTH

export async function getCurrentUser() {
    const user = await supabase.auth.getUser()
    if (user.data.user) {
        return user
    } else {
        return null
    }
}

export async function createNewUser(name, email, password) {
    if (password.length < 7) {
        throw new Error("Password must be longer than 6 characters")
    }
    try {
        const { data, error: signUpError } = await supabase.auth
            .signUp({
                email,
                password
            })
        console.log(data)
        console.log(signUpError)
        const { insertError } = await supabase
            .from('profiles')
            .insert({ id: data.user.id, name, email })
        console.log(insertError)
        return { data, signUpError, insertError }
    } catch(error) {
        console.log(error)
        return error
    }
}

export async function signInUser(email, password) {
    try {
        const { data, error } = await supabase.auth
            .signInWithPassword({
                email,
                password
            })
        console.log(data)
        console.log(error)
        return { data, error }
    } catch(error) {
        console.log(error)
    }
}

export async function signOutUser() {
    const { error } = await supabase.auth.signOut()
}

export async function sendResetPasswordEmail(email) {
    try {
        const { data, error } = await supabase.auth
            .resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:5173/update-password'
            })
        console.log(data)
        console.log(error)
        return { data, error }
    } catch(error) {
        console.log(error)
    }
}

export async function updateUserPassword(newPassword) {
    if (newPassword.length < 7) {
        throw new Error("Password must be longer than 6 characters")
    }
    try {
        const { data, error } = await supabase.auth
            .updateUser({
                password: newPassword
            })
        console.log(data)
        console.log(error)
    } catch(error) {
        console.log(error)
    }
}

export async function getUser() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }
    const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', currentUser.data.user.id)
    console.log(data)
    console.log(error)
    return data[0]
}

export async function updateUserProfile(newName, newEmail) {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }
    try {
        const { data, error: authError } = await supabase.auth
            .updateUser({
                name: newName,
                email: newEmail
            })
        console.log(data)
        console.log(authError)
        const { tableError } = await supabase
            .from('profiles')
            .update({
                name: newName,
                email: newEmail
            })
            .eq('id', currentUser.data.user.id)
        console.log(tableError)
    } catch(error) {
        console.log(error)
    }
}


// BOOKS

export async function addBook(bookTitle, bookAuthor) {
    const currentUser = await getCurrentUser()
    const { error } = await supabase
        .from('books')
        .insert({
            title: bookTitle,
            author: bookAuthor,
            user_id: currentUser.data.user.id
        })
}

export async function updateBookStatus(id, currentStatus) {
    const newStatus = currentStatus === "reading" ? "finished" : "reading" 
    try {
        await supabase
            .from('books')
            .update({ status: newStatus })
            .eq('id', id)
    } catch(error) {
        console.log(error)
        return error
    }
}

export async function deleteBook(id) {
    try {
        const response = await supabase
            .from('books')
            .delete()
            .eq('id', id)
    } catch (error) {
        console.log(error)
    }
}

export async function getBooks() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }
    try {
        const { data, error } = await supabase
            .from('books')
            .select(`
                *,
                notes ( * ),
                cards ( * )
            `)
            .eq('user_id', currentUser.data.user.id)
            .order('created_at', { ascending: false })
        // console.log(data)
        // console.log(error)
        return data
    } catch(error) {
        console.log(error)
    }
}

export async function getBook(id) {
    const { data, error } = await supabase
        .from('books')
        .select(`
            *,
            notes ( * ),
            cards ( * )
        `)
        .eq('id', id)
    // console.log(data)
    // console.log(error)
    return data[0]
}

export async function updateBook(id, title, author) {
    const { error } = await supabase
        .from('books')
        .update({
            title,
            author
        })
        .eq('id', id)
    console.log(error)
}

// NOTES

export async function addNote(note, book) {
    const currentUser = await getCurrentUser()
    const { error } = await supabase
        .from('notes')
        .insert({
            note_title: note.title,
            book_id: book.id,
            page: note.page,
            context: note.context,
            capture: note.capture,
            spark: note.spark,
            user_id: currentUser.data.user.id
        })
}

export async function deleteNote(id) {
    const response = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
}

export async function getAllNotes() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('user_id', currentUser.data.user.id)
    // console.log(data)
    // console.log(error)
    return data
}

export async function getNote(id) {
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('id', id)
    console.log(data)
    console.log(error)
    return data[0]
}

export async function getNotes(id) {
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('book_id', id)
        .eq('status', 'inbox')
    // console.log(data)
    // console.log(error)
    return data
}

export async function updateNote(id, note_title, page, context, capture, spark) {
    const { error } = await supabase
        .from('notes')
        .update({
            note_title,
            page,
            context,
            capture,
            spark
        })
        .eq('id', id)
}

export async function updateNoteStatus(id, newStatus) {
    const { error } = await supabase
        .from('notes')
        .update({ status: newStatus })
        .eq('id', id)
}

// BUCKETS

export async function getBuckets() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }
    try {
        const { data, error } = await supabase
            .from('buckets')
            .select()
            .eq('user_id', currentUser.data.user.id)
        // console.log(data)
        // console.log(error)
        const buckets = data.map(bucket => bucket.name)
        return buckets
    } catch(error) {
        console.log(error)
    }
}

export async function getCardBuckets(id) {
    try {
        const { data, error } = await supabase
            .from('card_buckets')
            .select()
            .eq('card_id', id)
        // console.log(data)
        // console.log(error)
        const buckets = data.map(async (bucket) => {
            const { data, error } = await supabase
                .from('buckets')
                .select()
                .eq('id', bucket.bucket_id)
            // console.log(data)
            // console.log(error)
            return data[0].name
        })
        const bucketsArr = await Promise.all(buckets)
        return bucketsArr.flat()
    } catch(error) {
        console.log(error)
    }
}

export async function deleteBucket(bucket) {
    const currentUser = await getCurrentUser()
    const response = await supabase
        .from('buckets')
        .delete()
        .eq('user_id', currentUser.data.user.id)
        .eq('name', bucket)
}

export async function deleteCardBucket(bucket) {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('buckets')
        .select()
        .eq('name', bucket)
        .eq('user_id', currentUser.data.user.id)
    console.log(data)
    console.log(error)

    await Promise.all(
        data.map(async (bucket) => {
            const { data, error } = await supabase
                .from('card_buckets')
                .delete()
                .eq('bucket_id', bucket.id)
            console.log(data)
            console.log(error)
            return data
        })  
    )
}

// CARDS

export async function addCard(note, response1, response2, buckets) {
    try {
        const { data: cardData, error: insertCardError } = await supabase
            .from('cards')
            .insert({
                card_title: note.note_title,
                book_id: note.book_id,
                page: note.page,
                context: note.context,
                capture: note.capture,
                spark: note.spark,
                question1: "Why did this stop you?",
                response1,
                question2: "What does this connect to in your life or other reading?",
                response2,
                user_id: note.user_id
            })
            .select()
        // console.log(cardData)
        // console.log(insertCardError)

        await Promise.all(
            buckets.map(async (bucket) => {
                const { data: bucketData, error: upsertError } = await supabase
                    .from('buckets')
                    .upsert({
                        name: bucket,
                        user_id: note.user_id
                    }, {
                        onConflict: 'name,user_id'
                    })
                    .select()
                // console.log(bucketData)
                // console.log(upsertError)

                const { data: cardBucketData, error: cardBucketError } = await supabase
                    .from('card_buckets')
                    .insert({
                        card_id: cardData[0].id,
                        bucket_id: bucketData[0].id
                    })
                    .select()
                // console.log(cardBucketData)
                // console.log(cardBucketError)
            })
        )

    } catch(error) {
        console.log(error)
    }
}

export async function getCards() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }
    try {
        const { data, error } = await supabase
            .from('cards')
            .select(`
                *,
                buckets ( * )
            `)
            .eq('user_id', currentUser.data.user.id)
        // console.log(data)
        // console.log(error)
        return data
    } catch(error) {
        console.log(error)
    }
}

export async function getBookCards(id) {
    try {
        const { data, error } = await supabase
            .from('cards')
            .select()
            .eq('book_id', id)
        // console.log(data)
        // console.log(error)
        return data
    } catch(error) {
        console.log(error)
    }
}

export async function getCard(id) {
    const { data, error } = await supabase
        .from('cards')
        .select()
        .eq('id', id)
    // console.log(data)
    // console.log(error)
    return data
}

export async function updateCard(id, card_title, page, context, capture, spark, response1, response2, buckets) {
    try {
        const { data: cardData, error } = await supabase
            .from('cards')
            .update({
                card_title,
                page,
                context,
                capture,
                spark,
                response1,
                response2
            })
            .eq('id', id)
            .select()
        console.log(cardData)
        console.log(error)

        await Promise.all(
            buckets.map(async (bucket) => {
                const { data: bucketData, error: upsertError } = await supabase
                    .from('buckets')
                    .upsert({
                        name: bucket,
                        user_id: cardData[0].user_id
                    }, {
                        onConflict: 'name,user_id'
                    })
                    .select()
                console.log(bucketData)
                console.log(upsertError)

                const { data: cardBucketData, error: cardBucketError } = await supabase
                    .from('card_buckets')
                    .insert({
                        card_id: cardData[0].id,
                        bucket_id: bucketData[0].id
                    })
                    .select()
                console.log(cardBucketData)
                console.log(cardBucketError)
            })
        )
    } catch(error) {
        console.log(error)
    }
}

export async function deleteCard(id) {
    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)
}


// VERCEL

export async function vercelFunction(cards) {
    console.log(cards)
    try {
        const response = await fetch('http://localhost:3000/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(cards)
        })
        const data = await response.text()
        console.log(data)
    } catch(error) {
        console.log(error)
    }
}