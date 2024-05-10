import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import ActionButton from "./ActionButton";

const URL = "http://localhost:3000";

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack,
    location,
}: {
    name: string;
    localAudioTrack: MediaStreamTrack | null;
    localVideoTrack: MediaStreamTrack | null;
    location: string;
}) => {
    const [lobby, setLobby] = useState(true);
    const [_socket, setSocket] = useState<null | Socket>(null);
    const [_sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [_receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
        null
    );
    const [_remoteVideoTrack, setRemoteVideoTrack] =
        useState<MediaStreamTrack | null>(null);
    const [_remoteAudioTrack, setRemoteAudioTrack] =
        useState<MediaStreamTrack | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);

    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = io(URL);

        socket.on("send-offer", async ({ roomId }) => {
            console.log("sending offer");

            setLobby(false);

            const pc = new RTCPeerConnection();

            pc.onicecandidate = async (e) => {
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        roomId,
                    });
                }
            };

            pc.onnegotiationneeded = async () => {
                const sdp = await pc.createOffer();
                await pc.setLocalDescription(sdp);
                setSendingPc(pc);
                socket.emit("offer", {
                    sdp,
                    roomId,
                });
            };

            if (localVideoTrack) {
                pc.addTrack(localVideoTrack);
            }

            if (localAudioTrack) {
                pc.addTrack(localAudioTrack);
            }
        });

        socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
            console.log("received offer");

            setLobby(false);

            const pc = new RTCPeerConnection();

            pc.ontrack = (event: RTCTrackEvent) => {
                if (remoteVideoRef.current) {
                    if (event.type === "audio") {
                        setRemoteAudioTrack(event.track);
                    } else if (event.type === "video") {
                        setRemoteVideoTrack(event.track);
                    }
                    remoteVideoRef.current.srcObject = new MediaStream([
                        event.track,
                    ]);
                    remoteVideoRef.current.play();
                }
            };

            pc.onicecandidate = async (e) => {
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId,
                    });
                }
            };

            await pc.setRemoteDescription(remoteSdp);
            const sdp = await pc.createAnswer();
            await pc.setLocalDescription(sdp);

            setReceivingPc(pc);

            socket.emit("answer", {
                roomId,
                sdp: sdp,
            });
        });

        socket.on("answer", ({ sdp: remoteSdp }) => {
            setLobby(false);

            setSendingPc((pc) => {
                pc?.setRemoteDescription(remoteSdp);
                return pc;
            });
        });

        socket.on("lobby", () => {
            setLobby(true);
        });

        socket.on("add-ice-candidate", ({ candidate, type }) => {
            if (type == "sender") {
                setReceivingPc((pc) => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            } else {
                setSendingPc((pc) => {
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            }
        });

        setSocket(socket);
    }, [name]);

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([
                    localVideoTrack,
                ]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef]);

    return (
        <div className="h-[90dvh] w-full flex justify-center">
            <div className="flex gap-1 w-[96%]">
                <div className="flex-1 flex flex-col">
                    <video
                        autoPlay
                        ref={localVideoRef}
                        className="w-full object-fill h-[60%]"
                    />
                    <div className="h-full w-full flex justify-center items-center">
                        <div className="flex w-full h-[70%] px-4 items-center gap-4 justify-around">
                            <ActionButton
                                title={"Next"}
                                className="bg-[#50b58d] active:shadow-[0_5px_rgba(67,_169,_128,_0.8)] shadow-[0_9px_rgba(67,_169,_128,_1)]"
                            />
                            <ActionButton
                                title="stop"
                                className="bg-[#f2b29f] active:shadow-[0_5px_rgba(226,_95,_55,_1)] shadow-[0_9px_rgba(226,_95,_55,_0.8)]"
                            />
                            <ActionButton
                                title={`Country: ${location}`}
                                className="bg-white dark:bg-blue-700 active:shadow-[0_5px_rgba(30,_58,_138,_1)] shadow-[0_9px_rgba(30,_58,_138,_0.8)]"
                            />
                            <ActionButton
                                title={isMuted ? "unmute" : "mute"}
                                className="bg-white dark:bg-blue-700 active:shadow-[0_5px_rgba(30,_58,_138,_1)] shadow-[0_9px_rgba(30,_58,_138,_0.8)]"
                                onClick={() => {
                                    if (localAudioTrack) {
                                        localAudioTrack.enabled = !isMuted;
                                        setIsMuted((p) => !p);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                {lobby ? (
                    <div className="flex-1 flex justify-center items-center">
                        <p>Waiting to connect you to someone</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <video
                            autoPlay
                            ref={remoteVideoRef}
                            className="w-full object-fill h-[60%]"
                        />
                        <div className="w-full flex flex-col flex-grow shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] dark:shadow-[rgba(255,_255,_255,_0.24)_0px_3px_8px] rounded-b-lg">
                            <p className="flex-grow"></p>
                            <input
                                type="text"
                                placeholder={`Chat with user2`}
                                className="w-full border-t border-input p-2 bg-transparent outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
