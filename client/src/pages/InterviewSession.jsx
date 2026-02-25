import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, AlertTriangle, ShieldAlert, CheckCircle, Mic, MicOff, Video, FileText, Clock, StopCircle } from 'lucide-react';

export default function InterviewSession() {
    const location = useLocation();
    const navigate = useNavigate();
    const { job, resume } = location.state || {};

    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Timer state (10 mins = 600 seconds)
    const [timeLeft, setTimeLeft] = useState(600);

    // Video & Audio state
    const [isListening, setIsListening] = useState(false);
    const videoRef = useRef(null);
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!job || !resume) {
            navigate('/jobs');
        } else {
            startInterview();
            setupMedia();
            setupSpeechRecognition();
        }

        return () => {
            window.speechSynthesis.cancel();
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    // Timer Countdown Logic
    useEffect(() => {
        if (interviewComplete || timeLeft <= 0) return;
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);

        if (timeLeft === 0) {
            handleEndInterview("Time is up. Concluding the interview now...");
        }

        return () => clearInterval(timerId);
    }, [timeLeft, interviewComplete]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const setupMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied or unavailable", err);
        }
    };

    const setupSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                handleSendVoice(transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech recognition not supported in this browser.");
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // Anti-Cheat System: Detect Tab Switching
    useEffect(() => {
        if (interviewComplete) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarnings(prev => {
                    const newWarnings = prev + 1;
                    if (newWarnings >= 3) {
                        setMessages(m => [...m, { role: 'system', content: 'INTERVIEW TERMINATED due to repeated tab switching violations.' }]);
                        setInterviewComplete(true);
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Interview terminated due to repeated violations."));
                    } else {
                        setShowAlert(true);
                        setTimeout(() => setShowAlert(false), 5000);
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Warning. Please remain on the interview page."));
                    }
                    return newWarnings;
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [interviewComplete]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const speakText = (text, onEndCallback = null) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))) || voices.find(v => v.lang.includes('en'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0;

        if (onEndCallback) {
            utterance.onend = () => {
                onEndCallback();
            };
        }

        window.speechSynthesis.speak(utterance);
    };

    // We only attach the voiceschanged listener once to guarantee accurate TTS when voices load
    useEffect(() => {
        const handleVoicesChanged = () => {
            // pre-loads the voices
            window.speechSynthesis.getVoices();
        };
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        return () => { window.speechSynthesis.onvoiceschanged = null; }
    }, []);

    const generateAIResponse = async (history) => {
        setIsTyping(true);
        try {
            const res = await axios.post('/api/interview/generate', {
                resume,
                jobRole: job.title,
                jobRequirements: job.requirements,
                previousMessages: history
            });

            const aiResponse = res.data.text;
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

            const isConcluding = aiResponse.toLowerCase().includes('conclude') || aiResponse.toLowerCase().includes('good luck') || history.length > 15;
            if (isConcluding && !interviewComplete) {
                await handleEndInterview(aiResponse);
                return;
            }

            speakText(aiResponse, () => {
                if (!isConcluding) {
                    try {
                        recognitionRef.current?.start();
                        setIsListening(true);
                    } catch (e) {
                        console.error('Recognition start error', e);
                    }
                }
            });

        } catch (err) {
            console.error(err);
            const errMsg = 'Connection to AJ Assistant lost. Please refresh.';
            setMessages(prev => [...prev, { role: 'ai', content: errMsg }]);
            speakText(errMsg);
        } finally {
            setIsTyping(false);
        }
    };

    const startInterview = async () => {
        const introMsg = `AJ Assistant is analyzing your resume for the ${job.title} role...`;
        setMessages([{ role: 'system', content: introMsg }]);
        await generateAIResponse([]);
    };

    const handleEndInterview = async (finalMessage = "Concluding interview. Thank you for your time.") => {
        setInterviewComplete(true);
        setIsTyping(false);
        setIsListening(false);
        recognitionRef.current?.stop();
        window.speechSynthesis.cancel();

        // Add final concluding message to screen and speak it
        setMessages(prev => [...prev, { role: 'ai', content: finalMessage }]);
        speakText(finalMessage);

        // Send transcript to backend to generate HR performance review
        setIsEvaluating(true);
        try {
            // Wait a moment for speech to finish roughly
            await new Promise(resolve => setTimeout(resolve, 3000));

            await axios.post('/api/interview/evaluate', {
                jobId: job._id,
                transcript: messages
            });

            setMessages(prev => [...prev, { role: 'system', content: 'Evaluation Complete. HR has received your performance review. You may now close this page.' }]);
        } catch (err) {
            console.error("Evaluation failed", err);
            setMessages(prev => [...prev, { role: 'system', content: 'Error saving performance review.' }]);
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleSendVoice = async (transcript) => {
        if (!transcript.trim() || interviewComplete) return;

        const newMsg = { role: 'user', content: transcript };
        const updatedHistory = [...messages, newMsg];

        setMessages(updatedHistory);
        await generateAIResponse(updatedHistory);
    };

    if (!job) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
            {/* Header Info & Warnings */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">AJ Assistant Video Interview</h1>
                        <p className="text-sm text-slate-400">Position: {job.title} at {job.company}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
                        <Clock className={`w-4 h-4 ${timeLeft < 180 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`} />
                        <span className={`text-sm font-bold tracking-widest ${timeLeft < 180 ? 'text-red-400' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 hidden md:flex">
                        <ShieldAlert className={`w-5 h-5 ${warnings > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                        <span className="text-sm font-medium text-slate-300">
                            Violations: <span className={warnings > 0 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>{warnings} / 3</span>
                        </span>
                    </div>

                    {!interviewComplete ? (
                        <button
                            onClick={() => handleEndInterview("You have manually concluded the interview. Thank you.")}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20"
                        >
                            <StopCircle className="w-4 h-4" /> End Interview
                        </button>
                    ) : (
                        <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            {isEvaluating ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                                    Evaluating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" /> Completed
                                </>
                            )}
                        </span>
                    )}
                </div>
            </div>

            {/* Anti-Cheat Alert Modal */}
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-red-400"
                    >
                        <AlertTriangle className="w-8 h-8 animate-pulse" />
                        <div>
                            <h3 className="font-bold text-lg">WARNING: Tab Switching Detected</h3>
                            <p className="text-sm text-red-100">Please remain on this page during the interview.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Call & Captions Layout */}
            <div className="flex-grow flex flex-col lg:flex-row gap-6 h-full min-h-0">
                {/* Left: Video Area */}
                <div className="lg:w-2/3 h-full flex flex-col rounded-3xl overflow-hidden relative bg-slate-950 border border-slate-800 shadow-2xl">

                    {/* The AI Avatar / Visualization (Main Focus) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-slate-900 z-0">
                        <motion.div
                            animate={{ scale: isTyping ? [1, 1.1, 1] : 1 }}
                            transition={{ repeat: isTyping ? Infinity : 0, duration: 2 }}
                            className="w-48 h-48 rounded-full bg-indigo-600/20 flex flex-col items-center justify-center border-4 border-indigo-500/30 shadow-[0_0_100px_rgba(79,70,229,0.2)]"
                        >
                            <Brain className={`w-20 h-20 ${isTyping ? 'text-indigo-400' : 'text-slate-500'}`} />
                            <span className="mt-4 text-sm font-bold tracking-widest text-indigo-300 uppercase">AJ Assistant</span>
                        </motion.div>
                    </div>

                    {/* Local Feed (Bottom Right) */}
                    <div className="absolute bottom-6 right-6 w-48 h-64 bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-lg z-10">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        <div className="absolute bottom-2 left-2 flex gap-2">
                            <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-white flex items-center gap-1">
                                <Video className="w-3 h-3" /> You
                            </div>
                        </div>
                    </div>

                    {/* Real-time Voice Record Button (Center Bottom) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                        <button
                            onClick={toggleListening}
                            disabled={interviewComplete || isTyping}
                            className={`flex flex-col items-center justify-center w-20 h-20 rounded-full transition-all shadow-2xl ${isListening
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse border-4 border-red-300'
                                : 'bg-blue-600 hover:bg-blue-500 border-4 border-slate-800 disabled:opacity-50 disabled:bg-slate-700'
                                }`}
                        >
                            {isListening ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-white" />}
                        </button>
                        <div className="text-center mt-3 text-sm font-bold text-white drop-shadow-md">
                            {isListening ? 'Listening... Click to Stop' : 'Click to Speak'}
                        </div>
                    </div>
                </div>

                {/* Right: Live Transcript / Captions */}
                <div className="lg:w-1/3 h-full flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur z-10">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" /> Live Captions
                        </h2>
                    </div>

                    <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                {msg.role === 'system' ? (
                                    <div className="w-full text-center py-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        {msg.content}
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-xs font-semibold text-slate-500 mb-1 px-1">
                                            {msg.role === 'user' ? 'You' : 'AJ Assistant'}
                                        </span>
                                        <div className={`rounded-xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm shadow-md'
                                            : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700 shadow-md whitespace-pre-line'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <span className="text-xs font-semibold text-slate-500 mb-1 px-1">AJ Assistant</span>
                                <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex gap-2">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}
