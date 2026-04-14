const songs = [
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 01 Intro.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 02 Into the Fire.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 03 Unstoppable Force.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 04 Cerberus.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 05 A Thousand Greetings.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 06 A Shattered Illusion.mp3" },
  { file: "sounds/Heaven Pierce Her - Music From ULTRAKILL Prelude - 07 Take Care.mp3" },

  { file: "sounds/Heaven Pierce Her - ULTRAKILL- CHAOS-ORDER - 01 The Spinal Staircase.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- CHAOS-ORDER - 02 CHAOS.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- CHAOS-ORDER - 03 ORDER.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- CHAOS-ORDER - 04 Sunshine (Mirage).mp3" },

  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 01 A Heart of Cold.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 02 Dead Heat Pulse (A Heart of Cold).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 03 An Absence.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 04 A Part Falling.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- ENCORES I - 05 After Hours.mp3" },

  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 01 In Absentia ΛΟΓΟΣ.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 02 Spiral Out (Keep Going).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 03 Never Odd or Even.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 04 No Devil Lived On.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 05 Mirror Rim.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 06 The Break (Crimson Glass deComposition).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 07 The Shattering Circle, or- A Charade of Shadeless Ones and Zeroes Rearranged ad Ni.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 08 Event Horizon (Reach for the Sun and Burn! Burn! Burn!).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- FRAUD - 09 The Fall.mp3" },

  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 01 Intro (Weihnachten Am Klavier).mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 02 PANDEMONIUM.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 03 WAR.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 04 Lakeside Songbook.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- PANDEMONIUM-WAR - 05 The Song That Plays In The Level Colloquially Known As 4-S.mp3" },

  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 01 The World Looks White.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 02 The World Looks Red.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 03 Bull of Hell.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 04 Do Robots Dream of Eternal Sleep-.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 05 Hear! The Siren Song Call of Death.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 06 Suffering Leaves Suffering Leaves.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 07 Danse Macabre.mp3" },
  { file: "sounds/Heaven Pierce Her - ULTRAKILL- VIOLENCE - 08 War Without Reason.mp3" },

  { file: "sounds/KEYGEN CHURCH - ULTRAKILL- PANDEMONIUM-WAR - 06 Tenebre Rosso Sangue.mp3" }
];

const TITLE_FIXES = {
  "Into the Fire": "Into the Fire",
  "The Shattering Circle, or- A Charade of Shadeless Ones and Zeroes Rearranged ad Ni": "The Shattering Circle, or- A Charade of Shadeless Ones and Zeroes Rearranged ad Nihilum",
  "War Without Reason": "War Without Reason"
};

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function simplifyTitle(name) {
  if (TITLE_FIXES[name]) return TITLE_FIXES[name];

  if (name.includes("CHAOS")) return "CHAOS";
  if (name.includes("ORDER")) return "ORDER";
  if (name.includes("Sunshine")) return "Sunshine (Mirage)";
  if (name.includes("Lakeside")) return "Lakeside Songbook";
  if (name.includes("4-S")) return "4-S Track";

  return name;
}

function cleanTitle(file) {
  return file
    .split("/").pop()
    .replace(".mp3", "")
    .replace(/^Heaven Pierce Her\s*-\s*/i, "")
    .replace(/^KEYGEN CHURCH\s*-\s*/i, "")
    .replace(/Music From ULTRAKILL\s*/i, "")
    .replace(/ULTRAKILL[-\s]*/gi, "")
    .replace(/\bPrelude\b|\bCHAOS-ORDER\b|\bFRAUD\b|\bVIOLENCE\b|\bPANDEMONIUM-WAR\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

songs.forEach(s => {
  s.title = cleanTitle(s.file);
  s.norm = normalize(s.title);
});
