const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const homeRoot = document.querySelector("[data-home-page]");
if (homeRoot) {
  initHomepage();
}

function initHomepage() {
  const stage = document.getElementById("demoStage");
  const fallbackScene = document.getElementById("fallbackScene");
  const eggStream = document.getElementById("eggStream");
  const basketCards = Array.from(document.querySelectorAll(".scene-baskets [data-basket-key]"));
  const simTime = document.getElementById("simTime");
  const stateMode = document.getElementById("stateMode");
  const quoteTitle = document.getElementById("quoteTitle");
  const quoteBody = document.getElementById("quoteBody");
  const latestRecord = document.getElementById("latestRecord");
  const latestNarrative = document.getElementById("latestNarrative");
  const visibilityValue = document.getElementById("visibilityValue");
  const visibilityNarrative = document.getElementById("visibilityNarrative");
  const housesMeta = document.getElementById("housesMeta");
  const passesMeta = document.getElementById("passesMeta");
  const syncMeta = document.getElementById("syncMeta");
  const housesCount = document.getElementById("housesCount");
  const passesCount = document.getElementById("passesCount");
  const feedCount = document.getElementById("feedCount");
  const alertCount = document.getElementById("alertCount");
  const dailyBar = document.getElementById("dailyBar");
  const dailyLabel = document.getElementById("dailyLabel");
  const syncBar = document.getElementById("syncBar");
  const syncLabel = document.getElementById("syncLabel");
  const utilBar = document.getElementById("utilBar");
  const utilLabel = document.getElementById("utilLabel");
  const ringVisual = document.getElementById("ringVisual");
  const ringValue = document.getElementById("ringValue");
  const toast = document.getElementById("simToast");
  const toastText = document.getElementById("simToastText");
  const collapseToggles = Array.from(document.querySelectorAll("[data-collapse-target]"));

  if (!stage || !eggStream) return;
  if (fallbackScene) fallbackScene.hidden = true;

  const laneOffsets = [22, 50];
  const farmHouses = Array.from({ length: 24 }, (_, index) => `Farm House ${String(index + 1).padStart(2, "0")}`);
  const truckBatches = ["Truck Batch A1", "Truck Batch A2", "Truck Batch B1", "Truck Batch B2", "Truck Batch C1"];

  const quoteDeck = [
    {
      title: "We're hatching something special.",
      body: "Project Farmbrite helps farm workers log production, feed intake, mortality, medicine, and vaccine activity so the sorting center can see the day as it happens."
    },
    {
      title: "From farm logbook to sorting center console.",
      body: "Every pass starts at the houses, then flows into a same-day console that supports feed planning, chick ordering, culling, and operational review."
    },
    {
      title: "The belt moves, the record updates.",
      body: "Instead of waiting for delayed reconciliation, management can follow egg grades, exceptions, and reporting discipline while work is still in motion."
    },
    {
      title: "Workers capture the source, managers see the signal.",
      body: "Production, casualties, medicine, and vaccine entries are visible in one reporting rhythm so decisions can be based on data rather than guesswork."
    },
    {
      title: "Same-day visibility changes the whole farm rhythm.",
      body: "Farmbrite turns tray movement into operational visibility, helping ZAFPI act earlier on feed, health, and production trends."
    }
  ];

  const eggTypes = [
    {
      key: "peewee",
      label: "Peewee",
      className: "egg--peewee",
      width: 26,
      height: 38,
      weight: 0.08,
      minGap: 116,
      speedBoost: -12,
      lanePool: [1],
      basket: "Peewee basket",
      basketIndex: 0,
      result: "peewee tray routed to the smallest grade basket",
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
      speedBoost: -8,
      lanePool: [1],
      basket: "Small basket",
      basketIndex: 1,
      result: "small tray routed into the secondary grade basket",
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
      basket: "Medium basket",
      basketIndex: 2,
      result: "medium tray added into the volume basket",
      impact: "volume"
    },
    {
      key: "large",
      label: "Large",
      className: "egg--large",
      width: 50,
      height: 68,
      weight: 0.21,
      minGap: 148,
      speedBoost: 12,
      lanePool: [0, 1],
      basket: "Large basket",
      basketIndex: 3,
      result: "large tray routed into the core output basket",
      impact: "confidence"
    },
    {
      key: "xl",
      label: "XL",
      className: "egg--xl",
      width: 58,
      height: 78,
      weight: 0.13,
      minGap: 160,
      speedBoost: 20,
      lanePool: [0],
      basket: "XL basket",
      basketIndex: 4,
      result: "XL tray locked into the high-output basket",
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
      speedBoost: 24,
      lanePool: [0],
      basket: "Jumbo basket",
      basketIndex: 5,
      result: "jumbo tray accepted into the premium output batch",
      impact: "confidence"
    },
    {
      key: "cracked",
      label: "Cracked",
      className: "egg--cracked",
      width: 44,
      height: 60,
      weight: 0.07,
      minGap: 146,
      speedBoost: 4,
      lanePool: [1],
      basket: "Cracked basket",
      basketIndex: 6,
      result: "cracked tray flagged for quality review",
      impact: "exception"
    },
    {
      key: "leakers",
      label: "Leakers",
      className: "egg--leakers",
      width: 48,
      height: 64,
      weight: 0.06,
      minGap: 152,
      speedBoost: 0,
      lanePool: [1],
      basket: "Leakers basket",
      basketIndex: 7,
      result: "leakers tray isolated for exception handling",
      impact: "exception"
    }
  ];

  let eggs = [];
  let captureMode = false;
  let quoteIndex = 0;
  let quoteTimer = 0;
  let passesLogged = 126;
  let activeHouses = 14;
  let syncPercent = 95;
  let visibilityScore = 57;
  let feedTons = 18.6;
  let casualtyCount = 2;
  let dailyProgress = 81;
  let medicineReadiness = 92;
  let vaccineReadiness = 86;
  let spawnTimer = 0.4;
  let beltShift = 0;
  let lastFrame = performance.now();
  let lastToastAt = 0;
  let toastTimer = 0;

  const recordState = {
    title: "Large tray to Large basket",
    narrative: "Truck Batch A2 arrived from Farm House 07 and entered the sorting-center queue."
  };

  const updateClock = () => {
    if (!simTime) return;
    simTime.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const setQuote = (index) => {
    if (!quoteTitle || !quoteBody) return;
    quoteTitle.textContent = quoteDeck[index].title;
    quoteBody.textContent = quoteDeck[index].body;
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
    const sourceHouse = pickFrom(farmHouses);
    const truckBatch = pickFrom(truckBatches);
    const title = `${type.label} tray to ${type.basket}`;
    const narrative = `${truckBatch} collected from ${sourceHouse}. ${type.result}.`;
    return {
      type,
      lane,
      sourceHouse,
      truckBatch,
      basketTarget: type.basket,
      basketKey: type.key,
      sortingLane: lane === 0 ? "Primary size lane" : "Quality and secondary lane",
      title,
      narrative,
      recordLabel: `${type.label} tray`,
      basketIndex: type.basketIndex
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
    if (stateMode) stateMode.textContent = captureMode ? "Sorter running" : "Monitoring baseline";
    if (captureMode) {
      showToast("Sorter running. Each tray is now logging directly into the Farmbrite console.");
    }
  };

  const applyEggImpact = (record) => {
    if (record.type.impact === "confidence") {
      syncPercent = clamp(syncPercent + 0.7, 90, 99);
      visibilityScore = clamp(visibilityScore + 0.42, 50, 92);
      feedTons = clamp(feedTons + 0.08, 16, 24);
      dailyProgress = clamp(dailyProgress + 0.26, 70, 99);
      casualtyCount = clamp(casualtyCount - 0.04, 0, 8);
    } else if (record.type.impact === "volume") {
      visibilityScore = clamp(visibilityScore + 0.34, 50, 92);
      dailyProgress = clamp(dailyProgress + 0.34, 70, 99);
      activeHouses = clamp(activeHouses + 0.12, 12, 24);
      feedTons = clamp(feedTons + 0.04, 16, 24);
    } else {
      casualtyCount = clamp(casualtyCount + 0.22, 0, 8);
      syncPercent = clamp(syncPercent - 0.2, 90, 99);
      visibilityScore = clamp(visibilityScore - 0.12, 50, 92);
      medicineReadiness = clamp(medicineReadiness - 0.18, 75, 99);
      vaccineReadiness = clamp(vaccineReadiness - 0.15, 72, 99);
    }
  };

  const updateDashboard = () => {
    const targets = captureMode
      ? { sync: 97, visibility: 74, daily: 95, houses: 24, feed: 19.6, casualties: 1, medicine: 97, vaccine: 94 }
      : { sync: 95, visibility: 57, daily: 81, houses: 14, feed: 18.6, casualties: 2, medicine: 92, vaccine: 86 };

    syncPercent += (targets.sync - syncPercent) * 0.018;
    visibilityScore += (targets.visibility - visibilityScore) * 0.018;
    dailyProgress += (targets.daily - dailyProgress) * 0.02;
    activeHouses += (targets.houses - activeHouses) * 0.02;
    feedTons += (targets.feed - feedTons) * 0.02;
    casualtyCount += (targets.casualties - casualtyCount) * 0.03;
    medicineReadiness += (targets.medicine - medicineReadiness) * 0.02;
    vaccineReadiness += (targets.vaccine - vaccineReadiness) * 0.02;

    const roundedSync = Math.round(syncPercent);
    const roundedVisibility = Math.round(visibilityScore);
    const roundedDaily = Math.round(dailyProgress);
    const roundedHouses = Math.max(1, Math.round(activeHouses));
    const roundedCasualties = Math.max(0, Math.round(casualtyCount));
    const feedLabel = `${feedTons.toFixed(1)} tons`;
    const passText = String(passesLogged).padStart(3, "0");
    const medicineLabel = `${Math.round(medicineReadiness)}% of medicine log target`;
    const vaccineLabel = `${Math.round(vaccineReadiness)}% of vaccine schedule target`;

    if (latestRecord) latestRecord.textContent = recordState.title;
    if (latestNarrative) latestNarrative.textContent = recordState.narrative;
    if (visibilityValue) visibilityValue.textContent = `${roundedVisibility}%`;
    if (visibilityNarrative) {
      visibilityNarrative.textContent = captureMode
        ? "Farm workers are logging at source while the sorting center can already see feed, casualty, medicine, and vaccine signals."
        : "Workers capture at the farm first, then management follows the day from the sorting center console.";
    }
    if (housesMeta) housesMeta.textContent = `${roundedHouses} / 24 active`;
    if (passesMeta) passesMeta.textContent = `${passText} passes`;
    if (syncMeta) syncMeta.textContent = `${roundedSync}% sync`;
    if (housesCount) housesCount.textContent = `${roundedHouses} / 24`;
    if (passesCount) passesCount.textContent = passText;
    if (feedCount) feedCount.textContent = feedLabel;
    if (alertCount) alertCount.textContent = `${roundedCasualties} logged`;
    if (dailyLabel) dailyLabel.textContent = `${roundedDaily}% of daily reporting target`;
    if (syncLabel) syncLabel.textContent = medicineLabel;
    if (utilLabel) utilLabel.textContent = vaccineLabel;
    if (dailyBar) dailyBar.style.setProperty("--fill", `${roundedDaily}%`);
    if (syncBar) syncBar.style.setProperty("--fill", `${Math.round(medicineReadiness)}%`);
    if (utilBar) utilBar.style.setProperty("--fill", `${Math.round(vaccineReadiness)}%`);
    if (ringVisual) ringVisual.style.setProperty("--ring-fill", roundedSync);
    if (ringValue) ringValue.textContent = `${roundedSync}%`;
  };

  const hasSpawnClearance = (minimumGap) => {
    return eggs.every((egg) => egg.x > minimumGap);
  };

  const placeEgg = (egg) => {
    const bob = prefersReducedMotion.matches ? 0 : Math.sin(egg.phase) * 2;
    egg.element.style.transform = `translate(${egg.x}px, ${egg.y + bob}px) rotate(${egg.rotation}deg)`;
  };

  const getBasketTarget = (egg, streamWidth) => {
    const basket = basketCards.find((card) => card.dataset.basketKey === egg.record.basketKey);
    if (basket) {
      const streamRect = eggStream.getBoundingClientRect();
      const basketRect = basket.getBoundingClientRect();
      return {
        x: basketRect.left - streamRect.left + basketRect.width * 0.5 - egg.width * 0.5,
        y: basketRect.top - streamRect.top + basketRect.height * 0.26
      };
    }

    const column = egg.record.basketIndex % 2;
    const row = Math.floor(egg.record.basketIndex / 2);
    return {
      x: streamWidth * 0.68 + column * 78,
      y: row * 52 - 42
    };
  };

  const createEgg = (type, x) => {
    const record = buildRecord(type);
    const egg = document.createElement("div");
    egg.className = `sim-egg ${type.className}`;
    egg.style.width = `${type.width}px`;
    egg.style.height = `${type.height}px`;
    eggStream.appendChild(egg);

    const laneOffset = laneOffsets[record.lane];
    const item = {
      element: egg,
      x,
      y: laneOffset,
      baseY: laneOffset,
      wobble: 5 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 10,
      rotationSpeed: (Math.random() - 0.5) * 10,
      speed: 180 + type.speedBoost,
      counted: false,
      routing: false,
      routedAt: 0,
      width: type.width,
      record
    };

    eggs.push(item);
    placeEgg(item);
  };

  const spawnEgg = () => {
    const type = chooseEggType();
    createEgg(type, -type.width - 18);
  };

  const seedEggs = () => {
    [
      { key: "small", x: 60 },
      { key: "medium", x: 250 },
      { key: "large", x: 470 },
      { key: "jumbo", x: 700 }
    ].forEach((seed) => {
      const type = eggTypes.find((item) => item.key === seed.key);
      if (type) createEgg(type, seed.x);
    });
  };

  const removeEgg = (egg) => {
    egg.element.remove();
    eggs = eggs.filter((item) => item !== egg);
  };

  const handleEggCheckpoint = (egg) => {
    if (egg.counted) return;
    egg.counted = true;
    egg.routing = true;
    passesLogged += 1;
    recordState.title = egg.record.title;
    recordState.narrative = egg.record.narrative;
    applyEggImpact(egg.record);
    showToast(`${egg.record.recordLabel || egg.record.title} visible in the sorting-center console.`);
  };

  const toggleCollapse = (toggle) => {
    const targetId = toggle.getAttribute("data-collapse-target");
    if (!targetId) return;
    const body = document.getElementById(targetId);
    const card = toggle.closest(".collapsible-card");
    if (!body || !card) return;
    const nextExpanded = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(nextExpanded));
    card.classList.toggle("is-collapsed", !nextExpanded);
  };

  const animate = (timestamp) => {
    const delta = Math.min((timestamp - lastFrame) / 1000, 0.033);
    lastFrame = timestamp;

    const beltSpeed = captureMode ? 154 : 42;
    const speedMultiplier = captureMode ? 1.4 : 0.34;
    const spawnRate = captureMode ? 0.48 : 1.85;

    beltShift += delta * beltSpeed;
    spawnTimer += delta;
    stage.style.setProperty("--belt-shift", `${beltShift}px`);

    const nextType = chooseEggType();
    if (spawnTimer >= spawnRate && hasSpawnClearance(nextType.minGap)) {
      spawnEgg();
      spawnTimer = 0;
    }

    const streamWidth = Math.max(eggStream.clientWidth, 720);
    const checkpoint = streamWidth * 0.62;

    eggs.slice().forEach((egg) => {
      const movement = delta * speedMultiplier;
      egg.rotation += delta * egg.rotationSpeed * speedMultiplier;
      egg.phase += delta * egg.wobble * speedMultiplier;

      if (egg.routing) {
        const target = getBasketTarget(egg, streamWidth);
        egg.x += (target.x - egg.x) * Math.min(1, movement * 2.2);
        egg.y += (target.y - egg.y) * Math.min(1, movement * 2.6);
        if (Math.abs(target.x - egg.x) < 4 && Math.abs(target.y - egg.y) < 4) {
          egg.routedAt += delta;
        }
      } else {
        egg.x += delta * egg.speed * speedMultiplier;
        egg.y += (egg.baseY - egg.y) * Math.min(1, movement * 1.8);
      }

      placeEgg(egg);
      if (egg.x + egg.width * 0.5 >= checkpoint) handleEggCheckpoint(egg);
      if ((egg.routing && egg.routedAt > 0.9) || egg.x > streamWidth + 120) removeEgg(egg);
    });

    if (!prefersReducedMotion.matches) {
      quoteTimer += delta;
      if (quoteTimer >= 4.4) {
        quoteIndex = (quoteIndex + 1) % quoteDeck.length;
        setQuote(quoteIndex);
        quoteTimer = 0;
      }
    }

    updateDashboard();
    window.requestAnimationFrame(animate);
  };

  collapseToggles.forEach((toggle) => {
    toggle.addEventListener("pointerdown", (event) => event.stopPropagation());
    toggle.addEventListener("pointerup", (event) => event.stopPropagation());
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleCollapse(toggle);
    });
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

  seedEggs();
  setQuote(0);
  updateClock();
  updateDashboard();
  window.setInterval(updateClock, 1000);
  window.requestAnimationFrame(animate);
}

