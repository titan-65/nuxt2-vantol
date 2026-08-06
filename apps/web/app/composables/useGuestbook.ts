import {
  ref as dbRef,
  onValue,
  push,
  remove,
  set,
  serverTimestamp,
  query,
  orderByChild,
} from "firebase/database";
import type { Database, Unsubscribe } from "firebase/database";

export interface GuestbookEntry {
  id: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorPhoto: string;
  createdAt: number;
}

export const useGuestbook = () => {
  const nuxtApp = useNuxtApp();
  const { user, isAdmin } = useFirebaseAuth();

  const entries = useState<GuestbookEntry[]>("guestbook:entries", () => []);
  const loading = useState<boolean>("guestbook:loading", () => true);

  let unsubscribe: Unsubscribe | null = null;

  const init = () => {
    if (import.meta.server) return;

    const db = nuxtApp.$firebaseDatabase as Database;
    if (!db) return;

    const entriesRef = dbRef(db, "guestbook");
    const entriesQuery = query(entriesRef, orderByChild("createdAt"));

    unsubscribe = onValue(entriesQuery, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        entries.value = [];
        loading.value = false;
        return;
      }

      const list: GuestbookEntry[] = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        message: value.message,
        authorName: value.authorName,
        authorEmail: value.authorEmail,
        authorPhoto: value.authorPhoto,
        createdAt: value.createdAt,
      }));

      // Sort newest first
      list.sort((a, b) => b.createdAt - a.createdAt);
      entries.value = list;
      loading.value = false;
    });
  };

  const addEntry = async (message: string) => {
    if (!user.value) {
      throw new Error("Must be signed in to leave a message");
    }

    const db = nuxtApp.$firebaseDatabase as Database;
    const entriesRef = dbRef(db, "guestbook");
    const newRef = push(entriesRef);

    await set(newRef, {
      message: message.trim(),
      authorName: user.value.displayName || "Anonymous",
      authorEmail: user.value.email || "",
      authorPhoto: user.value.photoURL || "",
      createdAt: serverTimestamp(),
    });
  };

  const deleteEntry = async (entryId: string) => {
    if (!user.value) return;

    const entry = entries.value.find((e) => e.id === entryId);
    if (!entry) return;

    const canDelete = isAdmin.value || entry.authorEmail === user.value.email;
    if (!canDelete) {
      throw new Error("Not authorized to delete this entry");
    }

    const db = nuxtApp.$firebaseDatabase as Database;
    const entryRef = dbRef(db, `guestbook/${entryId}`);
    await remove(entryRef);
  };

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  return {
    entries,
    loading,
    init,
    addEntry,
    deleteEntry,
    cleanup,
  };
};
