import { cn } from "@/lib/utils";
import React from "react";

type TActionButtonProps = {
    title: string;
    onClick?: () => void;
    color?: string;
    className?: string;
};

const ActionButton: React.FC<TActionButtonProps> = ({
    title,
    onClick,
    className,
}): JSX.Element => {
    return (
        <React.Fragment>
            <button
                className={cn(
                    "flex-1 h-full text-2xl text-center cursor-pointer outline-none border-none rounded-2xl active:translate-y-1 !capitalize",
                    className
                )}
                onClick={onClick}
            >
                {title}
            </button>
        </React.Fragment>
    );
};

export default ActionButton;
