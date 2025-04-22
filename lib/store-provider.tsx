"use client"

import { type ReactNode, useEffect, useState, createContext, useContext } from "react"

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return <StoreContext.Provider value={{}}>{isHydrated ? children : null}</StoreContext.Provider>
}
