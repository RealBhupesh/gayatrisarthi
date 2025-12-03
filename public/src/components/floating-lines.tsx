"use client"

import { motion } from "framer-motion"

export function FloatingLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute h-[2px] w-12 opacity-50 ${getRandomColor()}`}
          initial={{
            x: -100,
            y: Math.random() * window.innerHeight,
            rotate: Math.random() * 360,
          }}
          animate={{
            x: window.innerWidth + 100,
            y: Math.random() * window.innerHeight,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: Math.random() * 8 + 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

function getRandomColor() {
  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-green-500", "bg-yellow-500", "bg-red-500"]
  return colors[Math.floor(Math.random() * colors.length)]
}

