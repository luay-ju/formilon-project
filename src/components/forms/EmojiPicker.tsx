import React, { useRef, useEffect } from "react";
import EmojiPickerReact from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClickOutside: () => void;
}

export function EmojiPicker({
  onEmojiSelect,
  onClickOutside,
}: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickOutside]);

  return (
    <div
      ref={ref}
      className="rounded-lg shadow-lg overflow-hidden bg-background"
    >
      <EmojiPickerReact
        onEmojiClick={(emojiData: EmojiClickData) => {
          onEmojiSelect(emojiData.emoji);
        }}
        autoFocusSearch={false}
        width={320}
        height={400}
        searchDisabled
        skinTonesDisabled
        previewConfig={{
          showPreview: false,
        }}
        lazyLoadEmojis={true}
      />
    </div>
  );
}
