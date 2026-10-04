type InvoiceOrder = Record<string, unknown> & { id?: string };

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return typeof value === 'object' && value !== null ? value as JsonObject : {};
}

function asText(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'purchase-order';
}

export async function generateInvoice(order: InvoiceOrder) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const location = asObject(order.location);
  const client = asObject(location.client);
  const orderNumber = asText(order.po_number) || asText(order.id) || '—';
  const orderDateValue = order.order_date;
  const orderDate = orderDateValue ? new Date(String(orderDateValue)) : null;
  const formattedDate = orderDate && !Number.isNaN(orderDate.valueOf())
    ? orderDate.toLocaleDateString('en-IN')
    : '—';
  const clientName = asText(order.client_name) || asText(client.name) || '—';
  const locationName = asText(order.location_name) || asText(location.name) || '—';
  const rawAmount = Number(order.total_amount);
  const amount = order.total_amount == null || !Number.isFinite(rawAmount)
    ? '—'
    : new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rawAmount);
  const status = asText(order.status) || '—';

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const centerX = pageWidth / 2;
  let cursorY = 18;

  pdf.setTextColor(24, 43, 33);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('SHREEJI CONSTRUCTION', centerX, cursorY, { align: 'center' });
  cursorY += 6;

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.text('Reliability in Every Rivet and Recruitment.', centerX, cursorY, { align: 'center' });
  cursorY += 6;

  const companyLines = [
    'Plot No 855/859, Shivay Bungalow, Bhavnagar, Gujarat, India',
    'Mob: 9687375151 | Email: shreejiconstruction2007@zohomail.in / shreeji.shreejiconstruction.co@gmail.com',
    'Proprietor: I N Chudasama',
    'GSTIN: 24AJBPC6218N1ZC | UDYAM-GJ-05-0015335',
  ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  for (const line of companyLines) {
    const wrappedLines = pdf.splitTextToSize(line, pageWidth - margin * 2);
    pdf.text(wrappedLines, centerX, cursorY, { align: 'center' });
    cursorY += wrappedLines.length * 3.8 + 1;
  }

  cursorY += 2;
  pdf.setDrawColor(177, 191, 181);
  pdf.setLineWidth(0.4);
  pdf.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 9;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(24, 43, 33);
  pdf.text('TAX INVOICE', centerX, cursorY, { align: 'center' });
  cursorY += 12;

  autoTable(pdf, {
    startY: cursorY,
    theme: 'plain',
    body: [
      ['PO Number', orderNumber, 'Order Date', formattedDate],
      ['Client Name', clientName, 'Location', locationName],
    ],
    margin: { left: margin, right: margin },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: [45, 57, 50] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 27, textColor: [91, 106, 96] },
      1: { cellWidth: 58 },
      2: { fontStyle: 'bold', cellWidth: 27, textColor: [91, 106, 96] },
      3: { cellWidth: 'auto' },
    },
  });

  const detailsEndY = (pdf as typeof pdf & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY + 24;
  autoTable(pdf, {
    startY: detailsEndY + 8,
    head: [['Description', 'Amount']],
    body: [[`Professional Services for PO ${orderNumber}`, amount]],
    theme: 'grid',
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [34, 83, 57], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, textColor: [45, 57, 50] },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 42, halign: 'right' } },
  });

  const footerY = pageHeight - 39;
  pdf.setDrawColor(220, 229, 223);
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  pdf.setTextColor(69, 82, 73);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('Bank Details', margin, footerY + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.text('Bank Name: [Your Bank Name]', margin, footerY + 12);
  pdf.text('A/C: [Your A/C No]', margin, footerY + 16);
  pdf.text('IFSC: [Your IFSC]', margin, footerY + 20);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('Authorized Signatory', pageWidth - margin, footerY + 12, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.text('I N Chudasama (Proprietor)', pageWidth - margin, footerY + 17, { align: 'right' });

  pdf.save(`${safeFilePart(orderNumber)}_Invoice.pdf`);
}
