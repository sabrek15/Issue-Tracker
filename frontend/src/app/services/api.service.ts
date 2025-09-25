// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue } from '../models/issue';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = 'http://127.0.0.1:5000'; // Backend URL

  constructor(private http: HttpClient) {}

  getIssues(params: any): Observable<Issue[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.append(key, params[key]);
      }
    });
    return this.http.get<Issue[]>(`${this.apiUrl}/issues`, { params: httpParams });
  }

  getIssueById(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/issues/${id}`);
  }

  createIssue(issueData: Partial<Issue>): Observable<Issue> {
    return this.http.post<Issue>(`${this.apiUrl}/issues`, issueData);
  }

  updateIssue(id: string, issueData: Partial<Issue>): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/issues/${id}`, issueData);
  }
}