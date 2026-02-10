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
  doc.setFillColor(10, 15, 26);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(0, 212, 170);
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

  // Executive Summary Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 212, 170);
  doc.text('Executive Summary', 15, 85);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const summaryLines = [
    `This ${streams.length}-stream campaign represents the MAXIMUM REVENUE opportunity if all brand`,
    `slots across your content schedule are sold. Each stream has been valued based on research-`,
    `backed CPM benchmarks, concurrent audience reach, and sustainable inventory allocation (30%`,
    `rule). The total campaign value of ${formatCurrency(totalValue)} reflects professional-grade sponsorship pricing`,
    `that balances creator monetization with viewer experience.`
  ];

  let summaryY = 92;
  summaryLines.forEach(line => {
    doc.text(line, 15, summaryY);
    summaryY += 5;
  });

  // Individual Stream Details
  let currentY = summaryY + 10;
  
  streams.forEach((stream, index) => {
    // Check if we need a new page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(244, 196, 48);
    doc.text(`Stream ${index + 1}: ${stream.stream_type || stream.industry_name}`, 15, currentY);
    currentY += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    const streamExplanation = [
      `Content: ${stream.industry_name} | Length: ${stream.stream_length_minutes} min | Views: ${parseInt(stream.total_views).toLocaleString()}`,
      '',
      `This stream is valued at ${formatCurrency(stream.total_inventory_value)} (maximum revenue if all brand slots sell).`,
      `Each 2-minute placement is priced at ${formatCurrency(stream.cost_per_placement)} based on concurrent audience`,
      `reach. Brands need ${stream.min_ad_frequency} placements distributed throughout the stream to guarantee`,
      `100% audience reach, creating a full activation cost of ${formatCurrency(stream.cost_per_activation)} per brand.`,
      `Based on the ${stream.stream_length_minutes}-minute duration and 30% inventory rule, there are slots for`,
      `${stream.available_brand_slots || Math.floor(stream.max_placements / stream.min_ad_frequency)} brands maximum.`,
      ''
    ];

    streamExplanation.forEach(line => {
      doc.text(line, 15, currentY);
      currentY += 4.5;
    });

    currentY += 3;
  });

  // Campaign Strategy Section
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 212, 170);
  doc.text('Campaign Strategy & Rationale', 15, currentY);
  currentY += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const strategyText = [
    'PORTFOLIO APPROACH: Multi-stream campaigns offer sponsors diverse touchpoints across your',
    'content calendar. This creates sustained brand visibility and reduces dependency on single events.',
    '',
    `TOTAL ADDRESSABLE MARKET: The combined inventory value of ${formatCurrency(totalValue)} represents`,
    'your maximum earning potential across this content slate. Actual revenue depends on sell-through',
    'rate and negotiated pricing within these benchmarks.',
    '',
    'PRICING FLEXIBILITY: Sponsors can purchase individual placements, full activations (guaranteed',
    'reach), or cross-stream packages. The modular structure allows for both premium single-sponsor',
    'deals and multi-brand shared inventory approaches.',
    '',
    'VIEWER EXPERIENCE: All valuations respect the industry-standard 30% ad load threshold,',
    'ensuring sponsorships enhance rather than compromise content quality. Sustainable monetization',
    'protects long-term audience growth and sponsor ROI.'
  ];

  strategyText.forEach(line => {
    if (currentY > 275) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(line, 15, currentY);
    currentY += 5;
  });

  // Stream Breakdown Table (new page)
  doc.addPage();
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Stream Breakdown', 15, 20);

  const tableData = streams.map(stream => [
    stream.stream_type || stream.industry_name,
    stream.industry_name,
    `${stream.stream_length_minutes} min`,
    parseInt(stream.total_views).toLocaleString(),
    stream.user_selected_frequency,
    formatCurrency(stream.total_inventory_value)
  ]);

  autoTable(doc, {
    startY: 25,
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
    'This sponsorship valuation uses industry-validated CPM benchmarks with research-backed',
    'premium multipliers. Each 2-minute placement is priced based on concurrent audience reach.',
    'Premium multipliers account for:',
    '',
    '• Unskippable Format (1.8x) - Integrated content, guaranteed viewership',
    '• Integrated Content (2.5x) - Brand integration vs interruptive ads',
    '• Live Streaming (1.3x) - Real-time engagement premium',
    '• High-Attention Environment (1.4x) - Focused viewing context',
    '',
    'Calculated using geometric mean methodology for balanced, defensible pricing based on',
    'concurrent audience reach. Data from OutlierKit, Lenos, upGrowth, eMarketer, IAB.'
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
      `Dizplai Stream Value Calculator | Page ${i} of ${pageCount}`,
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

export const generateSingleStreamPDF = (result, streamParams, currency = 'GBP') => {
  const doc = new jsPDF();
  const exchangeRates = { GBP: 1, USD: 1.27 };
  
  const formatCurrency = (value) => {
    const convertedValue = parseFloat(value) * (currency === 'USD' ? exchangeRates.USD : 1);
    const symbol = currency === 'GBP' ? '£' : '$';
    return `${symbol}${convertedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Header - Company Name
  doc.setFillColor(10, 15, 26);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(0, 212, 170);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DIZPLAI', 15, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(180, 184, 197);
  doc.text('Live Stream Sponsorship Valuation', 15, 28);

  // Stream Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${result.industry.name} Live Stream`, 15, 55);

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Valuation Date: ${formatDate()}`, 15, 62);

  // Total Value Box
  doc.setFillColor(0, 212, 170);
  doc.roundedRect(140, 50, 55, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('TOTAL INVENTORY VALUE', 143, 58);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(result.calculation.totalInventoryValue), 143, 68);

  // Value Explanation Section (NEW - matches Dashboard UI)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 212, 170);
  doc.text('Value Explanation', 15, 85);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const explanationLines = [
    `This is the MAXIMUM REVENUE if all ${result.calculation.availableBrandSlots} brand slots are sold.`,
    '',
    `Each ad placement is valued at ${formatCurrency(result.calculation.costPerPlacement)} based on the Premium CPM`,
    `(${formatCurrency(result.calculation.premiumCPM)}) and the average concurrent audience of ${result.calculation.concurrentViewers.toLocaleString()} viewers`,
    `predicted at each point of the live stream.`,
    '',
    `Each sponsorship slot consists of ${result.calculation.minAdFrequency} x 2-minute brand placements distributed`,
    `throughout the stream to reach the full audience over its duration.`,
    '',
    `So, each FULL AUDIENCE brand activation is valued at ${formatCurrency(result.calculation.costPerActivation)}.`,
    '',
    `Based on the stream length and the 30% inventory rule (no more than 30% of stream time`,
    `can be used for sponsorships), there are slots for ${result.calculation.availableBrandSlots} separate brands.`,
    '',
    `Total Inventory Value (if all ${result.calculation.availableBrandSlots} slots sell) = ${formatCurrency(result.calculation.totalInventoryValue)}.`
  ];

  let explainY = 92;
  explanationLines.forEach(line => {
    doc.text(line, 15, explainY);
    explainY += 5;
  });

  // Stream Parameters Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Stream Parameters', 15, explainY + 10);

  const paramsData = [
    ['Content Category', result.industry.name],
    ['Stream Length', `${streamParams.streamLength} minutes`],
    ['Average View Time', `${streamParams.avgViewTime} minutes`],
    ['Total Views', parseInt(streamParams.totalViews).toLocaleString()],
    ['Concurrent Viewers', result.calculation.concurrentViewers.toLocaleString()]
  ];

  autoTable(doc, {
    startY: explainY + 15,
    body: paramsData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 120 }
    }
  });

  // Pricing Breakdown
  const pricingY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Pricing Breakdown', 15, pricingY);

  const pricingData = [
    ['Base CPM', formatCurrency(result.calculation.inputs.baseCPM)],
    ['Premium Multiplier', `${result.calculation.adjustedMultiplier}x`],
    ['Premium CPM', formatCurrency(result.calculation.premiumCPM)],
    ['Cost Per Placement', formatCurrency(result.calculation.costPerPlacement)],
    ['Minimum Frequency', `${result.calculation.minAdFrequency} placements`],
    ['Cost Per Activation', formatCurrency(result.calculation.costPerActivation)],
    ['Available Brand Slots', `${result.calculation.availableBrandSlots} brands`],
    ['Maximum Placements', `${result.calculation.maxPlacements} slots`]
  ];

  autoTable(doc, {
    startY: pricingY + 5,
    body: pricingData,
    foot: [['TOTAL INVENTORY VALUE', formatCurrency(result.calculation.totalInventoryValue)]],
    theme: 'striped',
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
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 110 }
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
    'This valuation uses industry-validated CPM benchmarks applied to concurrent audience reach.',
    'Each 2-minute placement is priced based on the average live audience at any moment.',
    'Premium multipliers account for:',
    '',
    '• Unskippable Format (1.8x) - Integrated content, guaranteed viewership',
    '• Integrated Content (2.5x) - Brand integration vs interruptive ads',
    '• Live Streaming (1.3x) - Real-time engagement premium',
    '• High-Attention Environment (1.4x) - Focused viewing context',
    '',
    'Geometric mean methodology provides balanced, defensible pricing. Industry data sourced',
    'from OutlierKit, Lenos, upGrowth, YouTube Tools Hub, eMarketer, Statista, and IAB.'
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
      `Dizplai Stream Value Calculator | Page ${i} of ${pageCount}`,
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
  const filename = `Dizplai_${result.industry.name.replace(/\s+/g, '_')}_Stream_Valuation.pdf`;
  
  // Save PDF
  doc.save(filename);
};