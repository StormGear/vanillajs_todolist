import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import date from 'date-and-time';


const firebaseConfig = {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    authDomain: "vanilla-js-todolist.firebaseapp.com",
    projectId: "vanilla-js-todolist",
    storageBucket: "vanilla-js-todolist.appspot.com",
    messagingSenderId: "1092349539461",
    appId: "1:1092349539461:web:b03180268304b78290a5ec"
};

let textFromInputField;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth();

function createUser(email, password) {
    if (validateEmail(signupEmail.value) && validatePassword(signupPassword.value)) {
    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    console.log(`User created: User ${userCredential.user}`);
  })
  .catch((error) => {
    console.log(`Error creating user with code ${error.code} and message ${error.message}`);
  });
} else {
    console.log('Enter valid email or password.')
}
}


listenToTodosChanges()

// Add click event listened to get text from the input field
document.getElementById("add-task-button").addEventListener("click", addTodoToFirestore);
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");

// Add blur event listener to validate email and password
loginEmail.addEventListener('blur', (e) => validateLoginEmailAndPassword(e));
loginPassword.addEventListener('blur', (e) => validateLoginEmailAndPassword(e));
// Add click event listener to validate email and password
document.getElementById("login-button").addEventListener("blur", (e) => validateLoginEmailAndPassword(e));

// Add click event listener to validate email and password
document.getElementById("signup-button").addEventListener("click", (e) => { 
    validateSignupEmailAndPassword(e);
    createUser(signupEmail.value, signupPassword.value);
});
// Add blur event listener to validate email and password
signupEmail.addEventListener('blur', (e) => validateSignupEmailAndPassword(e));
signupPassword.addEventListener('blur', (e) => validateSignupEmailAndPassword(e));

function validateSignupEmailAndPassword(event) {
    event.preventDefault();

    if (validateEmail(signupEmail.value)) {
        console.log('Email is valid');
        signupEmail.nextElementSibling.style.display = "block";
        signupEmail.nextElementSibling.nextElementSibling.style.display = "none";
    } else {
        console.log('Email is invalid');
        signupEmail.nextElementSibling.style.display = "none";
        signupEmail.nextElementSibling.nextElementSibling.style.display = "block";
    }
    if (validatePassword(signupPassword.value)) {
        console.log('Password is valid');
        signupPassword.nextElementSibling.style.display = "block";
        signupPassword.nextElementSibling.nextElementSibling.style.display = "none";
    } else {
        console.log('Password is invalid');
        signupPassword.nextElementSibling.style.display = "none";
        signupPassword.nextElementSibling.nextElementSibling.style.display = "block";
    }

}

function validateLoginEmailAndPassword(event) {
    event.preventDefault();
    // const email = document.getElementById("login-email");
    // const password = document.getElementById("login-password");
    if (validateEmail(loginEmail.value)) {
        console.log('Email is valid');
        loginEmail.nextElementSibling.style.display = "block";
        loginEmail.nextElementSibling.nextElementSibling.style.display = "none";
    } else {
        console.log('Email is invalid');
        loginEmail.nextElementSibling.style.display = "none";
        loginEmail.nextElementSibling.nextElementSibling.style.display = "block";
    }
    if (validatePassword(loginPassword.value)) {
        console.log('Password is valid');
        loginPassword.nextElementSibling.style.display = "block";
        loginPassword.nextElementSibling.nextElementSibling.style.display = "none";
    } else {
        console.log('Password is invalid');
        loginPassword.nextElementSibling.style.display = "none";
        loginPassword.nextElementSibling.nextElementSibling.style.display = "block";
    }
}




function renderTodoList(data, id) {
    const todoList = document.querySelector(".list-group");
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.id = id;
    const now = new Date();
    const createdAtDate = data.createdAt.toDate(); 
    li.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
        <span>${data.title}</span>
        <span>
            <i class="fa-solid fa-pen-to-square text-primary" data-bs-toggle="modal" data-bs-target="#edit-task-modal"></i>
            &nbsp;
            <i class="fa-solid fa-trash text-danger" ></i>
        </span>
    </div>
    <div class="d-flex justify-content-between align-items-center ">
        <span>Added ${date.format(createdAtDate, 'ddd, MMM DD YYYY')} ${date.format(createdAtDate, 'hh:mm A')}</span>
    </div>
    `;
    todoList.appendChild(li);
    const deleteButton = li.children[0].children[1].children[1];
    const editButton = li.children[0].children[1].children[0];
    deleteButton.addEventListener("click", (e) => deleteTodo(e));
    editButton.addEventListener("click", (e) => editTodoModal(e));
}

function deleteTodo(e) {
    e.preventDefault();
    console.log(e.target.parentElement.parentElement.parentElement.id);
    deleteDoc(doc(db, "todos", e.target.parentElement.parentElement.parentElement.id)).then(() => console.log('Document deleted')).catch(e => console.error('Error deleting document', e));
}

function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}



function validatePassword(password) {
    return password.length > 6;
}

function editTodoModal(e) { 
    const element = e.target.parentElement.parentElement.parentElement;
    console.log(element.id);
    const editTask = document.getElementById("edit-task");
    editTask.value = element.children[0].children[0].innerText;
    editTask.addEventListener("input", (e) => console.log(e.target.value));
    document.getElementById("save-changes").addEventListener("click", (e) => 
        {
            console.log(`This element has been updated ${element.id}`);
            const todosRef = doc(db, "todos", element.id);
            updateDoc(todosRef, {
            title: editTask.value,
            updatedAt: new Date()
            }).then(() => {
                console.log("Document successfully updated!");
                element.children[0].children[0].innerText = editTask.value;
            }).catch((error) => {
                console.error("Error updating document: ", error);
        });
    });
}




// Add a new todo to the Firestore database
function addTodoToFirestore() { 
    textFromInputField = document.getElementById("add-task").value;;
    const todos = collection(db, "todos");
    addDoc(todos, {
        title: textFromInputField,
        createdAt: new Date(),
        updatedAt: new Date()
    }).then(() => {
        console.log("Document successfully written!");
        document.getElementById("add-task").value = "";
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}


function listenToTodosChanges() {
    try {
        const todosRef = collection(db, "todos");
        const q = query(todosRef, orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    renderTodoList(change.doc.data(), change.doc.id);
                }
                if (change.type === "modified") {
                    console.log(`${change.doc.data()} was modified` );
                }
                if (change.type === "removed") {
                    console.log(`${change.doc.data()} was removed`);
                    const li = document.getElementById(change.doc.id);
                    if (li) {
                        li.remove();
                    } else {
                        console.log('Element not found');
                    }
                }
            })},
            (error) => {
                console.log('Error retrieving documents', error);
            }
        );
    } catch (e) { 
        console.error("Error listening to changes: ", e);
    }
}



