import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Room } from "./Room";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export const Landing: React.FC = (): JSX.Element => {
    const [name, setName] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);

    const [localAudioTrack, setLocalAudioTrack] =
        useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setlocalVideoTrack] =
        useState<MediaStreamTrack | null>(null);

    const [joined, setJoined] = useState(false);
    const { toast } = useToast();

    const getCam = async () => {
        try {
            const videoStream =
                await window.navigator.mediaDevices.getUserMedia({
                    video: true,
                });

            const videoTrack = videoStream.getVideoTracks()[0];
            setlocalVideoTrack(videoTrack);

            if (!videoRef.current) {
                return;
            }

            videoRef.current.srcObject = new MediaStream([videoTrack]);
            videoRef.current.play();

            try {
                const audioStream =
                    await window.navigator.mediaDevices.getUserMedia({
                        audio: true,
                    });
                const audioTrack = audioStream.getAudioTracks()[0];
                setLocalAudioTrack(audioTrack);
                videoRef.current.srcObject.addTrack(audioTrack);
            } catch (error) {
                console.error(error);
                toast({
                    title: "Mic not found!",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Uh oh! Something went wrong.",
                description:
                    "Camera not found! You need a camera to talk to strangers on Serendipity",
            });
        }
    };

    useEffect(() => {
        if (videoRef && videoRef.current) {
            getCam();
        }
    }, [videoRef]);

    const addUserToRoom = (e: FormEvent) => {
        e.preventDefault();
        setJoined(true);
    };

    if (!joined) {
        return (
            <div className="flex justify-center h-dvh w-full">
                <div className="flex flex-col items-center py-5 md:py-10 max-w-4xl">
                    <h1 className="text-4xl bg-clip-text mb-4 text-transparent pb-2 bg-gradient-to-b from-neutral-200 to-neutral-400 font-bold">
                        Talk to strangers
                    </h1>
                    <p className="text-sm font-medium mb-16 text-center">
                        One click, a world of possibilities. <br /> Meet new
                        people, find shared interests, and experience the joy of
                        spontaneous connection.
                    </p>
                    <p className="mb-2">Preview cam</p>
                    <video
                        autoPlay
                        className="rounded-lg mb-6 h-auto w-[500px]"
                        ref={videoRef}
                    />
                    <form
                        className="flex w-full max-w-sm items-center space-x-2"
                        onSubmit={addUserToRoom}
                    >
                        <Input
                            type="text"
                            placeholder="What should people call you..."
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            required
                        />
                        <Button type="submit">Chat</Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <Room
            name={name}
            localAudioTrack={localAudioTrack}
            localVideoTrack={localVideoTrack}
        />
    );
};
