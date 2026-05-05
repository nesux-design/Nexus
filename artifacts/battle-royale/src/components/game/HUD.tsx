import { HUDState } from "@/pages/GameScreen";

interface Props {
  state: HUDState;
}

export default function HUD({ state }: Props) {
  const { health, ammo, kills, alive, zoneTime, inZone, zoneRadius } = state;
  const healthColor = health > 60 ? "#4ade80" : health > 30 ? "#f0a500" : "#ff4444";

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Health bar - bottom left */}
      <div style={{ position: "absolute", bottom: 32, left: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>❤ HP</span>
          <span style={{ color: healthColor, fontSize: 20, fontWeight: 700 }}>{Math.ceil(health)}</span>
        </div>
        <div style={{
          width: 200, height: 10, background: "rgba(0,0,0,0.5)",
          borderRadius: 5, border: "1px solid rgba(255,255,255,0.2)", overflow: "hidden"
        }}>
          <div style={{
            width: `${health}%`, height: "100%",
            background: `linear-gradient(90deg, ${healthColor}, ${healthColor}88)`,
            borderRadius: 5, transition: "width 0.2s"
          }} />
        </div>
      </div>

      {/* Ammo - bottom right */}
      <div style={{ position: "absolute", bottom: 32, right: 24, textAlign: "right" }}>
        <div style={{ color: "#aaa", fontSize: 13, marginBottom: 4, letterSpacing: 1 }}>🔫 AMMO</div>
        <div style={{ color: ammo > 5 ? "#fff" : "#ff4444", fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
          {ammo}
          <span style={{ fontSize: 18, color: "#666" }}>/30</span>
        </div>
      </div>

      {/* Top bar: kills + alive */}
      <div style={{
        position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 40, alignItems: "center",
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
        padding: "10px 28px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#f0a500", fontSize: 22, fontWeight: 700 }}>{kills}</div>
          <div style={{ color: "#666", fontSize: 11, letterSpacing: 1 }}>KILLS</div>
        </div>
        <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#4ade80", fontSize: 22, fontWeight: 700 }}>{alive}</div>
          <div style={{ color: "#666", fontSize: 11, letterSpacing: 1 }}>ALIVE</div>
        </div>
      </div>

      {/* Safe zone warning */}
      {!inZone && (
        <div style={{
          position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,50,50,0.85)", color: "#fff",
          padding: "8px 24px", borderRadius: 6, fontSize: 14, fontWeight: 700,
          letterSpacing: 1, animation: "pulse 1s infinite"
        }}>
          ⚠ OUTSIDE SAFE ZONE — TAKE DAMAGE
        </div>
      )}

      {/* Zone timer */}
      <div style={{
        position: "absolute", top: 20, right: 24,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
        padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ color: "#888", fontSize: 11, letterSpacing: 1, marginBottom: 2 }}>ZONE</div>
        <div style={{ color: "#4adefd", fontSize: 16, fontWeight: 700 }}>
          {Math.floor(zoneTime / 60)}:{String(Math.ceil(zoneTime % 60)).padStart(2, "0")}
        </div>
        <div style={{
          width: 80, height: 4, background: "rgba(255,255,255,0.1)",
          borderRadius: 2, marginTop: 4, overflow: "hidden"
        }}>
          <div style={{
            width: `${(zoneRadius / 80) * 100}%`, height: "100%",
            background: "linear-gradient(90deg, #4adefd, #0088ff)",
            borderRadius: 2, transition: "width 0.5s"
          }} />
        </div>
      </div>

      {/* Mini-map */}
      <MiniMap state={state} />

      {/* Crosshair */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: 20, height: 20
      }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.8)", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.8)", transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 4, height: 4, borderRadius: "50%", background: "#f0a500" }} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
}

function MiniMap({ state }: Props) {
  const mapSize = 120;
  const worldSize = 200;
  const scale = mapSize / worldSize;
  const { zoneRadius } = state;

  return (
    <div style={{
      position: "absolute", bottom: 100, right: 24,
      width: mapSize, height: mapSize,
      background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 4, overflow: "hidden"
    }}>
      {/* Zone ring */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: zoneRadius * scale * 2,
        height: zoneRadius * scale * 2,
        transform: "translate(-50%,-50%)",
        border: "2px solid rgba(74,222,253,0.6)",
        borderRadius: "50%",
        background: "rgba(74,222,253,0.05)"
      }} />
      {/* Grid lines */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.05)" }} />
      {/* Player dot */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        width: 6, height: 6, background: "#f0a500",
        borderRadius: "50%", transform: "translate(-50%,-50%)",
        boxShadow: "0 0 6px #f0a500"
      }} />
      <div style={{ position: "absolute", bottom: 2, left: 4, color: "rgba(255,255,255,0.4)", fontSize: 9 }}>MAP</div>
    </div>
  );
}
