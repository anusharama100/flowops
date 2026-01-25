'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, UserRole, Permission } from '@/types'
import { store } from '@/lib/data/store'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  switchRole: (role: UserRole) => void
  currentRole: UserRole
  permissions: Permission
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default users for each role
const DEFAULT_USERS: Record<UserRole, string> = {
  requester: 'user-1',  // Alex Chen
  approver: 'user-4',   // Emily Davis
  agent: 'user-6',      // Lisa Anderson
  admin: 'user-8',      // Rachel Green
}

function getPermissions(role: UserRole): Permission {
  switch (role) {
    case 'requester':
      return {
        canCreate: true,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canApprove: false,
        canResolve: false,
        canClose: true,
        canReopen: true,
        canViewInternalNotes: false,
        canAddInternalNotes: false,
        canManageConfig: false,
      }
    case 'approver':
      return {
        canCreate: true,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canApprove: true,
        canResolve: false,
        canClose: false,
        canReopen: false,
        canViewInternalNotes: false,
        canAddInternalNotes: false,
        canManageConfig: false,
      }
    case 'agent':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canAssign: true,
        canApprove: false,
        canResolve: true,
        canClose: true,
        canReopen: true,
        canViewInternalNotes: true,
        canAddInternalNotes: true,
        canManageConfig: false,
      }
    case 'admin':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        canApprove: true,
        canResolve: true,
        canClose: true,
        canReopen: true,
        canViewInternalNotes: true,
        canAddInternalNotes: true,
        canManageConfig: true,
      }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole>('requester')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize store and load user
    if (typeof window !== 'undefined') {
      store.initialize()
      
      // Check for saved role
      const savedRole = localStorage.getItem('flowops_current_role') as UserRole | null
      const role = savedRole || 'requester'
      
      const userId = DEFAULT_USERS[role]
      const foundUser = store.getUser(userId)
      
      setCurrentRole(role)
      setUser(foundUser || null)
      setIsLoading(false)
    }
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    const userId = DEFAULT_USERS[role]
    const foundUser = store.getUser(userId)
    
    setCurrentRole(role)
    setUser(foundUser || null)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('flowops_current_role', role)
    }
  }, [])

  const permissions = getPermissions(currentRole)

  return (
    <AuthContext.Provider value={{ user, isLoading, switchRole, currentRole, permissions }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
