# UNITIS

An election management system designed to modernize student elections at Visayas State University

| Internal Release Code&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Date Released |
| ------------------------------------------------------ | ------------- |
| UN.010.001                                             | 2026-02-27    |
| UN.010.002                                             | 2026-02-27    |
| UN.010.003                                             | 2026-02-27    |
| UN.010.004                                             | 2026-03-07    |
| UN.010.005                                             | 2026-03-15    |
| UN.010.006                                             | 2026-04-02    |
| UN.010.007                                             | 2026-04-19    |
| UN.010.008                                             | 2026-04-26    |
| UN.010.009                                             | 2026-05-03    |

## UN.010.009 Release Notes
- Implemented age calculation from birth date during candidate application insertion.
- Updated partylist registration to include candidate slate validation and age calculation.
- Removed candidates page component as part of refactoring.
- Improved voting user verification to ensure email format compliance.
- Enhanced real-time turnout updates to include voter status changes.
- Updated election permissions to simplify role checks for creating election types.
- Refactored data table component for responsive design.
- Introduced new feature components for better UI representation of election features.
- Added utility functions for student ID validation and age calculation from birth date.

## UN.010.008 Release Notes
- Updated TurnoutLiveClient to use SharedTurnoutLiveClientProps for props.
- Refactored TurnoutSummaryCard to utilize a shared TurnoutData type.
- Enhanced Badge component by separating BadgeProps into a dedicated type.
- Modified UpcomingElectionSection and ElectionCard to use new UpcomingElectionCardProps.
- Introduced global.d.ts for CSS module declaration.
- Updated getCurrentProfile to include more detailed display_name for SEB Officers.
- Added requireElectionManager function for role-based access control.
- Created election-permissions.ts to manage election access policies and permissions.
- Enhanced candidacy and partylist registration with validation and age calculation
- Added validation for student ID format and birth date in candidacy form.

## UN.010.007 Release Notes
- Added new types for academic entities and officer management.
- Enhanced auth types to include additional fields for SEB Officers.
- Introduced candidacy types and form data structure.
- Created a comprehensive components.ts file to centralize component props types.
- Expanded election types to include new fields for better management.
- Added institutional types for data tables and candidate registries.
- Introduced officer-elections types for managing election-related data.
- Added public types for various election-related pages and forms.
- Created UI types for Badge component variants.
- Enhanced utility functions for date and election state management.
- Updated package dependencies and versioning.
- Removed unused Tailwind configuration file.
- Adjusted TypeScript configuration to include all declaration files.

## UN.010.006 Release Notes
- Split the home page election area into Happening Now and Upcoming Election sections.
- Add dedicated public event pages with state-based actions.
- Add live turnout snapshots with realtime refresh for active elections.
- Add archive detail pages with per-candidate totals and turnout summary metrics.
- Add officer turnout adjustment controls with active-election validation and auto-adjust handling.
- Add direct in-card `Check eligibility` action for upcoming elections while preserving card navigation to event pages.
- Expand upcoming event pages with full pre-election action set beyond eligibility.
- Refine hover feedback to border-emphasis style for cleaner visual cues.

## UN.010.005 Release Notes
- Add nav, hero, feature, and footer page to the home page
- Update dependencies and migrate to Tailwind CSS v4.2
- Add archive page and link to it from the home page
- Refactor candidacy application process, enhance application form, and add candidates page

## UN.010.004 Release Notes
- Implement OTP verification with login flow and eligibility checker.
- Fix voter verification flow with where admin, officer, and candidate accounts counts as authenticatied user in voting page
- Add abstain functionality to ballot form and improve candidate selection logic.
- Fix election date inputs bug to UTC ISO format for consistent database storage.
- Fix session management on ballot form page

## UN.010.003 Release Notes
- Add voting functionality with ballot form and initial election results. No websockets yet
- Redesign UI/UX across auth, layouts, and election pagesRefactor ABCD
- Add edit functionality in election management for SEB officers
- Add logo component and refactor elections list feature
- Add route groups for better folder structure
- Notes: Bug spotted in election management edit form. The form is sending the date data into datetime-local without converting it to ISO String, resulting to parsing errors. This will be fixed in the next release.

## UN.010.002 Release Notes
- Implement add election features for SEB officers
- Create all the necessary tables on supabase database
- Add candidate application form with pdf generator to print.
- Notes: This release is focused on the backend and database structure. The frontend is still in progress and will be included in the next release.


## UN.010.001 Release Notes
- Refactor code structure and remove template boilerplates
- Add auth and auth roles. With initial design and replaceable dashboard template.
- Fix createAdminClient to use createClient instead of createServerClientn

## UN.010.000 Release Notes
- Initialize project with Next.js, Tailwind CSS, TypeScript, and Supabase Template
- Initial Commit

### Important Links:
- Design Specs: [unitis-docportal](https://github.com/vitrus-o/unitis-docportal/tree/main)