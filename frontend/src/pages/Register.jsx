import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer',
        orgId: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setIsSubmitting(true);
        try {
            await register(formData);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg glass p-8 rounded-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/20 p-4 rounded-xl mb-4">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Create Account</h1>
                    <p className="text-text-secondary mt-2">Join VideoVault today</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 opacity-80">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2 opacity-80">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 opacity-80">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 opacity-80">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary transition-all"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 opacity-80">Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                            <select
                                name="role"
                                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary appearance-none transition-all"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2 opacity-80">Org Token (Optional)</label>
                        <div className="relative">
                            <input
                                name="orgId"
                                type="text"
                                className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary transition-all"
                                placeholder="ORG-123"
                                value={formData.orgId}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </button>
                    </div>
                </form>

                <p className="text-center mt-6 text-text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
