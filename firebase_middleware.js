const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const checkFirebaseToken = async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        return res.status(403).send("Unauthorized");
    }
    const token = authorizationHeader.split("Bearer ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        const db = admin.firestore(); // Initialize Firestore
        const userRef = db.collection("userStats").doc(decodedToken.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            await userRef.set({
                count: 0,
                lastResetDate: new Date().toISOString(),
            });
        } else {
            //check if last reset date is more than 1 month ago
            const lastResetDate = new Date(userDoc.data().lastResetDate);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - lastResetDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 30) {
                await userRef.update({
                    count: 0,
                    lastResetDate: new Date().toISOString(),
                });
            }
            //check if user has made more than 5 requests
            if (userDoc.data().count >= 5) {
                return res
                    .status(429)
                    .send("You have made five forms this month.");
            }
        }
        next();
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        res.status(403).send("Unauthorized");
    }
};

const updateRequestCount = async (req) => {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const db = admin.firestore();
    const userRef = db.collection("userStats").doc(decodedToken.uid);
    await userRef.update({
        count: admin.firestore.FieldValue.increment(1),
    });
};

module.exports = { checkFirebaseToken, updateRequestCount };
