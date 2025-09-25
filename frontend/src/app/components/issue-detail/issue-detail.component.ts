import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Issue } from '../../models/issue';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const issueId = this.route.snapshot.paramMap.get('id');

    if (issueId) {
      this.apiService.getIssueById(issueId).subscribe({
        next: (data) => {
          this.issue = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load issue. It may not exist.';
          this.isLoading = false;
          console.error(err);
        }
      });
    } else {
      this.error = 'No issue ID was provided in the URL.';
      this.isLoading = false;
    }
  }
}