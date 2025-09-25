import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Issue } from '../../models/issue';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.css']
})
export class IssueFormComponent implements OnInit {
  @Input() issue: Issue | null = null; // Input data from the parent component
  @Output() issueSubmit = new EventEmitter<Partial<Issue>>(); // Sends form data to parent
  @Output() close = new EventEmitter<void>(); // Tells parent to close the modal

  issueForm: FormGroup;
  isEditMode = false;

  constructor(private fb: FormBuilder) {
    this.issueForm = this.fb.group({
      title: ['', Validators.required],
      status: ['Open', Validators.required],
      priority: ['Medium', Validators.required],
      assignee: ['']
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.issue;
    if (this.isEditMode && this.issue) {
      // If we are editing, populate the form with existing data
      this.issueForm.patchValue(this.issue);
    }
  }

  submitForm(): void {
    if (this.issueForm.valid) {
      this.issueSubmit.emit(this.issueForm.value);
    } else {
      // Mark all fields as touched to display validation errors
      this.issueForm.markAllAsTouched();
    }
  }

  closeForm(): void {
    this.close.emit();
  }
}