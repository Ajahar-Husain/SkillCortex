import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, Code2, Server, Database, MonitorPlay, CheckCircle, XCircle, Award, Terminal } from 'lucide-react';

const TECH_STACKS = [
    { id: 'react', name: 'React.js', icon: MonitorPlay, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30' },
    { id: 'nextjs', name: 'Next.js', icon: MonitorPlay, color: 'text-slate-200', bg: 'bg-slate-200/10', border: 'border-slate-500/30' },
    { id: 'node', name: 'Node.js', icon: Server, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    { id: 'java', name: 'Java', icon: CoffeeIcon, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { id: 'php', name: 'PHP', icon: Server, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-500/30' },
    { id: 'python', name: 'Python', icon: Terminal, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/30' },
    { id: 'cpp', name: 'C++', icon: Code2, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/30' },
    { id: 'sql', name: 'SQL & Databases', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-500/30' },
];

function CoffeeIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
            <line x1="6" y1="2" x2="6" y2="4"></line>
            <line x1="10" y1="2" x2="10" y2="4"></line>
            <line x1="14" y1="2" x2="14" y2="4"></line>
        </svg>
    );
}

export default function QuizInterview() {
    const navigate = useNavigate();
    const [step, setStep] = useState('selection'); // selection, loading, quiz, result
    const [selectedStack, setSelectedStack] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    const handleSelectStack = async (stack) => {
        setSelectedStack(stack);
        setStep('loading');
        try {
            const res = await axios.post('/api/quiz/generate', { topic: stack.name });
            setQuestions(res.data.questions);
            setStep('quiz');
        } catch (err) {
            console.error("Failed to generate quiz", err);
            alert("Failed to connect to AJ Assistant to generate the quiz. Please try again.");
            setStep('selection');
        }
    };

    const handleAnswerSelect = (index) => {
        if (isAnswerRevealed) return;
        setSelectedAnswer(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        setIsAnswerRevealed(true);
        const currentQ = questions[currentQuestionIdx];
        if (selectedAnswer === currentQ.answerIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswerRevealed(false);
        } else {
            setStep('result');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">

            <AnimatePresence mode="wait">
                {step === 'selection' && (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full"
                    >
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl mb-6 shadow-lg shadow-indigo-500/20">
                                <Brain className="w-8 h-8" />
                            </div>
                            <h1 className="text-4xl font-extrabold text-white mb-4">Tech Stack Mock Interview</h1>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                Select a technology to begin. AJ Assistant will immediately generate 5 customized, rigorous multiple-choice questions to test your proficiency.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {TECH_STACKS.map(stack => (
                                <button
                                    key={stack.id}
                                    onClick={() => handleSelectStack(stack)}
                                    className={`group flex flex-col items-center justify-center p-6 bg-slate-800/50 border ${stack.border} rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 hover:shadow-xl hover:shadow-${stack.color.split('-')[1]}-500/10`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stack.bg} ${stack.color} group-hover:scale-110 transition-transform`}>
                                        <stack.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-slate-200 group-hover:text-white">{stack.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                            <Brain className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">AJ Assistant is drafting questions...</h2>
                            <p className="text-slate-400">Curating a specialized quiz for {selectedStack?.name}</p>
                        </div>
                    </motion.div>
                )}

                {step === 'quiz' && questions.length > 0 && (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-3xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedStack.bg} ${selectedStack.color}`}>
                                    <selectedStack.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedStack.name} Quiz</h2>
                                    <p className="text-sm text-slate-400">Question {currentQuestionIdx + 1} of {questions.length}</p>
                                </div>
                            </div>
                            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl mb-6">
                            <h3 className="text-lg md:text-xl text-white font-medium leading-relaxed mb-8">
                                {questions[currentQuestionIdx].question}
                            </h3>

                            <div className="space-y-3">
                                {questions[currentQuestionIdx].options.map((opt, idx) => {
                                    const isSelected = selectedAnswer === idx;
                                    const isCorrect = idx === questions[currentQuestionIdx].answerIndex;
                                    let btnStyle = "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300";

                                    if (isAnswerRevealed) {
                                        if (isCorrect) {
                                            btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                                        } else if (isSelected) {
                                            btnStyle = "bg-red-500/20 border-red-500 text-red-400";
                                        }
                                    } else if (isSelected) {
                                        btnStyle = "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={isAnswerRevealed}
                                            onClick={() => handleAnswerSelect(idx)}
                                            className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex justify-between items-center group ${btnStyle}`}
                                        >
                                            <span className="font-medium text-[15px]">{opt}</span>
                                            {isAnswerRevealed && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                            {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            {!isAnswerRevealed ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={selectedAnswer === null}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg"
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                                >
                                    {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {step === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
                            <Award className="w-12 h-12 text-white" />
                        </div>

                        <h2 className="text-3xl font-extrabold text-white mb-2">Quiz Completed!</h2>
                        <p className="text-slate-400 mb-8">You have completed the {selectedStack?.name} technical assessment.</p>

                        <div className="bg-slate-950 rounded-2xl p-6 mb-8 border border-slate-800">
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Final Score</div>
                            <div className="text-5xl font-black text-white flex items-center justify-center gap-2">
                                <span className={score === 5 ? 'text-emerald-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}>
                                    {score}
                                </span>
                                <span className="text-slate-600">/</span>
                                <span className="text-slate-500">5</span>
                            </div>
                            <div className="mt-4 text-emerald-400 font-bold flex items-center justify-center gap-1">
                                +{score * 50} Skill Points Earned!
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700"
                            >
                                Back to Profile
                            </button>
                            <button
                                onClick={() => setStep('selection')}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg"
                            >
                                Take Another
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
