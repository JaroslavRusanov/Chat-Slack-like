import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';

import useAuth from '../../auth/hook';
import { activeChannelSelector, setActiveChannel } from '../../store/Slices/activeChannel';
import { useGetChannelsQuery, useGetMessagesQuery } from '../../store/api';

import Channels from '../../components/Channels/Channels';
import ChatBox from '../../components/ChatBox/ChatBox';
import ChannelButtonSVG from '../../assets/ChannelButtonSVG';
import getModal from '../../components/modals';

const Chat = () => {
  const dispatch = useDispatch();
  const activeChannel = useSelector(activeChannelSelector);
  const { t } = useTranslation();
  const { logOut } = useAuth();

  const {
    data: channels,
    isLoading: channelsLoading,
    error: channelsError,
  } = useGetChannelsQuery();

  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useGetMessagesQuery();

  // auth guard
  useEffect(() => {
    if (channelsError?.status === 401 || messagesError?.status === 401) {
      logOut();
    }
  }, [channelsError, messagesError, logOut]);

  const [modalType, setModalType] = useState({ type: null, currentChannel: null });
  const [errorValidation, setErrorValidation] = useState({ isInvalid: false, error: '' });

  const handleChannelClick = (channel) => {
    dispatch(setActiveChannel(channel));
  };

  const handleModal = (type, currentChannel = null) => {
    setModalType({ type, currentChannel });
  };

  const closeModal = () => {
    setModalType((prev) => ({ ...prev, type: null }));
  };

  if (channelsLoading || messagesLoading) {
    return (
      <Spinner
        animation="border"
        variant="primary"
        className="position-fixed top-50 start-50"
      />
    );
  }

  return (
    <div className="container h-100 my-4 overflow-hidden rounded shadow">
      <div className="row h-100 bg-white flex-md-row">
        <div className="col-4 col-md-2 border-end px-0 bg-light d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center p-4">
            <b>{t('chatPage.header')}</b>
            <button
              type="button"
              className="p-0 text-primary btn"
              onClick={() => handleModal('adding')}
            >
              <ChannelButtonSVG />
              <span className="visually-hidden">+</span>
            </button>
          </div>

          <Channels
            channels={channels || []}
            activeChannel={activeChannel || {}}
            onChannelClick={handleChannelClick}
            onOpenModal={handleModal}
          />
        </div>

        <ChatBox
          messages={messages || []}
          activeChannel={activeChannel || {}}
        />

        {modalType.type && (() => {
          const Modal = getModal(modalType.type);
          return (
            <Modal
              modalType={modalType}
              closeModal={closeModal}
              activeChannnelClick={handleChannelClick}
              errorValidation={errorValidation}
              setErrorValidation={setErrorValidation}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default Chat;
