/* DTTC Simulator Demo - Three.js
   6-Phase FSM: TAKEOFF → RECON → STRIKE → RETURN → LANDING → DEBRIEF
*/

(function () {
  const canvas = document.getElementById('sim-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const PHASES = [
    { id: 'TAKEOFF', label: '이륙' },
    { id: 'RECON', label: '정찰' },
    { id: 'STRIKE', label: '정밀 타격' },
    { id: 'RETURN', label: '귀환' },
    { id: 'LANDING', label: '착륙' },
    { id: 'DEBRIEF', label: '임무 결과' },
  ];

  let phaseIdx = 0;
  let phaseTime = 0;
  let missionScore = 0;
  let strikeFired = false;

  // -------- Renderer / Scene / Camera --------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1e42);
  scene.fog = new THREE.Fog(0x0a1e42, 80, 260);

  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 600);
  camera.position.set(0, 18, 40);
  camera.lookAt(0, 4, 0);

  // -------- Lights --------
  const ambient = new THREE.AmbientLight(0x6688aa, 0.55);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffe8c2, 0.9);
  sun.position.set(60, 120, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  // -------- Ground / Terrain --------
  const groundGeo = new THREE.PlaneGeometry(400, 400, 80, 80);
  const positions = groundGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i);
    const h = Math.sin(x * 0.05) * Math.cos(y * 0.07) * 1.5
            + Math.sin(x * 0.12 + 1) * 0.6;
    positions.setZ(i, h);
  }
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshStandardMaterial({ color: 0x1a3a2e, flatShading: true, metalness: 0.05, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid overlay
  const grid = new THREE.GridHelper(400, 80, 0x2c5e8c, 0x1c3c5c);
  grid.position.y = 0.05;
  grid.material.opacity = 0.32;
  grid.material.transparent = true;
  scene.add(grid);

  // -------- Home Pad (HOME) --------
  const padGeo = new THREE.CircleGeometry(4, 32);
  const pad = new THREE.Mesh(padGeo, new THREE.MeshStandardMaterial({ color: 0xE85D1B, emissive: 0x5c2607 }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.15, 0);
  scene.add(pad);
  const padRing = new THREE.Mesh(
    new THREE.RingGeometry(4.4, 4.7, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  );
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.y = 0.16;
  scene.add(padRing);

  // -------- Target Building --------
  const targetGroup = new THREE.Group();
  const targetPos = new THREE.Vector3(50, 0, -45);
  targetGroup.position.copy(targetPos);
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x6b6f74, roughness: 0.85 });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 8), buildingMat);
  b1.position.y = 4; b1.castShadow = true;
  targetGroup.add(b1);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(5, 12, 5), buildingMat);
  b2.position.set(6, 6, 2); b2.castShadow = true;
  targetGroup.add(b2);
  // Target marker - red ring on top
  const targetRing = new THREE.Mesh(
    new THREE.RingGeometry(4, 5, 32),
    new THREE.MeshBasicMaterial({ color: 0xff3c2e, side: THREE.DoubleSide })
  );
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.position.set(0, 12.2, 0);
  targetGroup.add(targetRing);
  scene.add(targetGroup);

  // -------- Drone --------
  const droneGroup = new THREE.Group();
  scene.add(droneGroup);
  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.3, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x111a2c, metalness: 0.6, roughness: 0.4 })
  );
  body.castShadow = true;
  droneGroup.add(body);
  // Camera bulb
  const cameraBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xE85D1B, emissive: 0x4a1d05 })
  );
  cameraBulb.position.set(0, -0.18, 0.4);
  droneGroup.add(cameraBulb);
  // Arms + Rotors
  const armMat = new THREE.MeshStandardMaterial({ color: 0x202a3a });
  const rotors = [];
  const armPositions = [
    [ 0.7, 0,  0.7],
    [-0.7, 0,  0.7],
    [ 0.7, 0, -0.7],
    [-0.7, 0, -0.7],
  ];
  for (const [x, y, z] of armPositions) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 8), armMat);
    arm.position.set(x * 0.5, y, z * 0.5);
    arm.rotation.z = Math.PI / 2;
    arm.lookAt(x, 0, z);
    droneGroup.add(arm);
    const rotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.55 })
    );
    rotor.position.set(x, 0.18, z);
    droneGroup.add(rotor);
    rotors.push(rotor);
  }
  droneGroup.position.set(0, 0.4, 0);

  // -------- Waypoints (visual) --------
  const waypoints = [
    new THREE.Vector3(0, 12, 0),     // takeoff hover
    new THREE.Vector3(20, 18, -20),  // recon
    new THREE.Vector3(50, 22, -45),  // strike (over target)
    new THREE.Vector3(20, 18, -10),  // return mid
    new THREE.Vector3(0, 14, 0),     // landing approach
    new THREE.Vector3(0, 0.4, 0),    // landing/debrief
  ];
  const wpGroup = new THREE.Group();
  scene.add(wpGroup);
  waypoints.forEach((w, i) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: i === 2 ? 0xff3c2e : 0xE85D1B, transparent: true, opacity: 0.55 })
    );
    m.position.copy(w);
    wpGroup.add(m);
  });

  // -------- Path Line --------
  const pathGeo = new THREE.BufferGeometry().setFromPoints(waypoints);
  const path = new THREE.Line(pathGeo, new THREE.LineDashedMaterial({ color: 0xE85D1B, dashSize: 1.4, gapSize: 0.8, opacity: 0.7, transparent: true }));
  path.computeLineDistances();
  scene.add(path);

  // -------- Particle: Strike Effect --------
  let strikeEffect = null;
  function spawnStrike(pos) {
    const geom = new THREE.SphereGeometry(0.5, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 1 });
    strikeEffect = new THREE.Mesh(geom, mat);
    strikeEffect.position.copy(pos);
    strikeEffect.life = 1.0;
    scene.add(strikeEffect);
  }

  // -------- Input --------
  const keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
    if (e.code === 'KeyR') resetMission();
    if (e.code === 'KeyN') advancePhase();
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  // Restart button binding
  const restartBtn = document.getElementById('sim-restart');
  if (restartBtn) restartBtn.addEventListener('click', resetMission);
  const nextBtn = document.getElementById('sim-next');
  if (nextBtn) nextBtn.addEventListener('click', advancePhase);

  // -------- HUD update --------
  const hudPhase = document.getElementById('hud-phase');
  const hudAlt = document.getElementById('hud-alt');
  const hudSpd = document.getElementById('hud-spd');
  const hudWp = document.getElementById('hud-wp');
  const hudScore = document.getElementById('hud-score');

  function updatePhaseBar() {
    document.querySelectorAll('.sim-phase').forEach((el, i) => {
      el.classList.toggle('active', i === phaseIdx);
    });
  }

  function advancePhase() {
    if (phaseIdx < PHASES.length - 1) {
      phaseIdx++;
      phaseTime = 0;
      if (PHASES[phaseIdx].id === 'STRIKE') strikeFired = false;
      if (PHASES[phaseIdx].id === 'DEBRIEF') {
        missionScore = Math.max(60, Math.min(100, Math.floor(70 + Math.random() * 25)));
      }
      updatePhaseBar();
    }
  }

  function resetMission() {
    phaseIdx = 0;
    phaseTime = 0;
    droneGroup.position.set(0, 0.4, 0);
    droneVel.set(0, 0, 0);
    strikeFired = false;
    missionScore = 0;
    if (strikeEffect) { scene.remove(strikeEffect); strikeEffect = null; }
    updatePhaseBar();
  }

  // -------- Drone Auto / Manual --------
  const droneVel = new THREE.Vector3();
  let lastTime = performance.now();

  function update() {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    phaseTime += dt;

    // Rotor spin
    rotors.forEach((r, i) => { r.rotation.y += dt * (i % 2 === 0 ? 60 : -60); });

    const phase = PHASES[phaseIdx].id;
    const target = waypoints[phaseIdx];

    // Manual override (W/A/S/D + Space/Shift)
    const speed = 14;
    let manual = false;
    const dir = new THREE.Vector3();
    if (keys['KeyW']) { dir.z -= 1; manual = true; }
    if (keys['KeyS']) { dir.z += 1; manual = true; }
    if (keys['KeyA']) { dir.x -= 1; manual = true; }
    if (keys['KeyD']) { dir.x += 1; manual = true; }
    if (keys['Space']) { dir.y += 1; manual = true; }
    if (keys['ShiftLeft'] || keys['ShiftRight']) { dir.y -= 1; manual = true; }

    if (manual) {
      dir.normalize().multiplyScalar(speed);
      droneVel.lerp(dir, 0.18);
    } else {
      // Autopilot toward current waypoint
      const toTarget = new THREE.Vector3().subVectors(target, droneGroup.position);
      const dist = toTarget.length();
      if (dist > 0.6) {
        toTarget.normalize().multiplyScalar(Math.min(speed, dist * 1.6));
        droneVel.lerp(toTarget, 0.07);
      } else {
        droneVel.lerp(new THREE.Vector3(0, 0, 0), 0.18);
        // Auto-advance after a hover/pause at waypoint
        const pauseTime = (phase === 'STRIKE') ? 1.2 : (phase === 'LANDING' ? 1.0 : 0.6);
        if (phaseTime > pauseTime + 1.5) advancePhase();
      }
    }
    droneGroup.position.addScaledVector(droneVel, dt);
    if (droneGroup.position.y < 0.4) droneGroup.position.y = 0.4;

    // Tilt drone in motion direction (cosmetic)
    droneGroup.rotation.x = THREE.MathUtils.clamp(-droneVel.z * 0.04, -0.3, 0.3);
    droneGroup.rotation.z = THREE.MathUtils.clamp(droneVel.x * 0.04, -0.3, 0.3);

    // Strike trigger
    if (phase === 'STRIKE' && !strikeFired) {
      const distToTarget = droneGroup.position.distanceTo(targetPos);
      if (distToTarget < 12 && phaseTime > 0.8) {
        spawnStrike(new THREE.Vector3(targetPos.x, 12.5, targetPos.z));
        strikeFired = true;
        targetGroup.children.forEach(c => {
          if (c.material && c.material.color) {
            c.material.emissive = new THREE.Color(0x551a05);
          }
        });
      }
    }
    if (strikeEffect) {
      strikeEffect.life -= dt * 0.9;
      strikeEffect.scale.setScalar(1 + (1 - strikeEffect.life) * 6);
      strikeEffect.material.opacity = Math.max(strikeEffect.life, 0);
      if (strikeEffect.life <= 0) { scene.remove(strikeEffect); strikeEffect = null; }
    }

    // Camera follow (smooth)
    const camTarget = new THREE.Vector3(
      droneGroup.position.x - 18,
      droneGroup.position.y + 14,
      droneGroup.position.z + 24
    );
    camera.position.lerp(camTarget, 0.04);
    camera.lookAt(droneGroup.position);

    // HUD
    if (hudPhase) hudPhase.innerHTML = `<strong>PHASE ${String(phaseIdx + 1).padStart(2, '0')}</strong> ${PHASES[phaseIdx].label}`;
    if (hudAlt)   hudAlt.innerHTML   = `<strong>ALT</strong> ${droneGroup.position.y.toFixed(1)} m`;
    if (hudSpd)   hudSpd.innerHTML   = `<strong>SPD</strong> ${droneVel.length().toFixed(1)} m/s`;
    if (hudWp)    hudWp.innerHTML    = `<strong>WP</strong> ${(phaseIdx + 1)}/${PHASES.length}`;
    if (hudScore) hudScore.innerHTML = `<strong>SCORE</strong> ${missionScore || '—'}`;

    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }

  // Resize
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  updatePhaseBar();
  onResize();
  requestAnimationFrame(update);
})();
