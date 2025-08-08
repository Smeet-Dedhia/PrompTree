# PromptTree

A Next.js 14 application for managing and composing prompts with drag-and-drop functionality.

## Features

- **3-Pane Layout**: Topics list, prompt cards, and input area
- **Drag & Drop**: Drag prompts to insert into text area
- **Local Storage**: All data persisted in IndexedDB
- **Topic Management**: Create, edit, and delete topics
- **Prompt Management**: Create, edit, and delete prompts

## Usage

1. **Add Topics**: Click "Add Topic" to create new topic categories
2. **Create Prompts**: Write text in the input area and click "Save to Topic"
3. **Drag & Drop**: Drag prompt cards into the input area to insert them
4. **Copy & Clear**: Use buttons to copy all text or clear the input area

## Tech Stack

- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Dexie.js for IndexedDB storage
- Drag and drop with native HTML5 API

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
