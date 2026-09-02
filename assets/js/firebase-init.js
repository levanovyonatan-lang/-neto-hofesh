import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// Removed getAnalytics

// TODO: החלף את הערכים האלו בנתוני הפרויקט שלך ב-Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDa9u68dZfImq4rKa56X1CqLPPhGQMXdVo",
  authDomain: "neto-hofesh.firebaseapp.com",
  projectId: "neto-hofesh",
  storageBucket: "neto-hofesh.firebasestorage.app",
  messagingSenderId: "82711180725",
  appId: "1:82711180725:web:97b3a90a683d64d52cd5fc",
  measurementId: "G-99S4VQZ1SL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// הגדרת שמירה קבועה של החיבור גם אחרי סגירת הדפדפן
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

auth.languageCode = 'iw'; // Set language to Hebrew (iw is Google's internal code for Hebrew)
const db = getFirestore(app);
// Analytics removed to avoid overriding existing gtag
const provider = new GoogleAuthProvider();

// Expose Firebase functions globally for the app
window.firebaseAuth = auth;
window.firebaseDb = db;

window.firebaseAnonymousSignIn = async () => {
    window.isLoginActionActive = true;
    try {
        const userCredential = await signInAnonymously(auth);
        window.isLoginActionActive = false;
        return userCredential;
    } catch (error) {
        window.isLoginActionActive = false;
        console.error("Anonymous login failed", error);
        alert("התחברות נכשלה. אנא נסה שוב.");
        throw error;
    }
};
window.firebaseSignIn = () => {
    window.isLoginActionActive = true;
    
    // תמיד ננסה קודם פופ-אפ. העברה לדף אחר (Redirect) נכשלת לעיתים קרובות באייפון בגלל הגדרות פרטיות.
    
    return signInWithPopup(auth, provider).catch((error) => {
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            console.log("Popup blocked, falling back to redirect");
            return signInWithRedirect(auth, provider);
        }
        
        window.isLoginActionActive = false;
        console.error("Login failed", error);
        alert("התחברות נכשלה. אנא נסה שוב.");
        throw error;
    });
};

window.firebaseEmailAuth = async (email, password) => {
    window.isLoginActionActive = true;
    try {
        // מנסים להתחבר קודם
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        window.isLoginActionActive = false;
        return userCredential;
    } catch (error) {
        // אם המשתמש לא קיים או שיש שגיאת פרטים, ננסה ליצור חשבון חדש
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                window.isLoginActionActive = false;
                return userCredential;
            } catch (createError) {
                window.isLoginActionActive = false;
                throw createError;
            }
        }
        window.isLoginActionActive = false;
        throw error;
    }
};

window.firebaseSignOut = () => {
    return signOut(auth);
};

window.firebaseResetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
};

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // משתמש מחובר - נוודא שקיים במסד הנתונים
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (!userDocSnap.exists()) {
                // משתמש גוגל שאין לו פרופיל. נתנתק אותו כדי שיעבור להזדהות המקומית החדשה.
                window.currentUserProfile = null;
                signOut(auth).catch(e => console.error(e));
            } else {
                // משתמש קיים - נרענן את ה-UI או נשמור את הנתונים בזכרון
                window.currentUserProfile = userDocSnap.data();
                
                // סנכרון שיא הדינוזאור ל-localStorage (כדי שהמשחק ידע מה השיא)
                const serverDinoScore = window.currentUserProfile.dinoHighScore || 0;
                const localDinoScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
                
                if (serverDinoScore > localDinoScore) {
                    localStorage.setItem('dinoHighScore', serverDinoScore);
                    const hsEl = document.getElementById('dino-high-score-val');
                    if (hsEl) hsEl.textContent = serverDinoScore;
                } else if (localDinoScore > serverDinoScore) {
                    // יש שיא מקומי גבוה יותר, נעדכן את השרת
                    if (window.saveDinoHighScore) {
                        const token = localStorage.getItem('dinoHighScoreToken');
                        const timeElapsed = localStorage.getItem('dinoTimeElapsed');
                        window.saveDinoHighScore(localDinoScore, token, timeElapsed);
                    }
                }
                
                // One-time sync to fix users whose scores didn't make it to the leaderboard
                const maxScore = Math.max(serverDinoScore, localDinoScore);
                if (!localStorage.getItem('forceSync_v1') && maxScore > 0) {
                    if (window.saveDinoHighScore) {
                        window.saveDinoHighScore(maxScore);
                    }
                    localStorage.setItem('forceSync_v1', 'true');
                }
                
                console.log("Welcome back, ", window.currentUserProfile.nickname);
                if(window.updateLeaderboardUI) window.updateLeaderboardUI();
            }
        } catch (error) {
            console.error("Firestore error in auth state:", error);
            alert("שגיאת התחברות למסד הנתונים (Firestore): נראה שיש חסימת הרשאות. בדוק את ה-Rules במסוף Firebase.");
        }
        
        // ניקוי כפתור צד ישן שנשאר ב-Cache אצל חלק מהמשתמשים
        const oldPaBtn = document.getElementById('personal-area-btn');
        if (oldPaBtn) oldPaBtn.remove();
        
    } else {
        // מזהה מקומי למשתמש ללא חשבון גוגל
        let localUid = localStorage.getItem('local_uid');
        if (!localUid) {
            localUid = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('local_uid', localUid);
        }
        window.currentUid = localUid;

        try {
            const userDocRef = doc(db, "users", localUid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                window.currentUserProfile = userDocSnap.data();
                
                // סנכרון שיא
                const serverDinoScore = window.currentUserProfile.dinoHighScore || 0;
                const localDinoScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
                
                if (serverDinoScore > localDinoScore) {
                    localStorage.setItem('dinoHighScore', serverDinoScore);
                    const hsEl = document.getElementById('dino-high-score-val');
                    if (hsEl) hsEl.textContent = serverDinoScore;
                } else if (localDinoScore > serverDinoScore) {
                    if (window.saveDinoHighScore) {
                        const token = localStorage.getItem('dinoHighScoreToken');
                        const timeElapsed = localStorage.getItem('dinoTimeElapsed');
                        window.saveDinoHighScore(localDinoScore, token, timeElapsed);
                    }
                }
            } else {
                window.currentUserProfile = null;
            }
        } catch (error) {
            console.error("Error fetching local profile:", error);
            window.currentUserProfile = null;
        }

        if (window.updateLeaderboardUI) window.updateLeaderboardUI();
    }
});

