import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Home from "./components/pages/Home";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";
import SubmitReport from "./components/pages/SubmitReport";
import TrackReport from "./components/pages/TrackReport";
import NearbySupport from "./components/pages/NearbySupport";
import HowItWorks from "./components/pages/HowItWorks";
import NotFound from "./components/pages/NotFound";
import Login from "./components/admin/login/Login";
import Dashboard from "./components/admin/dashboard/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AdminProvider } from "./context/AdminContext";
import VolunteerDashboard from "./addon/sos/VolunteerDashboard";
import VolunteerLogin from "./addon/sos/VolunteerLogin";
import ReportProblemForm from "./addon/raiseProblem/ReportProblemForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Home />,
      },

      {
        path: "/submit-report",
        element: <SubmitReport />,
      },
      {
        path: "/track-report",
        element: <TrackReport />,
      },
      {
        path: "/near-by-support",
        element: <NearbySupport />,
      },
      {
        path: "/how-it-works",
        element: <HowItWorks />,
      },
      {
        path: "/raise-problem",
        element: <ReportProblemForm />,

      },
      // admin login (no layout)
      {
        path: "/admin/login",
        element: <Login />,
      },
      {
        path: "/volunteer/dashboard", element: <VolunteerDashboard />
      },
      {
        path: "/volunteer/login", element: <VolunteerLogin />
      },
      {
        path: "/raiseProblem",
        element: <ReportProblemForm />,
      },
    ],
  },


  // Admin routes with separate layout
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <AdminProvider>
      <RouterProvider router={router} />
    </AdminProvider>
  );
}

export default App;
