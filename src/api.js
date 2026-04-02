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

// export function monitorAuthState(callback) {
//     onAuthStateChanged(auth, callback)
// }

// export async function createNewUser(name, email, password) {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password)

//     updateProfile(userCredential.user, {
//         displayName: name
//     })
// }

export async function createNewUser(name, email, password) {
    console.log("function working")
    const { data, signUpError } = await supabase.auth
        .signUp({
            email,
            password
        })
    console.log(signUpError)
    const { insertError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, name, email })
    console.log(insertError)
}

// export async function signInUser(email, password) {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password)
//     console.log(userCredential)
//     return userCredential
// }

export async function signInUser(email, password) {
    const { data, error } = await supabase.auth
        .signInWithPassword({
            email,
            password
        })
}

// export async function signOutUser() {
//     try {
//         await signOut(auth)
//     } catch(error) {
//         console.log(error)
//         return error
//     }
// }

export async function signOutUser() {
    const { error } = await supabase.auth.signOut()
    console.log(error)
}

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email)
        console.log("email sent")
    } catch(error) {
        console.log(error)
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
        console.log("user profile updated")
    } catch(error) {
        console.log(error)
        return error
    }
}


// BOOKS

// export async function addBook(bookTitle, bookAuthor) {
//     const currentUser = await getCurrentUser()
//     if (!bookTitle || bookTitle.trim() === "" || !bookAuthor || bookAuthor.trim() === "") {
//         throw new Error("Must include Title and Author")
//     }
//     const docRef = await addDoc(collection(db, "books"), {
//         userId: currentUser.uid,
//         title: bookTitle,
//         author: bookAuthor,
//         status: "Reading"
//     })
// }

export async function addBook(bookTitle, bookAuthor) {
    const currentUser = await getCurrentUser()
    const { error } = await supabase
        .from('books')
        .insert({
            title: bookTitle,
            author: bookAuthor,
            user_id: currentUser.data.user.id
        })
    console.log(error)
}

// export async function updateBookStatus(id, currentStatus) {
//     const newStatus = currentStatus === "Reading" ? "Finished" : "Reading" 
//     const docRef = await updateDoc(doc(db, "books", id), {
//         status: newStatus
//     })
// }

export async function updateBookStatus(id, currentStatus) {
    const newStatus = currentStatus === "Reading" ? "Finished" : "Reading" 
    const { error } = await supabase
        .from('books')
        .update({ status: newStatus })
        .eq('id', id)
}

// export async function deleteBook(id) {
//     await deleteDoc(doc(db, "books", id))
// }

export async function deleteBook(id) {
    const response = await supabase
        .from('books')
        .delete()
        .eq('id', id)
}

// export async function getBooks() {
//     const currentUser = await getCurrentUser()
//     const q = query(
//         collection(db, "books"),
//         where("userId", "==", currentUser.uid)
//     )
//     const querySnapshot = await getDocs(q)
//     const dataArr = querySnapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }))
//     return dataArr
// }

export async function getBooks() {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('books')
        .select()
        .eq('user_id', currentUser.data.user.id)
    console.log(error)
    return data
}

// export async function getBook(id) {
//     const docRef = doc(db, "books", id)
//     const bookSnap = await getDoc(docRef)
//     if (!bookSnap.exists()) {
//         return null
//     }
//     return {
//         ...bookSnap.data(),
//         id: bookSnap.id
//     }
// }

export async function getBook(id) {
    const { data, error } = await supabase
        .from('books')
        .select()
        .eq('id', id)
    console.log(data)
    console.log(error)
    return data
}

// NOTES

// export async function addNote(note, book) {
//     const currentUser = await getCurrentUser()
//     const docRef = await addDoc(collection(db, "notes"), {
//         userId: currentUser.uid,
//         noteTitle: note.title,
//         bookId: book.id,
//         bookTitle: book.title,
//         page: note.page,
//         context: note.context,
//         capture: note.capture,
//         spark: note.spark,
//         status: "Inbox",
//         createdAt: serverTimestamp()
//     })
// }

export async function addNote(note, book) {
    const currentUser = await getCurrentUser()
    console.log(book)
    console.log(book[0].id)
    const { error } = await supabase
        .from('notes')
        .insert({
            note_title: note.title,
            book_id: book[0].id,
            page: note.page,
            context: note.context,
            capture: note.capture,
            spark: note.spark,
            user_id: currentUser.data.user.id
        })
    console.log(error)
}

// export async function deleteNote(id) {
//     await deleteDoc(doc(db, "notes", id))
// }

export async function deleteNote(id) {
    const response = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
}

// export async function getAllNotes() {
//     const currentUser = await getCurrentUser()
//     const q = query(
//         collection(db, "notes"),
//         where("userId", "==", currentUser.uid)
//     )
//     const querySnapshot = await getDocs(q)
//     const dataArr = querySnapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }))
//     return dataArr
// }

export async function getAllNotes() {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('user_id', currentUser.data.user.id)
    return data
}

// export async function getNote(id) {
//     const docRef = doc(db, "notes", id)
//     const noteSnap = await getDoc(docRef)
//     if (!noteSnap.exists()) {
//         return null
//     }
//     return {
//         ...noteSnap.data(),
//         id: noteSnap.id
//     }
// }

