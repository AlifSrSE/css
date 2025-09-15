import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../src/hooks/useAuth';
const { Title, Text } = Typography;
const Login = ({ onLoginSuccess }) => {
    const { isLoading, error, clearError } = useAuth();
    const [loginError, setLoginError] = useState(null);
    const handleLogin = async (values) => {
        try {
            setLoginError(null);
            clearError();
            // Simulate API call - replace with actual login logic
            console.log('Login attempt:', values);
            // Mock successful login for demo
            setTimeout(() => {
                localStorage.setItem('auth_token', 'mock-token');
                localStorage.setItem('user_data', JSON.stringify({
                    id: '1',
                    username: values.username,
                    email: `${values.username}@example.com`,
                    first_name: 'John',
                    last_name: 'Doe',
                    role: 'analyst'
                }));
                onLoginSuccess === null || onLoginSuccess === void 0 ? void 0 : onLoginSuccess();
            }, 1000);
        }
        catch (error) {
            setLoginError(error.message || 'Login failed. Please try again.');
        }
    };
    const handleForgotPassword = () => {
        console.log('Forgot password clicked');
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4", children: _jsx(Row, { justify: "center", align: "middle", className: "w-full min-h-screen", children: _jsx(Col, { xs: 24, sm: 20, md: 16, lg: 12, xl: 8, children: _jsxs(Card, { className: "shadow-xl border-0 rounded-lg", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx(Title, { level: 2, className: "mb-2", children: "Credit Scoring System" }), _jsx(Text, { type: "secondary", className: "text-lg", children: "Sign in to your account" })] }), (error || loginError) && (_jsx(Alert, { message: "Login Failed", description: error || loginError, type: "error", showIcon: true, closable: true, onClose: () => {
                                setLoginError(null);
                                clearError();
                            }, className: "mb-6" })), _jsxs(Form, { name: "login", onFinish: handleLogin, layout: "vertical", size: "large", children: [_jsx(Form.Item, { name: "username", label: "Username", rules: [
                                        { required: true, message: 'Please input your username!' },
                                        { min: 3, message: 'Username must be at least 3 characters!' }
                                    ], children: _jsx(Input, { prefix: _jsx(UserOutlined, { className: "text-gray-400" }), placeholder: "Enter your username" }) }), _jsx(Form.Item, { name: "password", label: "Password", rules: [
                                        { required: true, message: 'Please input your password!' },
                                        { min: 6, message: 'Password must be at least 6 characters!' }
                                    ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "text-gray-400" }), placeholder: "Enter your password" }) }), _jsx(Form.Item, { className: "mb-6", children: _jsx(Button, { type: "primary", htmlType: "submit", className: "w-full h-12 text-lg font-medium", loading: isLoading, children: "Sign In" }) }), _jsx("div", { className: "text-center", children: _jsx(Button, { type: "link", onClick: handleForgotPassword, className: "text-blue-600 hover:text-blue-700", children: "Forgot your password?" }) })] }), _jsx("div", { className: "mt-8 pt-6 border-t border-gray-200", children: _jsxs("div", { className: "text-center text-sm text-gray-600", children: [_jsx("p", { className: "mb-2", children: "Demo Credentials:" }), _jsxs("p", { children: [_jsx("strong", { children: "Username:" }), " admin | ", _jsx("strong", { children: "Password:" }), " password123"] }), _jsxs("p", { children: [_jsx("strong", { children: "Username:" }), " analyst | ", _jsx("strong", { children: "Password:" }), " password123"] })] }) })] }) }) }) }));
};
export default Login;
