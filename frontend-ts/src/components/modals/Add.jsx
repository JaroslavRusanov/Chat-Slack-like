import { useTranslation } from 'react-i18next';
import filter from 'leo-profanity';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { object, string } from 'yup';
import { Modal, Form, Button } from 'react-bootstrap';
import { useAddChannelMutation, useGetChannelsQuery } from '../../store/api.js';

const Add = ({
  closeModal,
  activeChannnelClick,
  errorValidation,
  setErrorValidation,
}) => {
  const [addChannel] = useAddChannelMutation();
  const { data } = useGetChannelsQuery();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      body: '',
    },
    onSubmit: async (values) => {
      const channelsNames = data ? Object.values(data).map(({ name }) => name) : [];
      try {
        const channelSchema = object({
          body: string()
            .min(3, t('modal.validation.range'))
            .max(20, t('modal.validation.range'))
            .notOneOf(channelsNames, t('modal.validation.notOneOf')),
        });
        await channelSchema.validate(values);
        const filteredName = filter.clean(values.body);
        const newChannel = await addChannel({ name: filteredName });
        activeChannnelClick(newChannel.data);
        setErrorValidation({ isInvalid: false, error: '' });
        if (newChannel.error?.status === 401) {
          toast.error(t('toastify.error.authErr'));
        } else toast.success(t('toastify.success.channel.add'));
        closeModal();
      } catch (err) {
        setErrorValidation({ isInvalid: true, error: err.message });
        toast.error(t('toastify.error.connectionErr'));
        throw err;
      }
    },
  });

  return (
    <Modal show="true" onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('modal.add.title')}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={formik.handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              id="addChannel"
              name="body"
              data-testid="input-body"
              className="mb-2"
              onChange={formik.handleChange}
              value={formik.values.body}
              isInvalid={errorValidation.isInvalid}
            />
            <label htmlFor="addChannel" className="visually-hidden">{t('modal.label')}</label>
            <div className="invalid-feedback">{errorValidation.error}</div>
            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                type="button"
                className="me-2"
                onClick={closeModal}
              >
                {t('modal.add.cancelButton')}
              </Button>
              <Button variant="primary" type="submit">{t('modal.add.sendButton')}</Button>
            </div>
          </Form.Group>
        </Modal.Body>
      </Form>
    </Modal>
  );
};

export default Add;
