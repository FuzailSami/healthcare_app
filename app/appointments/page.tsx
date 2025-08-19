"use client";

import { useEffect, useMemo, useState } from "react";
import { ScheduleAppointmentSchema } from "@/lib/validation";
import { formatDateTime } from "@/lib/utils";
import { Header } from "@/components/header";
import { AppointmentCard } from "@/components/appointment-card";

type Appointment = {
  id: string;
  patientName: string;
  primaryPhysician: string;
  schedule: string; // ISO string
  reason?: string;
  note?: string;
  createdAt: string;
};

const STORAGE_KEY = "carepulse.appointments";

function readAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Appointment[]) : [];
  } catch {
    return [];
  }
}

function writeAppointments(data: Appointment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function requestNotificationPermission() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function scheduleBrowserReminder(appointment: Appointment) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const triggerMs = new Date(appointment.schedule).getTime() - Date.now() - 15 * 60 * 1000; // 15 min before
  if (triggerMs <= 0) return;

  // Best-effort timer while the tab is open
  window.setTimeout(() => {
    // Fire only if still upcoming
    if (new Date(appointment.schedule).getTime() > Date.now()) {
      const { dateTime } = formatDateTime(appointment.schedule);
      new Notification("Appointment reminder", {
        body: `${appointment.patientName}, ${appointment.primaryPhysician} at ${dateTime}`,
      });
    }
  }, triggerMs);
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(readAppointments());
  const [form, setForm] = useState({
    patientName: "",
    primaryPhysician: "",
    schedule: "",
    reason: "",
    note: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    writeAppointments(appointments);
  }, [appointments]);

  const upcoming = useMemo(
    () => appointments.filter(a => new Date(a.schedule).getTime() >= Date.now()).sort((a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime()),
    [appointments]
  );
  const past = useMemo(
    () => appointments.filter(a => new Date(a.schedule).getTime() < Date.now()).sort((a, b) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime()),
    [appointments]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = ScheduleAppointmentSchema.safeParse({
      primaryPhysician: form.primaryPhysician,
      schedule: new Date(form.schedule),
      reason: form.reason || undefined,
      note: form.note || undefined,
    });

    if (!form.patientName || form.patientName.trim().length < 2) {
      setError("Patient name must be at least 2 characters");
      return;
    }
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid form");
      return;
    }

    const newAppt: Appointment = {
      id: crypto.randomUUID(),
      patientName: form.patientName.trim(),
      primaryPhysician: parsed.data.primaryPhysician,
      schedule: new Date(parsed.data.schedule).toISOString(),
      reason: parsed.data.reason,
      note: parsed.data.note,
      createdAt: new Date().toISOString(),
    };

    setAppointments(prev => {
      const next = [...prev, newAppt];
      scheduleBrowserReminder(newAppt);
      return next;
    });

    setForm({ patientName: "", primaryPhysician: "", schedule: "", reason: "", note: "" });
  }

  function removeAppointment(id: string) {
    setAppointments(prev => prev.filter(a => a.id !== id));
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-dark-300 to-dark-400">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 text-transparent bg-clip-text mb-4">
              Manage Your Appointments
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Schedule and manage your healthcare appointments with ease. Get reminders and keep track of your medical visits all in one place.
            </p>
          </div>

          <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-12">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Schedule New Appointment</h2>
            <form onSubmit={addAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Patient Name</label>
                <input
                  className="w-full px-4 py-2.5 bg-dark-400/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-100 placeholder:text-gray-500"
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  required
                  minLength={2}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Select Physician</label>
                <select
                  name="primaryPhysician"
                  value={form.primaryPhysician}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-dark-400/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-100"
                  required
                >
                  <option value="" disabled>Choose a doctor</option>
                  <option>Dr. Smith</option>
                  <option>Dr. Johnson</option>
                  <option>Dr. Patel</option>
                  <option>Dr. Chen</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Appointment Date & Time</label>
                <input
                  type="datetime-local"
                  name="schedule"
                  value={form.schedule}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-dark-400/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Reason for Visit</label>
                <input
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-dark-400/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-100 placeholder:text-gray-500"
                  placeholder="e.g., Annual checkup, Follow-up"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-300">Additional Notes</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-dark-400/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-100 placeholder:text-gray-500"
                  rows={3}
                  placeholder="Any additional information..."
                />
              </div>

              {error && (
                <div className="md:col-span-2">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Upcoming Appointments</h2>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-sm font-medium rounded-full">
                  {upcoming.length} scheduled
                </span>
              </div>
              
              <div className="space-y-4">
                {upcoming.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">No upcoming appointments</p>
                  </div>
                ) : (
                  upcoming.map(a => {
                    const { dateDay, timeOnly } = formatDateTime(a.schedule);
                    return (
                      <AppointmentCard
                        key={a.id}
                        patientName={a.patientName}
                        doctorName={a.primaryPhysician}
                        date={dateDay}
                        time={timeOnly}
                        reason={a.reason}
                        onRemove={() => removeAppointment(a.id)}
                      />
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Past Appointments</h2>
                <span className="px-3 py-1 bg-gray-500/10 text-gray-400 text-sm font-medium rounded-full">
                  {past.length} completed
                </span>
              </div>
              
              <div className="space-y-4">
                {past.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No past appointments</p>
                  </div>
                ) : (
                  past.map(a => {
                    const { dateDay, timeOnly } = formatDateTime(a.schedule);
                    return (
                      <AppointmentCard
                        key={a.id}
                        patientName={a.patientName}
                        doctorName={a.primaryPhysician}
                        date={dateDay}
                        time={timeOnly}
                        reason={a.reason}
                        isPast
                        onRemove={() => removeAppointment(a.id)}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Browser notifications will remind you 15 minutes before each appointment while this tab is open.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}


