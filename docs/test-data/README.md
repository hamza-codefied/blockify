# CSV Import Test Data

This directory contains CSV files for testing the bulk import functionality for Students and Managers.

## Files

### `students-import-test.csv`
- **Purpose:** Test data for importing students via CSV
- **Records:** 20 students
- **Format:** 
  - Required columns: `fullName`, `email`, `gradeLevel`
  - Optional columns: `status`
  - Grade levels: 9-12 (high school)
  - All students have `active` status

### `managers-import-test.csv`
- **Purpose:** Test data for importing managers via CSV
- **Records:** 20 managers
- **Format:**
  - Required columns: `fullName`, `email`, `password`
  - Optional columns: `department`, `status`
  - All passwords meet minimum 8 character requirement
  - Various departments included
  - All managers have `active` status

## Usage

### Testing Student Import
1. Navigate to User Management page in the admin dashboard
2. Click on "Students" tab
3. Click "Import CSV" button
4. Select `students-import-test.csv` file
5. Upload and verify all 20 students are imported successfully

### Testing Manager Import
1. Navigate to User Management page in the admin dashboard
2. Click on "Managers" tab
3. Click "Import CSV" button
4. Select `managers-import-test.csv` file
5. Upload and verify all 20 managers are imported successfully

## Notes

- All emails are unique and follow the pattern: `firstname.lastname@school.com`
- Student grade levels are between 9-12 (high school grades)
- Manager passwords are all 8+ characters and meet security requirements
- All records have `active` status by default
- These files are for testing purposes only

## Validation

The CSV import feature will validate:
- Email format and uniqueness
- Required fields presence
- Grade level range (1-12 for students)
- Password strength (minimum 8 characters for managers)
- Status values (active, inactive, suspended)

## Error Testing

To test error handling, you can:
1. Modify emails to create duplicates
2. Change grade levels to invalid values (e.g., 0, 13, or non-numeric)
3. Use invalid email formats
4. Use passwords shorter than 8 characters for managers
5. Use invalid status values

