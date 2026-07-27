export interface Participant {
  rank: string;
  bib: string;
  name: string;
  resultDetails: string;
  isLatest?: boolean;
  latest?: boolean;
  status: string; // "FINISHED" | "DNF" | "DSQ" | "DNS"
  run1Time?: number;
  run2Time?: number;
  sumTime?: number;
}

export interface Group {
  title: string; // e.g., "ЗАЕЗД 1" or "ИТОГИ"
  category: string; // e.g., "Юниоры MALE"
  finishers: Participant[];
  dnfs: Participant[];
  dsqs: Participant[];
  dnss: Participant[];
}

export interface SimulatorEvent {
  bib: number;
  name: string;
  category: string;
  gender: "MALE" | "FEMALE";
  run: number;
  status: "FINISHED" | "DNF" | "DSQ" | "DNS";
  time?: number;
  timestamp: number;
}

export interface BaseParticipant {
  bib: number;
  name: string;
  category: string;
  gender: "MALE" | "FEMALE";
}
