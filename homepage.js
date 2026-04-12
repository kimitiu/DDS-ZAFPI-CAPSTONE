const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const homeRoot = document.querySelector("[data-home-page]");
if (homeRoot) {
  initHomepage().catch(() => {
    enableFallback();
  });
}

async function initHomepage() {
  const stage = document.getElementById("demoStage");
  const canvasContainer = document.getElementById("canvasContainer");
  const fallbackScene = document.getElementById("fallbackScene");
  const focusToggle = document.getElementById("focusToggle");
  const storyLines = Array.from(document.querySelectorAll(".story-line"));
  const simTime = document.getElementById("simTime");
  const latestRecord = document.getElementById("latestRecord");
  const latestNarrative = document.getElementById("latestNarrative");
  const visibilityValue = document.getElementById("visibilityValue");
  const visibilityNarrative = document.getElementById("visibilityNarrative");
  const housesMeta = document.getElementById("housesMeta");
  const passesMeta = document.getElementById("passesMeta");
  const syncMeta = document.getElementById("syncMeta");
  const housesCount = document.getElementById("housesCount");
  const passesCount = document.getElementById("passesCount");
  const syncCount = document.getElementById("syncCount");
  const feedCount = document.getElementById("feedCount");
  const mortalityCount = document.getElementById("mortalityCount");
  const alertCount = document.getElementById("alertCount");
  const dailyBar = document.getElementById("dailyBar");
  const dailyLabel = document.getElementById("dailyLabel");
  const syncBar = document.getElementById("syncBar");
  const syncLabel = document.getElementById("syncLabel");
  const utilBar = document.getElementById("utilBar");
  const utilLabel = document.getElementById("utilLabel");
  const ringVisual = document.getElementById("ringVisual");
  const ringValue = document.getElementById("ringValue");
  const stateMode = document.getElementById("stateMode");
  const toast = document.getElementById("simToast");
  const toastText = document.getElementById("simToastText");

  if (!stage || !canvasContainer) return;

  const { default: THREE } = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");

  if (!window.WebGLRenderingContext) {
    throw new Error("WebGL unavailable");
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !prefersReducedMotion.matches;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  canvasContainer.appendChild(renderer.domElement);

  fallbackScene.hidden = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xdce4d7, 18, 42);

  const camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 100);
  camera.position.set(7.2, 4.6, 14.4);

  scene.add(new THREE.AmbientLight(0xf6f7f1, 1.85));

  const sunLight = new THREE.DirectionalLight(0xfff2d2, 2.8);
  sunLight.position.set(7, 11, 8);
  sunLight.castShadow = !prefersReducedMotion.matches;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  scene.add(sunLight);

  const fillLight = new THREE.PointLight(0x8bc1ff, 10, 40, 2);
  fillLight.position.set(-8, 5, 8);
  scene.add(fillLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x6f9b58, roughness: 0.92 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const serviceRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 32),
    new THREE.MeshStandardMaterial({ color: 0xd8cab0, roughness: 0.94 })
  );
  serviceRoad.rotation.x = -Math.PI / 2;
  serviceRoad.position.set(0, 0.01, 3);
  scene.add(serviceRoad);

  const beltGroup = new THREE.Group();
  scene.add(beltGroup);

  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.42, 26),
    new THREE.MeshStandardMaterial({ color: 0x30363d, roughness: 0.72, metalness: 0.35 })
  );
  belt.position.set(0, 1.35, 0);
  belt.receiveShadow = true;
  belt.castShadow = true;
  beltGroup.add(belt);

  const railMaterial = new THREE.MeshStandardMaterial({ color: 0xaeb7bb, roughness: 0.32, metalness: 0.84 });
  const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.56, 26), railMaterial);
  leftRail.position.set(-2.32, 1.86, 0);
  const rightRail = leftRail.clone();
  rightRail.position.x = 2.32;
  beltGroup.add(leftRail, rightRail);

  const crateMaterial = new THREE.MeshStandardMaterial({ color: 0xc5914b, roughness: 0.82 });
  for (let index = 0; index < 4; index += 1) {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), crateMaterial);
    crate.position.set(-4.2 + index * 2.8, 0.52, 11.8);
    crate.castShadow = true;
    crate.receiveShadow = true;
    scene.add(crate);
  }

  const barnGroup = new THREE.Group();
  scene.add(barnGroup);

  const barnMaterial = new THREE.MeshStandardMaterial({ color: 0x25584a, roughness: 0.78 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x223647, roughness: 0.62, metalness: 0.22 });

  const barnBase = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 7.6), barnMaterial);
  barnBase.position.set(-10, 3.05, -7.5);
  barnBase.castShadow = true;
  barnBase.receiveShadow = true;
  barnGroup.add(barnBase);

  const barnRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 3.5, 4), roofMaterial);
  barnRoof.position.set(-10, 7.25, -7.5);
  barnRoof.rotation.y = Math.PI / 4;
  barnRoof.castShadow = true;
  barnGroup.add(barnRoof);

  const shed = new THREE.Mesh(new THREE.BoxGeometry(7, 4.2, 5.2), barnMaterial);
  shed.position.set(10, 2.15, -8.5);
  shed.castShadow = true;
  scene.add(shed);

  const shedRoof = new THREE.Mesh(new THREE.ConeGeometry(3.7, 2.4, 4), roofMaterial);
  shedRoof.position.set(10, 5.2, -8.5);
  shedRoof.rotation.y = Math.PI / 4;
  shedRoof.castShadow = true;
  scene.add(shedRoof);

  const siloMaterial = new THREE.MeshStandardMaterial({ color: 0xbdc5cb, roughness: 0.44, metalness: 0.5 });
  const silo = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 7.8, 20), siloMaterial);
  silo.position.set(4.8, 3.9, -7.8);
  silo.castShadow = true;
  scene.add(silo);

  const siloCap = new THREE.Mesh(new THREE.SphereGeometry(1.45, 20, 20), siloMaterial);
  siloCap.position.set(4.8, 7.8, -7.8);
  siloCap.scale.y = 0.72;
  siloCap.castShadow = true;
  scene.add(siloCap);

  const houseRows = new THREE.Group();
  scene.add(houseRows);
  const houseMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f6ef, roughness: 0.82 });
  for (let index = 0; index < 8; index += 1) {
    const smallHouse = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 2.4), houseMaterial);
    smallHouse.position.set(-14 + index * 3.7, 0.62, -15.2);
    smallHouse.castShadow = true;
    houseRows.add(smallHouse);
  }

  const beltStripeCanvas = document.createElement("canvas");
  beltStripeCanvas.width = 32;
  beltStripeCanvas.height = 320;
  const stripeContext = beltStripeCanvas.getContext("2d");
  stripeContext.fillStyle = "#2a3036";
  stripeContext.fillRect(0, 0, beltStripeCanvas.width, beltStripeCanvas.height);
  stripeContext.fillStyle = "rgba(255,255,255,0.08)";
  for (let y = 0; y < beltStripeCanvas.height; y += 30) {
    stripeContext.fillRect(0, y, beltStripeCanvas.width, 14);
  }
  const beltTexture = new THREE.CanvasTexture(beltStripeCanvas);
  beltTexture.wrapS = THREE.RepeatWrapping;
  beltTexture.wrapT = THREE.RepeatWrapping;
  beltTexture.repeat.set(1, 5);
  belt.material.map = beltTexture;
  belt.material.needsUpdate = true;

  const eggMaterials = {
    jumbo: new THREE.MeshStandardMaterial({ color: 0xf3ebe0, roughness: 0.3 }),
    large: new THREE.MeshStandardMaterial({ color: 0xe6cfb8, roughness: 0.32 }),
    small: new THREE.MeshStandardMaterial({ color: 0xe2dbc9, roughness: 0.36 }),
    reject: new THREE.MeshStandardMaterial({ color: 0xc98f7e, roughness: 0.45 })
  };

  const eggOptions = [
    { key: "jumbo", label: "Super Jumbo sync", weight: 0.18 },
    { key: "large", label: "Large grade encoded", weight: 0.42 },
    { key: "small", label: "Medium tray passed", weight: 0.28 },
    { key: "reject", label: "Exception flagged", weight: 0.12 }
  ];

  const eggs = [];
  const eggGeometry = new THREE.SphereGeometry(0.34, 28, 28);
  for (let index = 0; index < 20; index += 1) {
    const egg = new THREE.Mesh(eggGeometry, eggMaterials.large);
    egg.scale.set(0.88, 1.14, 0.88);
    egg.visible = false;
    egg.castShadow = true;
    egg.userData = { active: false, speed: 1, spin: 0, label: "" };
    scene.add(egg);
    eggs.push(egg);
  }

  let captureMode = false;
  let passesLogged = 126;
  let syncPercent = 95;
  let utilization = 57;
  let activeHouses = 14;
  let feedMatch = 88;
  let alertTotal = 6;
  let dailyProgress = 81;
  let toastTimer = 0;
  let storyIndex = 0;
  let spawnTimer = 0;
  let elapsed = 0;
  let lastToastAt = 0;
  let focusView = false;

  const showToast = (message) => {
    const now = performance.now();
    if (now - lastToastAt < 700) return;
    lastToastAt = now;
    toastText.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
  };

  const setStory = (index) => {
    storyLines.forEach((line, lineIndex) => {
      line.classList.toggle("is-active", lineIndex === index);
    });
  };

  setStory(0);

  if (!prefersReducedMotion.matches && storyLines.length > 1) {
    window.setInterval(() => {
      storyIndex = (storyIndex + 1) % storyLines.length;
      setStory(storyIndex);
    }, 3600);
  }

  const chooseEgg = () => {
    let cursor = Math.random();
    for (const option of eggOptions) {
      cursor -= option.weight;
      if (cursor <= 0) return option;
    }
    return eggOptions[1];
  };

  const spawnEgg = () => {
    const egg = eggs.find((item) => !item.userData.active);
    if (!egg) return;
    const choice = chooseEgg();
    egg.visible = true;
    egg.material = eggMaterials[choice.key];
    egg.position.set((Math.random() - 0.5) * 0.6, 1.82, -10.6);
    egg.rotation.set(Math.random() * 0.24, Math.random() * Math.PI, 0);
    egg.userData.active = true;
    egg.userData.speed = captureMode ? 7.8 : 4.2;
    egg.userData.spin = (Math.random() - 0.5) * 0.06;
    egg.userData.label = choice.label;
  };

  const updateDashboard = () => {
    const targetSync = captureMode ? 97 : 95;
    const targetUtilization = captureMode ? 64 : 57;
    const targetFeed = captureMode ? 96 : 88;
    const targetDaily = captureMode ? 95 : 81;
    const targetAlerts = captureMode ? 3 : 6;
    const targetHouses = captureMode ? 24 : 14;

    syncPercent += (targetSync - syncPercent) * 0.025;
    utilization += (targetUtilization - utilization) * 0.022;
    feedMatch += (targetFeed - feedMatch) * 0.026;
    dailyProgress += (targetDaily - dailyProgress) * 0.026;
    alertTotal += (targetAlerts - alertTotal) * 0.04;
    activeHouses += (targetHouses - activeHouses) * 0.028;

    const roundedSync = Math.round(syncPercent);
    const roundedUtilization = Math.round(utilization);
    const roundedFeed = Math.round(feedMatch);
    const roundedDaily = Math.round(dailyProgress);
    const roundedAlerts = Math.max(1, Math.round(alertTotal));
    const roundedHouses = Math.max(1, Math.round(activeHouses));

    visibilityValue.textContent = `${roundedUtilization}%`;
    visibilityNarrative.textContent = captureMode
      ? "Field encoding, sync checks, and same-day review are moving together."
      : "The baseline shows why ZAFPI needs same-day operational visibility.";
    latestRecord.textContent = captureMode ? "Passes are syncing live" : "Awaiting next field pass";
    latestNarrative.textContent = captureMode
      ? "From the belt to the tablet, each pass becomes a record."
      : "Monitoring the current-state baseline before capture begins.";
    housesCount.textContent = `${roundedHouses} / 24`;
    if (housesMeta) housesMeta.textContent = `${roundedHouses} / 24`;
    passesCount.textContent = String(passesLogged).padStart(3, "0");
    if (passesMeta) passesMeta.textContent = String(passesLogged).padStart(3, "0");
    syncCount.textContent = `${roundedSync}%`;
    if (syncMeta) syncMeta.textContent = `${roundedSync}%`;
    feedCount.textContent = `${roundedFeed}%`;
    mortalityCount.textContent = "2 verified";
    alertCount.textContent = `${roundedAlerts} open`;
    dailyLabel.textContent = `${roundedDaily}% of daily reporting target`;
    syncLabel.textContent = `${roundedSync}% same-day sync confidence`;
    utilLabel.textContent = `${roundedUtilization}% utilization pathway`;
    dailyBar.style.setProperty("--fill", `${roundedDaily}%`);
    syncBar.style.setProperty("--fill", `${roundedSync}%`);
    utilBar.style.setProperty("--fill", `${roundedUtilization}%`);
    ringVisual.style.setProperty("--ring-fill", roundedSync);
    ringValue.textContent = `${roundedSync}%`;
    stateMode.textContent = captureMode ? "Capture active" : "Monitoring baseline";
  };

  const handleCaptureStart = () => {
    if (captureMode) return;
    captureMode = true;
    showToast("Capture mode is live. Same-day reporting now feels immediate and controlled.");
  };

  const handleCaptureEnd = () => {
    captureMode = false;
  };

  const setTime = () => {
    simTime.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  setTime();
  window.setInterval(setTime, 1000);

  focusToggle?.addEventListener("click", () => {
    focusView = !focusView;
    stage.classList.toggle("is-focus", focusView);
    focusToggle.textContent = focusView ? "Return to full view" : "Focus view";
  });

  stage.tabIndex = 0;
  stage.addEventListener("pointerdown", handleCaptureStart);
  stage.addEventListener("pointerup", handleCaptureEnd);
  stage.addEventListener("pointerleave", handleCaptureEnd);
  stage.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    event.preventDefault();
    handleCaptureStart();
  });
  stage.addEventListener("keyup", (event) => {
    if (event.code !== "Space") return;
    event.preventDefault();
    handleCaptureEnd();
  });

  window.addEventListener("blur", handleCaptureEnd);

  const resizeScene = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", resizeScene);
  resizeScene();
  updateDashboard();

  const clock = new THREE.Clock();
  const animate = () => {
    const delta = Math.min(clock.getDelta(), 0.033);
    elapsed += delta;
    beltTexture.offset.y -= delta * (captureMode ? 1.75 : 0.8);

    spawnTimer += delta;
    const spawnRate = captureMode ? 0.24 : 0.62;
    if (spawnTimer > spawnRate) {
      spawnEgg();
      spawnTimer = 0;
    }

    eggs.forEach((egg) => {
      if (!egg.userData.active) return;
      egg.position.z += egg.userData.speed * delta;
      egg.rotation.x += delta * egg.userData.speed * 0.8;
      egg.rotation.z += egg.userData.spin;
      if (egg.position.z > 7.4 && !egg.userData.counted) {
        egg.userData.counted = true;
        passesLogged += 1;
        latestRecord.textContent = egg.userData.label;
        latestNarrative.textContent = captureMode
          ? "The dashboard is reflecting a fresh pass without waiting for T+1 consolidation."
          : "The record is visible, but the workflow still needs same-day discipline to stabilize.";
        if (captureMode) showToast(`${egg.userData.label} recorded and pushed into the reporting view.`);
      }
      if (egg.position.z > 14.5) {
        egg.userData.active = false;
        egg.userData.counted = false;
        egg.visible = false;
      }
    });

    const idleX = 7.2 + Math.sin(elapsed * 0.36) * (prefersReducedMotion.matches ? 0 : 0.45);
    const idleY = 4.6 + Math.cos(elapsed * 0.42) * (prefersReducedMotion.matches ? 0 : 0.12);
    const idleZ = 14.4 + Math.sin(elapsed * 0.28) * (prefersReducedMotion.matches ? 0 : 0.28);
    const activeX = 6.2 + Math.sin(elapsed * 0.54) * (prefersReducedMotion.matches ? 0 : 0.18);
    const activeY = 4.1 + Math.cos(elapsed * 0.65) * (prefersReducedMotion.matches ? 0 : 0.08);
    const activeZ = 12.2 + Math.sin(elapsed * 0.48) * (prefersReducedMotion.matches ? 0 : 0.14);

    const targetPosition = captureMode
      ? new THREE.Vector3(activeX, activeY, activeZ)
      : new THREE.Vector3(idleX, idleY, idleZ);
    camera.position.lerp(targetPosition, captureMode ? 0.03 : 0.018);
    camera.lookAt(0, 1.95, -1.4);

    updateDashboard();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}

function enableFallback() {
  const fallbackScene = document.getElementById("fallbackScene");
  if (!fallbackScene) return;
  fallbackScene.hidden = false;
}
