import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function BackToHome({ text = '回主選單' }) {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      className="mb-4"
      onClick={() => router.push('/login')}
    >
      ← {text}
    </Button>
  )
}