export const COMPANY = {
  name: 'Floricultura Oriental',
  phone: '(16) 3371-2378',
  phoneRaw: '1633712378',
  whatsapp: '551633712378',
  email: 'contato@floriculturaoriental.com.br',
  address: {
    street: 'R. Eugênio Franco de Camargo',
    number: '1908',
    neighborhood: 'Jardim Brasil',
    city: 'São Carlos',
    state: 'SP',
    zip: '13569-270',
    full: 'R. Eugênio Franco de Camargo, 1908 – Jardim Brasil, São Carlos – SP, 13569-270',
  },
  hours: {
    weekdays: '09:00 às 18:00',
    weekend: 'Sábado: 09:00 às 18:00',
    display: 'Segunda a Sábado: 09:00 às 18:00',
  },
  rating: 4.8,
  social: {
    instagram: 'https://instagram.com/floriculturaoriental',
    facebook: 'https://facebook.com/floriculturaoriental',
  },
  maps: {
    url: 'https://maps.google.com/?q=-22.0103,-47.8950',
    embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3699.8!2d-47.8950!3d-22.0103',
  },
} as const

export const getWhatsAppLink = (message?: string) => {
  const baseUrl = `https://wa.me/${COMPANY.whatsapp}`
  if (!message) return baseUrl
  return `${baseUrl}?text=${encodeURIComponent(message)}`
}

export const getPhoneLink = () => `tel:+55${COMPANY.phoneRaw}`

export const getEmailLink = (subject?: string) => {
  const baseUrl = `mailto:${COMPANY.email}`
  if (!subject) return baseUrl
  return `${baseUrl}?subject=${encodeURIComponent(subject)}`
}
