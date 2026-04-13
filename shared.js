const songs = [
  // ================= PRELUDE =================
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 01 Intro.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 02 Into the Fire.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 03 Unstoppable Force.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 04 Cerberus.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 05 A Thousand Greetings.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 06 A Shattered Illusion.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 07 Take Care.mp3" },

  // ================= CHAOS / ORDER =================
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- CHAOS-ORDER - 01 The Spinal Staircase.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- CHAOS-ORDER - 02 CHAOS.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- CHAOS-ORDER - 03 ORDER.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- CHAOS-ORDER - 04 Sunshine (Mirage).mp3" },

  // ================= ENCORES =================
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 01 A Heart of Cold.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 02 Dead Heat Pulse (A Heart of Cold).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 03 An Absence.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 04 A Part Falling.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 05 After Hours.mp3" },

  // ================= FRAUD =================
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 01 In Absentia ΛΟΓΟΣ.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 02 Spiral Out (Keep Going).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 03 Never Odd or Even.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 04 No Devil Lived On.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 05 Mirror Rim.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 06 The Break (Crimson Glass deComposition).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 07 The Shattering Circle, or- A Charade of Shadeless Ones and Zeroes Rearranged ad Ni.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 08 Event Horizon (Reach for the Sun and Burn! Burn! Burn!).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 09 The Fall.mp3" },

  // ================= PANDEMONIUM / WAR =================
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 01 Intro (Weihnachten Am Klavier).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 02 PANDEMONIUM.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 03 WAR.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 04 Lakeside Songbook.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 05 The Song That Plays In The Level Colloquially Known As 4-S.mp3" },

  // ================= VIOLENCE =================
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 01 The World Looks White.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 02 The World Looks Red.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 03 Bull of Hell.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 04 Do Robots Dream of Eternal Sleep-.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 05 Hear! The Siren Song Call of Death.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 06 Suffering Leaves Suffering Leaves.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 07 Danse Macabre.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 08 War Without Reason.mp3" },

  // ================= KEYGEN CHURCH =================
  { file: "sounds/KEYGEN CHURCH - ULTRAKILL- PANDEMONIUM-WAR - 06 Tenebre Rosso Sangue.mp3" }
];

// ================= NORMALIZATION =================

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ================= TITLE CLEANING (FIXED AUTOFILL ROOT ISSUE) =================

function simplify(file) {
  let name = file.split("/").pop().replace(".mp3", "");
  let raw = name.toLowerCase();

  // hard fixes for missing / broken matching cases
  if (raw.includes("war without reason")) return "War Without Reason";
  if (raw.includes("the world looks red")) return "The World Looks Red";
  if (raw.includes("sunshine")) return "Sunshine (Mirage)";
  if (raw.includes("chaos")) return "CHAOS";
  if (raw.includes("order")) return "ORDER";
  if (raw.includes("pandemonium")) return "PANDEMONIUM";
  if (raw.includes("lakeside songbook")) return "Lakeside Songbook";
  if (raw.includes("4-s")) return "The Song That Plays In The Level Colloquially Known As 4-S";

  // fallback cleanup
  return name
    .split(" - ")
    .pop()
    .replace(/\d+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ================= BUILD DERIVED DATA (CRITICAL FIX) =================

songs.forEach(s => {
  s.title = simplify(s.file);
  s.norm = normalize(s.title);
});

// ================= OPTIONAL HELPERS =================

function titleCase(str) {
  return str
    .split(" ")
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}