import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // =====================
  // Main Public Layout
  // =====================
  layout("components/layout/main-layout.tsx", [
    index("routes/home.tsx"),

    route("/properties", "routes/properties.tsx"),
    route("/properties/:slug", "routes/property-detail.tsx"),
    route("/booking/:id", "routes/booking.tsx"),

    route("/about", "routes/about.tsx"),
    route("/terms", "routes/terms.tsx"),
    route("/privacy", "routes/privacy.tsx"),

    route("/user/bookings", "routes/user/orders.tsx"),
    route("/user/order-detail/:id", "routes/user/order-detail.tsx"),

    // Tenant Routes
    route("/tenant/orders", "routes/tenant/orders.tsx"),
    route("/tenant/reports", "routes/tenant/reports.tsx"),
    route("/tenant/reviews", "routes/tenant/reviews.tsx"),
  ]),

  // =====================
  // Auth (No Layout)
  // =====================
  route("/login", "routes/auth/login-page.tsx"),
  route("/register", "routes/auth/register-page.tsx"),
  route("/forgot-password", "routes/auth/forgot-password-page.tsx"),
  route("/reset-password", "routes/auth/reset-password-page.tsx"),
  route("/verify-email", "routes/auth/verify-email-page.tsx"),
  route("/onboarding", "routes/auth/onboarding-page.tsx"),

  // =====================
  // User Settings (with settings sidebar layout)
  // =====================
  layout("components/layout/settings-layout.tsx", [
    route("/settings", "routes/settings/account-settings.tsx"),
    route("/settings/security", "routes/settings/security-settings.tsx"),
    route(
      "/settings/notifications",
      "routes/settings/notification-settings.tsx",
    ),
    route("/settings/payments", "routes/settings/payment-settings.tsx"),
  ]),

  // =====================
  // Tenant Dashboard (with dashboard sidebar layout)
  // =====================
  layout("components/layout/dashboard-layout.tsx", [
    route("/tenant/dashboard", "routes/tenant/dashboard-overview.tsx"),
    route(
      "/tenant/dashboard/properties",
      "routes/tenant/dashboard-properties.tsx",
    ),
    route(
      "/tenant/dashboard/properties/new",
      "routes/tenant/property-new.tsx",
    ),
    route(
      "/tenant/dashboard/properties/:id",
      "routes/tenant/property-detail.tsx",
    ),
    route(
      "/tenant/dashboard/properties/:id/edit",
      "routes/tenant/property-edit.tsx",
    ),
    route(
      "/tenant/dashboard/properties/:id/rooms/:roomId",
      "routes/tenant/room-management.tsx",
    ),
    route(
      "/tenant/dashboard/categories",
      "routes/tenant/categories.tsx",
    ),
    route("/tenant/dashboard/orders", "routes/tenant/dashboard-orders.tsx"),
    route("/tenant/dashboard/reviews", "routes/tenant/dashboard-reviews.tsx"),
    route(
      "/tenant/dashboard/settings",
      "routes/tenant/dashboard-settings.tsx",
    ),
  ]),

  // =====================
  // 404
  // =====================
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
