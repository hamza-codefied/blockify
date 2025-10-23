/* eslint-disable no-unused-vars */
import API from '@services/api.service'
import { LockOutlined } from '@ant-design/icons'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Divider, message, Image } from 'antd'

/* Components */
import maxprodigitizing from '@assets/maxprodigitizing'
import Loader from '@components/Global/Loader'
import { Body, Section, Div } from '@layout/export.layout'

const ResetPassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const hasNavigated = useRef(false)

    // Early validation to prevent rendering if state is invalid
    const isValidState = state && state.otp_verified && state.email

    useEffect(() => {
        console.log('ResetPassword useEffect ran', { state, isValidState, hasNavigated: hasNavigated.current })
        if (!isValidState) {
            if (!hasNavigated.current) {
                hasNavigated.current = true
                console.log('Navigating to /forgot-password due to invalid state')
                message.error('Seems like you have not requested a password reset', 5)
                setPageLoading(false)
                setTimeout(() => {
                    navigate('/forgot-password', { replace: true })
                }, 2000)
            }
            return
        }
        setTimeout(() => {
            setPageLoading(false)
        }, 2000)
    }, [isValidState, navigate])

    const handleSubmit = async (values) => {
        setLoading(true)
        try {
            console.log('Submitting password reset', { otp: state.otp, ...values })
            const res = await API.post('/auth/password-reset', { otp: state.otp, ...values })
            message.success(res.data?.message || 'Password reset successfully', 8)
            setTimeout(() => {
                console.log('Navigating to /login')
                navigate('/login')
            }, 1000)
        } catch (err) {
            console.error('Password reset error:', err)
            message.error(err?.response?.data?.error || err.message || 'Password reset failed', 5)
        } finally {
            setLoading(false)
        }
    } 

    if (!isValidState || pageLoading) {
        console.log('Rendering Loader', { isValidState, pageLoading })
        return <Loader text="Verifying OTP..." />
    }

    return (
        <Body>
            <Section className="min-h-screen py-4">
                <Div className="p-8 my-6 bg-white rounded-xl shadow-md w-full max-w-md relative">
                    <Div className="absolute -top-4 -right-4 bg-[#1677FF] text-white py-1 px-2 rounded-full text-sm shadow-2xl font-medium">
                        Reset Password
                    </Div>
                    <Div className="w-full flex items-center justify-center mb-8">
                        <Divider><Image src={maxprodigitizing} width={100} preview={false} alt="Logo" className="object-contain rounded-full" /></Divider>
                    </Div>
                    <Form name="reset" form={form} onFinish={handleSubmit} layout="vertical">
                        <Form.Item name="newPassword" rules={[{ required: true, message: 'Please input your new password!' }]}> 
                            <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                        </Form.Item>
                        <Form.Item name="confirmPassword" dependencies={["newPassword"]} 
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve()
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'))
                                    },
                                }),
                            ]}
                        > 
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>Reset Password</Button>
                        </Form.Item>
                    </Form>
                </Div>
            </Section>
        </Body>
    )
}

export default ResetPassword