import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, AlertTriangle, Shield, UserCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<'student' | 'counsellor'>(
    (searchParams.get('role') as 'student' | 'counsellor') || 'student'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [visibility, setVisibility] = useState<'anonymous' | 'pseudonym' | 'identified'>('anonymous');
  const [showIdentityWarning, setShowIdentityWarning] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    pseudonym: '',
    displayName: '',
    counsellorTitle: '',
    credentials: null as File | null
  });

  const handleVisibilityChange = (newVisibility: 'anonymous' | 'pseudonym' | 'identified') => {
    if (newVisibility === 'identified') {
      setShowIdentityWarning(true);
    } else {
      setVisibility(newVisibility);
    }
  };

  const confirmIdentityChoice = () => {
    setVisibility('identified');
    setShowIdentityWarning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        role,
        {
          visibility,
          pseudonym: formData.pseudonym,
          displayName: formData.displayName,
          counsellorTitle: formData.counsellorTitle,
          counsellorBio: formData.counsellorTitle
            ? `${formData.counsellorTitle} at KNUST Counselling Unit`
            : undefined,
        }
      );

        if (!result.signedIn) {
          navigate('/login?message=check-email');
          return;
        }

        if (role === 'student') {
        navigate('/feed');
      } else {
        // Counsellor would need approval
        navigate('/login?message=awaiting-approval');
      }
    } catch (error) {
      console.error('Registration error:', error);

      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';

      if (message.toLowerCase().includes('rate limit')) {
        alert('Supabase rate limited signup attempts. Wait a minute, then try again, or disable email confirmation in Supabase Auth for instant local signup.');
        return;
      }

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 border border-[#E8F5EE]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#004D2C] mb-2">Join MindSpace KNUST</h1>
            <p className="text-gray-600">Create your account to access support</p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'student'
                    ? 'border-[#006B3F] bg-[#E8F5EE]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UserCircle className={`w-8 h-8 mx-auto mb-2 ${role === 'student' ? 'text-[#006B3F]' : 'text-gray-400'}`} />
                <div className="font-semibold">I'm a Student</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('counsellor')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'counsellor'
                    ? 'border-[#FDB913] bg-[#FFF7ED]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Shield className={`w-8 h-8 mx-auto mb-2 ${role === 'counsellor' ? 'text-[#FDB913]' : 'text-gray-400'}`} />
                <div className="font-semibold">I'm a Counsellor</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@knust.edu.gh"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Student-specific fields */}
            {role === 'student' && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <Label className="text-base font-bold text-[#004D2C] mb-3 block">
                    Choose How You Appear
                  </Label>
                  <p className="text-sm text-gray-600 mb-4">Anonymous, Nickname, or Real Name.</p>
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      visibility === 'anonymous' ? 'border-[#006B3F] bg-[#E8F5EE]' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="anonymous"
                        checked={visibility === 'anonymous'}
                        onChange={() => setVisibility('anonymous')}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#006B3F]" />
                          Fully Anonymous (Recommended)
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Display as "Anonymous Student" with a generated avatar. Maximum privacy.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      visibility === 'pseudonym' ? 'border-[#006B3F] bg-[#E8F5EE]' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="pseudonym"
                        checked={visibility === 'pseudonym'}
                        onChange={() => setVisibility('pseudonym')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">Use a Pseudonym</div>
                        <p className="text-sm text-gray-600 mt-1 mb-2">
                          Create a nickname. Still anonymous but adds personality.
                        </p>
                        {visibility === 'pseudonym' && (
                          <Input
                            placeholder="e.g., HopefulTech23"
                            value={formData.pseudonym}
                            onChange={(e) => setFormData({ ...formData, pseudonym: e.target.value })}
                          />
                        )}
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      visibility === 'identified' ? 'border-[#FDB913] bg-[#FFF7ED]' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        value="identified"
                        checked={visibility === 'identified'}
                        onChange={() => handleVisibilityChange('identified')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#FDB913]" />
                          Use My Real Identity
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Other students will see your real name. Not recommended for sensitive topics.
                        </p>
                        {visibility === 'identified' && (
                          <Input
                            placeholder="Your full name"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Counsellor-specific fields */}
            {role === 'counsellor' && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="bg-[#FFF7ED] border-l-4 border-[#FDB913] p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>Counsellor accounts require verification.</strong> After submitting, 
                    your application will be reviewed by KNUST's Counselling Unit.
                  </p>
                </div>

                <div>
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Dr. Jane Mensah"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="counsellorTitle">Professional Title</Label>
                  <Input
                    id="counsellorTitle"
                    type="text"
                    placeholder="Licensed Clinical Psychologist"
                    value={formData.counsellorTitle}
                    onChange={(e) => setFormData({ ...formData, counsellorTitle: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="credentials">Upload Credentials</Label>
                  <Input
                    id="credentials"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.files?.[0] || null })}
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload license, certificate, or KNUST employment letter
                  </p>
                </div>
              </div>
            )}

            {/* Community Guidelines Agreement */}
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={agreedToGuidelines}
                  onCheckedChange={(checked) => setAgreedToGuidelines(checked as boolean)}
                  className="mt-1"
                />
                <div className="text-sm text-gray-700">
                  I have read and agree to the{' '}
                  <Link to="/guidelines" target="_blank" className="text-[#006B3F] hover:underline font-semibold">
                    Community Guidelines
                  </Link>
                  . I understand that respectful, safe interaction is required on this platform.
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!agreedToGuidelines || isSubmitting}
              className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white py-6"
            >
              {isSubmitting ? 'Submitting...' : role === 'student' ? 'Create Account' : 'Submit for Verification'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#006B3F] hover:underline font-semibold">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Identity Warning Dialog */}
      <Dialog open={showIdentityWarning} onOpenChange={setShowIdentityWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#DC2626]">
              <AlertTriangle className="w-6 h-6" />
              Important: Identity Visibility Warning
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-4">
              <p>
                <strong>Are you sure you want to use your real identity?</strong>
              </p>
              <p>
                When you choose to be identified, other students will be able to see your real name 
                on all posts and comments. This cannot be easily undone.
              </p>
              <p>
                <strong className="text-[#004D2C]">We strongly recommend staying anonymous</strong> when 
                discussing sensitive mental health topics to protect your privacy and reduce stigma.
              </p>
              <p className="text-sm text-gray-600">
                Note: Counsellors always see a unique student ID regardless of your choice, 
                so you'll still receive proper care.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowIdentityWarning(false);
                setVisibility('anonymous');
              }}
            >
              Keep Me Anonymous
            </Button>
            <Button
              onClick={confirmIdentityChoice}
              className="bg-[#FDB913] hover:bg-[#e5a710] text-[#004D2C]"
            >
              I Understand, Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}