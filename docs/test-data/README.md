# CSV Import Test Data

This directory contains CSV files for testing the bulk import functionality for Students and Managers.

## Files

### `students-import-test.csv`
- **Purpose:** Test data for importing students via CSV
- **Records:** 20 students
- **Format:** 
  - Required columns: `fullName`, `email`, `gradeLevel`
  - Optional columns: `phone`, `address`, `zipcode`, `guardian_name`, `guardian_phone`, `guardian_email`, `guardian_address`, `guardian_zipcode`, `status`
  - Grade levels: 9-12 (high school)
  - All students have `active` status
  - Example includes all optional fields for comprehensive testing

### `managers-import-test.csv`
- **Purpose:** Test data for importing managers via CSV
- **Records:** 20 managers
- **Format:**
  - Required columns: `fullName`, `email`, `password`, `roleName` (or `displayName`), `gradeNames` (or `gradeLevels`)
  - Optional columns: `phone`, `address`, `zipcode`, `status`
  - All passwords meet minimum 8 character requirement
  - `roleName`: Use role name (e.g., "manager", "lead-teacher") or `displayName` (e.g., "Manager", "Lead Teacher")
  - `gradeNames`: Comma-separated grade names (e.g., "8,9,10") or use `gradeLevels` for numbers
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
- **Students:** Must have `gradeLevel` (single grade, 1-12)
  - Optional: `phone`, `address`, `zipcode`, and all guardian fields
- **Managers:** Must have:
  - `roleName` or `displayName` (e.g., "manager", "Manager", "lead-teacher", "Lead Teacher")
  - `gradeLevels` (comma-separated, 1-12) or `gradeNames` (comma-separated grade names). At least one grade required.
  - Optional: `phone`, `address`, `zipcode`
- Password strength (minimum 8 characters for managers)
- Status values (active, inactive, suspended)
- Grades must exist in the system before importing
- Roles must exist in the system before importing managers (use exact role name or display name)

## Error Testing

To test error handling, you can:
1. Modify emails to create duplicates
2. Change grade levels to invalid values (e.g., 0, 13, or non-numeric)
3. Use invalid email formats
4. Use passwords shorter than 8 characters for managers
5. Use invalid status values
6. Remove `gradeLevels` from managers CSV (will fail - grades are required)
7. Use non-existent grade names or levels (will fail if grades don't exist in system)

## Important Notes

- **Grades must exist in the system** before importing students or managers
- **Roles must exist in the system** before importing managers (default "manager" role exists, custom roles must be created first)
- Default grades (1-12) are automatically seeded when a school is created
- For managers, you can use either:
  - `gradeLevels`: Comma-separated numbers (e.g., "1,2,3")
  - `gradeNames`: Comma-separated grade names (e.g., "8,9,10" or "8 A,9 B")
- For manager roles, you can use either:
  - `roleName`: Exact role name (e.g., "manager", "lead-teacher")
  - `displayName`: Display name (e.g., "Manager", "Lead Teacher")
- Multiple grades for managers should be comma-separated and enclosed in quotes if they contain spaces
- All optional fields can be left empty in CSV - they will be set to null in the database

