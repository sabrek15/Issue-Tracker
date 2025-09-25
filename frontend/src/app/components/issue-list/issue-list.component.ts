import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Issue } from '../../models/issue';
import { ApiService } from '../../services/api.service';
import { IssueFormComponent } from '../issue-form/issue-form.component'; // <-- 1. IMPORT THE FORM COMPONENT

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IssueFormComponent // <-- 2. ADD IT TO THE IMPORTS ARRAY
  ],
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.css']
})
export class IssueListComponent implements OnInit {
  issues: Issue[] = [];
  filterForm: FormGroup;

  // Properties for the modal form
  isFormVisible = false;
  issueToEdit: Issue | null = null;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      priority: [''],
      assignee: [''],
    });
  }

  ngOnInit(): void {
    this.fetchIssues();

    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.fetchIssues();
      });
  }

  fetchIssues(): void {
    this.apiService.getIssues(this.filterForm.value).subscribe((data) => {
      this.issues = data;
    });
  }

  viewIssue(id: string): void {
    this.router.navigate(['/issues', id]);
  }

  // --- Methods for handling the form modal ---

  openCreateForm(): void {
    this.issueToEdit = null;
    this.isFormVisible = true;
  }

  openEditForm(event: Event, issue: Issue): void {
    event.stopPropagation();
    this.issueToEdit = issue;
    this.isFormVisible = true;
  }

  closeForm(): void {
    this.isFormVisible = false;
    this.issueToEdit = null;
  }

  handleFormSubmission(issueData: Partial<Issue>): void {
    const operation = this.issueToEdit
      ? this.apiService.updateIssue(this.issueToEdit.id, issueData)
      : this.apiService.createIssue(issueData);

    operation.subscribe({
      next: () => {
        this.fetchIssues();
        this.closeForm();
      },
      error: (err) => {
        console.error('Failed to save the issue', err);
      }
    });
  }
}