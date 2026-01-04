import { Link } from "react-router-dom";

export function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 16px",
        borderBottom: "1px solid #222",
      }}
    >
      <Link to="/" style={{ fontWeight: 700 }}>
        GazeDash
      </Link>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/sessions">Sessions</Link>
      </nav>
    </header>
  );
}
