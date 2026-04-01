import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData.email, formData.password);
      navigate('/feed');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Awaiting Approval Message */}
        {message === 'awaiting-approval' && (
          <div className="bg-[#FFF7ED] border-l-4 border-[#FDB913] p-4 rounded mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#FDB913] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#004D2C]">Application Submitted</p>
                <p className="text-sm text-gray-700 mt-1">
                  Your counsellor account is under review. You'll receive an email once approved 
                  by KNUST's Counselling Unit (typically within 2-3 business days).
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-8 border border-[#E8F5EE]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#004D2C] mb-2">Welcome Back</h1>
            <p className="text-gray-600">Log in to MindSpace KNUST</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-[#006B3F] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white py-6"
            >
              Log In
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#006B3F] hover:underline font-semibold">
              Sign up
            </Link>
          </div>

          {/* Crisis Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">In crisis and need help now?</p>
            <Link
              to="/crisis"
              className="inline-block px-4 py-2 bg-[#DC2626] hover:bg-[#b91c1c] text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Access Crisis Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}