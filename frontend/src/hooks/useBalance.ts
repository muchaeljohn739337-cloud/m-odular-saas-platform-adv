'use client'

import { useState, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Balance {
  balance_main: number
  earnings: number
  referral: number
  total: number
  portfolio?: {
    USD: number
    ETH: number
    BTC: number
  }
}

export function useBalance(userId: string) {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const [balanceResponse, portfolioResponse] = await Promise.all([
          fetch(`${API_URL}/api/transactions/balance/${userId}`),
          fetch(`${API_URL}/api/admin/portfolio/user/${userId}`)
        ])

        if (!balanceResponse.ok) throw new Error('Failed to fetch balance')

        const data = await balanceResponse.json()
        const portfolioData = portfolioResponse.ok ? await portfolioResponse.json() : null

        const balance: Balance = {
          balance_main: data.balance || 4000,
          earnings: data.earnings || 1250,
          referral: data.referral || 0,
          total: data.balance || 5250,
          portfolio: {
            USD: portfolioData?.totals?.USD ?? 0,
            ETH: portfolioData?.totals?.ETH ?? 0,
            BTC: portfolioData?.totals?.BTC ?? 0
          }
        }
        
        setBalance(balance)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Set mock data on error for demo purposes
        setBalance({
          balance_main: 4000,
          earnings: 1250,
          referral: 0,
          total: 5250,
          portfolio: {
            USD: 0,
            ETH: 0,
            BTC: 0
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()

    // Setup Socket.IO for real-time balance updates
    const socket: Socket = io(API_URL)
    
    socket.on('connect', () => {
      console.log('Socket connected for balance updates')
      socket.emit('join-room', userId)
    })

    socket.on('transaction-created', () => {
      // Refetch balance when a new transaction is created
      fetchBalance()
    })

    return () => {
      socket.disconnect()
    }
  }, [userId])

  return { balance, loading, error }
}
