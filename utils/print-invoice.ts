import { Invoice } from "@/types";

export function printInvoice(
  invoice: Invoice,
  orgName: string,
  formatCurrency: (n: number) => string,
  formatDate: (s: string) => string
) {
  const lineRows = invoice.lineItems
    .map(
      (item) => `
      <tr>
        <td>${item.description}</td>
        <td class="right">${item.quantity}</td>
        <td class="right">${formatCurrency(item.unitPrice)}</td>
        <td class="right bold">${formatCurrency(item.total)}</td>
      </tr>`
    )
    .join("");

  const balance = invoice.total - invoice.paidAmount;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 13px; color: #111; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .org-name { font-size: 20px; font-weight: 700; }
    .invoice-meta { text-align: right; }
    .invoice-number { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-unpaid { background: #fef9c3; color: #854d0e; }
    .badge-partial { background: #dbeafe; color: #1e40af; }
    .badge-overdue { background: #fee2e2; color: #991b1b; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 36px; }
    .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #6b7280; margin-bottom: 6px; }
    .party-name { font-weight: 600; font-size: 14px; }
    .party-meta { color: #6b7280; margin-top: 3px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { border-bottom: 2px solid #e5e7eb; }
    th { padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #6b7280; }
    td { padding: 10px 10px; border-bottom: 1px solid #f3f4f6; }
    .right { text-align: right; }
    .bold { font-weight: 600; }
    .totals { display: flex; justify-content: flex-end; margin-top: 8px; }
    .totals-box { min-width: 240px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
    .totals-row.grand { font-weight: 700; font-size: 15px; border-top: 2px solid #e5e7eb; margin-top: 4px; padding-top: 10px; }
    .totals-row.paid-row { color: #16a34a; }
    .totals-row.balance-row { font-weight: 600; }
    .balance-due { color: #dc2626; }
    .balance-settled { color: #16a34a; }
    .muted { color: #6b7280; }
    .discount { color: #16a34a; }
    footer { margin-top: 48px; text-align: center; color: #9ca3af; font-size: 11px; }
    @media print {
      @page { margin: 1.5cm; size: A4 portrait; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="org-name">${orgName}</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <span class="badge badge-${invoice.status}">${invoice.status}</span>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-label">Billed To</div>
      <div class="party-name">${invoice.customerName}</div>
    </div>
    <div style="text-align:right">
      <div class="party-label">Dates</div>
      <div class="party-meta">Issued: ${formatDate(invoice.createdAt)}</div>
      <div class="party-meta">Due: ${formatDate(invoice.dueDate)}</div>
    </div>
  </div>

  <hr class="divider" />

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="right">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row">
        <span class="muted">Subtotal</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
      ${
        invoice.discount > 0
          ? `<div class="totals-row"><span class="discount">Discount</span><span class="discount">− ${formatCurrency(invoice.discount)}</span></div>`
          : ""
      }
      ${
        invoice.tax > 0
          ? `<div class="totals-row"><span class="muted">Tax</span><span>${formatCurrency(invoice.tax)}</span></div>`
          : ""
      }
      <div class="totals-row grand">
        <span>Total</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
      <div class="totals-row paid-row">
        <span>Paid</span>
        <span>${formatCurrency(invoice.paidAmount)}</span>
      </div>
      <div class="totals-row balance-row">
        <span>Balance Due</span>
        <span class="${balance > 0 ? "balance-due" : "balance-settled"}">${formatCurrency(balance)}</span>
      </div>
    </div>
  </div>

  <footer>Thank you for your business.</footer>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 250);
}
