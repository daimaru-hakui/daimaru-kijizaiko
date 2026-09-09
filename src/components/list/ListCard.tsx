import { cn } from "@/lib/utils";

export type ListCardProps = {
  /**
   * md 以上のペイン割り。Tailwind は動的に組み立てた class を拾えないため、
   * 呼び出し元に `md:grid-cols-[...]` をリテラルで書いてもらう。
   *
   * 操作ペインの幅は auto にしない。削除ボタンの有無でカードごとに auto 幅が
   * 変わり、残りを分け合う fr の配分がズレて品番ペインの左端が揃わなくなる。
   */
  mdCols: string;
  /** 在庫不足など異常時に枠と左アクセント線を赤くする */
  danger?: boolean;
  children: React.ReactNode;
};

/**
 * 一覧カードの外枠。md 未満では各ペインを縦に積み、md 以上で mdCols の横並びになる。
 */
export function ListCard({ mdCols, danger, children }: ListCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border shadow-sm overflow-hidden transition-shadow hover:shadow-md flex",
        danger ? "border-red-300" : "border-slate-200",
      )}
    >
      {/* 左アクセントライン */}
      <div
        className={cn("w-1 shrink-0", danger ? "bg-red-400" : "bg-indigo-600")}
      />

      {/* md 未満は「本文 = 1fr / アクション = auto」の 2 列。ペインは既定で 2 列ぶち抜き */}
      <div
        className={cn(
          "flex-1 grid grid-cols-[minmax(0,1fr)_auto] min-w-0",
          mdCols,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export type ListCardPaneProps = {
  /** 数値ペイン。薄いグレー背景にして InlineStat を並べる。列数は className で渡す */
  stat?: boolean;
  /** アクションペイン。区切り線を持たず、狭いときは横に折り返す */
  action?: boolean;
  /** md 未満でもアクションと同じ行に並べる。バッジ1個などの狭いペイン向け */
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * カード内の1ペイン。区切り線は md 未満では下線、md 以上では右線になる。
 * 親に divide-x を置くとこの切り替えができないため、線はペイン側で持つ。
 */
export function ListCardPane({
  stat,
  action,
  inline,
  className,
  children,
}: ListCardPaneProps) {
  if (action) {
    return (
      <div
        className={cn("px-2 py-2 flex flex-wrap items-center gap-1", className)}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-3 py-2 min-w-0",
        stat
          ? "grid gap-x-1.5 bg-slate-50/60"
          : "flex flex-col justify-center gap-1",
        inline
          ? "border-r border-slate-100"
          : "col-span-2 border-b border-slate-100 last:border-b-0 md:col-auto md:border-b-0 md:border-r md:last:border-r-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
