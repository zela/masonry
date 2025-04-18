import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("photos/:id", "routes/photos.$id.tsx"),
] satisfies RouteConfig;
