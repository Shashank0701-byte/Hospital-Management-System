const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const { initializeFirebase, firebaseReady, getFirebaseAuth } = require('../firebase');

async function main() {
  const [firebaseUid] = process.argv.slice(2);
  if (!firebaseUid) throw new Error('Usage: npm run verify:staff-email -- <firebase-uid>');

  initializeFirebase();
  if (!firebaseReady()) throw new Error('Firebase Admin credentials are required.');

  const auth = getFirebaseAuth();
  const user = await auth.getUser(firebaseUid);
  if (user.emailVerified) {
    console.log(`Email is already verified for ${user.email || firebaseUid}.`);
    return;
  }

  await auth.updateUser(firebaseUid, { emailVerified: true });
  console.log(`Verified email for ${user.email || firebaseUid}.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});