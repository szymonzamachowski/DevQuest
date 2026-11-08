"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import type { ProjectQuestStatus } from "@prisma/client";

import { moveQuestToColumnAction } from "@/features/quests/actions/quest.actions";
import { QuestCard, type QuestCardData } from "@/features/quests/components/quest-card";
import {
  KANBAN_COLUMNS,
  kanbanColumnForStatus,
  statusForKanbanDrop,
  type KanbanColumn,
} from "@/lib/services/quest-workflow.service";
import { cn } from "@/lib/utils";

type BoardQuest = QuestCardData;

const columnTone: Record<KanbanColumn, string> = {
  LOCKED: "text-[var(--dq-outline)]",
  AVAILABLE: "text-[var(--dq-gold)]",
  IN_PROGRESS: "text-[var(--dq-ember)]",
  REVIEW: "text-[var(--dq-mana)]",
  COMPLETED: "text-[var(--dq-moss)]",
};

function DroppableColumn({
  id,
  title,
  quests,
  projectId,
}: {
  id: KanbanColumn;
  title: string;
  quests: BoardQuest[];
  projectId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      className={cn(
        "dq-well relative flex max-h-[calc(100dvh-14rem)] min-h-[420px] w-[min(288px,85vw)] shrink-0 flex-col",
        isOver && "dq-well--over",
      )}
    >
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <span className={cn("flex items-center gap-2 text-lg", columnTone[id])}>
          <span aria-hidden className="size-3 bg-current" />
          {title}
        </span>
        <span
          className="min-w-7 bg-[var(--dq-ink)] px-1.5 text-center text-[var(--muted-foreground)]"
          aria-live="polite"
        >
          {quests.length}
        </span>
      </header>
      <ul
        className={cn(
          "flex flex-1 list-none flex-col overflow-y-auto p-4",
          id === "COMPLETED" ? "gap-2" : "gap-5",
        )}
      >
        {quests.map((quest) => (
          <li key={quest.id}>
            <DraggableQuestCard quest={quest} projectId={projectId} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DraggableQuestCard({ quest, projectId }: { quest: BoardQuest; projectId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: quest.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style}>
      <QuestCard
        quest={quest}
        projectId={projectId}
        isDragging={isDragging}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  );
}

export function QuestBoard({
  projectId,
  quests: initialQuests,
}: {
  projectId: string;
  quests: BoardQuest[];
}) {
  const t = useTranslations("quests");
  const [quests, setQuests] = useState(initialQuests);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(
      KANBAN_COLUMNS.map((c) => [c, [] as BoardQuest[]]),
    ) as Record<KanbanColumn, BoardQuest[]>;
    for (const quest of quests) {
      grouped[kanbanColumnForStatus(quest.status)].push(quest);
    }
    return grouped;
  }, [quests]);

  const activeQuest = quests.find((q) => q.id === activeId) ?? null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setError(null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const questId = String(event.active.id);
    const overId = event.over?.id;
    if (!overId) return;

    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const targetColumn = KANBAN_COLUMNS.includes(overId as KanbanColumn)
      ? (overId as KanbanColumn)
      : kanbanColumnForStatus(quests.find((q) => q.id === overId)?.status ?? quest.status);

    const nextStatus = statusForKanbanDrop(targetColumn, quest.status);
    if (!nextStatus) {
      setError(t("errors.QUEST_LOCKED"));
      return;
    }

    if (kanbanColumnForStatus(quest.status) === targetColumn && quest.status === nextStatus) return;

    startTransition(async () => {
      const result = await moveQuestToColumnAction(projectId, questId, targetColumn);
      if (!result.ok) {
        setError(t(`errors.${result.error ?? "generic"}`));
        return;
      }
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, status: nextStatus as ProjectQuestStatus } : q,
        ),
      );
    });
  }

  const columnLabels: Record<KanbanColumn, string> = {
    LOCKED: t("columns.locked"),
    AVAILABLE: t("columns.available"),
    IN_PROGRESS: t("columns.inProgress"),
    REVIEW: t("columns.review"),
    COMPLETED: t("columns.completed"),
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div
          className="dq-card px-4 py-3 text-[var(--dq-blood)]"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      ) : null}

      <DndContext
        id="quest-board"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          className={cn(
            "dq-kanban-scroll flex gap-5 overflow-x-auto px-1 pt-1 pb-4",
            pending && "opacity-80",
          )}
          role="region"
          aria-label={t("boardRegion")}
        >
          {KANBAN_COLUMNS.map((column) => (
            <DroppableColumn
              key={column}
              id={column}
              title={columnLabels[column]}
              quests={columns[column]}
              projectId={projectId}
            />
          ))}
        </div>
        <DragOverlay>
          {activeQuest ? <QuestCard quest={activeQuest} projectId={projectId} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
