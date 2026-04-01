import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, updateDoc, getDoc, query, where, serverTimestamp } from "firebase/firestore"
import { firebaseConfig } from "./keys";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)

// AUTH

async function getCurrentUser() {
    await auth.authStateReady()
    const user = auth.currentUser
    if (user) {
        return user
    } else {
        return null
    }
}

export function monitorAuthState(callback) {
    onAuthStateChanged(auth, callback)
}

export async function createNewUser(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    updateProfile(userCredential.user, {
        displayName: name
    })
}

export async function signInUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log(userCredential)
    return userCredential
}

export async function signOutUser() {
    try {
        await signOut(auth)
    } catch(error) {
        console.log(error)
        return error
    }
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

export async function addBook(bookTitle, bookAuthor) {
    const currentUser = await getCurrentUser()
    if (!bookTitle || bookTitle.trim() === "" || !bookAuthor || bookAuthor.trim() === "") {
        throw new Error("Must include Title and Author")
    }
    const docRef = await addDoc(collection(db, "books"), {
        userId: currentUser.uid,
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
    const currentUser = await getCurrentUser()
    const q = query(
        collection(db, "books"),
        where("userId", "==", currentUser.uid)
    )
    const querySnapshot = await getDocs(q)
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
    const currentUser = await getCurrentUser()
    const docRef = await addDoc(collection(db, "notes"), {
        userId: currentUser.uid,
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
    const currentUser = await getCurrentUser()
    const q = query(
        collection(db, "notes"),
        where("userId", "==", currentUser.uid)
    )
    const querySnapshot = await getDocs(q)
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
    const currentUser = await getCurrentUser()
    const docRef = await addDoc(collection(db, "buckets"), {
        userId: currentUser.uid,
        name: bucket
    })
}

export async function getBuckets() {
    const currentUser = await getCurrentUser()
    const q = query(
        collection(db, "buckets"),
        where("userId", "==", currentUser.uid)
    )
    const querySnapshot = await getDocs(q)
    const dataArr = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    return dataArr
}

export async function deleteBucket(id, bucket) {
    await deleteDoc(doc(db, "buckets", id))
    const q = query(collection(db, "cards"), where("buckets", "array-contains", bucket))
    const querySnapshot = await getDocs(q)
    const dataArr = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
    dataArr.map(async (card) => {
        const updatedBuckets = card.buckets.filter(item => item !== bucket)
        await updateDoc(doc(db, "cards", card.id), {
            buckets: updatedBuckets
        })
    })
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
    const currentUser = await getCurrentUser()
    const q = query(
        collection(db, "cards"),
        where("userId", "==", currentUser.uid)
    )
    const querySnapshot = await getDocs(q)
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
