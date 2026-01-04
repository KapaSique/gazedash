import type { ReactNode } from "react";

type PageProps = {
  children: ReactNode;
};

export function Page({ children }: PageProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
