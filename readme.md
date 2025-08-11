# Pic-Store: Photo Gallery Sharing for Photographers

Pic-Store is a full-stack web application designed to help photographers easily share photo galleries with their clients. Clients can view their photos, and the platform supports features like pricing and ordering.

## Key Features

*   **Photographer Dashboard:** Manage galleries, upload images, and view statistics.
*   **Client Galleries:** Secure, access-code protected galleries for each client.
*   **Image Upload:** Drag-and-drop file uploader for images.
*   **Gallery Management:** Create, edit, and manage photo galleries.
*   **Pricing:** Set prices for images (feature in development).
*   **Responsive Design:** User interface built with Shadcn/ui and Tailwind CSS, ensuring a great experience on all devices.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
*   **Database:** conect to your supabase account
*   
*   **Authentication:** using basic auth with next-auth

git initgit initgit initgit initgit initgit remote add origin https://github.com/ANDERSON254KE/secure-pics-.git
## Getting Started

### Prerequisites

*   Node.js
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd pic-store
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Set up your environment variables by creating a `.env` file. You will need to configure database connection strings and other secrets.

5.  Run the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The application follows the Next.js App Router structure:

*   `app/api/`: API routes for server-side logic.
*   `app/dashboard/`: Routes for the photographer's dashboard.
*   `app/gallery/`: Routes for creating, managing, and uploading to galleries.
*   `app/client/`: Routes for the client-facing photo galleries.
*   `components/`: Shared UI components.
*   `lib/`: Utility functions and database logic (e.g., Prisma client).
*   `prisma/`: Database schema definition.

