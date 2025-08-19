"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ScheduleAppointmentSchema } from "@/lib/validation";
import { formatDateTime } from "@/lib/utils";

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
    <main className="container py-10">
      <div className="sub-container max-w-4xl">
        <div className="flex-between">
          <h1 className="header">Appointments</h1>
          <a href="/" className="text-14-medium text-green-500">Home</a>
        </div>

        <form onSubmit={addAppointment} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-200 p-5 rounded-xl">
          <div>
            <label className="shad-input-label">Patient name</label>
            <input
              className="shad-input w-full rounded-md px-3"
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="shad-input-label">Physician</label>
            <select
              name="primaryPhysician"
              value={form.primaryPhysician}
              onChange={handleChange}
              className="shad-select-trigger w-full rounded-md px-3"
              required
            >
              <option value="" disabled>
                Select a physician
              </option>
              <option>Dr. Smith</option>
              <option>Dr. Johnson</option>
              <option>Dr. Patel</option>
              <option>Dr. Chen</option>
            </select>
          </div>
          <div>
            <label className="shad-input-label">Date & time</label>
            <input
              type="datetime-local"
              name="schedule"
              value={form.schedule}
              onChange={handleChange}
              className="shad-input w-full rounded-md px-3"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="shad-input-label">Reason (optional)</label>
            <input
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="shad-input w-full rounded-md px-3"
              placeholder="e.g., Follow-up, annual checkup"
            />
          </div>
          <div className="md:col-span-2">
            <label className="shad-input-label">Note (optional)</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              className="shad-textArea w-full rounded-md px-3 py-2"
              rows={3}
            />
          </div>
          {error && <p className="shad-error md:col-span-2">{error}</p>}
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="shad-primary-btn rounded-md px-6 py-2 text-16-semibold">
              Add appointment
            </button>
          </div>
        </form>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-5 bg-dark-200">
            <h2 className="sub-header">Upcoming</h2>
            <ul className="mt-4 space-y-3">
              {upcoming.length === 0 && (
                <li className="text-dark-600 text-14-regular">No upcoming appointments</li>
              )}
              {upcoming.map(a => {
                const { dateDay, timeOnly } = formatDateTime(a.schedule);
                return (
                  <li key={a.id} className="data-table p-4 flex-between rounded-lg">
                    <div>
                      <p className="text-16-semibold">{a.patientName} • {a.primaryPhysician}</p>
                      <p className="text-14-regular text-dark-700">{dateDay} at {timeOnly}</p>
                    </div>
                    <button onClick={() => removeAppointment(a.id)} className="shad-danger-btn rounded-md px-4 py-2 text-14-medium">
                      Cancel
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rounded-2xl p-5 bg-dark-200">
            <h2 className="sub-header">Past</h2>
            <ul className="mt-4 space-y-3">
              {past.length === 0 && (
                <li className="text-dark-600 text-14-regular">No past appointments</li>
              )}
              {past.map(a => {
                const { dateDay, timeOnly } = formatDateTime(a.schedule);
                return (
                  <li key={a.id} className="data-table p-4 flex-between rounded-lg">
                    <div>
                      <p className="text-16-semibold">{a.patientName} • {a.primaryPhysician}</p>
                      <p className="text-14-regular text-dark-700">{dateDay} at {timeOnly}</p>
                    </div>
                    <button onClick={() => removeAppointment(a.id)} className="shad-gray-btn rounded-md px-4 py-2 text-14-medium">
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <p className="text-12-regular text-dark-600 mt-8">
          Reminders are delivered via browser notifications 15 minutes before an appointment while this tab is open.
        </p>
      </div>
    </main>
  );
}


