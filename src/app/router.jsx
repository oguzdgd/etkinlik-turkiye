import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "@components/layout/MainLayout";
import RouteError from "@components/RouteError";
import ProtectedRoute from "@components/guards/ProtectedRoute";
import AdminRoute from "@components/guards/AdminRoute";

// Adapter: route.lazy() expects a Component export; pages use default exports.
const lazyPage = (loader) => () => loader().then((m) => ({ Component: m.default }));

const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      errorElement: <RouteError />,
      children: [
        { index: true, lazy: lazyPage(() => import("@pages/public/HomePage")) },
        { path: "login", lazy: lazyPage(() => import("@pages/public/LoginPage")) },
        { path: "register", lazy: lazyPage(() => import("@pages/public/RegisterPage")) },

        { path: "events", lazy: lazyPage(() => import("@pages/events/EventListPage")) },
        { path: "events/map", lazy: lazyPage(() => import("@pages/events/MapPage")) },
        { path: "events/:eventId", lazy: lazyPage(() => import("@pages/events/EventDetailPage")) },

        {
          element: <ProtectedRoute />,
          children: [
            { path: "dashboard", lazy: lazyPage(() => import("@pages/user/DashboardPage")) },
            { path: "events/new", lazy: lazyPage(() => import("@pages/events/EventCreatePage")) },
          ],
        },

        {
          element: <AdminRoute />,
          children: [
            { path: "admin", lazy: lazyPage(() => import("@pages/admin/AdminDashboardPage")) },
          ],
        },

        { path: "*", lazy: lazyPage(() => import("@pages/NotFoundPage")) },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
