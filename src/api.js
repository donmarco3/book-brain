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

export async function getAllBooks() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }

    try {
        const { data, error } = await supabase
            .from('books')
            .select(`
                *,
                notes ( * )
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

export async function getBooks(page, sort) {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }

    const pageSize = 5
    const startRange = (page - 1) * pageSize
    const endRange = startRange + pageSize - 1
    try {
        const { data, error } = await supabase
            .from('books')
            .select(`
                *,
                notes ( * )
            `)
            .range(startRange, endRange)
            .order('created_at', { ascending: sort === "oldest" ? true : false })
            .eq('user_id', currentUser.data.user.id)
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
            syntheses ( * )
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

export async function addNote(note, book, buckets) {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }

    try {
        const { data: noteData, error } = await supabase
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
            .select()
            // console.log(noteData)
            // console.log(error)

        await Promise.all(
            buckets.map(async (bucket) => {
                const { data: bucketData, error: upsertError } = await supabase
                    .from('buckets')
                    .upsert({
                        name: bucket,
                        user_id: noteData[0].user_id
                    }, {
                        onConflict: 'name,user_id'
                    })
                    .select()
                // console.log(bucketData)
                // console.log(upsertError)

                const { data: noteBucketData, error: noteBucketError } = await supabase
                    .from('note_buckets')
                    .insert({
                        note_id: noteData[0].id,
                        bucket_id: bucketData[0].id
                    })
                    .select()
                // console.log(noteBucketData)
                // console.log(noteBucketError)
            })
        )
    } catch(error) {
        console.log(error)
    }
}

export async function getNotes(page, sort, books, buckets) {
    const pageSize = 5
    const startRange = (page - 1) * pageSize
    const endRange = startRange + pageSize - 1

    let selectQuery
    if (buckets.length !== 0) {
        selectQuery = `*, buckets!inner(*)`
    } else {
        selectQuery = `*, buckets ( * )`
    }

    let query = supabase
        .from('notes')
        .select(selectQuery, { count: 'exact' })
        .range(startRange, endRange)
        .order('created_at', { ascending: sort === "oldest" ? true : false })

    if (books.length !== 0) {
        query = query.in('book_id', books)
    }

    if (buckets.length !== 0) {
        query = query.in('buckets.name', buckets)
    }

    try {
        const { data, error, count } = await query
        // console.log(data)
        // console.log(error)
        // console.log(count)
        return { data, count }
    } catch(error) {
        console.log(error)
    }
}

export async function getAllNotes() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return
    }
    
    try {
        const { data, error } = await supabase
        .from('notes')
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
    
    export async function getNote(id) {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select()
                .eq('id', id)
            // console.log(data)
            // console.log(error)
            return data[0]
        } catch(error) {
            console.log(error)
        }
    }
    
    export async function updateNote(id, note_title, page, context, capture, spark, buckets) {
        try {
            const { data: noteData, error } = await supabase
                .from('notes')
                .update({
                    note_title,
                    page,
                    context,
                    capture,
                    spark,
                })
                .eq('id', id)
                .select()
            // console.log(noteData)
            // console.log(error)

            await Promise.all(
                buckets.map(async (bucket) => {
                    const { data: bucketData, error: upsertError } = await supabase
                        .from('buckets')
                        .upsert({
                            name: bucket,
                            user_id: noteData[0].user_id
                        }, {
                            onConflict: 'name,user_id'
                        })
                        .select()
                    // console.log(bucketData)
                    // console.log(upsertError)

                    const { data: noteBucketData, error: noteBucketError } = await supabase
                        .from('note_buckets')
                        .insert({
                            note_id: noteData[0].id,
                            bucket_id: bucketData[0].id
                        })
                        .select()
                    // console.log(noteBucketData)
                    // console.log(noteBucketError)
                })
            )
        } catch(error) {
            console.log(error)
        }
    }
    
    export async function deleteNote(id) {
        const response = await supabase
            .from('notes')
            .delete()
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

export async function getNoteBuckets(id) {
    try {
        const { data, error } = await supabase
            .from('note_buckets')
            .select()
            .eq('note_id', id)
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

export async function deleteNoteBucket(bucket) {
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
                .from('note_buckets')
                .delete()
                .eq('bucket_id', bucket.id)
            console.log(data)
            console.log(error)
            return data
        })  
    )
}

// SYNTHESES

export async function addSynthesis(id, synthesis, type) {
    try {
        const { data, error } = await supabase
            .from('syntheses')
            .insert({
                book_id: id,
                synthesis,
                type
            })
            .select()
        // console.log(data)
        // console.log(error)
        if (error) {
            return error
        }
    } catch(error) {
        console.log(error)
    }
}

export async function getSyntheses(id, page, sort) {
    const pageSize = 5
    const startRange = (page - 1) * pageSize
    const endRange = startRange + pageSize - 1
    try {
        const { data, error } = await supabase
            .from('syntheses')
            .select()
            .range(startRange, endRange)
            .order('created_at', { ascending: sort === "oldest" ? true : false })
            .eq('book_id', id)
        // console.log(data)
        // console.log(error)
        return data
    } catch(error) {
        console.log(error)
    }
}

export async function getSynthesis(id) {
    try {
        const { data, error } = await supabase
            .from('syntheses')
            .select()
            .eq('id', id)
        // console.log(data)
        // console.log(error)
        return data
    } catch(error) {
        console.log(error)
    }
}


// VERCEL

export async function vercelFunction(cards, type) {
    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ cards, type })
        })
        const data = await response.text()
        console.log(data)
        return data
    } catch(error) {
        console.log(error)
    }
}