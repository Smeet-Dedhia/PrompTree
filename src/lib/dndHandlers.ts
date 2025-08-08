import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

export interface DragData {
  type: 'prompt-card' | 'prompt-snippet' | 'input-text';
  id: string;
  text?: string;
  title?: string;
}

export const getDragData = (event: DragStartEvent): DragData | null => {
  const { active } = event;
  const data = active.data.current as DragData;
  return data || null;
};

export const handleDragEnd = (
  event: DragEndEvent,
  onDrop: (data: DragData, targetId: string) => void
) => {
  const { active, over } = event;
  
  if (!over) return;
  
  const dragData = active.data.current as DragData;
  if (!dragData) return;
  
  onDrop(dragData, over.id as string);
};

export const createDragData = (
  type: DragData['type'],
  id: string,
  text?: string,
  title?: string
): DragData => ({
  type,
  id,
  text,
  title
});
