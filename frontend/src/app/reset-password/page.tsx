'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState('')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('Resetting...')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })
      const data = await res.json()
      setStatus(data.message || 'Password reset successful!')
    } catch (err) {
      setStatus('Failed to reset password.')
    }
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
      <form onSubmit={handleSubmit} className='bg-white p-6 rounded-md shadow-md w-full max-w-sm'>
        <h2 className='text-2xl font-semibold mb-4 text-center'>Reset Password</h2>
        <input
          type='password'
          placeholder='Enter new password'
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className='border border-gray-300 rounded-md w-full p-2 mb-4'
          required
        />
        <button type='submit' className='bg-green-600 text-white rounded-md w-full py-2 hover:bg-green-700'>
          Reset Password
        </button>
        <p className='text-sm mt-3 text-center text-gray-600'>{status}</p>
      </form>
    </div>
  )
}
