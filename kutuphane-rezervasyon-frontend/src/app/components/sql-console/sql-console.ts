import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
}

@Component({
  selector: 'app-sql-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sql-console.html',
  styleUrls: ['./sql-console.css']
})
export class SqlConsoleComponent {
  sqlQuery: string = 'SELECT * FROM users LIMIT 10;';
  queryResult: QueryResult | null = null;
  loading: boolean = false;
  error: string = '';
  queryHistory: string[] = [];

  // Örnek sorgular
  exampleQueries = [
    { name: 'Tüm Kullanıcılar', query: 'SELECT id, name, email, role FROM users;' },
    { name: 'Tüm Odalar', query: 'SELECT * FROM rooms;' },
    { name: 'Aktif Rezervasyonlar', query: 'SELECT r.*, u.name as user_name, ro.name as room_name FROM reservations r JOIN users u ON r.user_id = u.id JOIN rooms ro ON r.room_id = ro.id WHERE r.status = \'PENDING\';' },
    { name: 'Kullanıcı İstatistikleri', query: 'SELECT role, COUNT(*) as count FROM users GROUP BY role;' },
    { name: 'Oda Doluluk Oranı', query: 'SELECT r.name, COUNT(res.id) as reservation_count FROM rooms r LEFT JOIN reservations res ON r.id = res.room_id GROUP BY r.id, r.name;' },
    { name: 'Son 7 Gün Rezervasyonları', query: 'SELECT COUNT(*) as total, DATE(created_at) as date FROM reservations WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\' GROUP BY DATE(created_at) ORDER BY date;' }
  ];

  constructor(private adminService: AdminService) {}

  executeQuery() {
    if (!this.sqlQuery.trim()) {
      this.error = 'SQL sorgusu boş olamaz!';
      return;
    }

    this.loading = true;
    this.error = '';
    this.queryResult = null;

    const startTime = Date.now();

    this.adminService.executeSqlQuery(this.sqlQuery).subscribe({
      next: (result) => {
        const executionTime = Date.now() - startTime;
        this.queryResult = {
          ...result,
          executionTime
        };
        this.addToHistory(this.sqlQuery);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'SQL sorgusu çalıştırılırken hata oluştu!';
        this.loading = false;
      }
    });
  }

  loadExample(query: string) {
    this.sqlQuery = query;
  }

  clearQuery() {
    this.sqlQuery = '';
    this.queryResult = null;
    this.error = '';
  }

  addToHistory(query: string) {
    if (!this.queryHistory.includes(query)) {
      this.queryHistory.unshift(query);
      if (this.queryHistory.length > 10) {
        this.queryHistory.pop();
      }
    }
  }

  loadFromHistory(query: string) {
    this.sqlQuery = query;
  }

  exportToCSV() {
    if (!this.queryResult) return;

    let csv = this.queryResult.columns.join(',') + '\n';
    this.queryResult.rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
  }
}
