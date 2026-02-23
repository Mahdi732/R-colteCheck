import { db } from '@/config/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc
} from 'firebase/firestore';

export interface Agriculteur {
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Parcelle {
  id?: string;
  nom: string;
  surface: number;
  cultures: string[];
  periodeRecolte: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Zone {
  id?: string;
  nom: string;
  description: string;
  createdAt?: Timestamp;
}

export interface Recolte {
  id?: string;
  culture: string;
  poidsKg: number;
  dateRecolte: Timestamp;
  notes: string;
  createdAt?: Timestamp;
}

export async function getProfile(userId: string): Promise<Agriculteur | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? (snap.data() as Agriculteur) : null;
}

export async function saveProfile(userId: string, data: Partial<Agriculteur>) {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
}

function parcellesCol(userId: string) {
  return collection(db, 'users', userId, 'parcelles');
}

export async function getParcelles(userId: string): Promise<Parcelle[]> {
  const snap = await getDocs(parcellesCol(userId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Parcelle));
}

export async function getParcelle(userId: string, parcelleId: string): Promise<Parcelle | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'parcelles', parcelleId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Parcelle) : null;
}

export async function addParcelle(userId: string, data: { nom: string; surface: number; cultures: string[]; periodeRecolte: string }) {
  return addDoc(parcellesCol(userId), {
    nom: data.nom,
    surface: data.surface,
    cultures: data.cultures,
    periodeRecolte: data.periodeRecolte,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateParcelle(userId: string, parcelleId: string, data: Partial<Parcelle>) {
  const { id, createdAt, ...rest } = data as any;
  await updateDoc(doc(db, 'users', userId, 'parcelles', parcelleId), { ...rest, updatedAt: serverTimestamp() });
}

export async function deleteParcelle(userId: string, parcelleId: string) {
  await deleteDoc(doc(db, 'users', userId, 'parcelles', parcelleId));
}

function zonesCol(userId: string, parcelleId: string) {
  return collection(db, 'users', userId, 'parcelles', parcelleId, 'zones');
}

export async function getZones(userId: string, parcelleId: string): Promise<Zone[]> {
  const snap = await getDocs(zonesCol(userId, parcelleId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Zone));
}

export async function getZone(userId: string, parcelleId: string, zoneId: string): Promise<Zone | null> {
  const snap = await getDoc(doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Zone) : null;
}

export async function addZone(userId: string, parcelleId: string, data: { nom: string; description: string }) {
  return addDoc(zonesCol(userId, parcelleId), {
    nom: data.nom,
    description: data.description,
    createdAt: serverTimestamp(),
  });
}

export async function updateZone(userId: string, parcelleId: string, zoneId: string, data: Partial<Zone>) {
  const { id, ...rest } = data as any;
  await updateDoc(doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId), rest);
}

export async function deleteZone(userId: string, parcelleId: string, zoneId: string) {
  await deleteDoc(doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId));
}

function recoltesCol(userId: string, parcelleId: string, zoneId: string) {
  return collection(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId, 'recoltes');
}

export async function getRecoltes(userId: string, parcelleId: string, zoneId: string): Promise<Recolte[]> {
  const snap = await getDocs(recoltesCol(userId, parcelleId, zoneId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recolte));
}

export async function addRecolte(userId: string, parcelleId: string, zoneId: string, data: { culture: string; poidsKg: number; dateRecolte: Timestamp; notes: string }) {
  return addDoc(recoltesCol(userId, parcelleId, zoneId), {
    culture: data.culture,
    poidsKg: data.poidsKg,
    dateRecolte: data.dateRecolte,
    notes: data.notes,
    createdAt: serverTimestamp(),
  });
}

export async function updateRecolte(
  userId: string,
  parcelleId: string,
  zoneId: string,
  recolteId: string,
  data: Partial<Recolte>,
) {
  const { id, ...rest } = data as any;
  await updateDoc(doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId, 'recoltes', recolteId), rest);
}

export async function deleteRecolte(userId: string, parcelleId: string, zoneId: string, recolteId: string) {
  await deleteDoc(doc(db, 'users', userId, 'parcelles', parcelleId, 'zones', zoneId, 'recoltes', recolteId));
}
