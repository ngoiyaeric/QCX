// config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


export const firebaseConfig = {
  apiKey: "AIzaSyCXvrhFTo8ObRvqP2mwEPmu93hk1fVfXbI",
  authDomain: "queue-app-9d250.firebaseapp.com",
  projectId: "queue-app-9d250",
  storageBucket: "queue-app-9d250.appspot.com",
  messagingSenderId: "437532419935",
  appId: "1:437532419935:web:164b36172a54d9b340b8ea",
  measurementId: "G-VW23PD1M51"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
  

export { auth };

  
  