import { useEffect, useRef, useState } from "react";
import { Room } from "./Room";
import { Button, Input } from "@material-tailwind/react";

export const Landing = () => {
    const [name, setName] = useState("");
    const [localAudioTrack, setLocalAudioTrack] =
        useState<MediaStreamTrack | null>(null);
    const [localVideoTrack, setlocalVideoTrack] =
        useState<MediaStreamTrack | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
    const [activeTimeout, setActiveTimeout] = useState<NodeJS.Timeout>();

    const [joined, setJoined] = useState(false);

    const getCam = async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        // MediaStream
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        setLocalAudioTrack(audioTrack);
        setlocalVideoTrack(videoTrack);
        if (!videoRef.current) {
            return;
        }
        videoRef.current.srcObject = new MediaStream([videoTrack, audioTrack]);
        videoRef.current.play();
    };

    useEffect(() => {
        if (videoRef && videoRef.current) {
            getCam();
        }
    }, [videoRef]);

    if (!joined) {
        return (
            <div className="min-h-dvh flex justify-center w-full">
                <div className="py-24 flex flex-col gap-6">
                    <h1 className="text-lg font-medium text-center font-sans mb-20">
                        <span className="text-[#FF7E01] text-2xl font-semibold">
                            Chirp
                        </span>{" "}
                        - Talk to strangers!
                    </h1>
                    <video
                        autoPlay
                        ref={videoRef}
                        className="border border-blue-gray-500 mb-6"
                    ></video>
                    <div className="flex gap-5">
                        <Input
                            crossOrigin={undefined}
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            label="What should people call you"
                            className="pr-20 !text-blue-gray-200"
                            containerProps={{
                                className: "min-w-0",
                            }}
                            labelProps={{
                                className: "!text-white",
                            }}
                        />
                        <Button
                            placeholder={undefined}
                            className="rounded flex items-center justify-center text-center"
                            onClick={() => {
                                if (name.length > 0) {
                                    setJoined(true);
                                } else {
                                    clearTimeout(activeTimeout);
                                    setShowErrorMessage(true);
                                    const id = setTimeout(
                                        () => setShowErrorMessage(false),
                                        2500
                                    );
                                    //@ts-expect-error "s"
                                    setActiveTimeout(id);
                                }
                            }}
                        >
                            Search
                        </Button>
                    </div>
                    {showErrorMessage && (
                        <p className="text-red-500 capitalize">
                            please enter a name
                        </p>
                    )}
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
