import { Dropdown, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

const Channels = ({
  channels,
  activeChannel,
  onChannelClick,
  onOpenModal,
}) => {
  const { t } = useTranslation();

  console.log("Channels", channels)

  return (
    <ul
      id="channels-box"
      className="nav flex-column nav-pills nav-fill px-2 mb-3 overflow-auto h-100 d-block"
    >
      {channels.map((channel) => {
        const isActive = channel.id === activeChannel?.id;

        const buttonClass = cn(
          'w-100',
          'rounded-0',
          'text-start',
          'text-truncate',
          'btn',
          { 'btn-secondary': isActive },
        );

        if (!channel.removable) {
          return (
            <li key={channel.id} className="nav-item w-100">
              <button
                type="button"
                className={buttonClass}
                onClick={() => onChannelClick(channel)}
              >
                <span className="me-1">#</span>
                {channel.name}
              </button>
            </li>
          );
        }

        return (
          <li key={channel.id} className="nav-item w-100">
            <Dropdown as={ButtonGroup} className="d-flex">
              <button
                type="button"
                className={buttonClass}
                onClick={() => onChannelClick(channel)}
              >
                <span className="me-1">#</span>
                {channel.name}
              </button>

              <Dropdown.Toggle
                split
                variant="none"
                className={cn('btn', { 'btn-secondary': isActive })}
              >
                <span className="visually-hidden">
                  {t('channels.manage')}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => onOpenModal('removing', channel)}>
                  {t('channels.removeButton')}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onOpenModal('renaming', channel)}>
                  {t('channels.renameButton')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </li>
        );
      })}
    </ul>
  );
};

export default Channels;
