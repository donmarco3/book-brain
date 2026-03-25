import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, updateDoc, getDoc, query, where, serverTimestamp } from "firebase/firestore"
import { firebaseConfig } from "./keys";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

// BOOKS

export async function addBook(bookTitle, bookAuthor) {
    if (!bookTitle || bookTitle.trim() === "" || !bookAuthor || bookAuthor.trim() === "") {
        throw new Error("Must include Title and Author")
    }
    const docRef = await addDoc(collection(db, "books"), {
        title: bookTitle,
        author: bookAuthor,
        status: "Reading"
    })
}

export async function updateBookStatus(id, currentStatus) {
    const newStatus = currentStatus === "Reading" ? "Finished" : "Reading" 
    const docRef = await updateDoc(doc(db, "books", id), {
        status: newStatus
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
    if (!bookSnap.exists()) {
        return null
    }
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
        status: "Inbox",
        createdAt: serverTimestamp()
    })
}

export async function deleteNote(id) {
    await deleteDoc(doc(db, "notes", id))
}

export async function getAllNotes() {
    const querySnapshot = await getDocs(collection(db, "notes"))
    const dataArr = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return dataArr
}

export async function getNote(id) {
    const docRef = doc(db, "notes", id)
    const noteSnap = await getDoc(docRef)
    if (!noteSnap.exists()) {
        return null
    }
    return {
        ...noteSnap.data(),
        id: noteSnap.id
    }
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

export async function updateNote(id, noteTitle, page, context, capture, spark) {
    const docRef = await updateDoc(doc(db, "notes", id), {
        noteTitle,
        page,
        context,
        capture,
        spark
    })
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

export async function deleteBucket(id) {
    await deleteDoc(doc(db, "buckets", id))
}

// CARDS

export async function addCard(note, response1, response2, buckets) {
    const docRef = await addDoc(collection(db, "cards"), {
        ...note,
        noteId: note.id,
        status: "Promoted",
        question1: "Why did this stop you?",
        response1,
        question2: "What does this connect to in your life or other reading?",
        response2,
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

export async function getCard(id) {
    const docRef = doc(db, "cards", id)
    const cardSnap = await getDoc(docRef)
    if (!cardSnap.exists()) {
        return null
    }
    return {
        ...cardSnap.data(),
        id: cardSnap.id
    }
}

export async function updateCard(id,
      noteTitle,
      page,
      context,
      capture,
      spark,
      response1,
      response2,
      selectedBuckets,) {
    const docRef = await updateDoc(doc(db, "cards", id), {
        noteTitle,
        page,
        context,
        capture,
        spark,
        response1,
        response2,
        buckets: selectedBuckets
    })
}

export async function deleteCard(id) {
    await deleteDoc(doc(db, "cards", id))
}