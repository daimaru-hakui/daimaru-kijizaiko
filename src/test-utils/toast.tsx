import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { AppToastContainer } from '@/components/ui/toast'

/**
 * トースト検証用の render。対象コンポーネントと AppToastContainer を一緒に描画する。
 * result.ok / result.error は window.alert ではなくトーストで表示されるため、
 * `screen.findByText('...')` でトーストの文言を検証する。
 */
export function renderWithToast(ui: ReactElement) {
  return render(
    <>
      {ui}
      <AppToastContainer />
    </>
  )
}
