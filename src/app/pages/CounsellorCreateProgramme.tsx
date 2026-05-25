import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { supabase } from "../lib/supabase";

const FREQUENCY_OPTIONS = ["Daily", "Twice weekly", "Weekly", "Bi-weekly"];

export default function CounsellorCreateProgramme() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState("14");
  const [checkinFrequency, setCheckinFrequency] = useState(FREQUENCY_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    const parsedDuration = Number.parseInt(durationDays, 10);
    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setError("Duration must be a positive number of days.");
      return;
    }

    setIsSubmitting(true);

    const { error: insertError } = await supabase.from("programmes").insert({
      name: name.trim(),
      description: description.trim(),
      duration_days: parsedDuration,
      checkin_frequency: checkinFrequency,
    });

    if (insertError) {
      if (insertError.message.toLowerCase().includes("row-level security")) {
        setError("Your account cannot create programmes yet. Ask an admin to grant programme-create access.");
      } else {
        setError(insertError.message);
      }
      setIsSubmitting(false);
      return;
    }

    navigate("/programmes");
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/counsellor/dashboard"
          className="inline-flex items-center gap-2 text-[#006B3F] hover:text-[#004D2C] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#006B3F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#004D2C]">Create Programme</h1>
              <p className="text-sm text-gray-600">Set up a structured support programme for students.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#004D2C] mb-2">Programme Name</label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. 21-Day Stress Recovery"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#004D2C] mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the goals and structure of this programme"
                className="min-h-28"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#004D2C] mb-2">Duration (days)</label>
                <Input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(event) => setDurationDays(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#004D2C] mb-2">Check-in Frequency</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={checkinFrequency}
                  onChange={(event) => setCheckinFrequency(event.target.value)}
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" className="bg-[#006B3F] hover:bg-[#004D2C] text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSubmitting ? "Creating..." : "Create Programme"}
              </Button>
              <Link to="/counsellor/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
