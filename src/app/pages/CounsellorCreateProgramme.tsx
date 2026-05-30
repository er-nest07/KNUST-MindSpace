import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Loader2, Sparkles, PlusCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { supabase } from "../lib/supabase";

const FREQUENCY_OPTIONS = ["Daily", "Twice weekly", "Weekly", "Bi-weekly", "Monthly"];
const AUDIENCE_OPTIONS = ["All students", "First-year students", "Final-year students", "Postgraduate students", "Students on probation"];
const DELIVERY_OPTIONS = ["Self-paced", "Counsellor-led", "Hybrid (self-paced + check-ins)", "Group sessions"];

const NINE_WEEK_COURSE = {
  name: "9-Week Mental Health Journey",
  description:
    "A comprehensive 9-week structured programme guiding KNUST students through emotional awareness, stress management, cognitive reframing, healthy relationships, self-compassion, and resilience. Designed for students navigating academic pressure, life transitions, and personal challenges.",
  duration_days: 63,
  checkin_frequency: "Weekly",
  audience: "All students",
  delivery: "Hybrid (self-paced + check-ins)",
  weeks: [
    {
      week: 1,
      title: "Foundation — Understanding Your Mental Health",
      topics: [
        "What mental health really means",
        "Common myths about mental wellbeing on campus",
        "Your personal mental health baseline",
        "Building awareness without judgment",
      ],
      activity: "Complete a personal mental health self-assessment and identify your three biggest current stressors.",
    },
    {
      week: 2,
      title: "Emotional Awareness & Regulation",
      topics: [
        "Naming and identifying emotions accurately",
        "The difference between feeling and reacting",
        "Window of tolerance and emotional flooding",
        "Simple daily regulation techniques",
      ],
      activity: "Keep a 7-day emotion diary. Notice patterns in what triggers strong reactions.",
    },
    {
      week: 3,
      title: "Stress Management & Relaxation",
      topics: [
        "How chronic academic stress affects the brain and body",
        "Progressive muscle relaxation and breathwork",
        "Stress response vs. relaxation response",
        "Creating a personal stress first-aid kit",
      ],
      activity: "Practice one relaxation technique daily (box breathing, body scan, or grounding) and track effectiveness.",
    },
    {
      week: 4,
      title: "Thought Patterns & Cognitive Reframing",
      topics: [
        "Identifying automatic negative thoughts (ANTs)",
        "Cognitive distortions common in students (catastrophising, mind-reading, all-or-nothing)",
        "The thought–feeling–behaviour triangle",
        "Challenging unhelpful beliefs with evidence",
      ],
      activity: "Use a thought record to challenge three unhelpful thoughts you notice this week.",
    },
    {
      week: 5,
      title: "Healthy Relationships & Communication",
      topics: [
        "Recognising unhealthy relationship patterns",
        "Assertiveness vs. aggression vs. passivity",
        "Setting and communicating boundaries",
        "Seeking support without shame",
      ],
      activity: "Practice one assertive communication in a real situation and reflect on how it went.",
    },
    {
      week: 6,
      title: "Self-Compassion & The Inner Critic",
      topics: [
        "Understanding the harsh inner critic",
        "Self-compassion as a mental health skill (not self-pity)",
        "The three components of self-compassion (Neff model)",
        "Turning self-criticism into self-coaching",
      ],
      activity: "Write a compassionate letter to yourself about a recent struggle, as if writing to a close friend.",
    },
    {
      week: 7,
      title: "Purpose, Meaning & Academic Goals",
      topics: [
        "Connecting daily effort to personal values",
        "The difference between pressure-driven and purpose-driven studying",
        "Goal-setting with flexibility (not perfectionism)",
        "Reframing failure as information",
      ],
      activity: "Define your top three personal values and map how your current goals align (or don't).",
    },
    {
      week: 8,
      title: "Resilience & Coping with Setbacks",
      topics: [
        "What resilience actually is (and is not)",
        "Post-traumatic growth and adversity",
        "Building a personal coping repertoire",
        "When to seek professional help vs. self-help",
      ],
      activity: "Identify a past setback and write out what strengths you used to get through it.",
    },
    {
      week: 9,
      title: "Integration & Life Beyond the Programme",
      topics: [
        "Reviewing personal growth over 9 weeks",
        "Building a sustainable mental health maintenance plan",
        "Red flags to watch for and how to act on them",
        "Resources available at KNUST and beyond",
      ],
      activity: "Create your personalised 'Mental Health Maintenance Plan' with daily, weekly, and monthly practices.",
    },
  ],
};

type TemplateMode = "scratch" | "nine-week";

