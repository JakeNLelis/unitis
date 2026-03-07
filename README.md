# UNITIS

An election management system designed to modernize student elections at Visayas State University

| Internal Release Code&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Date Released |
| ------------------------------------------------------ | ------------- |
| UN.010.001                                             | 2026-02-27    |
| UN.010.002                                             | 2026-02-27    |
| UN.010.003                                             | 2026-02-27    |
| UN.010.004                                             | 2026-03-07    |

## AB.010.004 Release Notes
- Implement OTP verification with login flow and eligibility checker.
- Fix voter verification flow with where admin, officer, and candidate accounts counts as authenticatied user in voting page
- Add abstain functionality to ballot form and improve candidate selection logic.
- Fix election date inputs bug to UTC ISO format for consistent database storage.
- Fix session management on ballot form page

## AB.010.003 Release Notes
- Add voting functionality with ballot form and initial election results. No websockets yet
- Redesign UI/UX across auth, layouts, and election pagesRefactor ABCD
- Add edit functionality in election management for SEB officers
- Add logo component and refactor elections list feature
- Add route groups for better folder structure
- Notes: Bug spotted in election management edit form. The form is sending the date data into datetime-local without converting it to ISO String, resulting to parsing errors. This will be fixed in the next release.

## AB.010.002 Release Notes
- Implement add election features for SEB officers
- Create all the necessary tables on supabase database
- Add candidate application form with pdf generator to print.
- Notes: This release is focused on the backend and database structure. The frontend is still in progress and will be included in the next release.


## AB.010.001 Release Notes
- Refactor code structure and remove template boilerplates
- Add auth and auth roles. With initial design and replaceable dashboard template.
- Fix createAdminClient to use createClient instead of createServerClientn

## AB.010.000 Release Notes
- Initialize project with Next.js, Tailwind CSS, TypeScript, and Supabase Template
- Initial Commit

### Important Links:
- Design Specs: [unitis-docportal](https://github.com/vitrus-o/unitis-docportal/tree/main)