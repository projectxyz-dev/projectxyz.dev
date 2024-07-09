import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-analytics.js";
const firebaseConfig = ${{ secrets.firebase }}
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);