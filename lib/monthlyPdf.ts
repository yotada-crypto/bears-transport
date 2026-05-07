import type { MonthlyHouseholdSummary } from '@/types'
import { formatDate, formatYearMonth } from './calculations'

function yen(n: number) {
  return `¥${n.toLocaleString('ja-JP')}`
}

// スコープ付きCSSを document.head に注入し、html2canvas がスタイルを拾う
const PDF_CSS = `
.pdf-block * { box-sizing: border-box; margin: 0; padding: 0; }
.pdf-block {
  font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
  font-size: 12px;
  color: #1e293b;
  line-height: 1.6;
  background: white;
}
.pdf-block .grand-total {
  background: #1e40af; color: white; border-radius: 6px;
  padding: 12px 20px;
  display: flex; justify-content: space-between; align-items: center;
}
.pdf-block .grand-total .label { font-size: 12px; }
.pdf-block .grand-total .amount { font-size: 22px; font-weight: bold; }
.pdf-block h1 { font-size: 20px; color: #1e40af; }
.pdf-block .meta { color: #64748b; font-size: 10px; margin-top: 4px; }
.pdf-block h2 {
  font-size: 13px; color: #1e40af;
  border-left: 4px solid #1e40af; padding-left: 8px;
  margin-bottom: 6px;
}
.pdf-block h3 {
  font-size: 12px; font-weight: bold; color: #334155;
  background: #f1f5f9; padding: 5px 10px;
  border-radius: 4px; margin-bottom: 4px;
}
.pdf-block table { width: 100%; border-collapse: collapse; font-size: 11px; }
.pdf-block thead tr { background: #1e40af; color: white; }
.pdf-block th { padding: 5px 8px; text-align: left; font-weight: normal; }
.pdf-block td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
.pdf-block tbody tr:nth-child(even) td { background: #f8fafc; }
.pdf-block .subtotal td { background: #dbeafe !important; font-weight: bold; color: #1e40af; }
.pdf-block .total-row td { background: #1e3a8a !important; color: white; font-weight: bold; }
.pdf-block .right { text-align: right; }
.pdf-block .center { text-align: center; }
.pdf-block .bold { font-weight: bold; }
.pdf-block .blue { color: #1d4ed8; }
.pdf-block .small { font-size: 10px; color: #475569; }
.pdf-block .nowrap { white-space: nowrap; }
.pdf-block .divider { border-top: 2px solid #e2e8f0; margin-bottom: 6px; }
.pdf-block .doc-header { border-bottom: 3px solid #1e40af; padding-bottom: 10px; margin-bottom: 14px; }
`

function makeBlock(innerHTML: string, widthPx: number): HTMLElement {
  const el = document.createElement('div')
  el.className = 'pdf-block'
  el.style.cssText = `width:${widthPx}px;background:white;`
  el.innerHTML = innerHTML
  return el
}

