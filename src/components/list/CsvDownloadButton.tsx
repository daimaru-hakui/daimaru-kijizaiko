'use client'

import { Button } from '@/components/ui/button'
import { downloadCsv } from '@/lib/download'
import { getTodayDate } from '@/lib/dates'
import { canDownloadCsv } from '@/lib/permissions'
import { useUserRoles } from '@/components/app-shell/roles-context'

type Props = {
  /** 拡張子と日付を除いたファイル名。ダウンロード時に `_YYYY-MM-DD.csv` が付く */
  filename: string
  /** 件数が多い一覧でも押すまで組み立てないよう、文字列ではなく関数で受け取る */
  build: () => string
}

export function CsvDownloadButton({ filename, build }: Props) {
  const roles = useUserRoles()
  if (!canDownloadCsv(roles)) return null

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-xs"
      onClick={() => downloadCsv(build(), `${filename}_${getTodayDate()}.csv`)}
    >
      CSV
    </Button>
  )
}
