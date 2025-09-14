import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../src/hooks/useAuth';
import { LoginCredentials } from '../src/types/auth';

const { Title, Text } = Typography;

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { isLoading, error, clearError } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (values: LoginCredentials) => {
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
        
        onLoginSuccess?.();
      }, 1000);
      
    } catch (error: any) {
      setLoginError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Row justify="center" align="middle" className="w-full min-h-screen">
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card className="shadow-xl border-0 rounded-lg">
            <div className="text-center mb-8">
              <Title level={2} className="mb-2">Credit Scoring System</Title>
              <Text type="secondary" className="text-lg">
                Sign in to your account
              </Text>
            </div>

            {(error || loginError) && (
              <Alert
                message="Login Failed"
                description={error || loginError}
                type="error"
                showIcon
                closable
                onClose={() => {
                  setLoginError(null);
                  clearError();
                }}
                className="mb-6"
              />
            )}

            <Form
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please input your username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Enter your username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter your password"
                />
              </Form.Item>

              <Form.Item className="mb-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 text-lg font-medium"
                  loading={isLoading}
                >
                  Sign In
                </Button>
              </Form.Item>

              <div className="text-center">
                <Button
                  type="link"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Forgot your password?
                </Button>
              </div>
            </Form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Demo Credentials:</p>
                <p><strong>Username:</strong> admin | <strong>Password:</strong> password123</p>
                <p><strong>Username:</strong> analyst | <strong>Password:</strong> password123</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;