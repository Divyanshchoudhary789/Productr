import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../environment.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [error, setError] = useState("");

    const [page, setPage] = useState("send-otp");

    const [otp, setOtp] = useState(new Array(6).fill(""));

    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const { checkAuth } = useAuth();


    useEffect(() => {
        if (
            page === "verify-otp"
        ) {
            inputRefs.current[0]?.focus();
        }
    }, [page]);



    useEffect(() => {

        if (page !== "verify-otp") return;

        if (timer === 0) {
            setCanResend(true);
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);

    }, [timer, page]);


    const startTimer = () => {
        setTimer(30);
        setCanResend(false);
    };

    const handleSignup = async () => {
        try {

            if (!name.trim() || !email.trim() || !mobileNumber.trim()) {
                setError("All Fields are required!");
                return;
            }

            setLoading(true);

            const res = await api.post("/signup/send-otp", {
                name: name,
                email: email,
                mobileNumber: mobileNumber
            });

            setError("");
            setPage("verify-otp");
            startTimer();

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }


    const handleOtpVerification = async () => {
        try {

            const otpValue = otp.join("");

            if (otpValue.length !== 6) {
                setError("Please Enter Complete OTP");
                return;
            }

            setOtpLoading(true);

            const res = await api.post("/signup/verify-otp", {
                email: email,
                otp: otpValue
            });

            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }

            await checkAuth();

            setOtp(new Array(6).fill(""));
            setError("");
            navigate("/");

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setOtpLoading(false);
        }
    }


    const handleResendOtp = async () => {
        try {

            setResendLoading(true);

            await api.post("/signup/send-otp", {
                name: name,
                email: email,
                mobileNumber: mobileNumber
            });

            setOtp(new Array(6).fill(""));

            inputRefs.current[0]?.focus();

            startTimer();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to resend OTP"
            );
        } finally {
            setResendLoading(false);
        }
    };

    const handleChange = (element, index) => {

        setError("");
        // Structural guard ensuring only mathematical digits pass through execution
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Shifts browser input cursor focus to the next box upon digit capture
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Shifts browser input cursor focus backwards to preceding box when backspacing an empty input slot
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl bg-white rounded-3xl overflow-hidden shadow-lg min-h-[90vh] flex flex-col md:flex-row">

                <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
                    <img
                        src="/hero-image.png"
                        alt="hero-image"
                        className="max-h-[85vh] object-contain"
                    />
                </div>

                <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-10">
                    {page === "send-otp" ? (
                        <div className="flex flex-col items-center pt-5 ">
                            <div className="my-5">
                                <img src="/logo.png" alt="logo-image" />
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold text-blue-950 text-center">
                                Create Account on Productr
                            </h1>

                            <div className="w-full max-w-md mt-10 flex flex-col gap-3">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-semibold text-blue-950"
                                >
                                    Name
                                </label>

                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Enter Your Name"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError("") }}
                                    className="w-full h-12 px-4 border rounded-lg bg-white outline-none"
                                />

                                <label
                                    htmlFor="email"
                                    className="text-sm font-semibold text-blue-950"
                                >
                                    Email
                                </label>

                                <input
                                    type="text"
                                    id="email"
                                    placeholder="Enter Your Email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                                    className="w-full h-12 px-4 border rounded-lg bg-white outline-none"
                                />

                                <label
                                    htmlFor="mobilenumber"
                                    className="text-sm font-semibold text-blue-950"
                                >
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    id="mobileNumber"
                                    placeholder="Enter Your Phone Number"
                                    value={mobileNumber}
                                    onChange={(e) => { setMobileNumber(e.target.value); setError("") }}
                                    className="w-full h-12 px-4 border rounded-lg bg-white outline-none"
                                />

                                {error.length > 0 ? <h2 className="text-red-500 text-sm">
                                    {error}
                                </h2> : null}
                                <button className="w-full h-12 rounded-lg bg-blue-900 text-white font-medium hover:bg-blue-800 transition-all"
                                    onClick={handleSignup}
                                    disabled={loading}
                                >
                                    {loading ? "Sending OTP..." : "Signup"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center pt-8 md:pt-16">
                            <div className="my-5">
                                <img src="/logo.png" alt="logo-image" />
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold text-blue-950 text-center">
                                Signup on Productr
                            </h1>

                            <div className="w-full max-w-md mt-10 flex flex-col gap-3">
                                <label
                                    htmlFor="otp"
                                    className="text-sm font-semibold text-blue-950"
                                >
                                    Enter OTP
                                </label>

                                <div className="flex flex-col items-center justify-center p-2 ">

                                    {/* Segmented OTP Matrix Row Grid Layout */}
                                    <div className="flex gap-3 sm:gap-4 justify-center items-center">
                                        {otp.map((data, index) => {
                                            return (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    name="otp-box"
                                                    maxLength="1"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={data}
                                                    ref={(el) => (inputRefs.current[index] = el)}
                                                    onChange={(e) => handleChange(e.target, index)}
                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                    // Dynamic conditional formatting explicitly matching stylistic states in image_48c105.png
                                                    className={`w-10 h-10 sm:w-14 sm:h-14 text-center text-xl font-semibold rounded-2xl border-2 bg-white transition-all outline-none text-[#2d3748]
                                                    ${data
                                                            ? 'border-[#9199cf] shadow-[0_0_0_1px_#9199cf]' // Highlighting filled text container state (matching '1')
                                                            : 'border-gray-200 focus:border-[#9199cf] focus:shadow-[0_0_0_1px_#9199cf]' // Passive neutral container state
                                                        }
                                                     `}
                                                />
                                            );
                                        })}
                                    </div>

                                </div>

                                {error.length > 0 ? <h2 className="text-red-500 text-sm">
                                    {error}
                                </h2> : null}
                                <button className="w-full h-12 rounded-lg bg-blue-900 text-white font-medium hover:bg-blue-800 transition-all"
                                    onClick={handleOtpVerification}
                                    disabled={otpLoading}
                                >
                                    {otpLoading ? "Verifying OTP..." : "Enter Your OTP"}
                                </button>
                                <div className="mt-4 text-center text-sm">

                                    <span className="text-gray-500">
                                        Didn't receive OTP?{" "}
                                    </span>

                                    {
                                        canResend ? (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={resendLoading}
                                                className="font-semibold text-blue-900 hover:underline cursor-pointer"
                                            >
                                                {resendLoading ? "Sending..." : "Resend"}
                                            </button>
                                        ) : (
                                            <span className="font-semibold text-blue-900">
                                                Resend in {timer}s
                                            </span>
                                        )
                                    }

                                </div>
                            </div>
                        </div>
                    )}

                    {page === "send-otp" ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="w-full max-w-md border-2 border-stone-300 rounded-2xl p-6 flex flex-col items-center gap-2">
                                <h2 className="text-stone-400 text-center">
                                    Already have an Account
                                </h2>

                                <Link to="/login">
                                    <h2 className="font-semibold text-blue-950 hover:underline">
                                        Login Here
                                    </h2>
                                </Link>
                            </div>
                        </div>
                    ) : null}


                </div>
            </div>
        </div>
    );
}