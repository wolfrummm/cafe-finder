// ==============================
// GLOBAL STATE
// ==============================
let cafeList = [];
let currentIndex = 0;
let mode = "discover"; // discover | saved

// Track cafes already seen or saved
const seenCafeIds = new Set(
  JSON.parse(localStorage.getItem("savedCafes") || "[]")
    .map(c => c.place_id)
);

// ==============================
// UTILITY
// ==============================
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ==============================
// LOCATION
// ==============================
function getLocation() {
  mode = "discover";

  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => useLocation(pos.coords.latitude, pos.coords.longitude),
    () => alert("Location permission denied")
  );
}

// ==============================
// FETCH CAFES (NO REPEATS)
// ==============================
async function useLocation(lat, lng) {
  const url = `/places/nearby?lat=${lat}&lng=${lng}&radius=4500&type=cafe`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();

    if (!resp.ok || data.error) {
      alert("Failed to load cafes");
      return;
    }

    cafeList = (data.results || []).filter(
      c => c.place_id && !seenCafeIds.has(c.place_id)
    );

    currentIndex = 0;

    if (!cafeList.length) {
      document.querySelector(".cards").innerHTML =
        "<p class='empty'>No new cafes ☕</p>";
      return;
    }

    showCurrentCafe();
  } catch {
    alert("Network error");
  }
}

// ==============================
// SHOW ONE CAFE (DISCOVER)
// ==============================
function showCurrentCafe() {
  const container = document.querySelector(".cards");
  container.innerHTML = "";

  if (currentIndex >= cafeList.length) {
    container.innerHTML = "<p class='empty'>No more cafes 🎉</p>";
    return;
  }

  const cafe = cafeList[currentIndex];
  seenCafeIds.add(cafe.place_id);

  renderCafeCard(container, cafe);
}

// ==============================
// SAVED CAFES VIEW
// ==============================
function showSaved() {
  mode = "saved";

  const container = document.querySelector(".cards");
  container.innerHTML = "";

  const saved = JSON.parse(localStorage.getItem("savedCafes") || "[]");

  if (!saved.length) {
    container.innerHTML = "<p class='empty'>No saved cafes yet ☕</p>";
    return;
  }

  saved.forEach(cafe => renderCafeCard(container, cafe));
}

// ==============================
// RENDER CARD (NO MODAL)
// ==============================
function renderCafeCard(container, cafe) {
  const raw = cafe._raw || cafe;

  const name =
    raw.displayName?.text ||
    raw.formattedAddress ||
    "Unknown";

  let imgSrc = "https://via.placeholder.com/400x280?text=No+Image";

  const photo =
    (raw.photos && raw.photos[0]) ||
    (cafe.photos && cafe.photos[0]) ||
    null;

  if (photo && photo.name) {
    imgSrc = `/places/photo?name=${encodeURIComponent(photo.name)}`;
  }

  const card = document.createElement("div");
  card.className = "location-card";

  card.innerHTML = `
    <img src="${imgSrc}"
         alt="${escapeHtml(name)}"
         onerror="this.src='https://via.placeholder.com/400x280?text=No+Image'"/>
    <h3>${escapeHtml(name)}</h3>
    <p>⭐ ${escapeHtml(String(cafe.rating || "N/A"))}</p>
  `;

  container.appendChild(card);
}

// ==============================
// BUTTON ACTIONS
// ==============================
function nextCafe() {
  if (mode !== "discover") return;
  currentIndex++;
  showCurrentCafe();
}

function saveCurrentCafe() {
  if (mode !== "discover" || !cafeList.length) return;

  saveCafe(cafeList[currentIndex]);
  currentIndex++;
  showCurrentCafe();
}

// ==============================
// SAVE LOGIC
// ==============================
function saveCafe(cafe) {
  let saved = JSON.parse(localStorage.getItem("savedCafes") || "[]");

  if (!saved.find(c => c.place_id === cafe.place_id)) {
    saved.push(cafe);
    localStorage.setItem("savedCafes", JSON.stringify(saved));
    seenCafeIds.add(cafe.place_id);
  }
}
