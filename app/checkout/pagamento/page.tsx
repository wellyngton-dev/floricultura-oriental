import { Suspense } from 'react'
import PagamentoPixContent from './PagamentoPixContent'

export default function PagamentoPix() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando pagamento...</p>
          </div>
        </div>
      }
    >
      <PagamentoPixContent />
    </Suspense>
  )
}
