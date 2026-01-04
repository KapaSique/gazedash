import { Outlet } from "react-router-dom";
import { Header } from "@/shared/ui/Header";
import { Page } from "@/shared/ui/Page";

export default function RootLayout() {
  return (
    <Page>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </Page>
  );
}
