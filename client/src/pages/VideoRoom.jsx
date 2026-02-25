import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MonitorUp } from 'lucide-react';

const SOCKET_SERVER_URL = "http://localhost:3001";

export default function VideoRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [peers, setPeers] = useState([]);
    const [stream, setStream] = useState();
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);

    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);

    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            setStream(currentStream);
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }

            socketRef.current.emit("join-room", roomId, socketRef.current.id);

            socketRef.current.on("user-connected", (userId) => {
                console.log("New user connected", userId);
                const peer = createPeer(userId, socketRef.current.id, currentStream);
                peersRef.current.push({
                    peerID: userId,
                    peer,
                });
                setPeers([...peersRef.current]);
            });

            socketRef.current.on("receive-call", (payload) => {
                const peer = addPeer(payload.signal, payload.from, currentStream);
                peersRef.current.push({
                    peerID: payload.from,
                    peer,
                });
                setPeers([...peersRef.current]);
            });

            socketRef.current.on("call-accepted", (signal) => {
                const item = peersRef.current.find((p) => p.peerID === signal.id);
                if (item && item.peer) {
                    // We normally signal back, handled by simple-peer internals if hooked up correctly
                }
            });

            socketRef.current.on("user-disconnected", userId => {
                const peerObj = peersRef.current.find(p => p.peerID === userId);
                if (peerObj) {
                    peerObj.peer.destroy();
                }
                const updatedPeers = peersRef.current.filter(p => p.peerID !== userId);
                peersRef.current = updatedPeers;
                setPeers(updatedPeers);
            });
        }).catch(err => {
            console.error("Failed to get local stream", err);
        });

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            socketRef.current.disconnect();
        };
    }, [roomId]);

    function createPeer(userToCall, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("call-user", {
                userToCall,
                callerID,
                signalData: signal,
            });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("answer-call", { signal, to: callerID });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsVideoMuted(!stream.getVideoTracks()[0].enabled);
        }
    };

    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsAudioMuted(!stream.getAudioTracks()[0].enabled);
        }
    };

    const leaveRoom = () => {
        navigate("/");
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem-20rem)] flex flex-col items-center justify-center p-6 bg-slate-950">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-900/10 rounded-full blur-[100px] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <h2 className="text-xl font-bold font-mono text-slate-200">Room: {roomId}</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Secure P2P WebRTC Connection active</p>
                </div>

                {/* Video Grid */}
                <div className={`grid gap-4 flex-grow ${peers.length > 0 ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl mx-auto w-full'}`}>
                    <motion.div
                        layoutId="local-video"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-xl shadow-black/50 aspect-video group"
                    >
                        <video
                            autoPlay
                            muted
                            ref={userVideo}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoMuted ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {isVideoMuted && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-400">You</span>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-2 rounded-lg backdrop-blur-sm">
                            <span className="text-white text-sm font-medium">You</span>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {peers.map((peerObj, index) => {
                            return (
                                <PeerVideo key={peerObj.peerID} peer={peerObj.peer} id={peerObj.peerID} />
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl"
                >
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-xl flex items-center justify-center transition-all ${isAudioMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                    >
                        {isAudioMuted ? <MicOff /> : <Mic />}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-xl flex items-center justify-center transition-all ${isVideoMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                    >
                        {isVideoMuted ? <VideoOff /> : <VideoIcon />}
                    </button>
                    <button className="p-4 rounded-xl flex items-center justify-center bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all">
                        <MonitorUp className="text-blue-400" />
                    </button>
                    <div className="w-px h-10 bg-slate-700 mx-2" />
                    <button
                        onClick={leaveRoom}
                        className="px-6 py-4 rounded-xl flex items-center justify-center bg-red-600 text-white hover:bg-red-500 transition-all font-semibold gap-2 shadow-lg shadow-red-600/20"
                    >
                        <PhoneOff className="w-5 h-5" />
                        Leave Session
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

const PeerVideo = ({ peer, id }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="relative bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-xl shadow-black/50 aspect-video group"
        >
            <video playsInline autoPlay ref={ref} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-2 rounded-lg backdrop-blur-sm">
                <span className="text-white text-sm font-medium">Peer {id.substring(0, 4)}</span>
            </div>
        </motion.div>
    );
}
