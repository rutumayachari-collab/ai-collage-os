import { useEffect, useRef } from "react";
import * as THREE from "three";

const NODES = [
  { label: "Students", hue: 0x5cc9e8 },
  { label: "Applicants", hue: 0x7fd8c4 },
  { label: "Faculty", hue: 0x8ab4f8 },
  { label: "Admissions", hue: 0x6ee7d3 },
  { label: "Documents", hue: 0x9bb7ef },
  { label: "AI", hue: 0x67e8f9 },
  { label: "Payments", hue: 0xf3c677 },
  { label: "Notifications", hue: 0xf29ba3 },
];

function labelSprite(text: string, color: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.font = "600 30px Manrope, system-ui, sans-serif";
  ctx.fillStyle = "#" + color.toString(16).padStart(6, "0");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 34);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 2;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  sprite.scale.set(1.5, 0.375, 1);
  return sprite;
}

export default function EcosystemScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.5, 9.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearAlpha(0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const group = new THREE.Group();
    scene.add(group);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.05, 3),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.55,
        roughness: 0.25,
        metalness: 0.35,
      }),
    );
    group.add(core);

    const halo = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 2),
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      }),
    );
    group.add(halo);

    const orbitRadius = 3.0;
    const nodes: { mesh: THREE.Mesh; sprite: THREE.Sprite; angle: number; y: number }[] = [];
    const lineGeoms: THREE.BufferGeometry[] = [];

    NODES.forEach((n, i) => {
      const angle = (i / NODES.length) * Math.PI * 2;
      const y = Math.sin(i * 1.7) * 0.85;

      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.34, 1),
        new THREE.MeshStandardMaterial({
          color: n.hue,
          emissive: n.hue,
          emissiveIntensity: 0.35,
          roughness: 0.3,
          metalness: 0.2,
        }),
      );
      group.add(mesh);

      const sprite = labelSprite(n.label, n.hue);
      group.add(sprite);

      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]);
      const line = new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({ color: n.hue, transparent: true, opacity: 0.25 }),
      );
      group.add(line);
      lineGeoms.push(geom);

      nodes.push({ mesh, sprite, angle, y });
    });

    const starCount = 220;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starGeom,
      new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.045, transparent: true, opacity: 0.5 }),
    );
    scene.add(stars);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xbae6fd, 1.5);
    key.position.set(4, 6, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x22d3ee, 0.8);
    rim.position.set(-6, -3, -4);
    scene.add(rim);

    let pointerX = 0;
    let pointerY = 0;
    const onPointer = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointer);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    let running = true;
    const io = new IntersectionObserver((entries) => {
      running = entries[0]?.isIntersecting ?? true;
    });
    io.observe(mount);

    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!running) return;
      const t = reduced ? 0 : clock.getElapsedTime();

      group.rotation.y = t * 0.12 + pointerX * 0.35;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -pointerY * 0.18, 0.05);
      core.rotation.y = t * 0.35;
      halo.rotation.y = -t * 0.2;
      halo.rotation.x = t * 0.12;
      stars.rotation.y = t * 0.02;

      nodes.forEach((n, i) => {
        const a = n.angle + t * 0.22;
        const x = Math.cos(a) * orbitRadius;
        const z = Math.sin(a) * orbitRadius;
        const y = n.y + Math.sin(t * 0.8 + i) * 0.12;
        n.mesh.position.set(x, y, z);
        n.mesh.rotation.y = t * 0.6;
        n.sprite.position.set(x, y + 0.62, z);
        const attr = lineGeoms[i]?.attributes["position"] as THREE.BufferAttribute | undefined;
        if (attr) {
          attr.setXYZ(0, 0, 0, 0);
          attr.setXYZ(1, x, y, z);
          attr.needsUpdate = true;
        }
      });

      core.scale.setScalar(1 + Math.sin(t * 1.4) * 0.02);
      camera.lookAt(tmp.set(0, 0, 0));
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mount.removeEventListener("pointermove", onPointer);
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="size-full"
      role="img"
      aria-label="Interactive 3D visualization of the college AI ecosystem"
    />
  );
}
