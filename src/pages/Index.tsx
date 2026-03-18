import { StatCards } from '@/components/dashboard/StatCards'
import { CashFlowChart } from '@/components/dashboard/CashFlowChart'
import { CropStatusWidget } from '@/components/dashboard/CropStatusWidget'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'

export default function Index() {
  return (
    <div className="space-y-6">
      <StatCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart />
        <CropStatusWidget />
      </div>
      <RecentTransactions />
    </div>
  )
}
