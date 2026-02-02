"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();

        const minimalUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
        };

        setUser(minimalUser);
        setToken(idToken);

        localStorage.setItem("authUser", JSON.stringify(minimalUser));
        localStorage.setItem("authToken", idToken);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("authUser");
        localStorage.removeItem("authToken");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🔹 Sign in
  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;
    const idToken = await firebaseUser.getIdToken();

    const minimalUser = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
    };

    setUser(minimalUser);
    setToken(idToken);

    localStorage.setItem("authUser", JSON.stringify(minimalUser));
    localStorage.setItem("authToken", idToken);
  };

  // 🔹 Sign up
  const signUp = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;

    if (name) {
      await updateProfile(firebaseUser, { displayName: name });
    }

    const idToken = await firebaseUser.getIdToken();

    const minimalUser = {
      uid: firebaseUser.uid,
      name,
      email: firebaseUser.email,
    };

    setUser(minimalUser);
    setToken(idToken);

    localStorage.setItem("authUser", JSON.stringify(minimalUser));
    localStorage.setItem("authToken", idToken);
  };

  // 🔹 Sign out
  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  // 🔹 Reset password
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
