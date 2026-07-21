import { ref, type Ref } from 'vue'

export interface Signature {
  id: string
  text: string
  x: number
  y: number
  rotation: number
  color: string
  createdAt: number
  expiresAt: number
}

export interface WallHandle {
  isOpen: Ref<boolean>
  signatures: Ref<Signature[]>
  open: () => void
  close: () => void
  add: (input: { text: string; x: number; y: number; rotation?: number; color?: string }) => Signature
  clear: () => void
}

const COLORS = ['#f5c542', '#7dd3fc', '#fda4af', '#a7f3d0', '#c4b5fd']

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]!
}

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function createWall(): WallHandle {
  const isOpen = ref(false)
  const signatures = ref<Signature[]>([])

  function open() {
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  function add(input: { text: string; x: number; y: number; rotation?: number; color?: string }): Signature {
    const now = Date.now()
    const sig: Signature = {
      id: makeId(),
      text: input.text,
      x: input.x,
      y: input.y,
      rotation: input.rotation ?? Math.floor(Math.random() * 30) - 15,
      color: input.color ?? randomColor(),
      createdAt: now,
      expiresAt: now + 3600_000,
    }
    signatures.value = [...signatures.value, sig]
    return sig
  }
  function clear() {
    signatures.value = []
  }

  return { isOpen, signatures, open, close, add, clear }
}

export function usePresenceWall(): WallHandle {
  // Singleton for now — replaced when server mode is added.
  return createWall()
}