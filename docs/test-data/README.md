# CSV Import Test Data

This directory contains CSV files for testing the bulk import functionality for Students and Managers.

## Files

### `students-import-test.csv`
- **Purpose:** Test data for importing students via CSV
- **Records:** 1000+ students
- **Format:** 
  - Required columns: `fullName`, `email`, `gradeLevel`
  - Optional columns: `phone`, `address`, `zipcode`, `guardian_name`, `guardian_phone`, `guardian_email`, `guardian_address`, `guardian_zipcode`, `status`
  - Grade levels: 1-12
  - All students have `active` status
  - Example includes all optional fields for comprehensive testing

### `students-import-test-errors.csv`
- **Purpose:** Test error handling and duplicate detection for student imports
- **Records:** 20 students (mix of valid and invalid)
- **Contains:**
  - Valid new students (Alice Test, Bob Sample, Charlie Valid, etc.)
  - Duplicate emails from `students-import-test.csv` (Emma Johnson, Michael Chen, Sophia Rodriguez, James Williams)
  - Invalid email formats
  - Missing required fields (name, email, gradeLevel)
  - Invalid grade levels (0, 13, 99, empty)
  - Use this file to test error CSV generation and validation

### `managers-import-test.csv`
- **Purpose:** Test data for importing managers via CSV
- **Records:** 40 managers
- **Format:**
  - Required columns: `fullName`, `email`, `password`, `roleName` (or `displayName`), `gradeNames` (or `gradeLevels`)
  - Optional columns: `phone`, `address`, `zipcode`, `status`
  - All passwords meet minimum 8 character requirement
  - `roleName`: Use role name (e.g., "manager", "lead-teacher") or `displayName` (e.g., "Manager", "Lead Teacher")
  - `gradeNames`: Comma-separated grade names (e.g., "8,9,10") or use `gradeLevels` for numbers
  - All managers have `active` status

### `managers-import-test-errors.csv`
- **Purpose:** Test error handling and duplicate detection for manager imports
- **Records:** 20 managers (mix of valid and invalid)
- **Contains:**
  - Valid new managers (Tom New Manager, Amy Test Manager, Ben Valid Manager, etc.)
  - Duplicate emails from `managers-import-test.csv` (Sarah Collins, Michael Wilson, Jennifer Davis, David Martinez, Lisa Anderson)
  - Invalid email formats
  - Missing required fields (name, email, password, roleName, gradeNames)
  - Short passwords (< 8 characters)
  - Invalid role names
  - Invalid grade names (non-existent grades)
  - Use this file to test error CSV generation and validation

### `schedules-import-test.csv`
- **Purpose:** Test data for importing schedules via CSV
- **Records:** 480 schedules (8 courses × 5 days × 12 grades)
- **Format:**
  - Required columns: `gradeLevel` (or `gradeName`), `courseName`, `managerEmail`, `dayOfWeek` (1-5), `startTime` (HH:mm), `endTime` (HH:mm)
  - Optional columns: `additionalGradeIds` (comma-separated)
  - Uses manager emails from `managers-import-test.csv`
  - All schedules are for weekdays (Monday-Friday, dayOfWeek 1-5)

### `schedules-import-test-errors.csv`
- **Purpose:** Test error handling and duplicate detection for schedule imports
- **Records:** 30 schedules (mix of valid and invalid)
- **Contains:**
  - Valid new schedules (various courses for grades 5-12)
  - Duplicate schedules from `schedules-import-test.csv` (same grade, course, day, time combinations)
  - Missing required fields (courseName, managerEmail, dayOfWeek, startTime, endTime, gradeLevel)
  - Invalid manager emails (non-existent managers)
  - Invalid day of week (7, 0, or empty)
  - Invalid time formats (25:00, invalid end time before start time)
  - Invalid grade levels (non-existent grades)
  - Use this file to test error CSV generation and validation

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

### Using Error Test Files
The `*-import-test-errors.csv` files are specifically designed to test error handling:
- **`students-import-test-errors.csv`**: Contains duplicates, invalid emails, missing fields, invalid grade levels
- **`managers-import-test-errors.csv`**: Contains duplicates, invalid emails, short passwords, missing fields, invalid roles/grades
- **`schedules-import-test-errors.csv`**: Contains duplicates, invalid manager emails, missing fields, invalid times/days/grades

When importing these files:
1. Some records will succeed (new valid data)
2. Some records will fail (duplicates, validation errors)
3. You'll receive an error CSV file with failed rows and error reasons
4. Download the error CSV to see which rows failed and why

### Manual Error Testing
To test error handling manually, you can:
1. Modify emails to create duplicates
2. Change grade levels to invalid values (e.g., 0, 13, or non-numeric)
3. Use invalid email formats
4. Use passwords shorter than 8 characters for managers
5. Use invalid status values
6. Remove `gradeLevels` from managers CSV (will fail - grades are required)
7. Use non-existent grade names or levels (will fail if grades don't exist in system)

## Schedule Assignment After Student Import

**Important**: Students are imported **without schedules**. After importing students, you need to assign schedules to them.

### Files for Schedule Assignment

- **`student-schedule-assignment-guide.csv`**: Reference guide showing recommended non-conflicting schedule assignments for test students
- **`SCHEDULE_ASSIGNMENT_GUIDE.md`**: Detailed guide on how to assign schedules without conflicts

### Import Order

1. **Import Managers** (`managers-import-test.csv`) - Required first
2. **Import Schedules** (`schedules-import-test.csv`) - Depends on managers
3. **Import Students** (`students-import-test.csv`) - Can be done after schedules
4. **Assign Schedules** - Use the assignment guide to assign non-conflicting schedules

### Schedule Assignment Notes

- The `schedules-import-test.csv` file contains **overlapping schedules by design** (like real colleges/universities)
- When assigning schedules to students, ensure no conflicts (same time slot)
- The system will automatically reject conflicting schedule assignments
- Use the assignment guide to ensure test students have valid, non-overlapping schedules
- For error testing, intentionally assign conflicting schedules to test conflict detection

## Important Notes

- **Grades must exist in the system** before importing students or managers
- **Roles must exist in the system** before importing managers (default "manager" role exists, custom roles must be created first)
- **Managers must be imported before schedules** (schedules reference manager emails)
- **Schedules can be imported before or after students** (students don't need schedules during import)
- Default grades (1-12) are automatically seeded when a school is created
- For managers, you can use either:
  - `gradeLevels`: Comma-separated numbers (e.g., "1,2,3")
  - `gradeNames`: Comma-separated grade names (e.g., "8,9,10" or "8 A,9 B")
- For manager roles, you can use either:
  - `roleName`: Exact role name (e.g., "manager", "lead-teacher")
  - `displayName`: Display name (e.g., "Manager", "Lead Teacher")
- Multiple grades for managers should be comma-separated and enclosed in quotes if they contain spaces
- All optional fields can be left empty in CSV - they will be set to null in the database

