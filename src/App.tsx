
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from '@/pages/Index';
import Buy from '@/pages/Buy';
import Rent from '@/pages/Rent';
import Sell from '@/pages/Sell';
import About from '@/pages/About';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Layout from '@/components/layout/Layout';
import StudentPG from '@/pages/StudentPG';
import StudentPGManagement from '@/pages/StudentPGManagement';
import AddPGListing from '@/pages/AddPGListing';
import EditProperty from "./pages/EditProperty";
import { AuthProvider } from '@/contexts/AuthContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "buy",
        element: <Buy />,
      },
      {
        path: "rent",
        element: <Rent />,
      },
      {
        path: "sell",
        element: <Sell />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "student-pg",
        element: <StudentPG />,
      },
      {
        path: "student-pg/management",
        element: <StudentPGManagement />,
      },
      {
        path: "student-pg/add",
        element: <AddPGListing />,
      },
      {
        path: "edit-property/:id",
        element: <EditProperty />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
