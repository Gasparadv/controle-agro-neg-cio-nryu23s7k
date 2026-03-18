import React, { createContext, useContext, useState } from 'react'
import { User } from '@/types'

interface TeamStoreContextType {
  users: User[]
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (id: string) => void
}

const initialUsers: User[] = [
  {
    id: 'u1',
    name: 'João Proprietário',
    email: 'joao@fazenda.com',
    role: 'owner',
    password: 'password123',
  },
  {
    id: 'u3',
    name: 'Maria Gestora',
    email: 'maria@fazenda.com',
    role: 'manager',
    password: 'password123',
  },
  {
    id: 'u2',
    name: 'Carlos Assistente',
    email: 'carlos@fazenda.com',
    role: 'collaborator',
    password: 'password123',
  },
]

const TeamStoreContext = createContext<TeamStoreContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers)

  const addUser = (user: User) => {
    setUsers((prev) => [...prev, user])
  }

  const updateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <TeamStoreContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
      {children}
    </TeamStoreContext.Provider>
  )
}

export default function useTeamStore() {
  const context = useContext(TeamStoreContext)
  if (!context) {
    throw new Error('useTeamStore must be used within a TeamProvider')
  }
  return context
}
