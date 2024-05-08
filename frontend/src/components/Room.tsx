import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack,
}: {
    name: string;
    localAudioTrack: MediaStreamTrack | null;
    localVideoTrack: MediaStreamTrack | null;
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
        <div className="h-dvh w-full flex">
            <div className="flex gap-1 w-full h-[60%]">
                <video
                    autoPlay
                    ref={localVideoRef}
                    className="flex-1 flex object-fill"
                />
                {lobby ? (
                    <div className="flex-1 flex justify-center items-center">
                        <p>Waiting to connect you to someone</p>
                    </div>
                ) : (
                    <video
                        autoPlay
                        ref={remoteVideoRef}
                        className="flex-1 flex object-fill"
                    />
                )}
            </div>
        </div>
    );
};
