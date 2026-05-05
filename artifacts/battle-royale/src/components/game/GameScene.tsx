import { useRef, useEffect, useCallback, MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { HUDState } from "@/pages/GameScreen";

const MAP_SIZE = 200;
const INITIAL_ZONE_RADIUS = 80;
const ZONE_DURATION = 240;
const PLAYER_SPEED = 10;
const BULLET_SPEED = 60;
const BULLET_RADIUS = 0.4;
const ENEMY_SPEED = 3.5;
const ENEMY_COUNT = 10;
const SHOOT_INTERVAL = 0.8;
const FIRE_RATE = 0.25;

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
}

const KEY_MAP = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
];

interface BulletData {
  id: number;
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  owner: "player" | "enemy";
  life: number;
}

interface EnemyData {
  id: number;
  pos: THREE.Vector3;
  health: number;
  shootTimer: number;
  dead: boolean;
  color: string;
}

const ENEMY_COLORS = ["#e74c3c","#8e44ad","#2980b9","#16a085","#d35400","#c0392b","#1abc9c","#9b59b6","#f39c12","#27ae60"];

const BUILDINGS: { pos: [number,number,number]; size: [number,number,number] }[] = [
  { pos: [-30, 3, -20], size: [10, 6, 10] },
  { pos: [20, 4, -40], size: [14, 8, 8] },
  { pos: [50, 5, 10], size: [8, 10, 12] },
  { pos: [-60, 3.5, 30], size: [12, 7, 10] },
  { pos: [40, 3, 50], size: [10, 6, 14] },
  { pos: [-10, 4, 60], size: [8, 8, 8] },
  { pos: [-50, 4.5, -50], size: [14, 9, 10] },
  { pos: [70, 3, -30], size: [8, 6, 10] },
  { pos: [-20, 6, 30], size: [10, 12, 8] },
  { pos: [0, 3.5, -60], size: [12, 7, 12] },
  { pos: [60, 4, 60], size: [10, 8, 10] },
  { pos: [-70, 3, 10], size: [8, 6, 8] },
  { pos: [30, 2.5, -10], size: [6, 5, 6] },
  { pos: [-40, 3, 50], size: [8, 6, 10] },
  { pos: [20, 3.5, 70], size: [10, 7, 8] },
];

function insideBuilding(pos: THREE.Vector3): boolean {
  for (const b of BUILDINGS) {
    const hw = b.size[0] / 2 + 0.5;
    const hd = b.size[2] / 2 + 0.5;
    if (Math.abs(pos.x - b.pos[0]) < hw && Math.abs(pos.z - b.pos[2]) < hd) return true;
  }
  return false;
}

function clampToMap(pos: THREE.Vector3) {
  const half = MAP_SIZE / 2 - 1;
  pos.x = Math.max(-half, Math.min(half, pos.x));
  pos.z = Math.max(-half, Math.min(half, pos.z));
}

interface GameLogicProps {
  onGameOver: (kills: number) => void;
  onWin: (kills: number) => void;
  onHUDUpdate: (state: HUDState) => void;
}

