const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || !score) {
      return res.status(400).json({ error: 'Name and score are required' });
    }

    await db.collection('leaderboard').add({ name, score });
    res.status(200).json({ message: 'Score added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leaderboard' });
  }
};
