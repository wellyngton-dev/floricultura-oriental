import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, Facebook, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo' // ← MUDANÇA AQUI: remover "default" 
import { COMPANY, getPhoneLink, getEmailLink } from '@/lib/constants/company'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo e Sobre */}
          <div>
            <Logo size="md" variant="dark" className="mb-6" />
            <p className="text-gray-400 text-sm mt-4">
              Flores frescas e arranjos exclusivos para tornar seus momentos ainda mais especiais.
            </p>
            <div className="mt-4 flex items-center gap-2 text-yellow-400 text-sm">
              <span className="text-xl">⭐</span>
              <span className="font-semibold">{COMPANY.rating}</span>
              <span className="text-gray-400">avaliação</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-pink-400 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-pink-400 transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-pink-400 transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-pink-400 transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-pink-400 flex-shrink-0" />
                <a 
                  href={getPhoneLink()} 
                  className="hover:text-pink-400 transition-colors"
                >
                  {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-pink-400 flex-shrink-0" />
                <a 
                  href={getEmailLink()} 
                  className="hover:text-pink-400 transition-colors break-all"
                >
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-pink-400 flex-shrink-0 mt-1" />
                <a
                  href={COMPANY.maps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  {COMPANY.address.street}, {COMPANY.address.number}<br />
                  {COMPANY.address.neighborhood}<br />
                  {COMPANY.address.city} - {COMPANY.address.state}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-pink-400 flex-shrink-0" />
                <span>{COMPANY.hours.display}</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-pink-500/10 hover:text-pink-400"
                asChild
              >
                <a 
                  href={COMPANY.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-pink-500/10 hover:text-pink-400"
                asChild
              >
                <a 
                  href={COMPANY.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Siga-nos para novidades, promoções e inspirações florais!
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {COMPANY.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
