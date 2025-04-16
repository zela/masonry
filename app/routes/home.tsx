import { useRouteLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const loaderData = useRouteLoaderData("root") as { message: string };
  return <Welcome message={loaderData.message} />;
}
