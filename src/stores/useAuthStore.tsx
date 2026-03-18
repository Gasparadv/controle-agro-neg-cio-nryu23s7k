import React, { createContext, useContext, useState } from 'react'
import { Role } from '@/types'

interface AuthStoreContextType {
  role: Role
  toggleRole: () => void
  userName: string
}

const AuthStoreContext = createContext<AuthStoreContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('owner')

  const toggleRole = () => {
    setRole((prev) => (prev === 'owner' ? 'collaborator' : 'owner'))
  }

  const userName = role === 'owner' ? 'João Proprietário' : 'Carlos Assistente'

  return (
    <AuthStoreContext.Provider value={{ role, toggleRole, userName }}>
      {children}
    </AuthStoreContext.Provider>
  )
}

export default function useAuthStore() {
  const context = useContext(AuthStoreContext)
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
