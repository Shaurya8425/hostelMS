// Student Types
export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  division?: string;
  course?: string;
  fromDate?: string;
  toDate?: string;
  designation?: string;
  guardianName?: string;
  mobile?: string;
  ticketNumber?: string;
  roomNumber?: string;
  roomId?: number;
  bedsheetCount: number;
  pillowCount: number;
  blanketCount: number;
  linenIssuedDate?: string;
  room?: {
    id: number;
    roomNumber: string;
    block: string;
  } | null;
}

export interface ArchivedStudent {
  id: number;
  originalId: number;
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  division?: string;
  course?: string;
  fromDate?: string;
  toDate?: string;
  designation?: string;
  guardianName?: string;
  mobile?: string;
  ticketNumber?: string;
  roomNumber?: string;
  bedsheetCount: number;
  pillowCount: number;
  blanketCount: number;
  linenIssuedDate?: string;
  deletedAt: string;
  deletedBy?: string;
  originalCreatedAt: string;
  originalUpdatedAt: string;
}
