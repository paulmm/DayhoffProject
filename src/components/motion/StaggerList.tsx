"use client";

import React from "react";
import { motion } from "framer-motion";

interface StaggerListProps {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}

const containerVariants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: {
      staggerChildren: stagger,
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

export default function StaggerList({
  children,
  stagger = 0.06,
  className,
}: StaggerListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      custom={stagger}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants} className="flex flex-col">{child}</motion.div>
      ))}
    </motion.div>
  );
}
