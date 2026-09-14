import { useState } from "react";

const DEMO_PASSWORD = "Password123";

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

export default function DemoCredentialsModal({ onClose, onSelect }) {
  const [tab, setTab] = useState("lecturers");

  const list = tab === "lecturers" ? lecturers : students;

  return (
    <div
      className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-display text-xl text-ink">Demo credentials</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-ink text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-5 pt-3">
          <p className="text-xs text-gray-500 mb-3">
            Every account below shares the password{" "}
            <span className="font-mono font-medium text-ink">
              {DEMO_PASSWORD}
            </span>
          </p>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTab("lecturers")}
              className={`flex-1 text-sm font-medium py-1.5 rounded transition-colors ${
                tab === "lecturers"
                  ? "bg-ink text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Lecturers
            </button>
            <button
              onClick={() => setTab("students")}
              className={`flex-1 text-sm font-medium py-1.5 rounded transition-colors ${
                tab === "students"
                  ? "bg-ink text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Students
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 pb-5 flex-1">
          <div className="divide-y divide-gray-100">
            {list.map((person) => (
              <button
                key={person.email}
                onClick={() =>
                  onSelect?.(person.matricNumber || person.email, DEMO_PASSWORD)
                }
                className="w-full text-left py-2.5 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
              >
                <p className="text-sm font-medium text-ink">
                  {person.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {person.email}
                  {person.matricNumber ? ` · ${person.matricNumber}` : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
