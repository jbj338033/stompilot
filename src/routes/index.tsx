import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Settings from "../pages/Settings";
import Layout from "../components/Layout";

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
