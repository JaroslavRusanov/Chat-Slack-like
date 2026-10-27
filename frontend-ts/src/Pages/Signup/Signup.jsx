import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { Form } from 'react-bootstrap';
import logo from '../../assets/avatar.jpg';
import useAuth from '../../auth/hook';
import { useAddNewUserMutation } from '../../store/api';
import { setToken } from '../../store/Slices/authToken';

const Signup = () => {
  const [addNewUser, { error }] = useAddNewUserMutation();
  const navigate = useNavigate();
  const { logIn } = useAuth();
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]);
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const isErrStatus409 = (responseErr) => responseErr && responseErr.status === 409;

  const onHandleSubmit = async (values) => {
    try {
      const { data } = await addNewUser({ username: values.username, password: values.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.username);
      dispatch(setToken(data.token));
      logIn();
      navigate('/');
    } catch (err) {
      toast.error(t('toastify.error.authErr'));
      throw err;
    }
  };

  const signupSchema = yup.object().shape({
    username: yup
      .string()
      .min(3, t('signupPage.form.errors.usernameRange'))
      .max(20, t('signupPage.form.errors.usernameRange'))
      .required(t('signupPage.form.errors.required')),
    password: yup
      .string()
      .min(6, t('signupPage.form.errors.passwordRange'))
      .required(t('signupPage.form.errors.required')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t('signupPage.form.errors.passwordConfirm'))
      .required(t('signupPage.form.errors.required')),
  });

  return (
    <Formik
      validationSchema={signupSchema}
      onSubmit={onHandleSubmit}
      initialValues={{ username: '', password: '', confirmPassword: '' }}
      validateOnBlur
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        errors,
        touched,
      }) => (
        <div className="container-fluid h-100">
          <div className="row justify-content-center align-content-center h-100">
            <div className="col-12 col-md-8 col-xxl-6">
              <div className="card shadow-sm">
                <div className="card-body d-flex flex-column flex-md-row justify-content-around align-items-center p-5">
                  <div>
                    <img src={logo} className="rounded-circle" alt={t('signupPage.logoAlt')} />
                  </div>
                  <Form className="w-50" onSubmit={handleSubmit}>
                    <h1 className="text-center mb-4">{t('signupPage.header')}</h1>
                    <div className="form-floating mb-3">
                      <Form.Control
                        placeholder={t('signupPage.form.username')}
                        id="newUsername"
                        name="username"
                        autoComplete="username"
                        className="form-control"
                        ref={inputRef}
                        value={values.username}
                        onChange={handleChange}
                        isInvalid={errors.username && touched.username}
                        onBlur={handleBlur}
                      />
                      <label className="form=label" htmlFor="newUsername">{t('signupPage.form.username')}</label>
                      <Form.Control.Feedback type="invalid" tooltip>{errors.username}</Form.Control.Feedback>
                    </div>
                    <div className="form-floating mb-3">
                      <Form.Control
                        placeholder={t('signupPage.form.password')}
                        id="newPassword"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        className="form-control"
                        value={values.password}
                        onChange={handleChange}
                        isInvalid={errors.password && touched.password}
                        onBlur={handleBlur}
                      />
                      <label className="form-label" htmlFor="newPassword">{t('signupPage.form.password')}</label>
                      <Form.Control.Feedback type="invalid" tooltip>{errors.password}</Form.Control.Feedback>
                    </div>
                    <div className="form-floating mb-4">
                      <Form.Control
                        placeholder={t('signupPage.form.confirmPassword')}
                        id="newPasswordConfirmation"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        className="form-control"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        isInvalid={
                          isErrStatus409(error)
                          || (errors.confirmPassword && touched.confirmPassword)
                        }
                        onBlur={handleBlur}
                      />
                      <label className="form-label" htmlFor="newPasswordConfirmation">{t('signupPage.form.confirmPassword')}</label>
                      <Form.Control.Feedback type="invalid" tooltip>
                        {errors.confirmPassword || t('signupPage.form.errors.usernameExist')}
                      </Form.Control.Feedback>
                    </div>
                    <button type="submit" className="w-100 btn btn-outline-primary">{t('signupPage.form.button')}</button>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Formik>
  );
};

export default Signup;
