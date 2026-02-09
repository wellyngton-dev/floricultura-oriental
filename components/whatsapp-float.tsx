'use client'

import { MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { COMPANY, getWhatsAppLink } from '@/lib/constants/company'

export default function WhatsAppFloat() {
  const [isVisible, setIsVisible] = useState(false)

  const message = `Olá! Gostaria de saber mais sobre flores e arranjos da ${COMPANY.name}.`
  const whatsappUrl = getWhatsAppLink(message)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        fixed bottom-6 right-6 z-50
        bg-green-500 hover:bg-green-600
        text-white rounded-full p-4
        shadow-lg hover:shadow-2xl
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
        group
      `}
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-6 w-6 animate-pulse group-hover:animate-none" />
      
      {/* Tooltip */}
      <span className="
        absolute right-full mr-3 top-1/2 -translate-y-1/2
        bg-gray-900 text-white text-sm
        px-3 py-2 rounded-lg whitespace-nowrap
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        pointer-events-none
      ">
        Fale conosco!
      </span>
    </a>
  )
}
