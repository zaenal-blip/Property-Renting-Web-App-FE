import {
  type RouteConfig,
  index,
  layout,
  prefix,
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

    route("/about", "routes/about.tsx"),
    route("/terms", "routes/terms.tsx"),
    route("/privacy", "routes/privacy.tsx"),
  ]),

  // =====================
  // Auth (No Layout)
  // =====================
  route("/login", "routes/auth/login-page.tsx"),
  route("/register", "routes/auth/register-page.tsx"),
  route("/forgot-password", "routes/auth/forgot-password-page.tsx"),
  route("/reset-password", "routes/auth/reset-password-page.tsx"),

  // =====================
  // 404
  // =====================
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
