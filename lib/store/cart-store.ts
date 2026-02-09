import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  nome: string
  preco: number
  quantidade: number
  imagemUrl: string | null
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantidade'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantidade: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantidade: i.quantidade + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, quantidade: 1 }] })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantidade) => {
        if (quantidade <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantidade } : i
            ),
          })
        }
      },

      clearCart: () => {
        set({ items: [] })
      },

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantidade, 0)
      },

      get totalPrice() {
        return get().items.reduce(
          (sum, item) => sum + item.preco * item.quantidade,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