function GameLogic({ onGameOver, onWin, onHUDUpdate }: GameLogicProps) {
  const { camera, gl } = useThree();
  const [, getControls] = useKeyboardControls<Controls>();

  const playerPos = useRef(new THREE.Vector3(0, 0.5, 0));
  const playerHealth = useRef(100);
  const playerAmmo = useRef(30);
  const playerKills = useRef(0);
  const yaw = useRef(0);
  const pitch = useRef(0);
  const fireTimer = useRef(0);
  const gameEnded = useRef(false);

  const zoneTime = useRef(ZONE_DURATION);
  const zoneRadius = useRef(INITIAL_ZONE_RADIUS);
  const zoneCenter = useRef(new THREE.Vector3(0, 0, 0));

  const enemies = useRef<EnemyData[]>([]);
  const bullets = useRef<BulletData[]>([]);
  const bulletId = useRef(0);

  const playerMeshRef = useRef<THREE.Mesh>(null);
  const enemyMeshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const bulletMeshRefs = useRef<Map<number, THREE.Mesh>>(new Map());

  const mouseDown = useRef(false);

  useEffect(() => {
    enemies.current = Array.from({ length: ENEMY_COUNT }, (_, i) => {
      const angle = (i / ENEMY_COUNT) * Math.PI * 2;
      const r = 40 + Math.random() * 30;
      return {
        id: i,
        pos: new THREE.Vector3(Math.cos(angle) * r, 0.5, Math.sin(angle) * r),
        health: 100,
        shootTimer: Math.random() * SHOOT_INTERVAL,
        dead: false,
        color: ENEMY_COLORS[i % ENEMY_COLORS.length],
      };
    });

    const canvas = gl.domElement;

    const onClick = () => { canvas.requestPointerLock(); };
    const onMouseDown = (e: MouseEvent) => { if (e.button === 0) mouseDown.current = true; };
    const onMouseUp = (e: MouseEvent) => { if (e.button === 0) mouseDown.current = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        yaw.current -= e.movementX * 0.002;
        pitch.current -= e.movementY * 0.002;
        pitch.current = Math.max(-0.4, Math.min(0.5, pitch.current));
      }
    };

    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl]);

  const spawnBullet = useCallback((pos: THREE.Vector3, dir: THREE.Vector3, owner: "player" | "enemy") => {
    const id = bulletId.current++;
    bullets.current.push({ id, pos: pos.clone(), dir: dir.clone().normalize(), owner, life: 3.0 });
    if (bullets.current.length > 100) bullets.current.shift();
  }, []);

  useFrame((_, delta) => {
    if (gameEnded.current) return;
    const dt = Math.min(delta, 0.05);

    // Player movement
    const ctrl = getControls();
    const dir = new THREE.Vector3();
    if (ctrl.forward) dir.z -= 1;
    if (ctrl.back) dir.z += 1;
    if (ctrl.left) dir.x -= 1;
    if (ctrl.right) dir.x += 1;

    if (dir.lengthSq() > 0) {
      dir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
      const next = playerPos.current.clone().addScaledVector(dir, PLAYER_SPEED * dt);
      clampToMap(next);
      if (!insideBuilding(next)) playerPos.current.copy(next);
    }

    if (playerMeshRef.current) {
      playerMeshRef.current.position.copy(playerPos.current);
      playerMeshRef.current.rotation.y = yaw.current;
    }

    // Camera follow
    const camOffset = new THREE.Vector3(0, 5, 10).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const camTarget = playerPos.current.clone().add(new THREE.Vector3(0, 1, 0));
    camera.position.lerp(playerPos.current.clone().add(camOffset).add(new THREE.Vector3(0, pitch.current * 5, 0)), 0.15);
    camera.lookAt(camTarget);

    // Shooting
    fireTimer.current -= dt;
    if (mouseDown.current && fireTimer.current <= 0 && playerAmmo.current > 0) {
      fireTimer.current = FIRE_RATE;
      playerAmmo.current = Math.max(0, playerAmmo.current - 1);
      const fwd = new THREE.Vector3(-Math.sin(yaw.current), -pitch.current * 0.5, -Math.cos(yaw.current));
      spawnBullet(playerPos.current.clone().add(new THREE.Vector3(0, 0.5, 0)), fwd, "player");
    }

    // Safe zone shrink
    zoneTime.current = Math.max(0, zoneTime.current - dt);
    const t = 1 - zoneTime.current / ZONE_DURATION;
    zoneRadius.current = INITIAL_ZONE_RADIUS * Math.max(0, 1 - t * 1.1);
    const distFromZone = playerPos.current.distanceTo(zoneCenter.current) - zoneRadius.current;
    const inZone = distFromZone <= 0;
    if (!inZone) playerHealth.current -= 8 * dt;

    // Enemy AI
    for (let i = 0; i < enemies.current.length; i++) {
      const e = enemies.current[i];
      if (e.dead) continue;

      const toPlayer = playerPos.current.clone().sub(e.pos);
      const dist = toPlayer.length();

      if (dist > 8) {
        const next = e.pos.clone().addScaledVector(toPlayer.clone().normalize(), ENEMY_SPEED * dt);
        clampToMap(next);
        if (!insideBuilding(next)) e.pos.copy(next);
      }

      const mesh = enemyMeshRefs.current[i];
      if (mesh) {
        mesh.position.copy(e.pos);
        if (dist > 0.01) mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
      }

      e.shootTimer -= dt;
      if (e.shootTimer <= 0 && dist < 40) {
        e.shootTimer = SHOOT_INTERVAL + Math.random() * 0.5;
        const sDir = toPlayer.clone().normalize();
        sDir.x += (Math.random() - 0.5) * 0.3;
        sDir.z += (Math.random() - 0.5) * 0.3;
        spawnBullet(e.pos.clone().add(new THREE.Vector3(0, 0.8, 0)), sDir, "enemy");
      }

      // Zone damage on enemies
      if (e.pos.distanceTo(zoneCenter.current) - zoneRadius.current > 0) {
        e.health -= 6 * dt;
        if (e.health <= 0) {
          e.dead = true;
          playerKills.current++;
          if (mesh) mesh.visible = false;
        }
      }
    }

    // Update bullets
    const toRemove: number[] = [];
    for (const b of bullets.current) {
      b.life -= dt;
      b.pos.addScaledVector(b.dir, BULLET_SPEED * dt);

      let hit = false;
      if (b.owner === "player") {
        for (const e of enemies.current) {
          if (e.dead) continue;
          if (b.pos.distanceTo(e.pos.clone().add(new THREE.Vector3(0, 0.8, 0))) < BULLET_RADIUS + 0.7) {
            e.health -= 34;
            hit = true;
            if (e.health <= 0) {
              e.dead = true;
              playerKills.current++;
              const m = enemyMeshRefs.current[e.id];
              if (m) m.visible = false;
            }
            break;
          }
        }
      } else {
        if (b.pos.distanceTo(playerPos.current.clone().add(new THREE.Vector3(0, 0.5, 0))) < BULLET_RADIUS + 0.7) {
          playerHealth.current -= 12;
          hit = true;
        }
      }

      if (b.life <= 0 || hit || b.pos.y < -2) toRemove.push(b.id);
    }
    bullets.current = bullets.current.filter(b => !toRemove.includes(b.id));

    // Win/lose
    const aliveCount = enemies.current.filter(e => !e.dead).length;
    if (aliveCount === 0 && !gameEnded.current) {
      gameEnded.current = true;
      onWin(playerKills.current);
      return;
    }
    if (playerHealth.current <= 0 && !gameEnded.current) {
      gameEnded.current = true;
      onGameOver(playerKills.current);
      return;
    }

    onHUDUpdate({
      health: Math.max(0, Math.round(playerHealth.current)),
      ammo: playerAmmo.current,
      kills: playerKills.current,
      alive: aliveCount + 1,
      zoneTime: zoneTime.current,
      inZone,
      zoneRadius: zoneRadius.current,
    });
  });

  return (
    <>
      <mesh ref={playerMeshRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#f0a500" />
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#f0c050" />
        </mesh>
        <mesh position={[0.5, 0, 0.6]}>
          <boxGeometry args={[0.15, 0.15, 0.8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </mesh>

      {Array.from({ length: ENEMY_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={el => { enemyMeshRefs.current[i] = el; }}
          position={[60 + i * 5, 0.5, 0]}
          castShadow
        >
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color={ENEMY_COLORS[i % ENEMY_COLORS.length]} />
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color="#ffd" />
          </mesh>
          <mesh position={[0.5, 0, 0.6]}>
            <boxGeometry args={[0.15, 0.15, 0.8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </mesh>
      ))}

      <BulletRenderer bullets={bullets} refs={bulletMeshRefs} />
      <SafeZoneRing zoneRadius={zoneRadius} zoneCenter={zoneCenter} />
    </>
  );
}

function BulletRenderer({
  bullets,
  refs,
}: {
  bullets: MutableRefObject<BulletData[]>;
  refs: MutableRefObject<Map<number, THREE.Mesh>>;
}) {
  const POOL = 80;
  const pool = useRef<(THREE.Mesh | null)[]>(Array(POOL).fill(null));

  useFrame(() => {
    const active = bullets.current;
    refs.current.clear();
    for (let i = 0; i < POOL; i++) {
      const mesh = pool.current[i];
      if (!mesh) continue;
      if (i < active.length) {
        refs.current.set(active[i].id, mesh);
        mesh.visible = true;
        mesh.position.copy(active[i].pos);
      } else {
        mesh.visible = false;
      }
    }
  });

  return (
    <>
      {Array.from({ length: POOL }, (_, i) => (
        <mesh key={i} ref={el => { pool.current[i] = el; }} visible={false}>
          <sphereGeometry args={[0.14, 6, 6]} />
          <meshStandardMaterial color="#ffff44" emissive="#ffcc00" emissiveIntensity={3} />
        </mesh>
      ))}
    </>
  );
}

function SafeZoneRing({
  zoneRadius,
  zoneCenter,
}: {
  zoneRadius: MutableRefObject<number>;
  zoneCenter: MutableRefObject<THREE.Vector3>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      const r = zoneRadius.current;
      meshRef.current.scale.set(r, 1, r);
      meshRef.current.position.set(zoneCenter.current.x, 0.02, zoneCenter.current.z);
    }
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[0.99, 1.01, 64]} />
      <meshStandardMaterial color="#4adefd" transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Terrain() {
  const patches: [number, number, number][] = [
    [-20, 0, 30], [40, 0, -20], [-60, 0, -40], [70, 0, 50], [-30, 0, 60],
    [50, 0, -60], [-80, 0, -10], [10, 0, 80], [-45, 0, -65], [45, 0, -25],
    [-35, 0, 75], [75, 0, -35], [-85, 0, -45], [25, 0, 55], [-55, 0, -15],
  ];
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshStandardMaterial color="#3a5c3a" />
      </mesh>
      {([
        [0, 2, -MAP_SIZE / 2, MAP_SIZE, 4, 2] as const,
        [0, 2, MAP_SIZE / 2, MAP_SIZE, 4, 2] as const,
        [-MAP_SIZE / 2, 2, 0, 2, 4, MAP_SIZE] as const,
        [MAP_SIZE / 2, 2, 0, 2, 4, MAP_SIZE] as const,
      ]).map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      ))}
      {patches.map(([x, y, z], k) => (
        <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[x, y + 0.01, z]}>
          <circleGeometry args={[4 + (k % 3) * 2, 8]} />
          <meshStandardMaterial color={k % 2 === 0 ? "#2d4a2d" : "#4a6a2a"} />
        </mesh>
      ))}
    </>
  );
}

