# **App Name**: EchoTrack

## Core Features:

- User Authentication: Secure user authentication using Firebase Auth with OTP (One-Time Password) via phone and email, managing user roles (admin, agent, driver).
- Live Map Tracking: Real-time display of drivers' locations using Leaflet, an open-source mapping library, to ensure license-free and lightweight map integration. Should have search tab to search driver by Id or Job Id, filter tab to filter based on vehicle type or by status 'empty' (completed to turn empty)
- Driver Assignment: Suggest suitable drivers based on location, vehicle type, license and insurance validity, using a Firebase Function as a tool for the best match.
- Internal Chat: Facilitate communication between agents and drivers via Firestore, providing offline message synchronization. SMS chat and Internal chat with Driver app, Shipper's app, Pax app to be linked
- Weather Display: Provide real-time weather information using Windy's iframe embed for route planning.
- Admin Control Panel: Audit-ready control panel for managing users, roles, logs, and data, with JSON export capabilities for easy analysis. All the pages to have full edit and change access to admin every cell, every line, every row, any changes so add Microsoft excel like functions, and to all the app give righclick popup menu same as Microsoft Office style.
- Security Rules: Implement Firebase Security Rules for data protection and access control, ensuring compliance and preventing data leaks.
- Settings 'Admin' Page: Admin page for managing settings. Inside the settings Admin page allow to change the Avatar and data of Admin and Users pROFILES
- Live App for Dispatch Page: Live dispatch application page.
- Fleet Tracking Map: Map for tracking fleet vehicles.
- SMS Page: Page for sending and receiving SMS messages.
- Jobs Page: Page for managing job assignments. Changes in jobs should be synced to the Control Center Web app.
- Manual Dispatch Page: Page for manually dispatching jobs.
- Fleet Page: Page for managing fleet vehicles. Fleet and Vehicle information to stored in Data page and should get synced.
- Driver Page: Page for managing driver information. Driver information to stored in Data page and should get synced.
- Data Page: Page for viewing and managing data. The main page should be visible in the data page. Driver & Vehicle, Pax and Shipper information should get synced to this page.
- Reports Page: Page for generating reports.
- Incident Report Page: Page for viewing incident reports.
- Invoice Page: Invoice to save as access, Once job completed the data to transfered to Invoice page and generate the bill and send it to the email address to email address mentioned in the top of the Invoice page and add phone number send via whatsapp to the company number enter manually and send button.
- Pricing Page: Page for managing pricing information.
- Driver App: Mobile app for drivers. Changes in Driver App should be synced to the Control Center Web app.
- Pax App: Mobile app for passengers. Changes in Pax App should be synced to the Control Center Web app. Pax information to stored in Data page and should get synced.
- Shipper's App: Mobile app for shippers. Changes in Shipper's Page should be synced to the Control Center Web app.  Shipper information to stored in Data page and should get synced.
- Support Page: Page for providing customer support.
- User Management: Includes user management. Depending on the permission, the agent can have his access. List all the minor and major access to Admin page
- Backup to local storage: Backup to local storage should be included as a sub menu page inside Admin Settings

## Style Guidelines:

- Primary color: Light purple (#A099FF), for a contemporary, calm, but high-tech feel.
- Background color: Off-white (#F5F4F9), for a clean and modern look that is easy on the eyes.
- Accent color: Light blue (#99A0FF), to provide subtle, but clear contrast.
- Headline font: 'Space Grotesk' sans-serif for a computerized, techy feel. Body text: 'Inter' sans-serif for a neutral look.
- Use flat design icons to represent various actions and categories throughout the app.
- Maintain a clean and organized layout with clear visual hierarchy for easy navigation.
- Subtle transitions and animations to enhance user experience, such as loading spinners or progress bars.
- Dashboard layout similar to the provided image, including summary cards for total vehicles, SMS, active trips, and idle drivers.
- Visualizations for fleet composition and driver fatigue levels.
- Awaiting jobs section displaying pending job details and assignment options.