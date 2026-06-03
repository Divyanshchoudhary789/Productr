import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";


//Pages List
import Dashboard from "./Pages/Dashboard.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";


// Auth Context

import { useAuth } from "./authContext.jsx";


const ProjectRoutes = () => {
    const { currentUser, setCurrentUser, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {

        if (loading) {
            return;
        }


        if (!currentUser && !["/login", "/signup"].includes(location.pathname)) {
            navigate("/login", { replace: true });
        }

        if (currentUser && location.pathname == "/login") {
            navigate("/", { replace: true });
        }

    }, [currentUser, loading, navigate, location.pathname]);

    let element = useRoutes([
        {
            path: "/",
            element: <Dashboard />
        },

        {
            path: "/login",
            element: <Login />
        },

        {
            path: "/signup",
            element: <Signup />
        }
    ]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div>
            </div>
        );
    }


    return element;

}


export default ProjectRoutes;