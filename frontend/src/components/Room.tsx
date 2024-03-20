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
    const configuration = {
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                ],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection>(
        new RTCPeerConnection(configuration)
    );
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection>(
        new RTCPeerConnection(configuration)
    );
    const [remoteVideoTrack, setRemoteVideoTrack] =
        useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] =
        useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] =
        useState<MediaStream | null>(new MediaStream());
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = io(URL);

        socket.on("send-offer", async ({ roomId }) => {
            console.log("sending offer");

            sendingPc.onicegatheringstatechange = async (e) => {
                console.log(
                    "iceGatheringStateChange",
                    //@ts-expect-error "s"
                    e.target.iceGatheringState
                );
            };

            sendingPc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    console.log(
                        "e.candidate aka ice candidate is empty while sending-offer"
                    );
                }
                if (e.candidate) {
                    console.log("receiving ice candidate locally");
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        roomId,
                    });
                }
            };

            if (localVideoTrack) {
                sendingPc.addTrack(localVideoTrack);
            }
            if (localAudioTrack) {
                sendingPc.addTrack(localAudioTrack);
            }

            setLobby(false);

            sendingPc.ontrack = async (e) => {
                console.log(
                    "onTrack send-offer, tracks",
                    e.transceiver.receiver.track
                );
            };

            sendingPc.onnegotiationneeded = async () => {
                console.log("onnegotiationneeded, inside send-offer triggered");
                const sdp = await sendingPc.createOffer();

                await sendingPc.setLocalDescription(sdp);

                socket.emit("offer", {
                    sdp,
                    roomId,
                });
            };
        });

        socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
            console.log("received offer");

            setLobby(false);

            receivingPc.ontrack = (e) => {
                console.log("inside offer phase onTrack");
                if (remoteVideoRef.current) {
                    console.log("transceiver inside onTrack");
                    const track = e.transceiver.receiver.track;
                    console.log("track:", track);
                    remoteMediaStream?.addTrack(track);
                    remoteVideoRef.current.srcObject = remoteMediaStream;
                }
            };

            await receivingPc.setRemoteDescription(
                new RTCSessionDescription(remoteSdp)
            );

            receivingPc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    console.log(
                        "onicecandidate's e.candidate during offer phase is empty"
                    );
                    return;
                }
                if (e.candidate) {
                    console.log("on-ice-candidate on receiving side");
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId,
                    });
                }
            };

            receivingPc.onnegotiationneeded = async () => {
                console.log("inside offer phase onnegotiationneeded");

                const sdp = await receivingPc.createAnswer();

                await receivingPc.setLocalDescription(sdp);

                socket.emit("answer", {
                    roomId,
                    sdp,
                });
            };
        });

        socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
            console.log("on socket answer entered");

            setLobby(false);

            setSendingPc((pc) => {
                pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
                return pc;
            });

            console.log("loop closed");
        });

        socket.on("lobby", () => {
            console.log("on lobby entered");
            setLobby(true);
        });

        socket.on("add-ice-candidate", ({ candidate, type }) => {
            console.log("add-ice-candidate triggered");

            console.log({ candidate, type });

            if (type == "sender") {
                setReceivingPc((pc) => {
                    if (!pc) {
                        console.error("receicng pc nout found");
                    } else {
                        console.error(pc.ontrack);
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            } else {
                setSendingPc((pc) => {
                    if (!pc) {
                        console.error("sending pc nout found");
                    } else {
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            }
        });

        setSocket(socket);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localVideoRef]);

    return (
        <div className="flex min-h-dvh w-full justify-center items-center gap-6">
            Hi {name}
            <video
                autoPlay
                width={400}
                height={400}
                ref={localVideoRef}
            />
            {lobby ? "Waiting to connect you to someone" : null}
            <video
                autoPlay
                width={400}
                height={400}
                ref={remoteVideoRef}
            />
        </div>
    );
};
