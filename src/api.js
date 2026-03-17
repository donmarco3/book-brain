import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, updateDoc, getDoc, query, where, serverTimestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDU_N-NF6XmwojAvq6xQuk8_0rOEJi9t9I",
  authDomain: "book-brain-ed740.firebaseapp.com",
  projectId: "book-brain-ed740",
  storageBucket: "book-brain-ed740.firebasestorage.app",
  messagingSenderId: "283645225322",
  appId: "1:283645225322:web:ac20b04396d3695c375d13"
};

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

export async function addNote(note, bookId) {
    const docRef = await addDoc(collection(db, "notes"), {
        title: note.title,
        bookId,
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

export async function addBuckets(bucketName) {
    const docRef = await addDoc(collection(db, "buckets"), {
        name: bucketName
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
        question1: response1,
        question2: response2,
        buckets,
        createdAt: serverTimestamp()
    })
}