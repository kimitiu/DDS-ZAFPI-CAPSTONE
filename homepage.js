const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const homeRoot = document.querySelector("[data-home-page]");
if (homeRoot) {
  initHomepage();
}

function initHomepage() {
  const stage = document.getElementById("demoStage");
  const fallbackScene = document.getElementById("fallbackScene");
  const eggStream = document.getElementById("eggStream");
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

  if (!stage || !eggStream) return;
  if (fallbackScene) fallbackScene.hidden = true;

  const eggTypes = [
    { className: "egg--light", label: "Super Jumbo sync", weight: 0.24 },
    { className: "egg--tan", label: "Large grade encoded", weight: 0.38 },
    { className: "egg--speckled", label: "Medium tray passed", weight: 0.26 },
    { className: "egg--alert", label: "Exception flagged", weight: 0.12 }
  ];

  let eggs = [];
  let captureMode = false;
  let focusMode = false;
  let passesLogged = 126;
  let activeHouses = 14;
  let syncPercent = 95;
  let feedMatch = 88;
  let utilization = 57;
  let dailyProgress = 81;
  let alertTotal = 6;
  let storyIndex = 0;
  let storyTimer = 0;
  let spawnTimer = 0;
  let beltShift = 0;
  let lastFrame = performance.now();
  let lastToastAt = 0;
  let toastTimer = 0;

  const setStory = (index) => {
    storyLines.forEach((line, lineIndex) => {
      line.classList.toggle("is-active", lineIndex === index);
    });
  };

  const updateClock = () => {
    if (!simTime) return;
    simTime.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const chooseEggType = () => {
    let cursor = Math.random();
    for (const option of eggTypes) {
      cursor -= option.weight;
      if (cursor <= 0) return option;
    }
    return eggTypes[1];
  };

  const showToast = (message) => {
    if (!toast || !toastText) return;
    const now = performance.now();
    if (now - lastToastAt < 750) return;
    lastToastAt = now;
    toastText.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
  };

  const setCaptureMode = (nextState) => {
    if (captureMode === nextState) return;
    captureMode = nextState;
    stage.classList.toggle("is-active", captureMode);
    if (stateMode) stateMode.textContent = captureMode ? "Capture active" : "Monitoring baseline";
    if (captureMode) {
      showToast("Capture mode is live. Same-day reporting now feels immediate and controlled.");
    }
  };

  const updateDashboard = () => {
    const targetSync = captureMode ? 97 : 95;
    const targetFeed = captureMode ? 96 : 88;
    const targetUtilization = captureMode ? 64 : 57;
    const targetDaily = captureMode ? 95 : 81;
    const targetAlerts = captureMode ? 3 : 6;
    const targetHouses = captureMode ? 24 : 14;

    syncPercent += (targetSync - syncPercent) * 0.024;
    feedMatch += (targetFeed - feedMatch) * 0.028;
    utilization += (targetUtilization - utilization) * 0.024;
    dailyProgress += (targetDaily - dailyProgress) * 0.026;
    alertTotal += (targetAlerts - alertTotal) * 0.04;
    activeHouses += (targetHouses - activeHouses) * 0.024;

    const roundedSync = Math.round(syncPercent);
    const roundedFeed = Math.round(feedMatch);
    const roundedUtilization = Math.round(utilization);
    const roundedDaily = Math.round(dailyProgress);
    const roundedAlerts = Math.max(1, Math.round(alertTotal));
    const roundedHouses = Math.max(1, Math.round(activeHouses));
    const passText = String(passesLogged).padStart(3, "0");

    if (visibilityValue) visibilityValue.textContent = `${roundedUtilization}%`;
    if (visibilityNarrative) {
      visibilityNarrative.textContent = captureMode
        ? "Field encoding, sync checks, and same-day review are moving together."
        : "The baseline shows why ZAFPI needs same-day operational visibility.";
    }
    if (latestRecord && !captureMode) latestRecord.textContent = "Awaiting next field pass";
    if (latestNarrative && !captureMode) latestNarrative.textContent = "Monitoring the current-state baseline before capture begins.";
    if (housesMeta) housesMeta.textContent = `${roundedHouses} / 24`;
    if (passesMeta) passesMeta.textContent = passText;
    if (syncMeta) syncMeta.textContent = `${roundedSync}%`;
    if (housesCount) housesCount.textContent = `${roundedHouses} / 24`;
    if (passesCount) passesCount.textContent = passText;
    if (syncCount) syncCount.textContent = `${roundedSync}%`;
    if (feedCount) feedCount.textContent = `${roundedFeed}%`;
    if (mortalityCount) mortalityCount.textContent = captureMode ? "1 verified" : "2 verified";
    if (alertCount) alertCount.textContent = `${roundedAlerts} open`;
    if (dailyLabel) dailyLabel.textContent = `${roundedDaily}% of daily reporting target`;
    if (syncLabel) syncLabel.textContent = `${roundedSync}% same-day sync confidence`;
    if (utilLabel) utilLabel.textContent = `${roundedUtilization}% utilization pathway`;
    if (dailyBar) dailyBar.style.setProperty("--fill", `${roundedDaily}%`);
    if (syncBar) syncBar.style.setProperty("--fill", `${roundedSync}%`);
    if (utilBar) utilBar.style.setProperty("--fill", `${roundedUtilization}%`);
    if (ringVisual) ringVisual.style.setProperty("--ring-fill", roundedSync);
    if (ringValue) ringValue.textContent = `${roundedSync}%`;
  };

  const spawnEgg = () => {
    const type = chooseEggType();
    const egg = document.createElement("div");
    egg.className = `sim-egg ${type.className}`;
    eggStream.appendChild(egg);

    eggs.push({
      element: egg,
      x: -80,
      y: 18 + Math.random() * 28,
      wobble: 12 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 18,
      rotationSpeed: (Math.random() - 0.5) * 32,
      speed: captureMode ? 420 : 260,
      counted: false,
      label: type.label
    });
  };

  const removeEgg = (egg) => {
    egg.element.remove();
    eggs = eggs.filter((item) => item !== egg);
  };

  const handleEggCheckpoint = (egg) => {
    if (egg.counted) return;
    egg.counted = true;
    passesLogged += 1;
    if (latestRecord) latestRecord.textContent = egg.label;
    if (latestNarrative) {
      latestNarrative.textContent = captureMode
        ? "The dashboard is reflecting a fresh pass without waiting for T+1 consolidation."
        : "The record is visible, but the workflow still needs same-day discipline to stabilize.";
    }
    if (captureMode) {
      showToast(`${egg.label} recorded and pushed into the reporting view.`);
    }
  };

  const animate = (timestamp) => {
    const delta = Math.min((timestamp - lastFrame) / 1000, 0.033);
    lastFrame = timestamp;

    beltShift += delta * (captureMode ? 220 : 100);
    stage.style.setProperty("--belt-shift", `${beltShift}px`);

    spawnTimer += delta;
    const spawnRate = captureMode ? 0.22 : 0.48;
    if (spawnTimer >= spawnRate) {
      spawnEgg();
      spawnTimer = 0;
    }

    const streamWidth = Math.max(eggStream.clientWidth, 640);
    const checkpoint = streamWidth * 0.62;

    eggs.forEach((egg) => {
      egg.x += delta * egg.speed;
      egg.rotation += delta * egg.rotationSpeed;
      const bob = Math.sin((timestamp / 1000) * egg.wobble + egg.phase) * 8;
      egg.element.style.transform = `translate(${egg.x}px, ${egg.y + bob}px) rotate(${egg.rotation}deg)`;
      if (egg.x >= checkpoint) handleEggCheckpoint(egg);
      if (egg.x > streamWidth + 100) removeEgg(egg);
    });

    storyTimer += delta;
    if (!prefersReducedMotion.matches && storyTimer >= 3.6 && storyLines.length > 1) {
      storyIndex = (storyIndex + 1) % storyLines.length;
      setStory(storyIndex);
      storyTimer = 0;
    }

    updateDashboard();
    window.requestAnimationFrame(animate);
  };

  focusToggle?.addEventListener("click", () => {
    focusMode = !focusMode;
    stage.classList.toggle("is-focus", focusMode);
    focusToggle.textContent = focusMode ? "Return view" : "Focus view";
  });

  stage.tabIndex = 0;
  stage.addEventListener("pointerdown", () => setCaptureMode(true));
  stage.addEventListener("pointerup", () => setCaptureMode(false));
  stage.addEventListener("pointerleave", () => setCaptureMode(false));
  stage.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    event.preventDefault();
    setCaptureMode(true);
  });
  stage.addEventListener("keyup", (event) => {
    if (event.code !== "Space") return;
    event.preventDefault();
    setCaptureMode(false);
  });
  window.addEventListener("blur", () => setCaptureMode(false));

  updateClock();
  updateDashboard();
  setStory(0);
  window.setInterval(updateClock, 1000);
  window.requestAnimationFrame(animate);
}
