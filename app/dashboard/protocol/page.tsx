import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProtocolForGoal } from '@/lib/protocols'
import { parseProtocolJournal } from '@/lib/protocolJournal'
import { DISCLAIMER } from '@/components/AppFooter'
import UnlockedProtocolClient from '@/app/protocol/unlocked/UnlockedProtocolClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function DashboardProtocolPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/signup')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, payment_status')
    .eq('id', user.id)
    .single()

  if (profile?.payment_status !== 'paid') {
    redirect('/protocol/locked')
  }

  const { data: answers } = await admin
    .from('questionnaire_answers')
    .select('goal')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const goal = answers?.goal ?? 'General health'
  const protocol = getProtocolForGoal(goal)
  const firstName = profile?.first_name ?? ''
  const content = protocol.content(firstName)
  const blocks = parseProtocolJournal(content)

  return (
    <>
      <div className="border-b border-[#D4CEC3]/80 bg-[#F0EDE6] px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#3D5A80] hover:text-[#C9A84C]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
      </div>
      <UnlockedProtocolClient
        blocks={blocks}
        compound={protocol.compound}
        firstName={firstName}
        goal={goal}
        disclaimer={DISCLAIMER}
        embedInDashboard
      />
    </>
  )
}
