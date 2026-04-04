import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, updateDoc, getDoc, query, where, serverTimestamp } from "firebase/firestore"
import { firebaseConfig } from "./keys";

import supabase from "./supabaseClient.js"

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)

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
    const { data, signUpError } = await supabase.auth
        .signUp({
            email,
            password
        })
    const { insertError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, name, email })
}

export async function signInUser(email, password) {
    const { data, error } = await supabase.auth
        .signInWithPassword({
            email,
            password
        })
}

export async function signOutUser() {
    const { error } = await supabase.auth.signOut()
}

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email)
    } catch(error) {
        return error
    }
}

export async function updateUserProfile(newName, newEmail) {
    const currentUser = await getCurrentUser()
    try {
        await updateProfile(currentUser, {
            displayName: newName,
            email: newEmail
        })
    } catch(error) {
        return error
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
    const { error } = await supabase
        .from('books')
        .update({ status: newStatus })
        .eq('id', id)
}

export async function deleteBook(id) {
    console.log(id)
    try {
        const response = await supabase
            .from('books')
            .delete()
            .eq('id', id)
        console.log(response)
    } catch (error) {
        console.log(error)
    }
}

export async function getBooks() {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('books')
        .select()
        .eq('user_id', currentUser.data.user.id)
    return data
}

export async function getBook(id) {
    const { data, error } = await supabase
        .from('books')
        .select()
        .eq('id', id)
    return data[0]
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
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('user_id', currentUser.data.user.id)
    return data
}

export async function getNote(id) {
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('id', id)
    return data[0]
}

export async function getNotes(id) {
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('book_id', id)
        .eq('status', 'inbox')
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

export async function updateNoteStatus(id) {
    const { error } = await supabase
        .from('notes')
        .update({ status: 'processed' })
        .eq('id', id)
}

// BUCKETS

export async function addBucket(cardId, bucketName) {
    const currentUser = await getCurrentUser()
    const { data, bucketsError } = await supabase
        .from('buckets')
        .insert({
            name: bucketName,
            user_id: currentUser.data.user.id
        })
        .select()
    const { cardBucketsError } = await supabase
        .from("card_buckets")
        .insert({
            card_id: cardId,
            bucket_id: data[0].id
        })
}

export async function getBuckets() {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('buckets')
        .select()
        .eq('user_id', currentUser.data.user.id)
    const buckets = data.map(bucket => bucket.name)
    return buckets
}

export async function getCardBuckets(id) {
    const { data, error } = await supabase
        .from('card_buckets')
        .select()
        .eq('card_id', id)
    const buckets = data.map(async (bucket) => {
        const { data, error } = await supabase
            .from('buckets')
            .select()
            .eq('id', bucket.bucket_id)
        return data[0].name
    })
    const bucketsArr = await Promise.all(buckets)
    return bucketsArr.flat()
}

export async function deleteBucket(id) {
    const { error } = await supabase
        .from('buckets')
        .delete()
        .eq('id', id)
}

export async function deleteCardBucket(bucket) {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('buckets')
        .select()
        .eq('name', bucket)
        .eq('user_id', currentUser.data.user.id)
    const buckets = data.map(async (bucket) => {
        const { data, error } = await supabase
            .from('card_buckets')
            .delete()
            .eq('bucket_id', bucket.id)
        return data
    })
    await Promise.all(buckets)
}

// CARDS

export async function addCard(note, response1, response2) {
    const { error } = await supabase
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
}

export async function getCards() {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('cards')
        .select()
        .eq('user_id', currentUser.data.user.id)
    return data
}

export async function getCard(id) {
    const { data, error } = await supabase
        .from('cards')
        .select()
        .eq('id', id)
    return data
}

export async function updateCard(id, card_title, page, context, capture, spark, response1, response2) {
    try {
        const { error } = await supabase
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
