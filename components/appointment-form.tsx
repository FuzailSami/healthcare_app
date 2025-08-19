import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { useState } from "react"

const appointmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  date: z.date(),
  reason: z.string().min(10, "Please provide more detail about your appointment reason"),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

export function AppointmentForm() {
  const [date, setDate] = useState<Date>()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  })

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error("Failed to schedule appointment")
      }
      
      // Handle success (e.g., show success message, reset form)
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error("Error scheduling appointment:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input
          {...register("name")}
          id="name"
          type="text"
          className="w-full p-2 border rounded-md"
          placeholder="Your name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          {...register("email")}
          id="email"
          type="email"
          className="w-full p-2 border rounded-md"
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Date</label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate)
            if (newDate) {
              setValue("date", newDate)
            }
          }}
          className="rounded-md border"
        />
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="reason" className="block text-sm font-medium">Reason for Appointment</label>
        <textarea
          {...register("reason")}
          id="reason"
          className="w-full p-2 border rounded-md h-24"
          placeholder="Please describe your reason for the appointment"
        />
        {errors.reason && (
          <p className="text-red-500 text-sm">{errors.reason.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Schedule Appointment
      </Button>
    </form>
  )
}
