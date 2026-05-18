'use client';

import { motion } from "framer-motion";
import { ArrowUp, MapPin, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Complaint, STATUS_COLORS, PRIORITY_COLORS, CATEGORIES } from "@/lib/mockData";

export function ComplaintCard({ c, index = 0 }: { c: Complaint; index?: number }) {
  const cat = CATEGORIES.find((x) => x.id === c.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl overflow-hidden group hover:shadow-civic transition-shadow"
    >
      <Link to="/complaints/$id" params={{ id: c.id }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={c.imageUrl}
            alt={c.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border backdrop-blur ${STATUS_COLORS[c.status]}`}>
              {c.status}
            </span>
          </div>
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[10px] font-semibold">
            #{c.id}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/70">{cat?.name}</div>
              <div className={`text-xs font-bold ${PRIORITY_COLORS[c.priority]} drop-shadow`}>● {c.priority}</div>
            </div>
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full text-white text-xs font-semibold">
              <ArrowUp className="h-3 w-3" />{c.upvotes}
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-display font-semibold leading-snug line-clamp-2">{c.title}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.ward.split("—")[1]?.trim() || c.ward}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.createdAt}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}