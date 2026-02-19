# **The Ultimate "Docs-as-Code" Tutorial Platform Prompt**

**Role:** Expert Senior Frontend Architect & UX Designer

**Objective:** Build a single-page React application that functions as a high-performance, developer-focused tutorial platform.

## **Core Context**

The application acts as a "Docs-as-Code" viewer. It treats a folder structure of Markdown files as a curriculum. The UX must be frictionless, encouraging the user to reach "Flow State" while learning.

## **Key Features & Requirements**

### **1\. The "Auto-Load" Simulation (Architecture)**

* **Data Structure:** Create a robust JSON object (mockFileSystem) that simulates a real directory structure.  
  * It must handle nested folders (Chapters/Sections) and Files (Lessons).  
  * Each file object contains: id, title, content (Markdown string), and type ('file' or 'folder').  
* **Navigation:**  
  * Implement a **recursive sidebar** component that renders the folder structure.  
  * Folders should be collapsible (Accordion style).  
  * Active file must be visually distinct (highlighted).

### **2\. The "Colorful Code" Experience (Visuals)**

* **Markdown Rendering:** Implement a parser to transform raw Markdown strings into React components.  
  * **Headers:** Clean, bold typography.  
  * **Text:** High legibility, sans-serif (Inter/System UI).  
  * **Code Blocks:** This is the priority. Detect code blocks (\`\`\`) and render them in a custom "CodeSnippet" component.  
  * **Syntax Highlighting:** Use a dark-theme aesthetic for code blocks with specific colors for keywords, strings, and functions (simulated syntax highlighting for JS/React).

### **3\. Trackable Progress (Gamification)**

* **State Management:** Track which files have been "Completed."  
* **Visual Feedback:**  
  * Add a "Mark as Complete" button at the bottom of every lesson.  
  * Show checkmarks ✅ next to completed files in the sidebar.  
  * Display a global **Progress Bar** (e.g., "35% Course Completed") at the top.

### **4\. Performance & UX**

* **Zero Latency:** Transitions between files must be instant (client-side routing logic).  
* **Responsive:** The sidebar must collapse into a hamburger menu on mobile.  
* **Keyboard Support:** Allow users to navigate sections using Next/Prev buttons.

## **Technical Constraints (For Gemini/Canvas)**

* **Single File:** All logic, styles (Tailwind), components, and icons (Lucide) must reside in one .tsx file.  
* **No External Heavy Libs:** Do not rely on npm install. Use pure React and Tailwind classes. Write a lightweight custom Markdown parser instead of importing heavy libraries like react-markdown to ensure reliability in the preview environment.

## **Design Aesthetic**

* **Theme:** "Modern Developer Dark Mode" (Slate/Zinc palette).  
* **Accent:** Indigo/Violet for primary actions.  
* **Vibe:** Clean, distraction-free, academic but cool.

**Output:** Generate the complete App.tsx file.