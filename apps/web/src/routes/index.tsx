import { createFileRoute } from "@tanstack/react-router";
import { LanguageSelector } from "../components/LanguageSelector";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return <LanguageSelector />;
}
