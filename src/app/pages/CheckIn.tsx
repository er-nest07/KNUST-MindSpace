import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Send, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { type DbEnrolment, type DbProgramme } from "../lib/community";

export default function CheckIn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState<string[]>(['', '', '']);
  const [moodScore, setMoodScore] = useState(5);
  const [enrolment, setEnrolment] = useState<DbEnrolment | null>(null);
  const [programme, setProgramme] = useState<DbProgramme | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadCheckInContext = async () => {
      if (!id) return;

      const { data: enrolmentRow } = await supabase
        .from('enrolments')
        .select('*')
        .eq('id', id)
        .single<DbEnrolment>();

      if (!enrolmentRow) return;

      setEnrolment(enrolmentRow);

      const { data: programmeRow } = await supabase
        .from('programmes')
        .select('*')
        .eq('id', enrolmentRow.programme_id)
        .single<DbProgramme>();

      setProgramme(programmeRow ?? null);
    };

    loadCheckInContext();
  }, [id]);

  const questions = [
    "How are you feeling today? Tell me about your day.",
    "What challenges or successes have you experienced since your last check-in?",
    "On a scale of 1-10, how would you rate your current mood?"
  ];

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!enrolment || !user) {
        return;
      }

      setIsSaving(true);

      await supabase.from('checkins').insert({
        enrolment_id: enrolment.id,
        student_id: user.id,
        response_one: responses[0],
        response_two: responses[1],
        mood_score: moodScore,
      });

      await supabase
        .from('enrolments')
        .update({ progress: Math.min(enrolment.progress + 1, enrolment.total_days) })
        .eq('id', enrolment.id);

      setIsSaving(false);
      navigate('/programmes');
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link to="/programmes" className="inline-flex items-center gap-2 text-[#006B3F] hover:text-[#004D2C] mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Programmes</span>
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8 border border-[#E8F5EE]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#004D2C] mb-2">{programme?.name}</h1>
            <p className="text-gray-600">Check-in {enrolment?.progress} of {enrolment?.total_days}</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s <= step ? 'bg-[#006B3F]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Question */}
          {step <= 2 ? (
            <div className="space-y-6">
              <div className="bg-[#E8F5EE] rounded-lg p-6">
                <p className="text-[#004D2C] font-semibold mb-2">MindSpace AI</p>
                <p className="text-gray-700">{questions[step - 1]}</p>
              </div>

              <div>
                <Textarea
                  value={responses[step - 1]}
                  onChange={(e) => {
                    const newResponses = [...responses];
                    newResponses[step - 1] = e.target.value;
                    setResponses(newResponses);
                  }}
                  placeholder="Take your time, there's no rush..."
                  className="min-h-[150px]"
                />
              </div>

              <Button
                onClick={handleNext}
                disabled={!responses[step - 1].trim()}
                className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white"
              >
                Continue
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#E8F5EE] rounded-lg p-6">
                <p className="text-[#004D2C] font-semibold mb-2">MindSpace AI</p>
                <p className="text-gray-700">{questions[2]}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl">😢</span>
                  <span className="text-4xl font-bold text-[#006B3F]">{moodScore}</span>
                  <span className="text-2xl">😊</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006B3F]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Very Low</span>
                  <span>Moderate</span>
                  <span>Very High</span>
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={isSaving}
                className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white"
              >
                {isSaving ? 'Saving...' : 'Complete Check-In'}
                <Heart className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Your responses are shared with your counsellor to provide better support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
