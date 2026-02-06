import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateCampaignPDF = (campaign, streams, totalValue, currency = 'GBP') => {
  const doc = new jsPDF();
  const exchangeRates = { GBP: 1, USD: 1.27 };
  
  const formatCurrency = (value) => {
    const convertedValue = parseFloat(value) * (currency === 'USD' ? exchangeRates.USD : 1);
    const symbol = currency === 'GBP' ? '£' : '$';
    return `${symbol}${convertedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Header - Company Name
  doc.setFillColor(10, 15, 26); // Dark background
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(0, 212, 170); // Teal color
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DIZPLAI', 15, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(180, 184, 197);
  doc.text('Live Stream Sponsorship Proposal', 15, 28);

  // Campaign Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(campaign.channel_name, 15, 55);

  // Campaign Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Proposal Date: ${formatDate(campaign.created_at)}`, 15, 62);
  doc.text(`Total Streams: ${streams.length}`, 15, 68);

  // Total Value Box
  doc.setFillColor(0, 212, 170);
  doc.roundedRect(140, 50, 55, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('TOTAL CAMPAIGN VALUE', 143, 58);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalValue), 143, 68);

  // Streams Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Stream Breakdown', 15, 85);

  const tableData = streams.map(stream => [
    stream.stream_type,
    stream.industry_name,
    `${stream.stream_length_minutes} min`,
    parseInt(stream.total_views).toLocaleString(),
    stream.user_selected_frequency,
    formatCurrency(stream.total_inventory_value)
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Stream Type', 'Content', 'Length', 'Views', 'Placements', 'Value']],
    body: tableData,
    foot: [['', '', '', '', 'TOTAL', formatCurrency(totalValue)]],
    theme: 'striped',
    headStyles: {
      fillColor: [0, 212, 170],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [244, 196, 48],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 12
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      5: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Methodology Section
  const finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 212, 170);
  doc.text('Valuation Methodology', 15, finalY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const methodologyText = [
    'This sponsorship valuation is calculated using industry-validated CPM benchmarks with',
    'research-backed premium multipliers accounting for:',
    '',
    '• Unskippable Format (1.8x) - Integrated content, guaranteed viewership',
    '• Integrated Content (2.5x) - Brand integration vs interruptive ads',
    '• Live Streaming (1.3x) - Real-time engagement premium',
    '• High-Attention Environment (1.4x) - Focused viewing context',
    '',
    'Values are calculated using geometric mean methodology to provide balanced, defensible',
    'pricing based on industry standards from eMarketer, Statista, IAB, and WordStream.'
  ];

  let textY = finalY + 7;
  methodologyText.forEach(line => {
    doc.text(line, 15, textY);
    textY += 5;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Dizplai CPM Calculator | Page ${i} of ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
    doc.text(
      'https://dizplai-cpm-calculator.vercel.app',
      105,
      290,
      { align: 'center' }
    );
  }

  // Generate filename
  const filename = `Dizplai_${campaign.channel_name.replace(/\s+/g, '_')}_Campaign_Proposal.pdf`;
  
  // Save PDF
  doc.save(filename);
};