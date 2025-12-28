import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction.js';
import FraudScore from '../models/FraudScore.js';
import PDFDocument from 'pdfkit';

const router = Router();

// POST /reports/export/pdf - Export PDF report
router.post('/export/pdf', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, risk_levels, include_details, title } = req.body;
    
    // Query transactions and fraud scores
    const query: any = {};
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) query.timestamp.$lte = new Date(end_date);
    }
    
    const transactions = await Transaction.find(query).lean();
    const transactionIds = transactions.map(t => t.transaction_id);
    
    let fraudScoreQuery: any = { transaction_id: { $in: transactionIds } };
    if (risk_levels && risk_levels.length > 0) {
      fraudScoreQuery.risk_level = { $in: risk_levels };
    }
    
    const fraudScores = await FraudScore.find(fraudScoreQuery).lean();
    const scoreMap = new Map(fraudScores.map(s => [s.transaction_id, s]));
    
    // Filter transactions by risk level
    const filteredTransactions = transactions.filter(t => scoreMap.has(t.transaction_id));
    
    // Generate PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="fraudguard-report-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    });
    
    // PDF Content
    doc.fontSize(24).text(title || 'FraudGuard Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
    doc.moveDown(2);
    
    // Summary
    doc.fontSize(18).text('Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Transactions: ${filteredTransactions.length}`);
    doc.text(`Date Range: ${start_date || 'Start'} to ${end_date || 'End'}`);
    
    const riskCounts = fraudScores.reduce((acc: any, s) => {
      acc[s.risk_level] = (acc[s.risk_level] || 0) + 1;
      return acc;
    }, {});
    
    doc.text(`Low Risk: ${riskCounts.low || 0}`);
    doc.text(`Medium Risk: ${riskCounts.medium || 0}`);
    doc.text(`High Risk: ${riskCounts.high || 0}`);
    doc.text(`Critical Risk: ${riskCounts.critical || 0}`);
    doc.moveDown(2);
    
    if (include_details) {
      doc.fontSize(18).text('Transaction Details', { underline: true });
      doc.moveDown();
      
      filteredTransactions.slice(0, 50).forEach((t, i) => {
        const score = scoreMap.get(t.transaction_id);
        doc.fontSize(10);
        doc.text(`${i + 1}. ${t.transaction_id}`);
        doc.text(`   Amount: ${t.currency} ${t.amount}`);
        doc.text(`   Risk Score: ${score?.score || 'N/A'} (${score?.risk_level || 'N/A'})`);
        doc.text(`   Date: ${t.timestamp}`);
        doc.moveDown();
      });
    }
    
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

// POST /reports/export/csv - Export CSV report
router.post('/export/csv', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, risk_levels, include_details } = req.body;
    
    // Query transactions and fraud scores
    const query: any = {};
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) query.timestamp.$lte = new Date(end_date);
    }
    
    const transactions = await Transaction.find(query).lean();
    const transactionIds = transactions.map(t => t.transaction_id);
    
    let fraudScoreQuery: any = { transaction_id: { $in: transactionIds } };
    if (risk_levels && risk_levels.length > 0) {
      fraudScoreQuery.risk_level = { $in: risk_levels };
    }
    
    const fraudScores = await FraudScore.find(fraudScoreQuery).lean();
    const scoreMap = new Map(fraudScores.map(s => [s.transaction_id, s]));
    
    // Generate CSV
    const headers = [
      'Transaction ID',
      'Amount',
      'Currency',
      'Timestamp',
      'User Email',
      'Country',
      'City',
      'Fraud Score',
      'Risk Level',
      'Confidence',
      'Status'
    ];
    
    if (include_details) {
      headers.push('Indicators');
    }
    
    const rows = transactions
      .filter(t => scoreMap.has(t.transaction_id))
      .map(t => {
        const score = scoreMap.get(t.transaction_id);
        const row = [
          t.transaction_id,
          t.amount.toString(),
          t.currency,
          t.timestamp.toISOString(),
          t.user.email,
          t.location.country,
          t.location.city || '',
          score?.score?.toString() || '',
          score?.risk_level || '',
          score?.confidence?.toString() || '',
          t.status
        ];
        
        if (include_details) {
          row.push(score?.indicators?.map((i: any) => i.type).join('; ') || '');
        }
        
        return row;
      });
    
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    
    res.contentType('text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="fraudguard-report-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate CSV report' });
  }
});

export default router;