export async function getNote(id) {
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('id', id)
    return data
}

// export async function getNotes(id) {
//     const q = query(
//         collection(db, "notes"),
//         where("bookId", "==", id),
//         where("status", "==", "Inbox"))
//     const querySnapshot = await getDocs(q)
//     const dataArr = querySnapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }))
//     return dataArr
// }

export async function getNotes(id) {
    const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('book_id', id)
        .eq('status', 'inbox')
    return data
}

// export async function updateNote(id, noteTitle, page, context, capture, spark) {
//     const docRef = await updateDoc(doc(db, "notes", id), {
//         noteTitle,
//         page,
//         context,
//         capture,
//         spark
//     })
// }

export async function updateNote(id, noteTitle, page, context, capture, spark) {
    const { error } = await supabase
        .from('notes')
        .update({
            note_title: noteTitle,
            page,
            context,
            capture,
            spark
        })
        .eq('id', id)
}

// export async function updateNoteStatus(id) {
//     const docRef = await updateDoc(doc(db, "notes", id), {
//         status: "Processed"
//     })
// }

export async function updateNoteStatus(id) {
    const { error } = await supabase
        .from('notes')
        .update({ status: 'processed' })
        .eq('id', id)
}

// BUCKETS

// export async function addBucket(bucket) {
//     const currentUser = await getCurrentUser()
//     const docRef = await addDoc(collection(db, "buckets"), {
//         userId: currentUser.uid,
//         name: bucket
//     })
// }

export async function addBucket(bucket) {
    const currentUser = await getCurrentUser()
    const { error } = await supabase
        .from('buckets')
        .insert({
            name: bucket,
            user_id: currentUser.data.user.id
        })
}

// export async function getBuckets() {
//     const currentUser = await getCurrentUser()
//     const q = query(
//         collection(db, "buckets"),
//         where("userId", "==", currentUser.uid)
//     )
//     const querySnapshot = await getDocs(q)
//     const dataArr = querySnapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }))
//     return dataArr
// }

export async function getBuckets() {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('buckets')
        .select()
        .eq('user_id', currentUser.data.user.id)
    return data
}

// export async function deleteBucket(id, bucket) {
//     await deleteDoc(doc(db, "buckets", id))
//     const q = query(collection(db, "cards"), where("buckets", "array-contains", bucket))
//     const querySnapshot = await getDocs(q)
//     const dataArr = querySnapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }))
//     dataArr.map(async (card) => {
//         const updatedBuckets = card.buckets.filter(item => item !== bucket)
//         await updateDoc(doc(db, "cards", card.id), {
//             buckets: updatedBuckets
//         })
//     })
// }

export async function deleteBucket(id, bucket) {
    const { error } = await supabase
        .from('buckets')
        .delete()
        .eq('id', id)
}

// CARDS

// export async function addCard(note, response1, response2, buckets) {
//     const docRef = await addDoc(collection(db, "cards"), {
//         ...note,
//         noteId: note.id,
//         status: "Promoted",
//         question1: "Why did this stop you?",
//         response1,
//         question2: "What does this connect to in your life or other reading?",
//         response2,
//         buckets,
//         createdAt: serverTimestamp()
//     })
// }

export async function addCard(note, response1, response2) {
    const { error } = await supabase
        .from('cards')
        .insert({
            ...note,
            question1: "Why did this stop you?",
            response1,
            question2: "What does this connect to in your life or other reading?",
            response2
        })
}

// export async function getCards() {
//     const currentUser = await getCurrentUser()
//     const q = query(
//         collection(db, "cards"),
//         where("userId", "==", currentUser.uid)
//     )
//     const querySnapshot = await getDocs(q)
//     const dataArr = querySnapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }))
//     return dataArr
// }

export async function getCards() {
    const currentUser = await getCurrentUser()
    const { data, error } = await supabase
        .from('cards')
        .select()
        .eq('user_id', currentUser.data.user.id)
    return data
}

// export async function getCard(id) {
//     const docRef = doc(db, "cards", id)
//     const cardSnap = await getDoc(docRef)
//     if (!cardSnap.exists()) {
//         return null
//     }
//     return {
//         ...cardSnap.data(),
//         id: cardSnap.id
//     }
// }

export async function getCard(id) {
    const { data, error } = await supabase
        .from('cards')
        .select()
        .eq('id', id)
    return data
}

// export async function updateCard(id,
//       noteTitle,
//       page,
//       context,
//       capture,
//       spark,
//       response1,
//       response2,
//       selectedBuckets,) {
//     const docRef = await updateDoc(doc(db, "cards", id), {
//         noteTitle,
//         page,
//         context,
//         capture,
//         spark,
//         response1,
//         response2,
//         buckets: selectedBuckets
//     })
// }

export async function updateCard(id, noteTitle, page, context, capture, spark, response1, response2) {
    const { error } = await supabase
        .from('cards')
        .update({
            note_title: noteTitle,
            page,
            context,
            capture,
            spark,
            response1,
            response2
        })
}

// export async function deleteCard(id) {
//     await deleteDoc(doc(db, "cards", id))
// }

export async function deleteCard(id) {
    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)
}
