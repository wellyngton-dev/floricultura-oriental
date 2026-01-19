import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
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
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantidade: i.quantidade + 1 }
                  : i
              ),
            }
          }
          
          return {
            items: [...state.items, { ...item, quantidade: 1 }],
          }
        })
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      
      updateQuantity: (id, quantidade) => {
        if (quantidade <= 0) {
          get().removeItem(id)
          return
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantidade } : item
          ),
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantidade, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.preco * item.quantidade,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