function Buildings() {
  return (
    <>
      {BUILDINGS.map((b, i) => (
        <group key={i} position={[b.pos[0], 0, b.pos[2]]}>
          <mesh position={[0, b.size[1] / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={`hsl(${210 + i * 15}, 20%, ${25 + (i % 4) * 5}%)`} />
          </mesh>
          <mesh position={[0, b.size[1] + 0.1, 0]}>
            <boxGeometry args={[b.size[0] + 0.3, 0.2, b.size[2] + 0.3]} />
            <meshStandardMaterial color="#555" />
          </mesh>
          {([-1, 1] as const).map(side => (
            <mesh key={side} position={[side * (b.size[0] / 2 - 0.05), b.size[1] * 0.5, 0]}>
              <boxGeometry args={[0.1, 1.2, 1.5]} />
              <meshStandardMaterial color="#88bbff" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

const TREE_POSITIONS: [number, number][] = [
  [-15, 25], [35, -15], [-55, 45], [65, -55], [-25, -35],
  [55, 65], [-75, 15], [15, -75], [-45, -65], [45, -25],
  [-35, 75], [75, -35], [-85, -45], [25, 55], [-55, -15],
  [85, 25], [-65, -75], [35, 85], [-5, -85], [95, -5],
  [-15, -55], [55, -5], [-75, 45], [5, 65], [30, 30],
];

function Trees() {
  return (
    <>
      {TREE_POSITIONS.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 2.4, 6]} />
            <meshStandardMaterial color="#6b4226" />
          </mesh>
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[1.8, 2.5, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#2d7a2d" : "#3a8a3a"} />
          </mesh>
          <mesh position={[0, 4.2, 0]}>
            <coneGeometry args={[1.2, 2, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#3a8a3a" : "#2d7a2d"} />
          </mesh>
        </group>
      ))}
    </>
  );
}

const ROCK_POSITIONS: [number, number][] = [
  [-40, 15], [30, 40], [-60, -30], [50, -20], [-20, -45],
  [10, -25], [70, 10], [-80, 50], [40, -70], [-10, 50],
  [60, -45], [-50, -55], [20, 25], [-30, -20], [80, -70],
];

function Rocks() {
  return (
    <>
      {ROCK_POSITIONS.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.4, z]} rotation={[0.2 * i, i * 0.7, 0.1 * i]}>
          <dodecahedronGeometry args={[0.6 + (i % 3) * 0.3, 0]} />
          <meshStandardMaterial color={`hsl(30, ${10 + (i % 3) * 5}%, ${40 + (i % 4) * 5}%)`} />
        </mesh>
      ))}
    </>
  );
}

interface Props {
  onGameOver: (kills: number) => void;
  onWin: (kills: number) => void;
  onHUDUpdate: (state: HUDState) => void;
}

export default function GameScene({ onGameOver, onWin, onHUDUpdate }: Props) {
  return (
    <KeyboardControls map={KEY_MAP}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 70, near: 0.1, far: 500 }}
        style={{ background: "#87ceeb" }}
      >
        <fog attach="fog" args={["#87ceeb", 80, 200]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={300}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />
        <hemisphereLight args={["#87ceeb", "#3a5c3a", 0.4]} />
        <Terrain />
        <Buildings />
        <Trees />
        <Rocks />
        <GameLogic onGameOver={onGameOver} onWin={onWin} onHUDUpdate={onHUDUpdate} />
      </Canvas>
    </KeyboardControls>
  );
}
