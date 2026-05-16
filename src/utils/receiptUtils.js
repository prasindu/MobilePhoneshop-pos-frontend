import html2pdf from 'html2pdf.js';

export const generateBillHTML = (saleData, storeInfo) => {
  const currentDate = new Date(saleData.date || Date.now());
  
  let itemsSubtotal = 0;

  const itemsHTML = saleData.items.map(item => {
    let discountedUnitPrice = item.unitPrice;
    let itemDiscountLabel = '';

    // අයිටම් එකට ඩිස්කවුන්ට් එකක් දීලා තියෙනවා නම්
    if (item.discount > 0) {
      const dType = (item.discountType || '').toUpperCase();
      if (dType === 'PERCENTAGE') {
        discountedUnitPrice = item.unitPrice * (1 - item.discount / 100);
        itemDiscountLabel = `<br><small class="item-dis">(-${item.discount}%)</small>`;
      } else {
        discountedUnitPrice = Math.max(0, item.unitPrice - item.discount);
        itemDiscountLabel = `<br><small class="item-dis">(-Rs.${item.discount})</small>`;
      }
    }
    const itemTotal = discountedUnitPrice * item.quantity;
    itemsSubtotal += itemTotal;

    return `
      <tr>
        <td class="item-name">
           ${item.productName} 
           ${itemDiscountLabel}
        </td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  let globalDiscountAmount = 0;
  if (saleData.discount > 0) {
    const globalDType = (saleData.discountType || '').toUpperCase();
    if (globalDType === 'PERCENTAGE') {
      globalDiscountAmount = itemsSubtotal * (saleData.discount / 100);
    } else {
      globalDiscountAmount = Math.min(saleData.discount, itemsSubtotal);
    }
  }

  const finalTotal = saleData.total !== undefined ? saleData.total : (itemsSubtotal - globalDiscountAmount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${saleData.invoiceId}</title>
      <style>
        @page { margin: 0; }
        body { 
          font-family: 'Courier New', Courier, monospace; 
          width: 72mm; 
          margin: 0 auto; 
          padding: 4mm; 
          color: #000; 
          font-size: 12px; 
          line-height: 1.2;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
        .logo { font-size: 18px; font-weight: bold; text-transform: uppercase; }
        .details { margin-bottom: 10px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th { border-bottom: 1px solid #000; padding: 2px 0; font-size: 11px; text-align: left;}
        td { padding: 4px 0; font-size: 12px; vertical-align: top; }
        .item-name { width: 50%; word-break: break-all; }
        .item-dis { color: #555; font-size: 10px; }
        .totals { border-top: 1px dashed #000; padding-top: 5px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px; }
        .discount-row { color: #333; font-size: 11px; }
        .final { font-weight: bold; font-size: 15px; margin-top: 4px; border-top: 1px solid #000; padding-top: 4px; }
        .notes { font-size: 11px; font-style: italic; border-top: 1px dashed #ccc; margin-top: 10px; padding-top: 5px; text-align: center; }
        .footer { text-align: center; margin-top: 15px; font-size: 11px; border-top: 1px dashed #000; padding-top: 5px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">${storeInfo?.name || 'MobileHub POS'}</div>
        <div>${storeInfo?.address || ''}</div>
        <div>Tel: ${storeInfo?.phone || ''}</div>
      </div>
      <div class="details">
        <div>Inv: ${saleData.invoiceId}</div>
        <div>Date: ${currentDate.toLocaleString()}</div>
        ${saleData.customerName ? `<div>Cust: ${saleData.customerName}</div>` : ''}
        ${saleData.customerPhone ? `<div>Tel: ${saleData.customerPhone}</div>` : ''}
      </div>
      <table>
        <thead>
          <tr><th>Item</th><th class="text-center">Qty</th><th class="text-right">Total</th></tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      
      <div class="totals">
        ${globalDiscountAmount > 0 ? `
          <div class="totals-row"><span>Subtotal:</span><span>Rs. ${itemsSubtotal.toFixed(2)}</span></div>
          <div class="totals-row discount-row">
             <span>Discount ${saleData.discountType === 'PERCENTAGE' ? `(${saleData.discount}%)` : ''}:</span>
             <span>- Rs. ${globalDiscountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="totals-row final"><span>Total:</span><span>Rs. ${parseFloat(finalTotal).toFixed(2)}</span></div>
      </div>

      ${saleData.notes ? `<div class="notes">Note: ${saleData.notes}</div>` : ''}
      
      <div class="footer">
        Thank you! Come again.
      </div>
    </body>
    </html>
  `;
};

// Iframe එක UI එකේ කිසිම විදිහකින් නොපෙනෙන්න සහ හිරවෙන්නේ නැති වෙන්න හැදුවා
export const printIframe = (htmlContent) => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none'; // සම්පූර්ණයෙන්ම සඟවයි
  document.body.appendChild(iframe);
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(htmlContent);
  iframe.contentWindow.document.close();
  
  // Load වුණාට පස්සේ විතරක් Print එක කෝල් කරනවා
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 3000);
  };
};

export const downloadPDF = (htmlContent, filename) => {
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  const opt = {
    margin: 5,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: [80, 200], orientation: 'portrait' } 
  };
  html2pdf().set(opt).from(element).save();
};