import Link from 'next/link'
import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getProductFormOptions } from '@/lib/products/form-data'
import { ProductForm } from '@/components/products/ProductForm'
import { Button } from '@/components/ui/button'
import { features } from '../../../../../datalist'

export default async function ProductsNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const options = await getProductFormOptions()

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-2xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">生地の登録</h1>
            <Link href="/products">
              <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                戻る
              </Button>
            </Link>
          </div>
          <ProductForm {...options} features={features} />
        </div>
      </div>
    </div>
  )
}
