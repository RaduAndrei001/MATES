const admin = require("firebase-admin");
const serviceAccount = require("./steam-clone-2defd-firebase-adminsdk-fbsvc-61157ff4cd.json");

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
module.exports = { admin, db };