// פונקציה להשלמת הרשמה
window.completeUserRegistration = async (user, nickname, optInNewsletter, emoji = '👤', customGrade = null) => {
    try {
        const uid = user ? user.uid : window.currentUid;
        if (!uid) {
            alert("שגיאה במזהה משתמש");
            return;
        }
        
        // שאיבת שכבת הגיל מתוך ה-parameter או מתוך האחסון המקומי
        let userGrade = customGrade || "לא נבחר";
        if (!customGrade || customGrade === "לא נבחר") {
            try {
                const savedState = localStorage.getItem('dailyTipsState');
                if(savedState) {
                    const parsed = JSON.parse(savedState);
                    if(parsed.selectedCategory) userGrade = parsed.selectedCategory;
                }
            } catch(e) {}
        }

        const localDinoScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
        
        const profileData = {
            nickname: nickname,
            emoji: emoji,
            email: user ? user.email : null,
            displayName: user ? user.displayName : null,
            grade: userGrade,
            newsletterOptIn: optInNewsletter,
            createdAt: new Date().toISOString(),
            dinoHighScore: localDinoScore
        };

        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, profileData);
        window.currentUserProfile = profileData;
        console.log("Registration completed successfully!");
        
        if (localDinoScore > 0 && window.saveDinoHighScore) {
            const token = localStorage.getItem('dinoHighScoreToken');
            const timeElapsed = localStorage.getItem('dinoTimeElapsed');
            await window.saveDinoHighScore(localDinoScore, token, timeElapsed);
        }
        
        window.leaderboardLastFetch = 0;
        if(window.showLeaderboard) {
            window.showLeaderboard(null, null, null, true);
        } else if(window.updateLeaderboardUI) {
            window.updateLeaderboardUI();
        }
    } catch (error) {
        console.error("Error saving user profile:", error);
        alert("אירעה שגיאה בשמירת הנתונים. נסה שוב.");
    }
};

