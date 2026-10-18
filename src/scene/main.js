/* Syed Mateen · WebGL stage (v4).
   One particle system of ~22k glowing points re-forms into a new shape for every chapter:
   0 hero core + rings · 1 robot (AI agents) · 2 three phones playing real ads (CGI ads) · 3 lead funnel (growth)
   4 workflow graph (automation) · 5 "SAY HELLO" (contact).
   Between shapes the particles swirl through curl-like noise, run hot (colour by speed) and the
   post pass adds chromatic aberration + a short digital glitch: the transition VFX.
   Solid objects (glass crystal, robot, phones) materialise with a dissolve shader once the
   particles settle. Colours follow the site accent (blue / violet / sunset / aurora).
   Bundled with esbuild to static/assets/js/scene.js (classic script, so it runs from file:// too). */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export const ACCENTS = {
  blue: ["#1f6fff", "#7cc4ff"],
  violet: ["#6d4dff", "#d36bff"],
  sunset: ["#ff4d4d", "#ffb347"],
  aurora: ["#00c2a8", "#6ef0ff"],
  // older names, kept so saved choices still work
  purple: ["#6d4dff", "#d36bff"],
  orange: ["#ff4d4d", "#ffb347"],
  green: ["#00c2a8", "#6ef0ff"]
};

