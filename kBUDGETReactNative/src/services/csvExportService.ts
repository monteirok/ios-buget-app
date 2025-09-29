import * as FileSystem from 'expo-file-system';
import { Transaction } from '@/models';

export interface DataExporter {
  exportTransactions(transactions: Transaction[]): Promise<string>;
}

export class CSVExportService implements DataExporter {
  async exportTransactions(transactions: Transaction[]): Promise<string> {
    const header = 'Date,Category,Original Amount,Original Currency,Amount CAD,Merchant,Note';
    const rows = transactions.map((transaction) => {
      const date = transaction.date;
      const merchant = (transaction.merchant ?? '').replace(/,/g, ' ');
      const note = (transaction.note ?? '').replace(/,/g, ' ');
      return `${date},${transaction.categoryId},${transaction.amountOriginal},${transaction.currencyCode},${transaction.amountCAD},${merchant},${note}`;
    });

    const content = [header, ...rows].join('\n');
    const fileUri = `${FileSystem.cacheDirectory}kbudget-${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
    return fileUri;
  }
}
