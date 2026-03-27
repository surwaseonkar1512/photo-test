import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const { 
    register: registerForgot, 
    handleSubmit: handleForgotSubmit, 
    formState: { errors: forgotErrors } 
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (data) => {
    try {
      setIsLoading(true);
      await api.post('/auth/forgotpassword', data);
      toast.success('Password reset email sent (if account exists).');
      setIsForgotPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border shadow-lg rounded-2xl overflow-hidden relative min-h-[400px]"
      >
        <div className="bg-primary/5 p-8 flex flex-col items-center border-b">
          <div className="h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4">
            <Camera className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-serif font-semibold text-center tracking-tight">
            Studio Dashboard
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Secure admin access portal
          </p>
        </div>

        <div className="p-8 relative">
          <AnimatePresence mode="wait">
            {!isForgotPassword ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-4"
              >
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@example.com"
                  error={errors.email?.message}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                <Input
                  label="Password"
                  type="password"
                  error={errors.password?.message}
                  {...register('password', { required: 'Password is required' })}
                />
                
                <div className="flex items-center justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                  Sign in
                </Button>
              </motion.form>
            ) : (
              <motion.form 
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleForgotSubmit(onForgotSubmit)} 
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@example.com"
                  error={forgotErrors.email?.message}
                  {...registerForgot('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />

                <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                  Send Reset Link
                </Button>
                
                <div className="mt-4 text-center">
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    &larr; Back to login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
