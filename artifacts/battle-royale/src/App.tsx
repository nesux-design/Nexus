import { useState } from "react";
import HomeScreen from "@/pages/HomeScreen";
import GameScreen from "@/pages/GameScreen";

export type GameState = "home" | "playing" | "dead" | "won";

export default function App() {
  const [gameState, setGameState] = useState<GameState>("home");
  const [kills, setKills] = useState(0);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      {gameState === "home" && (
        <HomeScreen onStart={() => setGameState("playing")} />
      )}
      {(gameState === "playing" || gameState === "dead" || gameState === "won") && (
        <GameScreen
          onGameOver={(k) => { setKills(k); setGameState("dead"); }}
          onWin={(k) => { setKills(k); setGameState("won"); }}
          onRestart={() => setGameState("playing")}
          onHome={() => setGameState("home")}
          gameState={gameState}
          kills={kills}
        />
      )}
    </div>
  );
}