export default function CounsellorCreateProgramme() {
  const navigate = useNavigate();

  const [templateMode, setTemplateMode] = useState<TemplateMode>("nine-week");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  const [name, setName] = useState(NINE_WEEK_COURSE.name);
  const [description, setDescription] = useState(NINE_WEEK_COURSE.description);
  const [durationDays, setDurationDays] = useState(String(NINE_WEEK_COURSE.duration_days));
  const [checkinFrequency, setCheckinFrequency] = useState(NINE_WEEK_COURSE.checkin_frequency);
  const [audience, setAudience] = useState(NINE_WEEK_COURSE.audience);
  const [delivery, setDelivery] = useState(NINE_WEEK_COURSE.delivery);
  const [customNotes, setCustomNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const applyTemplate = (mode: TemplateMode) => {
    setTemplateMode(mode);
    if (mode === "nine-week") {
      setName(NINE_WEEK_COURSE.name);
      setDescription(NINE_WEEK_COURSE.description);
      setDurationDays(String(NINE_WEEK_COURSE.duration_days));
      setCheckinFrequency(NINE_WEEK_COURSE.checkin_frequency);
      setAudience(NINE_WEEK_COURSE.audience);
      setDelivery(NINE_WEEK_COURSE.delivery);
    } else {
      setName("");
      setDescription("");
      setDurationDays("14");
      setCheckinFrequency("Weekly");
      setAudience("All students");
      setDelivery("Counsellor-led");
    }
  };

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

    const fullDescription = customNotes.trim()
      ? `${description.trim()}\n\nCounsellor notes: ${customNotes.trim()}`
      : description.trim();

    const { error: insertError } = await supabase.from("programmes").insert({
      name: name.trim(),
      description: fullDescription,
      duration_days: parsedDuration,
      checkin_frequency: checkinFrequency,
    });

    if (insertError) {
      if (insertError.message.toLowerCase().includes("row-level security")) {
        setError(
          "Permission denied. Ask your Supabase admin to run supabase/fix_permissions.sql to grant counsellors programme-creation access."
        );
      } else {
        setError(insertError.message);
      }
      setIsSubmitting(false);
      return;
    }

    navigate("/counsellor/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/counsellor/dashboard"
          className="inline-flex items-center gap-2 text-[#006B3F] hover:text-[#004D2C] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE] mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#006B3F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#004D2C]">Create Programme</h1>
              <p className="text-sm text-gray-600">Choose a template or build your own course from scratch.</p>
            </div>
          </div>
        </div>

        {/* Template Selector */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#004D2C] mb-3">Start with a template</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 9-Week Template Card */}
            <button
              type="button"
              onClick={() => applyTemplate("nine-week")}
              className={`text-left rounded-xl border-2 p-5 transition-all ${
                templateMode === "nine-week"
                  ? "border-[#006B3F] bg-[#F0F9F4] shadow-md"
                  : "border-gray-200 bg-white hover:border-[#006B3F]/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#E8F5EE] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#006B3F]" />
                </div>
                {templateMode === "nine-week" && (
                  <CheckCircle2 className="w-5 h-5 text-[#006B3F] flex-shrink-0" />
                )}
              </div>
              <p className="font-bold text-[#004D2C] text-sm mb-1">9-Week Mental Health Journey</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                A structured, evidence-informed programme covering emotional awareness, stress, cognition, relationships,
                self-compassion, and resilience.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["9 weeks", "Weekly check-ins", "63 days"].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-[#E8F5EE] text-[#006B3F] text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </button>

            {/* Scratch Card */}
            <button
              type="button"
              onClick={() => applyTemplate("scratch")}
              className={`text-left rounded-xl border-2 p-5 transition-all ${
                templateMode === "scratch"
                  ? "border-[#006B3F] bg-[#F0F9F4] shadow-md"
                  : "border-gray-200 bg-white hover:border-[#006B3F]/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <PlusCircle className="w-4 h-4 text-gray-600" />
                </div>
                {templateMode === "scratch" && (
                  <CheckCircle2 className="w-5 h-5 text-[#006B3F] flex-shrink-0" />
                )}
              </div>
              <p className="font-bold text-[#004D2C] text-sm mb-1">Start from Scratch</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Build a fully custom programme with your own name, description, duration, and check-in schedule.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Custom", "Full control"].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* 9-Week Curriculum Preview */}
        {templateMode === "nine-week" && (
          <div className="bg-white rounded-xl shadow-md border border-[#E8F5EE] mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8F5EE] bg-[#F0F9F4]">
              <h2 className="font-bold text-[#004D2C]">Course Curriculum — 9 Weeks</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Review each week's topics. You can customise the programme name and notes below.
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {NINE_WEEK_COURSE.weeks.map((w) => (
                <div key={w.week}>
                  <button
                    type="button"
                    onClick={() => setExpandedWeek(expandedWeek === w.week ? null : w.week)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#006B3F] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{w.week}</span>
                      </div>
                      <span className="font-semibold text-[#004D2C] text-sm">{w.title}</span>
                    </div>
                    {expandedWeek === w.week ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedWeek === w.week && (
                    <div className="px-6 pb-5 bg-[#FAFFFE]">
                      <div className="ml-10">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Topics covered</p>
                        <ul className="space-y-1 mb-4">
                          {w.topics.map((topic) => (
                            <li key={topic} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#006B3F] mt-0.5 flex-shrink-0" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                        <div className="rounded-lg bg-[#E8F5EE] px-4 py-3">
                          <p className="text-xs font-semibold text-[#004D2C] mb-1">Weekly activity</p>
                          <p className="text-sm text-gray-700">{w.activity}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8F5EE]">
          <h2 className="font-bold text-[#004D2C] mb-5">
            {templateMode === "nine-week" ? "Customise & Save" : "Programme Details"}
          </h2>

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
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 9-Week Mental Health Journey"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#004D2C] mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  onChange={(e) => setDurationDays(e.target.value)}
                  required
                />
                {templateMode === "nine-week" && (
                  <p className="text-xs text-gray-500 mt-1">63 days = 9 weeks</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#004D2C] mb-2">Check-in Frequency</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={checkinFrequency}
                  onChange={(e) => setCheckinFrequency(e.target.value)}
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#004D2C] mb-2">Target Audience</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#004D2C] mb-2">Delivery Format</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                >
                  {DELIVERY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#004D2C] mb-2">
                Counsellor Notes <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <Textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Add any specific instructions, modifications, or context for this programme instance…"
                className="min-h-20"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" className="bg-[#006B3F] hover:bg-[#004D2C] text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSubmitting ? "Creating..." : "Create Programme"}
              </Button>
              <Link to="/counsellor/dashboard">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
