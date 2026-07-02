/**
 * Copyright (c) 2026 pokemon-type-simulator
 * MIT License
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { categoryLabels, TYPE_COLORS, type EffectivenessResult } from "@/lib/type-chart";

type EffectivenessResultsProps = {
  groupedResults: Record<string, EffectivenessResult[]>;
  activeItems: string[];
  onActiveItemsChange: (items: string[]) => void;
};

export function EffectivenessResults({
  groupedResults,
  activeItems,
  onActiveItemsChange,
}: EffectivenessResultsProps) {
  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-700">
      <Accordion
        type="multiple"
        value={activeItems}
        onValueChange={onActiveItemsChange}
        className="w-full"
      >
        {Object.keys(categoryLabels).map((cat) => {
          const list = groupedResults[cat];
          if (!list || list.length === 0) return null;
          return (
            <AccordionItem key={cat} value={cat} className="border-slate-200 dark:border-slate-700">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold">{categoryLabels[cat]} ({list.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-4 gap-2 pt-2 pb-4">
                  {list.map((r) => (
                    <div
                      key={r.type}
                      className={`p-2 text-center rounded text-sm font-bold shadow-sm border border-black/5 ${TYPE_COLORS[r.type]
                        } ${r.type === "あく" ? "text-white" : "text-slate-900"}`}
                    >
                      {r.type}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
