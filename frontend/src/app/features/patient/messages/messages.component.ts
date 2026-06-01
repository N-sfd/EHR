import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-patient-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  private http = inject(HttpClient);

  threads: any[] = [];
  selectedThread: any | null = null;
  replyBody = '';
  isLoading = true;
  isSending = false;
  sendError: string | null = null;

  ngOnInit(): void {
    this.loadThreads();
  }

  loadThreads(): void {
    this.http.get<any[]>('/api/patient/messages/threads', { withCredentials: true })
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.threads = (data || []).sort((a, b) =>
          new Date(b.lastMessageAt || b.updatedAt || 0).getTime() -
          new Date(a.lastMessageAt || a.updatedAt || 0).getTime()
        );
        this.isLoading = false;
      });
  }

  selectThread(thread: any): void {
    this.selectedThread = null;
    this.sendError = null;
    this.replyBody = '';
    this.http.get<any>(`/api/patient/messages/threads/${thread.threadId}`, { withCredentials: true })
      .pipe(catchError(() => of(thread)))
      .subscribe(detail => {
        this.selectedThread = detail;
        this.markRead(thread.threadId);
        thread.unreadCount = 0;
      });
  }

  closeThread(): void {
    this.selectedThread = null;
    this.replyBody = '';
    this.sendError = null;
  }

  sendReply(): void {
    if (!this.replyBody.trim() || !this.selectedThread) return;
    this.isSending = true;
    this.sendError = null;
    this.http.post<any>(
      `/api/patient/messages/threads/${this.selectedThread.threadId}/messages`,
      { body: this.replyBody.trim() },
      { withCredentials: true }
    ).pipe(catchError(() => { this.sendError = 'Failed to send. Please try again.'; return of(null); }))
      .subscribe(msg => {
        this.isSending = false;
        if (msg) {
          if (!this.selectedThread.messages) this.selectedThread.messages = [];
          this.selectedThread.messages.push(msg);
          this.replyBody = '';
        }
      });
  }

  private markRead(threadId: number): void {
    this.http.post(`/api/patient/messages/threads/${threadId}/read`, null, { withCredentials: true })
      .pipe(catchError(() => of(null))).subscribe();
  }

  relativeTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return days === 1 ? 'Yesterday' : `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  senderLabel(msg: any): string {
    return msg?.senderType === 'PATIENT' ? 'You' : (msg?.senderName || 'Care Team');
  }
}
