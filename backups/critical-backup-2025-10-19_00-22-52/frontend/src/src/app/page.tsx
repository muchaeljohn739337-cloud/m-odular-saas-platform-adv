import SidebarLayout from '@/components/SidebarLayout'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-3 sm:p-4 md:p-6 lg:p-8">
        <Dashboard />
      </div>
    </SidebarLayout>
  )
}
