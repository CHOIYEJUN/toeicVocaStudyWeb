import {DBservice} from "./fireBase";
import {addDoc, collection, doc, setDoc} from "firebase/firestore";

export async function CreateUserField(uid, email, username, account, accountNumber, accountOwner) {
    const today = new Date();
    const todayYMD = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    const userDocRef = doc(collection(DBservice, "users"), uid);
    await setDoc(userDocRef, {
        uid: uid,
        email: email,
        username: username,
        account: account,
        accountNumber: accountNumber,
        accountOwner: accountOwner,
        createdAt: todayYMD,
        startDay: "2024-02-15",
    });
}
