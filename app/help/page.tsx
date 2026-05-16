export default function HelpPage() {
  return (
    <div>
      <header className="bg-blue-800 text-white px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">使い方</h1>
        <p className="text-blue-200 text-sm mt-0.5">Bears遠征費精算アプリの使い方</p>
      </header>

      <div className="p-4 space-y-6 pb-8">

        {/* このアプリでできること */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h2 className="font-bold text-slate-800 mb-2">このアプリでできること</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            遠征の交通費（ガソリン代・高速代・駐車場代）を記録し、月ごとに家庭別の精算明細をPDFで出力できます。
          </p>
          <div className="mt-3 bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-800 font-medium text-center">
            遠征を登録 → 車を登録 → 月次精算でPDF出力
          </div>
        </div>

        {/* 遠征を登録する */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h2 className="font-bold text-slate-800 mb-3">🧳 遠征を登録する</h2>
          <ol className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">1.</span>「遠征一覧」タブ → 右上の「＋」をタップ</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">2.</span>日付を入力</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">3.</span><span><strong>区内 / 区外</strong>を選択<br /><span className="text-slate-500">区内：固定料金 / 区外：距離計算</span></span></li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">4.</span>区外の場合、遠征先を検索してルートを選択</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">5.</span>高速利用の場合はインター名とETC料金（片道）を入力</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">6.</span>メモ欄に大会名などを入力（任意）</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">7.</span>「登録して配車を設定」をタップ</li>
          </ol>
        </div>

        {/* 配車を登録する */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h2 className="font-bold text-slate-800 mb-3">🚗 車を登録する</h2>
          <ol className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">1.</span>「車登録」タブで車（家庭）をあらかじめ登録</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">2.</span>遠征一覧から対象の遠征をタップ</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">3.</span>「家庭を追加」から車を選択し、往復 / 片道を設定</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">4.</span>駐車場代がある場合は金額を入力（任意）</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">5.</span>金額が自動で計算されます</li>
          </ol>
          <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500">
            送り・迎え両方担当 → 往復　／　どちらか一方のみ → 片道（半額）
          </div>
        </div>

        {/* 駐車場代を登録・編集する */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h2 className="font-bold text-slate-800 mb-3">🅿️ 駐車場代を登録・編集する</h2>
          <p className="text-sm text-slate-600 mb-3">駐車場代は配車ごとに個別に登録できます。登録後も後から追加・変更が可能です。</p>
          <ol className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">登録時</span>配車追加フォームの「駐車場代（任意）」欄に金額を入力</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">後日追加</span>配車カードの「編集」をタップ → 駐車場代欄に入力して保存</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">金額修正</span>同じく「編集」からガソリン代・高速代も上書き変更できます</li>
          </ol>
        </div>

        {/* 月次精算 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h2 className="font-bold text-slate-800 mb-3">📊 月次精算を見る</h2>
          <ol className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">1.</span>「月次精算」タブをタップ</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">2.</span>年・月を選択</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">3.</span>家庭ごとの支払い合計と遠征一覧が表示されます（駐車場代を含む）</li>
            <li className="flex gap-2"><span className="font-bold text-blue-700 shrink-0">4.</span>「PDFをダウンロード」で明細を保存・印刷</li>
          </ol>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h2 className="font-bold text-slate-800 mb-3">FAQ</h2>
          <div className="space-y-4 text-sm">
            {[
              {
                q: '区内と区外の違いは？',
                a: '区内は距離に関係なく設定した固定料金が支給されます。区外は出発地点からの距離をもとにガソリン代を計算します。',
              },
              {
                q: '片道と往復はどう使い分ける？',
                a: '送り・迎えの両方を担当した場合は「往復」、どちらか一方のみの場合は「片道」を選択してください。片道は往復の半額になります。',
              },
              {
                q: '金額の計算方法は？',
                a: 'ガソリン代 ＝ 距離（km）× ガソリン単価 × 2（往復）です。高速利用の場合はETC料金（往復）が加算されます。駐車場代がある場合はさらに加算されます。',
              },
              {
                q: '駐車場代を後から追加したい',
                a: '遠征一覧から該当の遠征をタップ → 配車カードの「編集」をタップすると、駐車場代を入力・変更できます。',
              },
              {
                q: '金額の端数はどうなる？',
                a: '設定で指定した単位（1円・10円・100円）で切り上げされます。駐車場代は入力した金額がそのまま加算されます。',
              },
              {
                q: '設定を変えたい',
                a: '「設定」タブからガソリン単価・区内遠征費・切り上げ単位・出発地点を変更できます。変更後は「保存する」をタップしてください。',
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-semibold text-slate-700">Q. {q}</p>
                <p className="text-slate-500 mt-1 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 設定項目 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h2 className="font-bold text-slate-800 mb-3">⚙️ 設定項目の説明</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: '出発地点', desc: 'グラウンドなど、距離計算の起点となる住所' },
              { label: '区内遠征費', desc: '区内遠征の際に支給する固定金額（往復）' },
              { label: '切り上げ単位', desc: '支払金額の端数処理の単位（1・10・100円）' },
              { label: 'ガソリン単価', desc: '1kmあたりのガソリン代（円/km）' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex gap-3">
                <span className="font-semibold text-slate-700 shrink-0 w-28">{label}</span>
                <span className="text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 py-2">
          <p>⚾ Bears遠征費精算アプリ v1.1</p>
        </div>
      </div>
    </div>
  )
}
