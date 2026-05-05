import { useRef, useState, useCallback } from "react";
import { GameState } from "@/App";
import GameScene from "@/components/game/GameScene";
import HUD from "@/components/game/HUD";

interface Props {
  onGameOver: (kills: number) => void;
  onWin: (kills: number) => void;
  onRestart: () => void;
  onHome: () => void;
  gameState: GameState;
  kills: number;
}

export interface HUDState {
  health: number;
  ammo: number;
  kills: number;
  alive: number;
  zoneTime: number;
  inZone: boolean;
  zoneRadius: number;
}

export default function GameScreen({ onGameOver, onWin, onRestart, onHome, gameState, kills }: Props) {
  const [hudState, setHudState] = useState<HUDState>({
    health: 100, ammo: 30, kills: 0, alive: 11, zoneTime: 240, inZone: true, zoneRadius: 80
  });
  const isOver = gameState === "dead" || gameState === "won";

  const handleHUDUpdate = useCallback((state: HUDState) => {
    setHudState(state);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {!isOver && (
        <GameScene
          onGameOver={onGameOver}
          onWin={onWin}
          onHUDUpdate={handleHUDUpdate}
        />
      )}
      {!isOver && <HUD state={hudState} />}

      {isOver && (
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "'Segoe UI', sans-serif", color: "#fff"
        }}>
          {gameState === "won" ? (
            <>
              <div style={{ fontSize: 14, letterSpacing: 6, color: "#f0a500", textTransform: "uppercase", marginBottom: 16 }}>
                🏆 BOOYAH!
              </div>
              <h1 style={{ fontSize: 64, fontWeight: 900, margin: 0, color: "#f0a500" }}>WINNER!</h1>
              <p style={{ color: "#aaa", marginTop: 8 }}>You eliminated all enemies!</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, letterSpacing: 6, color: "#ff4444", textTransform: "uppercase", marginBottom: 16 }}>
                ELIMINATED
              </div>
              <h1 style={{ fontSize: 64, fontWeight: 900, margin: 0, color: "#ff4444" }}>DEFEATED</h1>
              <p style={{ color: "#aaa", marginTop: 8 }}>You were taken down in battle.</p>
            </>
          )}

          <div style={{ marginTop: 32, padding: "24px 48px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: "#f0a500" }}>{kills}</div>
            <div style={{ color: "#666", fontSize: 14 }}>KILLS</div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
            <button onClick={onRestart} style={{
              padding: "14px 40px", fontSize: 16, fontWeight: 700,
              background: "linear-gradient(90deg, #f0a500, #ff6b35)",
              border: "none", borderRadius: 4, color: "#fff",
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase"
            }}>
              PLAY AGAIN
            </button>
            <button onClick={onHome} style={{
              padding: "14px 40px", fontSize: 16, fontWeight: 700,
              background: "transparent",
              border: "2px solid rgba(255,255,255,0.3)", borderRadius: 4, color: "#fff",
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase"
            }}>
              HOME
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