(function () {
  const root = document.documentElement;
  const canvas = document.getElementById("stage");
  if (!canvas) return;
  const RENDER = !!window.SCENE_RENDER;
  const reduce = !RENDER && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = !RENDER && matchMedia("(pointer: coarse)").matches;
  const small = !RENDER && Math.min(innerWidth, innerHeight) < 640;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: RENDER, stencil: false });
  } catch (e) { root.classList.add("no-webgl"); resolveReady(); return; }
  if (!renderer.getContext()) { root.classList.add("no-webgl"); resolveReady(); return; }

  function resolveReady() { if (window.__stageReadyResolve) window.__stageReadyResolve(); }

  const BG = 0x040507;
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  let dpr = RENDER ? 1 : Math.min(devicePixelRatio || 1, coarse ? 1.3 : 1.5);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.045);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  camera.position.set(0, 0, 11);

  /* ---------- accent colours ---------- */
  let liftY = 0;
  const colA = new THREE.Color(), colB = new THREE.Color(), tgtA = new THREE.Color(), tgtB = new THREE.Color();
  function readAccent() {
    const key = root.getAttribute("data-accent") || window.SCENE_ACCENT || "blue";
    const pair = ACCENTS[key] || ACCENTS.blue;
    tgtA.set(pair[0]); tgtB.set(pair[1]);
  }
  readAccent(); colA.copy(tgtA); colB.copy(tgtB);
  addEventListener("accentchange", readAccent);

  /* ---------- lights ---------- */
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 6, 6); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const accentLight = new THREE.PointLight(0xffffff, 14, 14, 2); accentLight.position.set(1.5, 1.2, -2.5); scene.add(accentLight);
  const accentLight2 = new THREE.PointLight(0xffffff, 8, 12, 2); accentLight2.position.set(-2, -1.5, 2.5); scene.add(accentLight2);

  /* ---------- helpers ---------- */
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const N = RENDER ? 24000 : coarse || small ? 8000 : 16000;
  const v = new THREE.Vector3();

  function sphereShell(arr, off, count, r, jitter) {
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), rr = r + (rnd() - 0.5) * jitter;
      arr[(off + i) * 3] = Math.cos(a) * s * rr; arr[(off + i) * 3 + 1] = u * rr; arr[(off + i) * 3 + 2] = Math.sin(a) * s * rr;
    }
  }
  function ring(arr, off, count, r, w, tiltX, tiltZ) {
    const m = new THREE.Matrix4().makeRotationX(tiltX).multiply(new THREE.Matrix4().makeRotationZ(tiltZ));
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2, rr = r + (rnd() - 0.5) * w;
      v.set(Math.cos(a) * rr, (rnd() - 0.5) * w * 0.15, Math.sin(a) * rr).applyMatrix4(m);
      arr[(off + i) * 3] = v.x; arr[(off + i) * 3 + 1] = v.y; arr[(off + i) * 3 + 2] = v.z;
    }
  }
  function sampleMeshes(meshes, arr, count, scale, offset) {
    const areas = meshes.map((m) => {
      const g = m.geometry, p = g.attributes.position, idx = g.index; let a = 0;
      const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
      const tri = idx ? idx.count / 3 : p.count / 3;
      for (let t = 0; t < tri; t++) {
        const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
        A.fromBufferAttribute(p, i0); B.fromBufferAttribute(p, i1); C.fromBufferAttribute(p, i2);
        a += B.sub(A).cross(C.sub(A)).length() * 0.5;
      }
      const sc = new THREE.Vector3(); m.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), sc);
      return a * sc.x * sc.y;
    });
    const total = areas.reduce((x, y) => x + y, 0) || 1;
    let k = 0;
    meshes.forEach((m, mi) => {
      const n = mi === meshes.length - 1 ? count - k : Math.round((areas[mi] / total) * count);
      if (n <= 0) return;
      const s = new MeshSurfaceSampler(m).build();
      for (let i = 0; i < n && k < count; i++, k++) {
        s.sample(v); v.applyMatrix4(m.matrixWorld).multiplyScalar(scale).add(offset);
        arr[k * 3] = v.x; arr[k * 3 + 1] = v.y; arr[k * 3 + 2] = v.z;
      }
    });
  }

  /* ---------- three phones that play real ads (used for particles and the solids) ---------- */
  const PHONES = [
    { x: -1.5, y: -0.12, z: -0.55, ry: 0.42, rz: 0.04, s: 0.86, ad: "burger", name: "Burger & fries" },
    { x: 0, y: 0.08, z: 0.35, ry: 0, rz: 0, s: 1, ad: "lumora", name: "Lumora serum" },
    { x: 1.5, y: -0.12, z: -0.55, ry: -0.42, rz: -0.04, s: 0.86, ad: "jabeens", name: "Jabeen's hair oil" }
  ];
  const PH_W = 1.02, PH_H = 1.92, SC_W = 0.92, SC_H = 1.636;
  const phoneGeo = new RoundedBoxGeometry(PH_W, PH_H, 0.08, 4, 0.12);
  function phoneMatrix(ph) {
    return new THREE.Matrix4().compose(new THREE.Vector3(ph.x, ph.y, ph.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ph.ry, ph.rz)), new THREE.Vector3(ph.s, ph.s, ph.s));
  }

  /* ---------- particle targets ---------- */
  const T = [0, 1, 2, 3, 4, 5].map(() => new Float32Array(N * 3));
  const aRnd = new Float32Array(N);
  for (let i = 0; i < N; i++) aRnd[i] = rnd();

  // 0 · hero: core shell + two tilted rings + loose halo
  (() => {
    const a = T[0], n1 = Math.floor(N * 0.42), n2 = Math.floor(N * 0.22), n3 = Math.floor(N * 0.16);
    sphereShell(a, 0, n1, 1.75, 0.12);
    ring(a, n1, n2, 2.75, 0.22, 1.2, 0.25);
    ring(a, n1 + n2, n3, 3.35, 0.12, 1.45, -0.35);
    sphereShell(a, n1 + n2 + n3, N - n1 - n2 - n3, 4.6, 2.4);
  })();
  // 1 · robot: fallback humanoid until the model has loaded
  (() => {
    const a = T[1];
    for (let i = 0; i < N; i++) {
      const r = rnd();
      if (r < 0.28) { v.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(0.7); v.y += 1.25; }
      else if (r < 0.7) { v.set((rnd() - 0.5) * 1.3, (rnd() - 0.5) * 1.4, (rnd() - 0.5) * 0.7); }
      else { const s = rnd() < 0.5 ? -1 : 1; v.set(s * (0.35 + rnd() * 0.15), -0.7 - rnd() * 1.2, (rnd() - 0.5) * 0.3); }
      a[i * 3] = v.x; a[i * 3 + 1] = v.y; a[i * 3 + 2] = v.z;
    }
  })();
  // 2 · three phones
  (() => {
    const meshes = PHONES.map((ph) => { const m = new THREE.Mesh(phoneGeo); m.matrixWorld.copy(phoneMatrix(ph)); return m; });
    sampleMeshes(meshes, T[2], N, 1, new THREE.Vector3());
  })();
  // 3 · funnel: stored as (angle, radius factor, start height); the shader makes it flow
  (() => {
    const a = T[3];
    for (let i = 0; i < N; i++) { a[i * 3] = rnd() * Math.PI * 2; a[i * 3 + 1] = Math.sqrt(rnd()) * 0.35 + 0.65; a[i * 3 + 2] = rnd() * 6 - 3; }
  })();
  // 4 · workflow graph: five nodes and the links between them
  const NODES = [[-3.2, 0.9, 0], [-1.6, -0.5, 0.3], [0, 0.9, 0], [1.6, -0.5, -0.3], [3.2, 0.9, 0]];
  (() => {
    const a = T[4], nn = Math.floor(N * 0.55), per = Math.floor(nn / NODES.length);
    let k = 0;
    NODES.forEach((p, ni) => {
      const cnt = ni === NODES.length - 1 ? nn - k : per;
      for (let i = 0; i < cnt; i++, k++) {
        const u = rnd() * 2 - 1, an = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), r = 0.36 * Math.cbrt(rnd()) + (rnd() < 0.5 ? 0.04 : 0);
        a[k * 3] = p[0] + Math.cos(an) * s * r; a[k * 3 + 1] = p[1] + u * r; a[k * 3 + 2] = p[2] + Math.sin(an) * s * r;
      }
    });
    for (; k < N; k++) {
      const e = Math.floor(rnd() * (NODES.length - 1)), t = rnd(), A = NODES[e], B = NODES[e + 1];
      a[k * 3] = A[0] + (B[0] - A[0]) * t + (rnd() - 0.5) * 0.05;
      a[k * 3 + 1] = A[1] + (B[1] - A[1]) * t + (rnd() - 0.5) * 0.05;
      a[k * 3 + 2] = A[2] + (B[2] - A[2]) * t + (rnd() - 0.5) * 0.05;
    }
  })();
  // 5 · text; filled after fonts load
  function textTarget(word) {
    const c = document.createElement("canvas"); c.width = 1200; c.height = 300;
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    const face = (px) => `600 ${px}px "Unbounded", "Arial Black", Arial, sans-serif`;
    g.font = face(200); const wd = g.measureText(word).width;
    g.font = face(Math.min(200, Math.floor(200 * 1130 / Math.max(1, wd))));
    g.fillText(word, 600, 155);
    const d = g.getImageData(0, 0, 1200, 300).data, pts = [];
    for (let y = 0; y < 300; y += 2) for (let x = 0; x < 1200; x += 2) if (d[(y * 1200 + x) * 4 + 3] > 140) pts.push(x, y);
    const a = T[5], cnt = pts.length / 2;
    for (let i = 0; i < N; i++) {
      if (!cnt) { a[i * 3] = (rnd() - 0.5) * 8; a[i * 3 + 1] = (rnd() - 0.5) * 2; a[i * 3 + 2] = 0; continue; }
      const j = Math.floor(rnd() * cnt) * 2;
      a[i * 3] = ((pts[j] + rnd() * 2) / 1200 - 0.5) * 9.2;
      a[i * 3 + 1] = -((pts[j + 1] + rnd() * 2) / 300 - 0.53) * 2.3;
      a[i * 3 + 2] = (rnd() - 0.5) * 0.25;
    }
    if (geo.attributes.t5) geo.attributes.t5.needsUpdate = true;
  }

  /* ---------- particle material ---------- */
  const NOISE = `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(T[0], 3));
  T.forEach((a, i) => geo.setAttribute("t" + i, new THREE.BufferAttribute(a, 3)));
  geo.setAttribute("aRnd", new THREE.BufferAttribute(aRnd, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);

  const PU = {
    uW: { value: [1, 0, 0, 0, 0, 0] }, uTime: { value: 0 }, uTurb: { value: 0 }, uSize: { value: 26 }, uPix: { value: 1 },
    uColA: { value: colA }, uColB: { value: colB }, uSolid: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 0) }, uFade: { value: 0 }
  };
  const pMat = new THREE.ShaderMaterial({
    uniforms: PU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 t0; attribute vec3 t1; attribute vec3 t2; attribute vec3 t3; attribute vec3 t4; attribute vec3 t5; attribute float aRnd;
      uniform float uW[6]; uniform float uTime; uniform float uTurb; uniform float uSize; uniform float uPix; uniform float uSolid; uniform float uFade;
      uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uMouse;
      varying vec3 vCol; varying float vA;
      ${NOISE}
      mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
      void main(){
        float t = uTime;
        vec3 p0 = rotY(t*0.12) * t0;
        vec3 p1 = rotY(sin(t*0.35)*0.35) * t1;
        vec3 p2 = rotY(sin(t*0.3)*0.18) * t2;
        float y = mod(t3.z - t*(0.32 + aRnd*0.3) + 3.0, 6.0) - 3.0;
        float k = clamp((y + 3.0) / 6.0, 0.0, 1.0);
        float R = (0.22 + 1.9 * pow(k, 1.6)) * t3.y;
        float an = t3.x + t*0.45;
        vec3 p3 = vec3(cos(an)*R, y, sin(an)*R);
        vec3 p4 = t4 + vec3(0.0, sin(t*1.2 + t4.x)*0.04, 0.0);
        vec3 p5 = t5 + vec3(0.0, sin(t*1.5 + t5.x*0.8)*0.04, 0.0);
        vec3 p = p0*uW[0] + p1*uW[1] + p2*uW[2] + p3*uW[3] + p4*uW[4] + p5*uW[5];
        float turb = uTurb;
        vec3 q = p*0.45 + vec3(aRnd*7.0);
        vec3 n = vec3(snoise(q + vec3(t*0.25,0.,0.)), snoise(q + vec3(13.1, t*0.25, 0.)), snoise(q + vec3(0., 27.3, t*0.25)));
        p += n * (0.035 + turb * (1.4 + aRnd*1.4));
        // pointer pushes particles a little
        vec3 d = p - uMouse; float dl = length(d);
        p += normalize(d + 1e-4) * smoothstep(1.4, 0.0, dl) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float sz = uSize * (0.35 + aRnd*aRnd*1.3) * (1.0 + turb*0.9);
        gl_PointSize = sz * uPix / max(0.5, -mv.z);
        // funnel conversion: some particles leave at the Leads and Customers rings
        float leave = (y < 0.9 && aRnd < 0.42 ? 0.0 : 1.0) * (y < -1.4 && aRnd < 0.68 ? 0.0 : 1.0);
        float a = mix(1.0, leave, uW[3]);
        vec3 c = mix(uColA, uColB, smoothstep(0.2, 1.0, aRnd));
        c = mix(c, vec3(1.0), turb * 0.55 * aRnd);            // hot when moving fast
        vCol = c;
        vA = a * (0.5 + aRnd*0.45) * (1.0 - uSolid*0.85) * (1.0 - uFade);
      }`,
    fragmentShader: `
      varying vec3 vCol; varying float vA;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        float a = smoothstep(0.5, 0.0, d); a *= a;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vCol * a * vA, a * vA);
      }`
  });
  const points = new THREE.Points(geo, pMat);
  points.frustumCulled = false;
  scene.add(points);

  /* background dust + soft accent haze */
  const dust = (() => {
    const n = coarse ? 600 : 1400, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (rnd() - 0.5) * 40; p[i * 3 + 1] = (rnd() - 0.5) * 24; p[i * 3 + 2] = -rnd() * 30 + 4; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ size: 0.05, color: 0x9fb3d1, transparent: true, opacity: 0.5, depthWrite: false, sizeAttenuation: true });
    const pts = new THREE.Points(g, m); scene.add(pts); return pts;
  })();
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), new THREE.ShaderMaterial({
    uniforms: { uColA: { value: colA }, uColB: { value: colB }, uTime: { value: 0 }, uOff: { value: new THREE.Vector2(0.62, 0.5) } },
    depthWrite: false, transparent: true,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: `varying vec2 vUv; uniform vec3 uColA; uniform vec3 uColB; uniform float uTime; uniform vec2 uOff;
      void main(){ vec2 p = vUv - uOff; p.x *= 1.75; float d = length(p);
        float g = exp(-d*d*10.0)*0.055 + exp(-length(vUv-vec2(0.18,0.15))*4.0)*0.018;
        vec3 c = mix(uColA, uColB, 0.25 + 0.25*sin(uTime*0.2));
        gl_FragColor = vec4(c*g, 1.0); }`
  }));
  haze.position.z = -14; scene.add(haze);
  haze.material.blending = THREE.AdditiveBlending;

  /* ---------- dissolve: solids materialise out of noise with a glowing edge ---------- */
  const solids = [];
  function dissolve(mat, U) {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uReveal = U.uReveal; sh.uniforms.uEdge = U.uEdge;
      sh.vertexShader = "varying vec3 vDPos;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vDPos = position;");
      sh.fragmentShader = "uniform float uReveal; uniform vec3 uEdge; varying vec3 vDPos;\n" +
        "float dh(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\n" +
        "float dn(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(dh(i),dh(i+vec3(1,0,0)),f.x),mix(dh(i+vec3(0,1,0)),dh(i+vec3(1,1,0)),f.x),f.y),mix(mix(dh(i+vec3(0,0,1)),dh(i+vec3(1,0,1)),f.x),mix(dh(i+vec3(0,1,1)),dh(i+vec3(1,1,1)),f.x),f.y),f.z);}\n" +
        sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          float dnv = dn(vDPos*3.2)*0.65 + dn(vDPos*9.0)*0.35;
          float th = uReveal*1.15 - 0.08;
          if (dnv > th) discard;
          float edge = smoothstep(th - 0.07, th, dnv) * step(uReveal, 0.995);
          totalEmissiveRadiance += uEdge * edge * 4.0;`);
    };
    mat.customProgramCacheKey = () => "dissolve";
  }
  function makeSolid(group, station, offset) {
    const U = { uReveal: { value: 0 }, uEdge: { value: colB } };
    group.traverse((o) => { if (o.isMesh) dissolve(o.material, U); });
    group.visible = false;
    const s = { group, station, U, offset: offset || new THREE.Vector3() };
    solids.push(s); scene.add(group); return s;
  }

  // hero: coloured glass crystal with a glowing core
  const hero = new THREE.Group();
  const crystalMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.06, transmission: 1, thickness: 1.6, ior: 1.65, attenuationColor: colA.clone(), attenuationDistance: 0.7, iridescence: 0.7, iridescenceIOR: 1.4, flatShading: true, envMapIntensity: 1.5, clearcoat: 1 });
  const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), crystalMat);
  const coreMat = new THREE.LineBasicMaterial({ color: colB.clone(), transparent: true, opacity: 0.85, depthTest: false });
  const core = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.55, 1)), coreMat);
  core.renderOrder = 10; hero.add(crystal, core);
  const heroS = makeSolid(hero, 0);

  // AI agents: robot (loaded) on a pedestal
  const robotG = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.14, 64), new THREE.MeshStandardMaterial({ color: 0x0b0d12, metalness: 0.8, roughness: 0.3 }));
  ped.position.y = -2.0; robotG.add(ped);
  const pedRing = new THREE.Mesh(new THREE.TorusGeometry(1.31, 0.015, 8, 160), new THREE.MeshBasicMaterial({ color: colA.clone() }));
  pedRing.rotation.x = Math.PI / 2; pedRing.position.y = -1.92; robotG.add(pedRing);
  const robotS = makeSolid(robotG, 1);
  let mixer = null, actions = {}, robotModel = null;

  // CGI ads: three phones; screens show posters first, then the real ad videos where the browser allows it
  const phonesG = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0d12, metalness: 0.7, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 });
  const screens = [];
  PHONES.forEach((ph) => {
    const g = new THREE.Group();
    g.position.set(ph.x, ph.y, ph.z); g.rotation.set(0, ph.ry, ph.rz); g.scale.setScalar(ph.s);
    const body = new THREE.Mesh(phoneGeo, bodyMat.clone());
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ color: 0xc8c8c8, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    scr.position.z = 0.043; scr.userData = { ad: ph.ad, video: null };
    const notch = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.16, 4, 12), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true }));
    notch.rotation.z = Math.PI / 2; notch.position.set(0, SC_H / 2 - 0.06, 0.046);
    g.add(body, scr, notch); phonesG.add(g); screens.push(scr);
    g.userData.base = g.position.clone();
  });
  const phoneS = makeSolid(phonesG, 2);
  // a canvas texture can always be uploaded; anything else is checked first so file:// pages never break WebGL
  function usable(src) {
    try { const c = document.createElement("canvas"); c.width = c.height = 2; const g = c.getContext("2d"); g.drawImage(src, 0, 0, 2, 2); g.getImageData(0, 0, 1, 1); return true; } catch (e) { return false; }
  }
  function fallbackTex(name) {
    const c = document.createElement("canvas"); c.width = 360; c.height = 640; const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 640); gr.addColorStop(0, "#" + colA.getHexString()); gr.addColorStop(1, "#05070c"); g.fillStyle = gr; g.fillRect(0, 0, 360, 640);
    g.fillStyle = "#fff"; g.font = '600 30px "Unbounded", system-ui, sans-serif'; g.textAlign = "center"; g.fillText(name, 180, 330);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  screens.forEach((scr, i) => {
    scr.material.map = fallbackTex(PHONES[i].name);
    const src = (window.AD_POSTERS && window.AD_POSTERS[scr.userData.ad]) || null;
    if (!src) return;
    const img = new Image();
    img.onload = () => { if (!usable(img)) return; const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; scr.material.map = t; scr.material.needsUpdate = true; };
    img.src = src;
  });
  let videosOn = false;
  function startVideos() {
    if (videosOn || RENDER || reduce) return; videosOn = true;
    const base = canvas.getAttribute("data-ads") || "assets/video/loop/";
    screens.forEach((scr) => {
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto"; v.src = base + scr.userData.ad + ".mp4";
      v.addEventListener("loadeddata", () => {
        if (!usable(v)) return;
        const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
        scr.material.map = t; scr.material.needsUpdate = true; scr.userData.video = v;
      }, { once: true });
      v.load();
    });
  }

  /* labels (canvas sprites) */
  const redraws = [];
  function label(lines, opts) {
    opts = opts || {};
    const W = opts.w || 512, H = opts.h || 140, c = document.createElement("canvas"); c.width = W; c.height = H;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      const g = c.getContext("2d"); g.clearRect(0, 0, W, H);
      if (opts.box) {
        const r = 26; g.beginPath(); g.moveTo(r, 4); g.arcTo(W - 4, 4, W - 4, H - 4, r); g.arcTo(W - 4, H - 4, 4, H - 4, r); g.arcTo(4, H - 4, 4, 4, r); g.arcTo(4, 4, W - 4, 4, r); g.closePath();
        g.fillStyle = "rgba(8,10,16,0.82)"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#" + colA.getHexString(); g.globalAlpha = 0.9; g.stroke(); g.globalAlpha = 1;
      }
      lines.forEach((l, i) => {
        const fs = i === 0 ? opts.size || 44 : Math.round((opts.size || 44) * 0.6);
        g.font = (i === 0 ? "600 " : "500 ") + fs + 'px "Manrope", "Instrument Sans", system-ui, sans-serif';
        g.fillStyle = i === 0 ? "#f2f4f8" : "#" + colB.getHexString(); g.textBaseline = "middle"; g.textAlign = opts.center ? "center" : "left";
        g.fillText(l, opts.center ? W / 2 : 30, H / 2 + (i - (lines.length - 1) / 2) * (opts.size || 44) * 1.05);
      });
      tex.needsUpdate = true;
    };
    draw(); redraws.push(draw);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
    s.scale.set(opts.scale || 1.6, (opts.scale || 1.6) * H / W, 1);
    return s;
  }
  const overlay = new THREE.Group(); scene.add(overlay);
  const bubble = label(["Hi! How can I help?", "Books · answers · follows up"], { box: true, w: 620, h: 180, size: 46, scale: 2.0 });
  bubble.position.set(1.35, 2.35, 0.4); bubble.userData.station = 1; overlay.add(bubble);
  const funnelLabels = [[3, "Visitors"], [0.9, "Leads"], [-1.4, "Customers"]].map(([y, t]) => {
    const l = label([t], { w: 420, h: 110, size: 52, scale: 1.7 });
    const R = 0.22 + 1.9 * Math.pow((y + 3) / 6, 1.6);
    l.position.set(R + 1.15, y, 0); l.userData.station = 3; overlay.add(l); return l;
  });
  const nodeLabels = [["Call", "Phone"], ["AI agent", "Talks & checks"], ["Calendar", "Slot booked"], ["Sheet", "Logged"], ["Email", "Confirmed"]].map((t, i) => {
    const l = label(t, { box: true, w: 420, h: 150, size: 46, scale: 1.25 });
    l.position.set(NODES[i][0], NODES[i][1] + (NODES[i][1] > 0 ? 0.75 : -0.75), 0.3); l.userData.station = 4; overlay.add(l); return l;
  });
  const phoneLabels = PHONES.map((ph) => {
    const l = label([ph.name], { w: 460, h: 100, size: 44, scale: 1.35, center: true });
    l.position.set(ph.x, ph.y - PH_H * ph.s / 2 - 0.28, ph.z + 0.2); l.userData.station = 2; overlay.add(l); return l;
  });
  const pulses = [];
  for (let i = 0; i < NODES.length - 1; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    p.userData = { o: i * 0.22, e: i }; overlay.add(p); pulses.push(p);
  }
  const allLabels = [bubble, ...funnelLabels, ...nodeLabels, ...phoneLabels];

  /* ---------- post: bloom + aberration, glitch, grain, vignette ---------- */
  let composer = null, finalPass = null, bloomPass = null;
  const FX = {
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAmt: { value: 0.0015 }, uGlitch: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform float uAmt; uniform float uGlitch; uniform vec2 uRes; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      void main(){
        vec2 uv = vUv; vec2 c = uv - 0.5;
        float band = floor(uv.y * 34.0);
        float fr = floor(uTime * 24.0);
        float g = step(1.0 - uGlitch * 0.32, h(vec2(band, fr)));
        uv.x += g * (h(vec2(band, fr + 3.0)) - 0.5) * 0.08 * uGlitch;
        float a = uAmt * (0.6 + dot(c, c) * 3.0) + g * 0.006 * uGlitch;
        vec3 col;
        col.r = texture2D(tDiffuse, uv + c * a).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv - c * a).b;
        col += (h(uv * uRes + fract(uTime) * 91.0) - 0.5) * 0.012;
        col *= smoothstep(1.15, 0.28, length(c * vec2(1.0, 0.9)));
        gl_FragColor = vec4(col, 1.0);
      }`
  };
  function buildComposer() {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.32);
    composer.addPass(bloomPass);
    finalPass = new ShaderPass(FX); composer.addPass(finalPass);
    composer.addPass(new OutputPass());
  }
  buildComposer();

  /* ---------- layout ---------- */
  let narrow = false, W = 1, H = 1;
  const OFF = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const SCL = [1, 1, 1, 1, 1, 1];
  function layout(w, h) {
    W = w || innerWidth; H = h || innerHeight;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    if (composer) { composer.setPixelRatio(dpr); composer.setSize(W, H); }
    FX.uniforms.uRes.value.set(W * dpr, H * dpr);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    narrow = W / H < 1.0;
    PU.uPix.value = H * dpr / 900 * (narrow ? 0.85 : 1);
    if (narrow) {
      [0, 1, 2, 3].forEach((i) => { OFF[i].set(0, 1.45, 0); SCL[i] = 0.62; });
      OFF[2].set(0, 1.6, 0); SCL[2] = 0.86;
      OFF[4].set(0, 1.5, 0); SCL[4] = 0.44; OFF[5].set(0, 3.05, 0); SCL[5] = 0.32;
    } else {
      OFF[0].set(2.7, 0.15, 0); SCL[0] = 1;
      OFF[1].set(2.5, 0.05, 0); SCL[1] = 0.84;
      OFF[2].set(2.55, 0.1, 0); SCL[2] = 1.32;
      OFF[3].set(2.5, -0.3, 0); SCL[3] = 0.82;
      OFF[4].set(1.9, 0.2, 0); SCL[4] = 0.68;
      OFF[5].set(0, 1.55, 0); SCL[5] = 0.86;
    }
    haze.material.uniforms.uOff.value.set(narrow ? 0.5 : 0.64, narrow ? 0.62 : 0.5);
  }
  if (!RENDER) addEventListener("resize", () => layout());
  layout(RENDER ? window.SCENE_W : 0, RENDER ? window.SCENE_H : 0);

  /* fonts may arrive late: redraw labels and resample the text */
  function onFonts() { redraws.forEach((f) => f()); textTarget(window.SCENE_WORD || "SAY HELLO"); }
  textTarget(window.SCENE_WORD || "SAY HELLO");
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('600 100px "Unbounded"'), document.fonts.load('500 20px "Manrope"'), document.fonts.ready]).then(onFonts, onFonts);

  /* ---------- robot loading (base64 script so it also works from file://) ---------- */
  let robotDone = false;
  function b64ToBuf(b64) { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  function setupRobot(gltf) {
    robotModel = gltf.scene;
    const meshes = [];
    robotModel.traverse((o) => {
      if (!o.isMesh) return;
      const n = (o.material && o.material.name) || "";
      let mat = new THREE.MeshPhysicalMaterial({ color: 0xa7adb9, metalness: 0.15, roughness: 0.32, clearcoat: 0.5, envMapIntensity: 0.4 });
      if (/grey/i.test(n)) mat = new THREE.MeshStandardMaterial({ color: 0x5d6270, metalness: 0.85, roughness: 0.25 });
      if (/black/i.test(n)) mat = new THREE.MeshStandardMaterial({ color: 0x07080b, roughness: 0.35, emissive: colA.clone(), emissiveIntensity: 0.0 });
      o.material = mat; o.frustumCulled = false; meshes.push(o);
    });
    robotModel.scale.setScalar(0.88); robotModel.position.y = -1.93; robotModel.rotation.y = -0.3;
    robotG.add(robotModel);
    robotModel.traverse((o) => { if (o.isMesh) dissolve(o.material, robotS.U); });
    // sample particles from the model's surface (bind pose), in the group's own space
    const sp = robotG.position.clone(), ss = robotG.scale.clone();
    robotG.position.set(0, 0, 0); robotG.scale.set(1, 1, 1); robotG.updateMatrixWorld(true);
    try {
      const plain = meshes.map((m) => { const mm = new THREE.Mesh(m.geometry); mm.matrixWorld.copy(m.matrixWorld); return mm; });
      sampleMeshes(plain, T[1], N, 1, new THREE.Vector3());
      geo.attributes.t1.needsUpdate = true;
    } catch (e) { /* keep the fallback silhouette */ }
    robotG.position.copy(sp); robotG.scale.copy(ss);
    mixer = new THREE.AnimationMixer(robotModel);
    gltf.animations.forEach((c) => { actions[c.name] = mixer.clipAction(c); });
    if (actions.Idle) actions.Idle.play();
    if (actions.Wave) actions.Wave.setLoop(THREE.LoopOnce, 1);
    mixer.addEventListener("finished", () => { if (actions.Idle) actions.Idle.reset().fadeIn(0.4).play(); });
    robotDone = true;
  }
  let waveAt = -99;
  function wave(t) {
    if (!actions.Wave || t - waveAt < 8) return; waveAt = t;
    if (actions.Idle) actions.Idle.fadeOut(0.3);
    actions.Wave.reset().fadeIn(0.3).play();
  }
  function loadRobot() {
    return new Promise((res) => {
      const parse = () => { try { new GLTFLoader().parse(b64ToBuf(window.ROBOT_GLB_B64), "", (g) => { setupRobot(g); res(); }, () => res()); } catch (e) { res(); } };
      if (window.ROBOT_GLB_B64) return parse();
      const s = document.createElement("script"); s.src = canvas.getAttribute("data-robot") || "assets/models/robot.js"; s.async = true;
      s.onload = () => (window.ROBOT_GLB_B64 ? parse() : res()); s.onerror = () => res();
      document.head.appendChild(s);
      setTimeout(res, 9000);
    });
  }

  /* ---------- per-frame ---------- */
  const W6 = [0, 0, 0, 0, 0, 0];
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), tmp = new THREE.Vector3();
  const mouseW = new THREE.Vector3(99, 99, 0), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  let mxS = 0, myS = 0;
  function weights(p) {
    for (let i = 0; i < 6; i++) W6[i] = Math.max(0, 1 - Math.abs(p - i));
    // ease each blend so shapes hold longer and transition faster
    const f = p - Math.floor(p), i0 = Math.min(5, Math.floor(p)), i1 = Math.min(5, i0 + 1);
    const e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
    for (let i = 0; i < 6; i++) W6[i] = 0;
    W6[i0] += 1 - e; W6[i1] += e;
    return 4 * e * (1 - e); // turbulence: 1 at the middle of a transition
  }
  function draw(time, dt, prog, mx, my, mouse) {
    prog = Math.min(5, Math.max(0, prog));
    const turb = weights(prog);
    PU.uW.value = W6.slice(); PU.uTime.value = time; PU.uTurb.value = reduce ? 0 : turb;
    colA.lerp(tgtA, Math.min(1, dt * 3)); colB.lerp(tgtB, Math.min(1, dt * 3));
    accentLight.color.copy(colA); accentLight2.color.copy(colB);
    crystalMat.attenuationColor.copy(colA); coreMat.color.copy(colB).multiplyScalar(2.2);
    pedRing.material.color.copy(colA).multiplyScalar(2);
    pulses.forEach((p) => p.material.color.copy(colB).multiplyScalar(2));

    // where the particle object sits and how big it is (blend of station layouts)
    tmp.set(0, 0, 0); let sc = 0;
    for (let i = 0; i < 6; i++) { tmp.addScaledVector(OFF[i], W6[i]); sc += SCL[i] * W6[i]; }
    tmp.y += liftY * W6[5]; // keep "SAY HELLO" above the contact heading while the footer scrolls in
    points.position.copy(tmp); points.scale.setScalar(sc);
    overlay.position.copy(tmp); overlay.scale.setScalar(sc);

    // solids: fade in once particles have settled on their station
    let solid = 0;
    solids.forEach((s) => {
      const w = W6[s.station], r = reduce ? (w > 0.5 ? 1 : 0) : Math.min(1, Math.max(0, (w - 0.72) / 0.26));
      s.U.uReveal.value = r; s.group.visible = r > 0.001;
      s.group.position.copy(OFF[s.station]); s.group.scale.setScalar(SCL[s.station]);
      if (s.station !== 0) solid = Math.max(solid, r);
    });
    PU.uSolid.value = solid;
    // hero crystal motion
    crystal.rotation.x = time * 0.21; crystal.rotation.y = time * 0.3; core.rotation.set(-time * 0.3, -time * 0.4, 0); core.scale.setScalar(1 + Math.sin(time * 2.2) * 0.05);
    // robot
    if (mixer && robotS.group.visible) mixer.update(dt);
    if (robotModel) robotModel.rotation.y = -0.3 + mx * 0.5;
    if (W6[1] > 0.95 && !RENDER) wave(time);
    // phones: gentle float, screens fade in with the solids, videos play only while visible
    if (W6[2] > 0.3) startVideos();
    phonesG.children.forEach((g, i) => { g.position.y = g.userData.base.y + Math.sin(time * 0.9 + i * 1.7) * 0.06; });
    phonesG.rotation.y = mx * 0.35 + Math.sin(time * 0.3) * 0.12;
    const rv = phoneS.U.uReveal.value;
    screens.forEach((scr) => {
      scr.material.opacity = Math.max(0, (rv - 0.35) / 0.65);
      const v = scr.userData.video;
      if (v) { if (rv > 0.05 && v.paused) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } else if (rv <= 0.05 && !v.paused) v.pause(); }
    });
    // labels and pulses
    allLabels.forEach((l) => { const w = W6[l.userData.station]; l.material.opacity = Math.max(0, (w - 0.8) / 0.2); });
    bubble.position.y = 2.35 + Math.sin(time * 1.2) * 0.06;
    pulses.forEach((p) => { const A = NODES[p.userData.e], B = NODES[p.userData.e + 1], u = (time * 0.45 + p.userData.o) % 1; p.position.set(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u); p.material.opacity = Math.max(0, (W6[4] - 0.8) / 0.2); });

    // camera: slow drift, mouse parallax, push-in and roll while particles travel
    mxS += (mx - mxS) * 0.06; myS += (my - myS) * 0.06;
    camPos.set(mxS * 0.9, -myS * 0.5 + 0.1, (narrow ? 14.5 : 11) - turb * 1.2);
    camera.position.copy(camPos);
    camLook.set(mxS * 0.3, 0, 0); camera.lookAt(camLook);
    camera.rotation.z += Math.sin(prog * Math.PI) * 0.0 + turb * 0.04 * (Math.floor(prog) % 2 ? -1 : 1);
    dust.rotation.y = time * 0.01;
    haze.material.uniforms.uTime.value = time;

    // pointer in world space at the particle plane
    if (mouse) { ray.setFromCamera(mouse, camera); if (ray.ray.intersectPlane(plane, mouseW)) PU.uMouse.value.copy(mouseW).sub(points.position).divideScalar(Math.max(0.01, sc)); }

    if (finalPass) { FX.uniforms.uTime.value = time; FX.uniforms.uAmt.value = 0.001 + turb * 0.006; FX.uniforms.uGlitch.value = reduce ? 0 : Math.max(0, turb - 0.35) * 0.55; }
    if (bloomPass) bloomPass.strength = 0.5 + turb * 0.45;
    if (composer) composer.render(); else renderer.render(scene, camera);
    window.__stage = { progress: prog, turb, accent: "#" + colA.getHexString() };
  }

  /* ---------- render mode (records the reel) ---------- */
  if (RENDER) {
    let lastT = 0;
    window.sceneReady = loadRobot().then(() => (document.fonts ? document.fonts.ready : null)).then(() => onFonts());
    window.sceneWave = () => { if (actions.Wave) { waveAt = -99; wave(999); } };
    window.sceneRender = (t, p, mx, my) => { const dt = Math.max(0, Math.min(0.05, t - lastT)); lastT = t; draw(t, dt, p, mx || 0, my || 0, null); };
    return;
  }

  /* ---------- live: scroll drives the morph ---------- */
  const lastStation = document.querySelector('[data-station="5"]');
  const anchors = Array.prototype.map.call(document.querySelectorAll("[data-station]"), (el) => ({ el, v: parseFloat(el.getAttribute("data-station")) }));
  const covers = Array.prototype.slice.call(document.querySelectorAll("[data-cover]"));
  function targetIdx() {
    const mid = innerHeight * 0.5;
    const cs = anchors.map((a) => { const r = a.el.getBoundingClientRect(); return { c: r.top + Math.min(r.height, innerHeight) / 2 - mid, v: a.v }; });
    if (!cs.length || cs[0].c >= 0) return cs.length ? cs[0].v : 0;
    for (let i = 0; i < cs.length - 1; i++) if (cs[i].c <= 0 && cs[i + 1].c >= 0) { const k = -cs[i].c / (cs[i + 1].c - cs[i].c); return cs[i].v + (cs[i + 1].v - cs[i].v) * k; }
    return cs[cs.length - 1].v;
  }
  function covered() { for (const c of covers) { const r = c.getBoundingClientRect(); if (r.top <= 0 && r.bottom >= innerHeight) return true; } return false; }
  let mx = 0, my = 0;
  const mouseN = new THREE.Vector2(9, 9);
  addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; mouseN.set(mx * 2, -my * 2); }, { passive: true });
  addEventListener("pointerleave", () => mouseN.set(9, 9));

  let idx = targetIdx(), last = performance.now(), time = 0, frames = 0, acc = 0, tuned = false, started = false;
  function frame(now) {
    requestAnimationFrame(frame);
    const realDt = Math.min((now - last) / 1000, 0.3), dt = Math.min(realDt, 0.05); last = now;
    if (document.hidden || covered()) return;
    if (!reduce) time += dt;
    if (!tuned) { frames++; if (frames > 20) acc += dt; if (frames === 80) { if (acc / 60 > 0.026) { dpr = 1; layout(); if (acc / 60 > 0.04) { composer = null; finalPass = null; bloomPass = null; } } tuned = true; } }
    const t = targetIdx();
    if (lastStation) { const top = lastStation.getBoundingClientRect().top; liftY = Math.max(0, -top) / innerHeight * 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); }
    idx += (t - idx) * (reduce ? 1 : 1 - Math.exp(-realDt * 2.6));
    draw(time, dt, idx, mx, my, coarse ? null : mouseN);
    if (!started) { started = true; root.classList.add("stage-on"); }
  }
  // compile shaders and load the robot before the preloader lets people in
  const ready = loadRobot().then(() => { try { renderer.compile(scene, camera); } catch (e) {} });
  ready.then(resolveReady);
  requestAnimationFrame(frame);
})();
