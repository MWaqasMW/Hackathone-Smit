
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

        //  localStorage.setItem("userId",user.uid ,)
        location.href = "login.html"
        // console.log("Document written with ID: ", docRef.id);
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



let getUser = async (uid) => {
  let fullName = document.getElementById("fullName");
  let email = document.getElementById("email");

  const docRef = await doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {

    console.log("Document data:", docSnap.data().email);

    fullName.value = docSnap.data().user
    email.value = docSnap.data().email


    if (docSnap.data().picture) {

      profile_img.src = docSnap.data().picture
    }
    else {
      profile_img.src = defaultImg
    }

  }

  else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }

}
onAuthStateChanged(auth, (user) => {
  const uid = localStorage.getItem("uid")
  if (user && uid) {

    getUser(user.uid)
    if (location.pathname !== '/profile.html' && location.pathname !== '/index.html') {
      location.href = "profile.html"
    }
    //   } else {
    //       if (location.pathname !== '/index.html' && location.pathname !== '/signup.html' ) {
    //           location.href = "index.html"
    //       }
    //   }
    // });
  }
  const logoutBtn = document.getElementById("logout-btn")

  logoutBtn && logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
      localStorage.clear()
      location.href = "index.html"
    }).catch((error) => {
      // An error happened.
    });

  })

})



let Post = () => {
  let title = document.getElementById("title")
  let text = document.getElementById("text")

  const docRef = addDoc(collection(db, "Post"), {
    title: title.value,
    text: text.value,
  });
  console.log("Document written with ID: ", docRef.id);

}

window.Post = Post




let getPost = () => {
  let postSec = document.getElementById("Post-Sec");

  const q = query(collection(db, "Post"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const posts = [];
    querySnapshot.forEach((doc) => {
   
     

        posts.push(doc.data());
        postSec.innerHTML += `
      <div class="card text-center" >
      <h2 class="card-header">
      Blog
      </h2>
      <div class="card-body">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuS4q9gPpC3J0mYiARB4gNfrwx3QHNglobOpDduKih&s" alt="">
      <h5 class="card-title"> ${doc.data().title}</h5>
      <p class="card-text input-sec">${doc.data().text}</p>
        <a href="#" class="btn btn-danger">Delete</a>
        <a href="#" class="btn btn-secondary">Edit</a>
      </div>
      <div class="card-footer text-body-secondary">
      2 days ago
      </div>
      </div>
      `
      
    });

  });
}
getPost()

let getAllUser = () => {
  let postSecAll = document.getElementById("Post-Sec-All");
  const q = query(collection(db, "Post"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push(doc.data());
      for (var i = 0; i < posts.length; i++){

        postSecAll.innerHTML += `
        <div class="card text-center">
      <h2 class="card-header">
        Blog
        </h2>
        <div class="card-body">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuS4q9gPpC3J0mYiARB4gNfrwx3QHNglobOpDduKih&s" alt="">
        <h5 class="card-title">${doc.data().title[i]}</h5>
        <p class="card-text input-sec">${doc.data().text[i]}</p>
       <span class="">12-23-2002</span>
       </div>
       
       </div>
       `
      }
      });

    });
}

getAllUser()