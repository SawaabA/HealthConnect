import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function Chatbot({ context = 'patient' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: context === 'patient' 
                ? "Hi there! I'm your HealthConnect AI assistant. I can help answer questions about your records, upcoming appointments, or general health information. How can I help you today?"
                : "Hello Dr. I am your clinical AI assistant. I can help summarize patient history, find past lab results, or answer questions about the current patient context. How can I assist?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: input.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: getSimulatedResponse(userMsg.text, context),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const getSimulatedResponse = (query, ctx) => {
        const lowerQuery = query.toLowerCase();
        
        if (ctx === 'patient') {
            if (lowerQuery.includes('appointment')) return "You have an upcoming appointment with Dr. James Wright on April 12, 2026 at 2:00 PM for an annual checkup.";
            if (lowerQuery.includes('lab') || lowerQuery.includes('result')) return "Your most recent lab results from Nov 14, 2025 show your HbA1c at 6.8%, which your doctor marked as within the target range.";
            if (lowerQuery.includes('prescription') || lowerQuery.includes('medication')) return "Your active prescription is Metformin 500mg, taken twice daily. You have 2 refills remaining.";
            return "I'm sorry, I'm just a demo AI assistant. In a real setting, I'd analyze your specific medical records to answer that. Could you please bring this up with your doctor?";
        } else {
            if (lowerQuery.includes('sarah') || lowerQuery.includes('chen')) return "Sarah Chen is a 34yo female with Type 1 Diabetes. Her last HbA1c was 6.8%. She is currently taking Insulin and Metformin. Please note allergies to Penicillin and Sulfa drugs.";
            if (lowerQuery.includes('lab') || lowerQuery.includes('result')) return "Retrieving latest lab results for Sarah Chen: Comprehensive Metabolic Panel (11/14/2025) - Glucose: 110 mg/dL, HbA1c: 6.8%. Liver and kidney functions are within normal limits.";
            if (lowerQuery.includes('schedule') || lowerQuery.includes('today')) return "You have 14 patients scheduled for today. Your next appointment is Priya Sharma at 10:30 AM (Follow-up for Rheumatoid Arthritis).";
            return "I am currently limited to the demo context. In production, I would query the EMR database to provide specific clinical decision support.";
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
                        style={{ height: '500px', maxHeight: '80vh' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between text-white border-b border-green-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">HealthConnect AI</h3>
                                    <p className="text-green-100 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.type === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Bot size={16} className="text-green-700" />
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div 
                                            className={`px-4 py-2.5 rounded-2xl text-sm ${
                                                msg.type === 'user' 
                                                    ? 'bg-green-600 text-white rounded-tr-sm shadow-sm' 
                                                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
                                            }`}
                                        >
                                            <p className="leading-relaxed">{msg.text}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                                    </div>
                                    {msg.type === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3 justify-start"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot size={16} className="text-green-700" />
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="w-full bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 rounded-full pl-4 pr-12 py-3 transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-1.5 p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                                >
                                    <Send size={16} className="translate-x-[1px] translate-y-[1px]" />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-gray-400">AI can make mistakes. Verify important medical data.</span>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageSquare size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
