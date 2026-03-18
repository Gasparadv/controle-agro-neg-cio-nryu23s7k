import React, { createContext, useContext, useState } from 'react'
import { Role, User } from '@/types'
import useTeamStore from './useTeamStore'

interface AuthStoreContextType {
  user: User | null
  role: Role
  userName: string
  setActiveUser: (id: string) => void
}

const AuthStoreContext = createContext<AuthStoreContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { users } = useTeamStore()
  const [activeUserId, setActiveUserId] = useState<string>('u1')

  const user = users.find((u) => u.id === activeUserId) || users[0] || null
  const role = user?.role || 'owner'
  const userName = user?.name || 'Desconhecido'

  return (
    <AuthStoreContext.Provider value={{ user, role, userName, setActiveUser: setActiveUserId }}>
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
