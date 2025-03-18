import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../db/firebase";

const login = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		const user = result.user;
		console.log("User logged in:", user);
	} catch (error) {
		console.error("Error during login:", error);
	}
};

const logout = async () => {
	try {
		await signOut(auth);
		console.log("User logged out");
	} catch (error) {
		console.error("Error during logout:", error);
	}
};

export { login, logout };
