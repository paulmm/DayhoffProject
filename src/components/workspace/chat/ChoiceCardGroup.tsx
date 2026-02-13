"use client";

import { motion } from "framer-motion";

export interface ChoiceCard {
  id: string;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

interface ChoiceCardGroupProps {
  cards: ChoiceCard[];
  selected?: string | null;
  onSelect: (id: string) => void;
  columns?: 2 | 3;
}

export default function ChoiceCardGroup({
  cards,
  selected,
  onSelect,
  columns = 3,
}: ChoiceCardGroupProps) {
  return (
    <div
      className={`grid gap-3 ${
        columns === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {cards.map((card, index) => {
        const isSelected = selected === card.id;
        const Icon = card.icon;

        return (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => !card.disabled && onSelect(card.id)}
            disabled={card.disabled}
            className={`relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
              isSelected
                ? "border-dayhoff-purple/60 bg-dayhoff-purple/10"
                : card.disabled
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
            }`}
          >
            {card.badge && (
              <span className="absolute right-3 top-3 rounded-full bg-dayhoff-purple/20 px-2 py-0.5 text-[10px] font-semibold text-dayhoff-purple">
                {card.badge}
              </span>
            )}

            {Icon && (
              <Icon
                className={`h-5 w-5 ${
                  isSelected ? "text-dayhoff-purple" : "text-gray-400"
                }`}
              />
            )}

            <div>
              <div
                className={`text-sm font-semibold ${
                  isSelected ? "text-white" : "text-gray-200"
                }`}
              >
                {card.title}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {card.description}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
