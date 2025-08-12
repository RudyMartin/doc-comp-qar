import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthService, type AuthUser } from '../utils/supabase'
import { supabase } from '../utils/supabase'
import { APP_CONSTANTS } from '../utils/constants'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Demo mode: bypass authentication
    if (APP_CONSTANTS.DEMO_MODE) {
      const demoUser: AuthUser = {
        id: 'demo-user-id',
        email: 'demo@qcreporter.com',
        name: 'Demo User',
        access_token: 'demo-access-token'
      }
      setUser(demoUser)
      setLoading(false)
      return
    }

    // Production mode: real authentication
    const getInitialSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            access_token: session.access_token
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (APP_CONSTANTS.DEMO_MODE) {
      // In demo mode, just simulate successful login
      console.log('Demo mode: simulating login')
      return
    }
    
    setLoading(true)
    try {
      await AuthService.signIn(email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (APP_CONSTANTS.DEMO_MODE) {
      // In demo mode, just simulate successful signup
      console.log('Demo mode: simulating signup')
      return
    }
    
    setLoading(true)
    try {
      await AuthService.signUp(email, password, name)
      // After signup, sign in the user
      await AuthService.signIn(email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    if (APP_CONSTANTS.DEMO_MODE) {
      // In demo mode, just simulate logout
      console.log('Demo mode: simulating logout')
      return
    }
    
    setLoading(true)
    try {
      await AuthService.signOut()
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}