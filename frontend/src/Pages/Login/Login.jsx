import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useGetAuthTokenMutation } from '../../store/api.js';
import { setToken } from '../../store/Slices/authToken.js';
import logo from '../../assets/login.jpeg';
import useAuth from '../../auth/hook.jsx';

const Login = () => {
  const navigate = useNavigate();
  const [isInvalidAuth, setFailAuth] = useState(false);
  const { logIn } = useAuth();
  const [getToken] = useGetAuthTokenMutation();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: async (inputData) => {
      try {
        const { data } = await getToken(inputData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.username);
        dispatch(setToken(data.token));
        setFailAuth(false);
        logIn();
        navigate('/');
      } catch (err) {
        setFailAuth(true);
        toast.error(t('toastify.error.connectionErr'));
        throw err;
      }
    },
  });

  return (
    <div className="container-fluid h-100">
      <div className="row justify-content-center align-content-center h-100">
        <div className="col-12 col-md-8 col-xxl-6">
          <div className="card shadow-sm">
            <div className="card-body row p-5">
              <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                <img src={logo} className="rounded-circle" alt={t('loginPage.logoAlt')} />
              </div>
              <Form className="col-12 col-md-6 mt-3 mt-mb-0" onSubmit={formik.handleSubmit}>
                <Form.Group>
                  <h1 className="text-center mb-4">{t('loginPage.header')}</h1>
                  <div className="form-floating mb-3">
                    <Form.Control
                      id="username"
                      name="username"
                      autoComplete="username"
                      required=""
                      placeholder={t('loginPage.form.username')}
                      className="form-control"
                      onChange={formik.handleChange}
                      isInvalid={isInvalidAuth}
                      defaultValue={formik.values.username}
                    />
                    <label htmlFor="username">{t('loginPage.form.username')}</label>
                  </div>
                  <div className="form-floating mb-4">
                    <Form.Control
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      required=""
                      placeholder={t('loginPage.form.password')}
                      type="password"
                      className="form-control"
                      onChange={formik.handleChange}
                      defaultValue={formik.values.password}
                      isInvalid={isInvalidAuth}
                    />
                    <label htmlFor="password">{t('loginPage.form.password')}</label>
                    <Form.Control.Feedback type="invalid" tooltip>{t('loginPage.form.error')}</Form.Control.Feedback>
                  </div>
                </Form.Group>
                <Button type="submit" variant="outline-primary" className="w-100 mb-3">{t('loginPage.form.button')}</Button>
              </Form>
            </div>
            <div className="card-footer p-4">
              <div className="text-center">
                <span>{t('loginPage.footer.span')}</span>
                <Link to="/signup">{t('loginPage.footer.link')}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
