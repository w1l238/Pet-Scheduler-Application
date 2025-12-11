# Styling

The frontend application is styled using standard CSS. The approach is a combination of global styles for application-wide consistency and component-specific styles for individual UI elements.

## Global Styles

*   **`index.css`**: This is the most important CSS file for the application's overall look and feel. It defines:
    *   The primary font (`Poppins`).
    *   A global `box-sizing: border-box` reset.
    *   The background color for the entire application.
    *   Default styles for basic HTML elements.

## Page & Layout Styles

These files control the layout and appearance of the main pages and content areas.

*   **`Dashboard.css`**: This is a major stylesheet that provides the core layout and styling for both the Admin and Client dashboard pages. It defines the two-column layout (calendar pane and cards pane), the appearance of the "cards" used to hold content, and the styling for the various lists (appointments, clients, pets, etc.).
*   **`AdminLayout.css` & `ClientLayout.css`**: These files define the top-level grid layout for the admin and client portals, positioning the sidebar and the main content area.
*   **`Auth.css`**: Styles the login and registration pages, including the forms and input fields.
*   **`HomePage.css`**: Provides the styling for the public-facing landing page.

## Component Styles

Most individual components have their own dedicated CSS file (e.g., `Navbar.css`, `AppointmentCalendar.css`, `EditClientModal.css`). This approach encapsulates the styles for a specific component, making them easier to manage and preventing unintended side effects.

Key component styles include:
*   **`Navbar.css`**: Styles the main navigation bar, including the logo, links, and notification icons.
*   **`AppointmentCalendar.css`**: Styles the `react-calendar` component to integrate with the application's design.
*   **`*.Modal.css`**: Each modal component has its own CSS file to style its specific layout, form fields, and buttons.

## Utility Classes & Naming Conventions

The project uses a BEM-like naming convention (Block__Element--Modifier) in many places, though not strictly enforced everywhere. Utility classes are used for common styling patterns, such as status indicators (`.status-scheduled`, `.status-pending`, etc.), which apply a consistent color and background to status labels across different components.
