
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc, addDoc, collection, query, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";
import { db, auth } from './firebase.js'

// Initialize Firebase


const storage = getStorage();

const profile_img = document.getElementById("profile-img")


const uploadFiles = (file) => {
  console.log(file)
  return new Promise((resolve, reject) => {

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);


    uploadTask.on('state_changed',
      (snapshot) => {


        switch (snapshot.state) {
          case 'paused':
            hideloder()
            break;
          case 'running':
            showloder()
            break;
        }
      },
      (error) => {
        hideloder()
        reject(error)
      },
      async () => {
        hideloder()
        await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);


        });
      },

    );



  })




}

const fileInput = document.getElementById("file-inp");

fileInput && fileInput.addEventListener("change", () => {
  console.log(fileInput.files[0])
  profile_img.src = URL.createObjectURL(fileInput.files[0])
})
const updateProfile = document.getElementById("update-profile");

updateProfile && updateProfile.addEventListener("click", async () => {
  showloder()
  let uid = localStorage.getItem("uid")
  let fullName = document.getElementById("fullName")

  const imageUrl = await uploadFiles(fileInput.files[0])
  console.log(imageUrl)
  const firestoreRef = doc(db, "users", uid);
  await updateDoc(firestoreRef, {
    fullName: fullName.value,
    picture: imageUrl
  });
  hideloder()

  console.log("done")
})





let loader = document.getElementById("loader")

let showloder = () => {
  loader.style.display = "block";
}

let hideloder = () => {
  loader.style.display = "none";
}



let signupBtn = document.getElementById("signUp");
signupBtn && signupBtn.addEventListener("click", async () => {

  let email = document.getElementById("user-email")
  let password = document.getElementById("password")
  let user = document.getElementById("user-name")


  let userData = {
    user: user.value,
    email: email.value,
    password: password.value,

  }



  showloder() || createUserWithEmailAndPassword(auth, userData.email, userData.password)

    .then(async (userCredential) => {

      const user = userCredential.user;

      try {
        await setDoc(doc(db, "users", user.uid), {
          ...userData,
          uid: user.uid,



        });


        location.href = "login.html"
        console.log("added")
      } catch (e) {
        console.error("Error adding document: ", e);
        sweetAlert("Oops...", error.message, "error");
      }
      hideloder()
    })
    .catch((error) => {
      hideloder()
      const errorMessage = error.message;
      sweetAlert("Oops...", error.message, "error");
    })

})


let loginBtn = document.getElementById("loginBtn")
loginBtn && loginBtn.addEventListener("click", () => {
  let email = document.getElementById("user-email")
  let password = document.getElementById("password")


  showloder() || signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {

      const user = userCredential.user;

      try {
        location.href = "profile.html"
        localStorage.setItem("uid", user.uid)
      } catch (err) {
        console.log(err)

      }

      // getUser(user.uid)
      hideloder()


    })
    .catch((error) => {
      hideloder()
      console.log("error.message", error.message)
      sweetAlert("Oops...", error.message, "error");
    });

})


const defaultImg = `images/user.png`


let profile = document.getElementById("profile")
let getUser = async (uid) => {
  let fullName = document.getElementById("fullName");
  let email = document.getElementById("email");
  const docRef = await doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {

    console.log("Document data:", docSnap.data().email);

    fullName.value = docSnap.data().user
    email.value = docSnap.data().email

    profile_img.src = docSnap.data().picture ? docSnap.data().picture : defaultImg



  }

  else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }

}


let logout = document.getElementById("logout-btn")
let postBtn = document.getElementById("postBtn")
onAuthStateChanged(auth, (user) => {
  const uid = localStorage.getItem("uid")
  let fullName = document.getElementById("fullName");

  if (user && uid) {
    logout.style.display = "block"
    fullName.style.display = "block"
    
    
    getUser(uid)
    postBtn.removeAttribute('disabled')
    if (location.pathname !== '/profile.html' && location.pathname !== '/index.html') {
      location.href = "index.html"
      

    }

    else {
      // if (location.pathname !== '/index.html' && location.pathname !== '/profile.html' ) {
      //     location.href = "index.html"
      // }
    }
  }
  else {
    let login = document.getElementById("login")
    let singUp = document.getElementById("signUp")
    
    if (location.pathname === '/index.html') {
      fullName.style.display = "none"
      login.style.display = "block"
      singUp.style.display = "block"
    }

    if (location.pathname !== '/login.html' && location.pathname !== '/index.html' && location.pathname !== '/signup.html') {
      location.href = "index.html"

    }
  }

});
const logoutBtn = document.getElementById("logout-btn")

logoutBtn && logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    localStorage.clear()
    location.href = "index.html"
  }).catch((error) => {
    // An error happened.
  });

})





let Post = async () => {
  let uid = localStorage.getItem("uid")
  const docRef2 = await doc(db, "users", uid);
  const docSnap = await getDoc(docRef2);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data())
  }

  else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }

  console.log("Document data:", docSnap.data())
  let title = document.getElementById("title")
  let text = document.getElementById("text")

  if ( title.value.length >5 &&  text.value.length >100 ){
    const docRef = addDoc(collection(db, "Post"), {
      title: title.value,
      text: text.value,
      picture: docSnap.data().picture,
      Uname: docSnap.data().user,
      email: docSnap.data().email,
      timestamp: serverTimestamp(),
      
    });
    console.log("Document written with ID: ", docRef.id);
  }
else{
  alert("Please make sure that the title is between 5 and 50 characters, the text is between 100 and 3000 characters, and both fields are filled in.");

}
}

window.Post = Post

let getAllUser = () => {
  let postSecAll = document.getElementById("Post-Sec-All");
  const q = query(collection(db, "Post"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push(doc.data());


      postSecAll.innerHTML += `
        <div class="card text-center">
      <h2 class="card-header">
        Blog
        </h2>
        <div class="card-body mb-2">
        <div class="d-flex align-items-center">
        <img class="userImg" src="${doc.data().picture ? doc.data().picture : defaultImg}" alt="" >
        <div>
        <h2>${doc.data().Uname}</h2>
        <h5>${doc.data().email}</h5>
        </div>
        </div>
        <div/>
        <h5 class="card-title">${doc.data().title}</h5>
        <p class="card-text input-sec">${doc.data().text}</p>
       <span class="">12-23-2002</span>
       </div>
       
       </div>
       `

    });

  });
}

getAllUser()