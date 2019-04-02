const functions = require('firebase-functions'); //import the Cloud Functions

const admin = require('firebase-admin'); // Admin SDK modules
admin.initializeApp();

const nodeMailer = require('nodemailer');

// const gmailEmail = functions.config().gmail.email;
// const gmailPassword = functions.config().gmail.password;

const mailTransport = nodeMailer.createTransport({
	service: 'gmail',
	auth: {
		user: "eneter gmail id",
		pass: "enter your password here"
	}
})

const APP_NAME = 'Firebase Cloud Functions Test App';



// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// https://us-central1-fir-testproject-f2eca.cloudfunctions.net/helloWorld
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello Deepak from Firebase!");
});

// https://us-central1-fir-testproject-f2eca.cloudfunctions.net/addMessage
exports.addMessage = functions.https.onRequest((req, res)=>{
	const original = req.query.text;
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/messages').push({original: original}).then((snapshot)=>{
		return res.redirect(303, snapshot.ref.toString());
	})
})


exports.makeUpperCase = functions.database.ref('/messages/{messageId}/original').onCreate((snapshot, context)=>{
	const original = snapshot.val();
	console.log("Uppercasing", context.params.messageId, original)
	const upperCase = original.toUpperCase();
	return snapshot.ref.parent.child('uppercase').set(upperCase);
})



exports.newUserCreated = functions.auth.user().onCreate((user)=>{
	const email = user.email;
	const displayName = user.displayName;
	return sendWelcomeEmail(email, displayName);	
})


async function sendWelcomeEmail(email, displayName){
	const mailOptions = {
		from: `${APP_NAME} <noreply@firebase.com`,
		to: email
	}

	mailOptions.subject = `Welcome to ${APP_NAME}`;
	mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. `;
	await mailTransport.sendMail(mailOptions);
	console.log("New Welcome mail sent to: ", email);
	return null;
}


exports.userDeleted = functions.auth.user().onDelete((user)=>{
	return sendByeEmail(user.email, user.displayName);
});

async function sendByeEmail(email, displayName){
	const mailOptions = {
		from: `${APP_NAME} <noreply@firebase.com`,
		to: email
	}

	mailOptions.subject = `	Bye!`;
	mailOptions.text = `Hey ${displayName || ''}! We confirm that we have deleted your ${APP_NAME} account. `;
	await mailTransport.sendMail(mailOptions);
	console.log("Account deletion confirmation email sent to: ", email);
	return null;
}