function buildBlocks(
  summaries: MonthlyHouseholdSummary[],
  year: number,
  month: number,
  widthPx: number
): HTMLElement[] {
  const ym = `${year}-${String(month).padStart(2, '0')}`
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
  const grandTotal = summaries.reduce((s, h) => s + h.total_amount, 0)

  const expMap = new Map<string, {
    date: string; destination: string; total: number
    assignments: { name: string; trip_type: string; amount: number }[]
  }>()
  for (const s of summaries) {
    for (const d of s.details) {
      if (!expMap.has(d.expedition_id)) {
        expMap.set(d.expedition_id, { date: d.expedition_date, destination: d.destination, total: 0, assignments: [] })
      }
      const e = expMap.get(d.expedition_id)!
      e.total += d.total_amount
      e.assignments.push({ name: s.household_name, trip_type: d.trip_type, amount: d.total_amount })
    }
  }
  const expeditions = [...expMap.values()].sort((a, b) => a.date.localeCompare(b.date))

  const blocks: HTMLElement[] = []

  // Block 1: ヘッダー
  blocks.push(makeBlock(`
    <div class="doc-header">
      <h1>⚾ Bears遠征費精算アプリ</h1>
      <div class="meta">対象月: ${formatYearMonth(ym)}&emsp;|&emsp;生成日: ${today}</div>
    </div>
    <div class="grand-total">
      <span class="label">月間支払総額（${summaries.length}号分）</span>
      <span class="amount">${yen(grandTotal)}</span>
    </div>
  `, widthPx))

  // Block 2: 支払先サマリー
  const summaryRows = summaries.map((s) => `
    <tr>
      <td>${s.household_name}号</td>
      <td class="center">${s.round_trip_count > 0 ? `${s.round_trip_count}回` : '―'}</td>
      <td class="center">${s.one_way_count > 0 ? `${s.one_way_count}回` : '―'}</td>
      <td class="right bold blue">${yen(s.total_amount)}</td>
    </tr>`).join('')

  blocks.push(makeBlock(`
    <div class="divider"></div>
    <h2>支払先サマリー</h2>
    <table>
      <thead><tr><th>号</th><th class="center">往復</th><th class="center">片道</th><th class="right">支払額</th></tr></thead>
      <tbody>
        ${summaryRows}
        <tr class="total-row"><td colspan="3">合計</td><td class="right">${yen(grandTotal)}</td></tr>
      </tbody>
    </table>
  `, widthPx))

  // Block 3: 遠征別一覧
  const expeditionRows = expeditions.map((e) => {
    const names = e.assignments.map((a) =>
      `${a.name}号（${a.trip_type === 'round_trip' ? '往復' : '片道'} ${yen(a.amount)}）`
    ).join('　')
    return `
    <tr>
      <td class="nowrap">${formatDate(e.date)}</td>
      <td>${e.destination}</td>
      <td class="small">${names}</td>
      <td class="right bold blue">${yen(e.total)}</td>
    </tr>`
  }).join('')

  blocks.push(makeBlock(`
    <div class="divider"></div>
    <h2>遠征別一覧</h2>
    <table>
      <thead><tr><th>日付</th><th>遠征先</th><th>配車</th><th class="right">支払総額</th></tr></thead>
      <tbody>${expeditionRows}</tbody>
    </table>
  `, widthPx))

  // Block 4: 号別内訳 見出し
  blocks.push(makeBlock(`<div class="divider"></div><h2>号別内訳</h2>`, widthPx))

  // Block 5+: 各号（1号1ブロック = 改ページしない）
  for (const s of summaries) {
    const detailRows = s.details.map((d) => `
      <tr>
        <td>${d.destination}</td>
        <td class="nowrap">${formatDate(d.expedition_date)}</td>
        <td class="center">${d.trip_type === 'round_trip' ? '往復' : '片道'}</td>
        <td class="right bold blue">${yen(d.total_amount)}</td>
      </tr>`).join('')

    blocks.push(makeBlock(`
      <h3>${s.household_name}号</h3>
      <table>
        <thead><tr><th>遠征先</th><th>日付</th><th class="center">往復/片道</th><th class="right">支払額</th></tr></thead>
        <tbody>
          ${detailRows}
          <tr class="subtotal"><td colspan="3">合計</td><td class="right">${yen(s.total_amount)}</td></tr>
        </tbody>
      </table>
    `, widthPx))
  }

  return blocks
}

export async function downloadMonthlyPDF(
  summaries: MonthlyHouseholdSummary[],
  year: number,
  month: number
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 18
  const gap = 4
  const contentW = pageW - margin * 2

  const widthPx = Math.round(contentW * 96 / 25.4)

  // PDFスタイルを document.head に注入
  const styleEl = document.createElement('style')
  styleEl.textContent = PDF_CSS
  document.head.appendChild(styleEl)

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
  document.body.appendChild(wrapper)

  const blocks = buildBlocks(summaries, year, month, widthPx)
  for (const b of blocks) wrapper.appendChild(b)

  try {
    let currentY = margin
    let isFirstPage = true

    for (const block of blocks) {
      const canvas = await html2canvas(block, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      })
      const blockHmm = canvas.height * contentW / canvas.width

      if (!isFirstPage && currentY + blockHmm > pageH - margin) {
        pdf.addPage()
        currentY = margin
      }

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.93),
        'JPEG',
        margin,
        currentY,
        contentW,
        blockHmm
      )
      currentY += blockHmm + gap
      isFirstPage = false
    }

    const ym = `${year}${String(month).padStart(2, '0')}`
    pdf.save(`Bears精算_${ym}.pdf`)
  } finally {
    document.body.removeChild(wrapper)
    document.head.removeChild(styleEl)
  }
}
