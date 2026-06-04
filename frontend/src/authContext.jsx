import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "./environment.js";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const checkAuth = async () => {
        try {

            const res = await api.get("/user");

            console.log(res);
            setCurrentUser(res.data.user);

        } catch (err) {
            console.log(err);
            localStorage.removeItem("token");
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        checkAuth();
    }, []);


    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );

}
