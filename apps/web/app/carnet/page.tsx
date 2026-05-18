import { CarnetView } from '@/components/carnet/CarnetView'
import { MOCK_CARNET } from '@/lib/carnet/mock-carnet'

export default function CarnetPage() {
  return <CarnetView data={MOCK_CARNET} />
}
