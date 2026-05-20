import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const downloadInvoicePdf = (sale: any, profile?: any) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Handle Date
    const saleDate = sale.createdAt?.toDate ? sale.createdAt.toDate() : sale.date || new Date();
    const dateStr = format(saleDate, 'dd MMMM yyyy');

    // Colors
    const lightGreen = [123, 208, 138]; // #7bd08a
    const darkGreen = [25, 151, 87];   // #199757

    // 1. Top Shapes
    // Left light green rect
    doc.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
    doc.rect(0, 0, pageWidth / 2, 25, 'F');
    
    // Right dark green polygon (clip-path style)
    doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.triangle(pageWidth * 0.45, 0, pageWidth, 0, pageWidth, 20, 'F');
    doc.rect(pageWidth * 0.5, 0, pageWidth / 2, 18, 'F');

    // 2. Logo (Mountains)
    doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    // Mountain 1
    doc.triangle(15, 45, 30, 25, 45, 45, 'F');
    // Mountain 2
    doc.triangle(35, 45, 55, 15, 75, 45, 'F');
    
    // Tamil Text
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('லோகேஷ்', 15, 52);
    doc.text('விவசாயி', 15, 56);

    // 3. INVOICE Title
    doc.setFontSize(36);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 15, 45, { align: 'right' });

    // 4. Info Section
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Invoice Date :', 15, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, 15, 80);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice to :', pageWidth - 15, 75, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text((sale.customerInfo?.name || 'WALK-IN CUSTOMER').toUpperCase(), pageWidth - 15, 80, { align: 'right' });

    // 5. Items Table
    const tableData = sale.items.map((item: any) => [
      item.name,
      item.quantity,
      `INR ${ (item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }`
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['ITEM DESCRIPTION', 'QTY', 'PRICE']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [darkGreen[0], darkGreen[1], darkGreen[2]],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 50 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // Subtotal Row
    doc.setFillColor(245, 245, 245);
    doc.rect(15, finalY, pageWidth - 30, 10, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.rect(15, finalY, pageWidth - 30, 10, 'D');
    
    doc.setFont('helvetica', 'bold');
    doc.text('SUBTOTAL :', 20, finalY + 6.5);
    doc.text(`INR ${sale.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, finalY + 6.5, { align: 'right' });

    // Pending Due Row (if any)
    if (sale.pendingAmount > 0) {
      doc.setFillColor(255, 255, 255);
      doc.rect(15, finalY + 10, pageWidth - 30, 10, 'F');
      doc.rect(15, finalY + 10, pageWidth - 30, 10, 'D');
      doc.setTextColor(211, 47, 47); // Red
      doc.text('PENDING DUE :', 20, finalY + 16.5);
      doc.text(`INR ${sale.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, finalY + 16.5, { align: 'right' });
    }

    // 6. Footer Contact
    const footerY = pageHeight - 30;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTACT', pageWidth - 15, footerY, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(profile?.email || 'logeshvivasayi@gmail.com', pageWidth - 15, footerY + 5, { align: 'right' });
    doc.text(profile?.phone || '+91 87546 2190', pageWidth - 15, footerY + 9, { align: 'right' });

    // 7. Bottom Border
    doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');

    // Save PDF
    doc.save(`Invoice_${sale.id.slice(0, 8)}.pdf`);
  } catch (error) {
    console.error('PDF Manual Generation Error:', error);
    alert('Failed to generate PDF. Falling back to simple print.');
  }
};
