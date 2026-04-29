"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/utils/supabase";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  agentId: string | null;
  viewerId: string | null;
  dict: any;
}

export function AppointmentModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  agentId,
  viewerId,
  dict,
}: AppointmentModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewerId) {
      setMessage({ type: "error", text: "You must be logged in to schedule a visit." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const appointmentDate = new Date(`${date}T${time}`);

    const { error } = await supabase.from("appointments").insert({
      property_id: propertyId,
      viewer_id: viewerId,
      agent_id: agentId,
      appointment_date: appointmentDate.toISOString(),
      notes: notes,
      status: "pending",
    });

    setIsSubmitting(false);

    if (error) {
      console.error("Error creating appointment:", error);
      setMessage({ type: "error", text: dict.appointments.error });
    } else {
      setMessage({ type: "success", text: dict.appointments.success });
      setTimeout(() => {
        onClose();
        setMessage(null);
        setDate("");
        setTime("");
        setNotes("");
      }, 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dict.appointments.schedule_title}>
      <div className="space-y-4">
        <p className="text-sm text-nordic-dark/60">
          {dict.appointments.schedule_subtitle}
        </p>
        <div className="p-3 bg-mosque/5 rounded-lg border border-mosque/10 mb-4">
          <p className="text-xs font-bold text-mosque uppercase tracking-widest mb-1">
            {dict.appointments.property}
          </p>
          <p className="font-medium text-nordic-dark truncate">{propertyTitle}</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="date" className="text-sm font-semibold text-nordic-dark/70">
                {dict.appointments.date}
              </label>
              <input
                type="date"
                id="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-nordic-dark/10 focus:outline-none focus:ring-2 focus:ring-mosque/20 focus:border-mosque transition-all bg-white dark:bg-[#0a1a18] dark:text-white"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="time" className="text-sm font-semibold text-nordic-dark/70">
                {dict.appointments.time}
              </label>
              <input
                type="time"
                id="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-nordic-dark/10 focus:outline-none focus:ring-2 focus:ring-mosque/20 focus:border-mosque transition-all bg-white dark:bg-[#0a1a18] dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-sm font-semibold text-nordic-dark/70">
              {dict.appointments.notes}
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-nordic-dark/10 focus:outline-none focus:ring-2 focus:ring-mosque/20 focus:border-mosque transition-all bg-white dark:bg-[#0a1a18] dark:text-white resize-none"
              placeholder="..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-mosque hover:bg-primary-hover text-white py-3 px-6 rounded-xl font-bold transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {dict.appointments.submitting}
              </>
            ) : (
              <>
                <span className="material-icons text-xl group-hover:scale-110 transition-transform">send</span>
                {dict.appointments.submit}
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}
