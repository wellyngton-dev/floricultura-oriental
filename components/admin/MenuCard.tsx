import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MenuCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
}

export function MenuCard({ title, description, icon: Icon, href, color }: MenuCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-2 hover:border-pink-200">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={`${color} p-4 rounded-xl shadow-md`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
