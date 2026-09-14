const API_BASE = process.env.API_BASE || "http://localhost:5000/api/v1";
const SEED_PASSWORD = "Password123";

const lecturers = [
  { fullName: "Dr. Adebayo Ogundimu", email: "adebayoogundimu@oauife.edu.ng" },
  { fullName: "Dr. Folake Adeyemi", email: "folakeadeyemi@oauife.edu.ng" },
  { fullName: "Prof. Chinedu Okonkwo", email: "chineduokonkwo@oauife.edu.ng" },
  { fullName: "Dr. Ngozi Eze", email: "ngozieze@oauife.edu.ng" },
  { fullName: "Dr. Tunde Bakare", email: "tundebakare@oauife.edu.ng" },
];

const students = [
  {
    fullName: "Amaka Johnson",
    email: "ajohnson@oauife.edu.ng",
    matricNumber: "CSC/2019/001",
  },
  {
    fullName: "Chidi Nwosu",
    email: "cnwosu@oauife.edu.ng",
    matricNumber: "CSC/2019/002",
  },
  {
    fullName: "Bisi Afolabi",
    email: "bafolabi@oauife.edu.ng",
    matricNumber: "CSC/2019/003",
  },
  {
    fullName: "Emeka Obi",
    email: "eobi@oauife.edu.ng",
    matricNumber: "CSC/2019/004",
  },
  {
    fullName: "Funmilayo Adekunle",
    email: "fadekunle@oauife.edu.ng",
    matricNumber: "CSC/2019/005",
  },
  {
    fullName: "Ibrahim Musa",
    email: "imusa@oauife.edu.ng",
    matricNumber: "CSC/2019/006",
  },
  {
    fullName: "Kemi Oladipo",
    email: "koladipo@oauife.edu.ng",
    matricNumber: "CSC/2019/007",
  },
  {
    fullName: "Segun Oyelaran",
    email: "soyelaran@oauife.edu.ng",
    matricNumber: "CSC/2019/008",
  },
  {
    fullName: "Ada Chukwu",
    email: "achukwu@oauife.edu.ng",
    matricNumber: "CSC/2019/009",
  },
  {
    fullName: "Yusuf Abdullahi",
    email: "yabdullahi@oauife.edu.ng",
    matricNumber: "CSC/2019/010",
  },
  {
    fullName: "Blessing Eze",
    email: "beze@oauife.edu.ng",
    matricNumber: "CSC/2019/011",
  },
  {
    fullName: "Damilola Fashola",
    email: "dfashola@oauife.edu.ng",
    matricNumber: "CSC/2019/012",
  },
  {
    fullName: "Grace Nnamdi",
    email: "gnnamdi@oauife.edu.ng",
    matricNumber: "CSC/2019/013",
  },
  {
    fullName: "Hassan Bello",
    email: "hbello@oauife.edu.ng",
    matricNumber: "CSC/2019/014",
  },
  {
    fullName: "Ifeoma Uche",
    email: "iuche@oauife.edu.ng",
    matricNumber: "CSC/2019/015",
  },
];

async function registerUser(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (res.ok) {
    console.log(`  ✓ ${payload.role.padEnd(9)} ${payload.fullName}`);
  } else {
    // Already-registered accounts (409) are expected on repeat runs — skip quietly
    console.log(
      `  ✗ ${payload.role.padEnd(9)} ${payload.fullName} — ${data.error}`,
    );
  }
}

async function seed() {
  console.log(`Seeding against ${API_BASE}\n`);

  console.log("Lecturers:");
  for (const lecturer of lecturers) {
    await registerUser({
      ...lecturer,
      password: SEED_PASSWORD,
      role: "lecturer",
      department: "Computer Science",
    });
  }

  console.log("\nStudents:");
  for (const student of students) {
    await registerUser({
      ...student,
      password: SEED_PASSWORD,
      role: "student",
      department: "Computer Science",
    });
  }

  console.log(
    `\nDone. All seeded accounts share the password: ${SEED_PASSWORD}`,
  );
}

seed();