// פונקציה לשמירת שיא בדינוזאור
window.saveDinoHighScore = async (score, token, timeElapsed) => {
    const user = auth.currentUser;
    const uid = user ? user.uid : window.currentUid;
    if (!uid || !window.currentUserProfile) return false;

    // Anti-Cheat Validation
    score = Number(score);
    if (!Number.isFinite(score) || score < 0 || score > 999999) {
        console.warn("Anti-Cheat: Invalid score format (Infinity/NaN/Too High).");
        return false;
    }

    let isValid = false;
    if (score <= 3000 && !token) {
        // Legacy scores up to 3000 are allowed without token for smooth transition
        isValid = true;
    } else if (token && timeElapsed) {
        const expectedTokenStr = score + "_NETOHOFESH_" + timeElapsed;
        try {
            if (btoa(expectedTokenStr) === token) {
                const maxPossibleScore = (timeElapsed / 1000) * 150;
                if (score <= maxPossibleScore || score <= 100) {
                    isValid = true;
                }
            }
        } catch(e) {}
    }
    
    if (!isValid) {
        console.warn("Anti-Cheat: Invalid score submission blocked.");
        // Revert local storage to the legitimate server score
        localStorage.setItem('dinoHighScore', window.currentUserProfile.dinoHighScore || 0);
        return false;
    }

    const currentMonth = new Date().toISOString().substring(0, 7);
    const serverAllTime = window.currentUserProfile.dinoHighScore || 0;
    const serverMonthly = (window.currentUserProfile.monthlyScores && window.currentUserProfile.monthlyScores[currentMonth]) ? window.currentUserProfile.monthlyScores[currentMonth] : 0;

    let updated = false;
    let userMergeData = {};
    let scoreMergeData = {
        updatedAt: new Date().toISOString()
    };
    if (window.currentUserProfile.nickname) scoreMergeData.nickname = window.currentUserProfile.nickname;
    if (window.currentUserProfile.emoji) scoreMergeData.emoji = window.currentUserProfile.emoji;

    if (score > serverAllTime) {
        userMergeData.dinoHighScore = score;
        scoreMergeData.score = score;
        window.currentUserProfile.dinoHighScore = score;
        updated = true;
    }

    if (score > serverMonthly) {
        if (!window.currentUserProfile.monthlyScores) window.currentUserProfile.monthlyScores = {};
        window.currentUserProfile.monthlyScores[currentMonth] = score;
        userMergeData.monthlyScores = { [currentMonth]: score };
        scoreMergeData.monthlyScores = { [currentMonth]: score };
        updated = true;
    }

    if (updated) {
        try {
            const userDocRef = doc(db, "users", uid);
            await setDoc(userDocRef, userMergeData, { merge: true });

            // עדכון באוסף נפרד שמיועד רק לטבלת השיאים (לשליפה מהירה)
            const scoreDocRef = doc(db, "dino_scores", uid);
            await setDoc(scoreDocRef, scoreMergeData, { merge: true });

            window.leaderboardLastFetch = 0; // Force refresh on next view
            return true;
        } catch (error) {
            console.error("Error saving high score:", error);
            return false;
        }
    }
    return false;
};

// פונקציה לשליפת טבלת השיאים
window.getTopDinoScores = async (type = 'monthly') => {
    try {
        const scoresRef = collection(db, "dino_scores");
        let q;
        const currentMonth = new Date().toISOString().substring(0, 7);
        
        if (type === 'monthly') {
            q = query(scoresRef, orderBy(`monthlyScores.${currentMonth}`, "desc"), limit(100));
        } else {
            q = query(scoresRef, orderBy("score", "desc"), limit(100));
        }
        
        const querySnapshot = await getDocs(q);
        
        let leaderboard = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let displayScore = data.score || 0;
            if (type === 'monthly') {
                displayScore = (data.monthlyScores && data.monthlyScores[currentMonth]) ? data.monthlyScores[currentMonth] : 0;
            }
            leaderboard.push({ ...data, uid: doc.id, displayScore: displayScore });
        });
        return leaderboard;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
};

// Handle redirect result for iOS/Safari logins
getRedirectResult(auth).then((result) => {
    if (result) {
        console.log("Successfully logged in via redirect", result.user);
        // If user already exists, maybe open the leaderboard so they see they are logged in
        // (If new user, onAuthStateChanged will open the registration modal)
        const tryShowLeaderboard = () => {
            if (window.showLeaderboard) {
                // We use a slight delay so onAuthStateChanged has a chance to set currentUserProfile
                setTimeout(() => window.showLeaderboard(), 500);
            } else {
                setTimeout(tryShowLeaderboard, 100);
            }
        };
        tryShowLeaderboard();
    }
}).catch((error) => {
    console.error("Redirect login failed", error);
});

// פונקציות ניהול אזור אישי
window.handleLogout = async () => {
    if (confirm("בטוח שאתה רוצה להתנתק?")) {
        try {
            await signOut(auth);
            if(window.closePersonalArea) window.closePersonalArea();
            alert("התנתקת בהצלחה. להתראות! 👋");
            window.location.reload();
        } catch (error) {
            console.error("Error signing out:", error);
            alert("שגיאה בהתנתקות.");
        }
    }
};

window.handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    if (confirm("⚠️ אזהרה: פעולה זו תמחק את החשבון שלך ואת כל השיאים שלך לצמיתות! האם אתה בטוח?")) {
        if (confirm("בטוח ב-100%? אי אפשר לשחזר את הנתונים!")) {
            try {
                // מחיקת מסמך המשתמש
                await deleteDoc(doc(db, "users", user.uid));
                // מחיקת מסמך שיאים
                await deleteDoc(doc(db, "dino_scores", user.uid));
                // מחיקת חשבון מפיירבייס
                await deleteUser(user);
                
                alert("החשבון נמחק לצמיתות. 🗑️");
                window.location.reload();
            } catch (error) {
                console.error("Error deleting user:", error);
                if (error.code === 'auth/requires-recent-login') {
                    alert("בשביל למחוק חשבון אתה צריך להתחבר מחדש (מטעמי אבטחה). התנתק, התחבר שוב ונסה שוב.");
                } else {
                    alert("שגיאה במחיקת החשבון: " + error.message);
                }
            }
        }
    }
};
