interface Props {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: Props) {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", color: "#fff",
      userSelect: "none"
    }}>
      <div style={{ textAlign: "center", maxWidth: 600 }}>
        <div style={{ fontSize: 14, letterSpacing: 6, color: "#f0a500", textTransform: "uppercase", marginBottom: 16 }}>
          ◆ BATTLE ROYALE ◆
        </div>
        <h1 style={{
          fontSize: 72, fontWeight: 900, margin: 0,
          background: "linear-gradient(90deg, #f0a500, #ff6b35, #f0a500)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          textShadow: "none", letterSpacing: 2
        }}>
          FIRE ZONE
        </h1>
        <p style={{ color: "#aaa", fontSize: 16, marginTop: 12, marginBottom: 48, lineHeight: 1.6 }}>
          Last player standing wins.<br />
          Eliminate enemies, survive the zone, claim victory.
        </p>

        <button onClick={onStart} style={{
          padding: "18px 64px", fontSize: 20, fontWeight: 700,
          background: "linear-gradient(90deg, #f0a500, #ff6b35)",
          border: "none", borderRadius: 4, color: "#fff",
          cursor: "pointer", letterSpacing: 2, textTransform: "uppercase",
          boxShadow: "0 0 40px rgba(240,165,0,0.4)",
          transition: "transform 0.1s"
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          PLAY NOW
        </button>

        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, textAlign: "left" }}>
          {[
            ["WASD / Arrow Keys", "Move"],
            ["Mouse", "Aim & Look"],
            ["Left Click", "Shoot"],
            ["Escape", "Release mouse"],
          ].map(([key, action]) => (
            <div key={key} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 4, fontSize: 13, fontWeight: 600, color: "#f0a500", whiteSpace: "nowrap" }}>{key}</span>
              <span style={{ color: "#888", fontSize: 14 }}>{action}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: "16px 32px", background: "rgba(255,255,255,0.05)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f0a500" }}>10</div>
              <div style={{ fontSize: 12, color: "#666" }}>ENEMIES</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f0a500" }}>1</div>
              <div style={{ fontSize: 12, color: "#666" }}>WINNER</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f0a500" }}>3D</div>
              <div style={{ fontSize: 12, color: "#666" }}>WORLD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
