/* eslint-disable no-unused-vars */
import API from '@services/api.service'
import Countdown from 'react-countdown'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Typography, Divider, message, Image } from 'antd'

const { Text } = Typography

/* Components */
import maxprodigitizing from '@assets/maxprodigitizing'
import Loader from '@components/Global/Loader'
import { Body, Section, Div } from '@layout/export.layout'

const Otp = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [countdownTime, setCountdownTime] = useState(Date.now() + 120000)
    const hasNavigated = useRef(false)

    // Early validation to prevent rendering if state is invalid
    const isValidState = state && state.reset_password_request && state.reset_password_request_type && state.email

    useEffect(() => {
        console.log('Otp useEffect ran', { state, isValidState, hasNavigated: hasNavigated.current })
        if (!isValidState) {
            if (!hasNavigated.current) {
                hasNavigated.current = true
                console.log('Navigating to /forgot-password due to invalid state')
                message.error('Seems like you are not authorized to access this page', 6)
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
            console.log('Submitting OTP', values.otp)
            const res = await API.post('/auth/otp-token-verify', { otp: values.otp })
            message.success(res.data?.message || 'OTP verified successfully', 6)
            setTimeout(() => {
                navigate('/reset-password', { 
                    state: { 
                        otp_verified: true,
                        email: state.email,
                        otp: values.otp
                    },
                    search: `?otp_verified=true&email=${state.email}`
                })
            }, 1000)
        } catch (err) {
            console.error('OTP verification error:', err)
            message.error(err?.response?.data?.error || err.message || 'OTP verification failed', 6)
        } finally {
            setLoading(false)
        }
    } 

    const handleResend = async () => {
        setResendLoading(true)
        try {
            console.log('Resending OTP for email:', state.email)
            const res = await API.post('/auth/password-change-request', { email: state.email })
            message.success(res.data?.message || 'OTP sent successfully', 8)
            setCountdownTime(Date.now() + 120000)
        } catch (err) {
            console.error('Resend OTP error:', err)
            message.error(err?.response?.data?.error || err.message || 'Failed to resend OTP', 6)
        } finally {
            setResendLoading(false)
        }
    }

    const Completionist = () => (
        <Button 
            color="default"
            variant="filled"
            type="button"
            onClick={handleResend}
            loading={resendLoading}
            className="w-full"
        >
            Resend OTP
        </Button>
    )

    const renderer = ({ minutes, seconds, completed }) => {
        if (completed) {
            return <Completionist />
        } else {
            return (
                <Button 
                    color="default"
                    variant="filled"
                    type="button"
                    disabled
                    className="w-full"
                >{minutes}:{seconds < 10 ? `0${seconds}` : seconds} Resend OTP</Button>
            )
        }
    }

    if (!isValidState || pageLoading) {
        console.log('Rendering Loader', { isValidState, pageLoading })
        return <Loader text="Working on it..." />
    }

    return (
        <Body>
            <Section className="min-h-screen py-4">
                <Div className="p-8 my-6 bg-white rounded-xl shadow-md w-full max-w-md relative">
                    <Div className="absolute -top-4 -right-4 bg-[#1677FF] text-white py-1 px-2 rounded-full text-sm shadow-2xl font-medium">
                        OTP Verification
                    </Div>
                    <Div className="w-full flex items-center justify-center mb-8">
                        <Divider><Image src={maxprodigitizing} width={100} preview={false} alt="Logo" className="object-contain rounded-full" /></Divider>
                    </Div>
                    <Div className="w-full flex items-center justify-center mb-4">
                        <Text className="text-center mb-2">
                            Please enter the <span className="text-[#27b167] font-bold">OTP</span> that we just sent to your registered email.
                        </Text>
                    </Div>
                    <Form name="reset" onFinish={handleSubmit} layout="vertical">
                        <Form.Item className="w-full items-center justify-center" name="otp" rules={[{ required: true, message: 'Please input the OTP!' }]}> 
                            <Input.OTP 
                                size="large" 
                                className="w-full" 
                                formatter={str => str.toUpperCase()}
                                onChange={(value) => console.log('OTP input:', value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>Verify</Button>
                        </Form.Item>
                    </Form>
                    <Div className="text-center text-sm mt-4">
                        <Countdown 
                            date={countdownTime} 
                            renderer={renderer}
                            key={countdownTime}
                        />
                    </Div>
                </Div>
            </Section>
        </Body>
    )
}

export default Otp