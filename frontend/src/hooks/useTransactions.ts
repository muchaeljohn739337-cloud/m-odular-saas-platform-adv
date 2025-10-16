'use client'

import { useState, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Transaction {
  id: string
  userId: string
  amount: number
  type: 'credit' | 'debit' | 'transfer' | 'bonus'
  status: 'pending' | 'completed' | 'failed'
  description?: string
  timestamp: string
}

export function useTransactions(userId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/transactions/recent/${userId}`)
        if (!response.ok) throw new Error('Failed to fetch transactions')
        
        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Set mock data on error for demo purposes
        setTransactions([
          {
            id: '1',
            userId,
            amount: 500,
            type: 'credit',
            status: 'completed',
            description: 'Salary deposit',
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            userId,
            amount: 150,
            type: 'debit',
            status: 'completed',
            description: 'Online purchase',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '3',
            userId,
            amount: 75,
            type: 'bonus',
            status: 'completed',
            description: 'Monthly bonus',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()

    // Setup Socket.IO for real-time transaction updates
    const socket: Socket = io(API_URL)
    
    socket.on('connect', () => {
      console.log('Socket connected for transaction updates')
      socket.emit('join-room', userId)
    })

    socket.on('transaction-created', (transaction: Transaction) => {
      console.log('New transaction received:', transaction)
      setTransactions(prev => [transaction, ...prev])
    })

    socket.on('global-transaction', (transaction: Transaction) => {
      console.log('Global transaction broadcast:', transaction)
    })

    return () => {
      socket.disconnect()
    }
  }, [userId])

  return { transactions, loading, error }
}
