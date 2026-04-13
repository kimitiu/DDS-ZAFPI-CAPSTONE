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

  const laneOffsets = [16, 42];
  const layerHouses = Array.from({ length: 19 }, (_, index) => `Layer House ${String(index + 1).padStart(2, "0")}`);
  const growerHouses = Array.from({ length: 3 }, (_, index) => `Grower House ${String(index + 1).padStart(2, "0")}`);
  const brooderHouses = Array.from({ length: 2 }, (_, index) => `Brooder House ${String(index + 1).padStart(2, "0")}`);

  const eggTypes = [
    {
      key: "peewee",
      label: "Peewee",
      className: "egg--peewee",
      width: 26,
      height: 38,
      weight: 0.08,
      minGap: 116,
      speedBoost: -16,
      lanePool: [1],
      destinationPool: growerHouses.concat(layerHouses.slice(0, 5)),
      result: "peewee tray captured for graded volume tracking",
      impact: "volume"
    },
    {
      key: "small",
      label: "Small",
      className: "egg--small",
      width: 34,
      height: 48,
      weight: 0.16,
      minGap: 126,
      speedBoost: -10,
      lanePool: [1],
      destinationPool: growerHouses.concat(layerHouses.slice(0, 8)),
      result: "small tray recorded into the reporting mix",
      impact: "volume"
    },
    {
      key: "medium",
      label: "Medium",
      className: "egg--medium",
      width: 42,
      height: 58,
      weight: 0.2,
      minGap: 138,
      speedBoost: -2,
      lanePool: [0, 1],
      destinationPool: layerHouses.concat(growerHouses),
      result: "medium tray added to consolidation",
      impact: "volume"
    },
    {
      key: "large",
      label: "Large",
      className: "egg--large",
      width: 50,
      height: 68,
      weight: 0.22,
      minGap: 148,
      speedBoost: 12,
      lanePool: [0, 1],
      destinationPool: layerHouses,
      result: "core production pass accepted",
      impact: "confidence"
    },
    {
      key: "xl",
      label: "XL",
      className: "egg--xl",
      width: 58,
      height: 78,
      weight: 0.15,
      minGap: 160,
      speedBoost: 20,
      lanePool: [0],
      destinationPool: layerHouses,
      result: "XL tray locked into the high-output batch",
      impact: "confidence"
    },
    {
      key: "jumbo",
      label: "Jumbo",
      className: "egg--jumbo",
      width: 66,
      height: 90,
      weight: 0.09,
      minGap: 174,
      speedBoost: 26,
      lanePool: [0],
      destinationPool: layerHouses,
      result: "jumbo tray locked into the premium output run",
      impact: "confidence"
    },
    {
      key: "cracked",
      label: "Cracked",
      className: "egg--cracked",
      width: 44,
      height: 60,
      weight: 0.06,
      minGap: 146,
      speedBoost: 6,
      lanePool: [1],
      destinationPool: layerHouses.concat(brooderHouses),
      result: "cracked egg isolated for exception review",
      impact: "exception"
    },
    {
      key: "leakers",
      label: "Leakers",
      className: "egg--leakers",
      width: 48,
      height: 64,
      weight: 0.04,
      minGap: 152,
      speedBoost: 2,
      lanePool: [1],
      destinationPool: layerHouses.concat(brooderHouses),
      result: "leaker isolated and raised for quality review",
      impact: "exception"
    }
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
  let mortalityVerified = 2;
  let spawnTimer = 0.4;
  let beltShift = 0;
  let lastFrame = performance.now();
  let lastToastAt = 0;
  let toastTimer = 0;

  const recordState = {
    title: "Awaiting next field pass",
    narrative: "Monitoring the current-state baseline before capture begins."
  };

  const updateClock = () => {
    if (!simTime) return;
    simTime.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const pickFrom = (pool) => pool[Math.floor(Math.random() * pool.length)];

  const chooseEggType = () => {
    let cursor = Math.random();
    for (const option of eggTypes) {
      cursor -= option.weight;
      if (cursor <= 0) return option;
    }
    return eggTypes[3];
  };

  const buildRecord = (type) => {
    const lane = pickFrom(type.lanePool);
    const destination = pickFrom(type.destinationPool);
    const isDefect = type.impact === "exception";
    return {
      type,
      lane,
      destination,
      title: isDefect ? `${type.label} flagged from ${destination}` : `${type.label} egg logged to ${destination}`,
      narrative: isDefect
        ? `${type.result}. The exception is visible immediately inside the reporting console.`
        : `${type.result}. The pass is visible immediately inside the reporting console.`,
      recordLabel: `${type.label} ${isDefect ? "flagged" : "logged"}`
    };
  };

  const showToast = (message) => {
    if (!toast || !toastText) return;
    const now = performance.now();
    if (now - lastToastAt < 720) return;
    lastToastAt = now;
    toastText.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const setCaptureMode = (nextState) => {
    if (captureMode === nextState) return;
    captureMode = nextState;
    stage.classList.toggle("is-active", captureMode);
    if (stateMode) stateMode.textContent = captureMode ? "Capture active" : "Monitoring baseline";
    if (captureMode) {
      showToast("Capture mode is live. Same-day recording, sorting, and dashboard updates are accelerating.");
    }
  };

  const applyEggImpact = (record) => {
    if (record.type.impact === "confidence") {
      syncPercent = clamp(syncPercent + 0.9, 90, 99);
      feedMatch = clamp(feedMatch + 0.8, 80, 99);
      dailyProgress = clamp(dailyProgress + 0.18, 70, 99);
      alertTotal = clamp(alertTotal - 0.24, 1, 12);
    } else if (record.type.impact === "volume") {
      dailyProgress = clamp(dailyProgress + 0.42, 70, 99);
      utilization = clamp(utilization + 0.3, 48, 79);
      activeHouses = clamp(activeHouses + 0.18, 12, 24);
    } else {
      alertTotal = clamp(alertTotal + 1.08, 1, 12);
      syncPercent = clamp(syncPercent - 0.45, 90, 99);
      feedMatch = clamp(feedMatch - 0.55, 80, 99);
      mortalityVerified = clamp(mortalityVerified + 0.08, 1, 4);
    }
  };

  const updateDashboard = () => {
    const targets = captureMode
      ? { sync: 97, feed: 95, utilization: 66, daily: 95, alerts: 3, houses: 24, mortality: 1 }
      : { sync: 95, feed: 88, utilization: 57, daily: 81, alerts: 6, houses: 14, mortality: 2 };

    syncPercent += (targets.sync - syncPercent) * 0.018;
    feedMatch += (targets.feed - feedMatch) * 0.02;
    utilization += (targets.utilization - utilization) * 0.018;
    dailyProgress += (targets.daily - dailyProgress) * 0.02;
    alertTotal += (targets.alerts - alertTotal) * 0.026;
    activeHouses += (targets.houses - activeHouses) * 0.02;
    mortalityVerified += (targets.mortality - mortalityVerified) * 0.03;

    const roundedSync = Math.round(syncPercent);
    const roundedFeed = Math.round(feedMatch);
    const roundedUtilization = Math.round(utilization);
    const roundedDaily = Math.round(dailyProgress);
    const roundedAlerts = Math.max(1, Math.round(alertTotal));
    const roundedHouses = Math.max(1, Math.round(activeHouses));
    const roundedMortality = Math.max(1, Math.round(mortalityVerified));
    const passText = String(passesLogged).padStart(3, "0");

    if (latestRecord) latestRecord.textContent = recordState.title;
    if (latestNarrative) latestNarrative.textContent = recordState.narrative;
    if (visibilityValue) visibilityValue.textContent = `${roundedUtilization}%`;
    if (visibilityNarrative) {
      visibilityNarrative.textContent = captureMode
        ? "Graded passes are syncing immediately into the same-day control view."
        : "The baseline still shows delayed visibility, but the sorter is already proving the future state.";
    }
    if (housesMeta) housesMeta.textContent = `${roundedHouses} / 24 active`;
    if (passesMeta) passesMeta.textContent = `${passText} passes`;
    if (syncMeta) syncMeta.textContent = `${roundedSync}% sync`;
    if (housesCount) housesCount.textContent = `${roundedHouses} / 24`;
    if (passesCount) passesCount.textContent = passText;
    if (syncCount) syncCount.textContent = `${roundedSync}%`;
    if (feedCount) feedCount.textContent = `${roundedFeed}%`;
    if (mortalityCount) mortalityCount.textContent = `${roundedMortality} verified`;
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

  const hasSpawnClearance = (minimumGap) => {
    return eggs.every((egg) => egg.x > minimumGap);
  };

  const spawnEgg = () => {
    const type = chooseEggType();
    const record = buildRecord(type);
    const egg = document.createElement("div");
    egg.className = `sim-egg ${type.className}`;
    egg.style.width = `${type.width}px`;
    egg.style.height = `${type.height}px`;
    eggStream.appendChild(egg);

    const laneOffset = laneOffsets[record.lane];
    eggs.push({
      element: egg,
      x: -type.width - 18,
      y: laneOffset,
      wobble: 5 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 10,
      rotationSpeed: (Math.random() - 0.5) * 10,
      speed: (captureMode ? 290 : 190) + type.speedBoost,
      counted: false,
      width: type.width,
      record
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
    recordState.title = egg.record.title;
    recordState.narrative = egg.record.narrative;
    applyEggImpact(egg.record);
    if (captureMode) {
      showToast(`${egg.record.recordLabel || egg.record.title} now appears in the same-day monitor.`);
    }
  };

  const animate = (timestamp) => {
    const delta = Math.min((timestamp - lastFrame) / 1000, 0.033);
    lastFrame = timestamp;

    beltShift += delta * (captureMode ? 160 : 90);
    stage.style.setProperty("--belt-shift", `${beltShift}px`);

    spawnTimer += delta;
    const spawnRate = captureMode ? 0.32 : 0.62;
    const nextType = chooseEggType();
    if (spawnTimer >= spawnRate && hasSpawnClearance(nextType.minGap)) {
      spawnEgg();
      spawnTimer = 0;
    }

    const streamWidth = Math.max(eggStream.clientWidth, 720);
    const checkpoint = streamWidth * 0.62;

    eggs.slice().forEach((egg) => {
      egg.x += delta * egg.speed;
      egg.rotation += delta * egg.rotationSpeed;
      const bob = prefersReducedMotion.matches ? 0 : Math.sin((timestamp / 1000) * egg.wobble + egg.phase) * 4;
      egg.element.style.transform = `translate(${egg.x}px, ${egg.y + bob}px) rotate(${egg.rotation}deg)`;
      if (egg.x + egg.width * 0.5 >= checkpoint) handleEggCheckpoint(egg);
      if (egg.x > streamWidth + 120) removeEgg(egg);
    });

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
  window.setInterval(updateClock, 1000);
  window.requestAnimationFrame(animate);
}
