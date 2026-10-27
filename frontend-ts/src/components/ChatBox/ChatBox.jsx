import { useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Messages from './Messages';
import MessageInput from './MessageInput';

const ChatBox = ({ messages, activeChannel }) => {
  const { t } = useTranslation();
  const inputEl = useRef(null);

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => m.channelID === activeChannel?.id);
  }, [messages, activeChannel?.id]);

  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.focus();
    }
  }, [activeChannel]);

  return (
    <div className="col p-0 h-100">
      <div className="d-flex flex-column h-100">
        <div className="bg-light mb-4 p-3 shadow-sm small">
          <p className="m-0">
            <b># {activeChannel?.name}</b>
          </p>
          <span className="text-muted">
            {t('chatBox.messages', { count: filteredMessages.length })}
          </span>
        </div>
        <Messages messages={filteredMessages} activeChannel={activeChannel}/>
        <MessageInput inputEl={inputEl} channelID={activeChannel?.id} />
      </div>
    </div>
  );
};

export default ChatBox;
