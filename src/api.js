import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, updateDoc, getDoc, query, where, serverTimestamp } from "firebase/firestore"
import { firebaseConfig } from "./keys";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

// BOOKS

export async function addBook(bookTitle, bookAuthor) {
    const docRef = await addDoc(collection(db, "books"), {
        title: bookTitle,
        author: bookAuthor,
        status: "Reading"
    })
}

export async function updateBookStatus(id) {
    const docRef = await updateDoc(doc(db, "books", id), {
        status: "Finished"
    })
}

export async function deleteBook(id) {
    await deleteDoc(doc(db, "books", id))
}

export async function getBooks() {
    const querySnapshot = await getDocs(collection(db, "books"))
    const dataArr = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return dataArr
}

export async function getBook(id) {
    const docRef = doc(db, "books", id)
    const bookSnap = await getDoc(docRef)
    return {
        ...bookSnap.data(),
        id: bookSnap.id
    }
}

// NOTES

export async function addNote(note, book) {
    const docRef = await addDoc(collection(db, "notes"), {
        noteTitle: note.title,
        bookId: book.id,
        bookTitle: book.title,
        page: note.page,
        context: note.context,
        capture: note.capture,
        spark: note.spark,
        status: "Inbox"
    })
}

export async function deleteNote(id) {
    await deleteDoc(doc(db, "notes", id))
}

export async function getNotes(id) {
    const q = query(
        collection(db, "notes"),
        where("bookId", "==", id),
        where("status", "==", "Inbox"))
    const querySnapshot = await getDocs(q)
    const dataArr = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return dataArr
}

export async function updateNoteStatus(id) {
    const docRef = await updateDoc(doc(db, "notes", id), {
        status: "Processed"
    })
}

// BUCKETS

export async function addBucket(bucket) {
    const docRef = await addDoc(collection(db, "buckets"), {
        name: bucket
    })
}

export async function getBuckets() {
    const querySnapshot = await getDocs(collection(db, "buckets"))
    const dataArr = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return dataArr
}

// CARDS

export async function addCard(note, response1, response2, buckets) {
    const docRef = await addDoc(collection(db, "cards"), {
        ...note,
        noteId: note.id,
        status: "Promoted",
        question1: response1,
        question2: response2,
        buckets,
        createdAt: serverTimestamp()
    })
}

export async function getCards() {
    const querySnapshot = await getDocs(collection(db, "cards"))
    const dataArr = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return dataArr
}