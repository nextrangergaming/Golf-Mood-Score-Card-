const moods = [
  { key: "smile", face: "\u{1F642}", label: "Smile" },
  { key: "mediocre", face: "\u{1F610}", label: "Mediocre" },
  { key: "sad", face: "\u{2639}\u{FE0F}", label: "Sad" }
];

const storageKey = "golf-moodcard-holes";
const holes = loadHoles();

const frontNine = document.querySelector("#front-nine");
const backNine = document.querySelector("#back-nine");
const resetButton = document.querySelector("#reset-button");

renderHoles();
updateSummary();

resetButton.addEventListener("click", () => {
  holes.fill(null);
  saveHoles();
  renderHoles();
  updateSummary();
});

function loadHoles() {
  const emptyRound = Array(18).fill(null);
  const savedRound = window.localStorage.getItem(storageKey);

  if (!savedRound) {
    return emptyRound;
  }

  try {
    const parsedRound = JSON.parse(savedRound);
    if (!Array.isArray(parsedRound) || parsedRound.length !== 18) {
      return emptyRound;
    }

    return parsedRound.map((mood) => moods.some((item) => item.key === mood) ? mood : null);
  } catch {
    return emptyRound;
  }
}

function saveHoles() {
  window.localStorage.setItem(storageKey, JSON.stringify(holes));
}

function renderHoles() {
  frontNine.replaceChildren();
  backNine.replaceChildren();

  holes.forEach((selectedMood, index) => {
    const holeNumber = index + 1;
    const row = document.createElement("article");
    row.className = "hole-row";

    const title = document.createElement("div");
    title.className = "hole-title";
    title.textContent = `Hole ${holeNumber}`;

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "mood-buttons";
    buttonGroup.setAttribute("aria-label", `Mood for hole ${holeNumber}`);

    moods.forEach((mood) => {
      const button = document.createElement("button");
      button.className = "mood-button";
      button.type = "button";
      button.dataset.mood = mood.key;
      button.textContent = mood.face;
      button.setAttribute("aria-label", `${mood.label} for hole ${holeNumber}`);
      button.setAttribute("aria-pressed", String(selectedMood === mood.key));

      if (selectedMood === mood.key) {
        button.classList.add("selected");
      }

      button.addEventListener("click", () => {
        holes[index] = mood.key;
        saveHoles();
        renderHoles();
        updateSummary();
      });

      buttonGroup.append(button);
    });

    row.append(title, buttonGroup);

    if (holeNumber <= 9) {
      frontNine.append(row);
    } else {
      backNine.append(row);
    }
  });
}

function updateSummary() {
  const completedCount = holes.filter(Boolean).length;
  document.querySelector("#completed-count").textContent = completedCount;
  document.querySelector("#smile-count").textContent = countMood("smile");
  document.querySelector("#mediocre-count").textContent = countMood("mediocre");
  document.querySelector("#sad-count").textContent = countMood("sad");
  resetButton.disabled = completedCount === 0;
}

function countMood(mood) {
  return holes.filter((selectedMood) => selectedMood === mood).length;
}
