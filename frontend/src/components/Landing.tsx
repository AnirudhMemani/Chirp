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
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
    }
  }, [videoRef]);

  if (!joined) {
    return (
      <div className="h-dvh flex justify-center items-center gap-6 w-full">
        <video
          autoPlay
          ref={videoRef}
        ></video>
        <div className="flex gap-5">
          <Input
            crossOrigin={undefined}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            label="Write your name"
            className="pr-20"
            containerProps={{
              className: "min-w-0",
            }}
          />
          <Button
            placeholder={undefined}
            className="rounded"
            onClick={() => {
              setJoined(true);
            }}
          >
            Join
          </Button>
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
