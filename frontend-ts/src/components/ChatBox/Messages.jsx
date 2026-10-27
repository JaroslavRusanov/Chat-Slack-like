import filter from 'leo-profanity';
import { useEffect, useRef, useMemo } from 'react';

const Messages = ({ messages, activeChannel }) => {
  const scrollRef = useRef(null);
  const activeChannelID = activeChannel?.id;

  const filteredMessages = useMemo(() => {
    return messages?.filter(m => m.channelID === activeChannelID) || [];
  }, [messages, activeChannelID]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [filteredMessages]);

  return (
    <div id="messages-box" className="chat-messages overflow-auto px-5">
      {filteredMessages.map((message) => (
        <div key={message.id} className="text-break mb-2">
          <b>{message.username}</b>
          {`: ${filter.clean(message.body)}`}
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  );
};

export default Messages;
