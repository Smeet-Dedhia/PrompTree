'use client';

import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export function SaveLoadButtons() {
  const { topics } = useAppStore();

  const handleSave = () => {
    const data = {
      topics,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptree-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.topics && Array.isArray(data.topics)) {
            // Import data into IndexedDB
            const { db } = await import('@/lib/db');
            
            // Clear existing data
            await db.topics.clear();
            await db.prompts.clear();
            
            // Import new data
            for (const topic of data.topics) {
              await db.topics.put(topic);
              for (const prompt of topic.prompts) {
                await db.prompts.put({ ...prompt, topicId: topic.id });
              }
            }
            
            // Refresh the store
            const { initialize } = useAppStore.getState();
            await initialize();
            
            alert('Data imported successfully!');
          } else {
            alert('Invalid file format. Please select a valid PrompTree export file.');
          }
        } catch (error) {
          console.error('Import error:', error);
          alert('Error loading file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to delete all topics and prompts? This action cannot be undone.')) {
      return;
    }

    try {
      const { db } = await import('@/lib/db');
      
      // Clear all data from IndexedDB
      await db.topics.clear();
      await db.prompts.clear();
      
      // Refresh the store
      const { initialize } = useAppStore.getState();
      await initialize();
      
      alert('All data cleared successfully!');
    } catch (error) {
      console.error('Clear error:', error);
      alert('Error clearing data. Please try again.');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleSave}
        disabled={topics.length === 0}
        className="h-8 border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all duration-150 hover:-translate-y-0.5"
      >
        <Download className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        <span>Export</span>
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleLoad}
        className="h-8 border border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 rounded-xl transition-all duration-150 hover:-translate-y-0.5"
      >
        <Upload className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        <span>Import</span>
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleClear}
        disabled={topics.length === 0}
        className="h-8 border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50 hover:text-rose-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all duration-150 hover:-translate-y-0.5"
      >
        <Trash2 className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        <span>Clear</span>
      </Button>
    </div>
  );
}
