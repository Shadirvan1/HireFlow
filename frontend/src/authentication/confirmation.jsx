import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import publicApi from '../api/publicapi';

const VerifyEmailPage = () => {
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState('Verifying your email...');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);

        const res = await publicApi.get(
          `accounts/verify-email/${uidb64}/${token}/`
        );

        const data = res.data;

        if (data.message) {
          setStatus(data.message);

          setTimeout(() => navigate('/login'), 3000);
        } else if (data.error) {
          setStatus(data.error);
        } else {
          setStatus('Unexpected response from server.');
        }
      } catch (error) {
        console.error(error);

        if (error.response) {
          setStatus(error.response.data.error || 'Verification failed.');
        } else if (error.request) {
          setStatus('No response from server. Please try again later.');
        } else {
          setStatus('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [uidb64, token, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Email Verification</h2>
        {loading ? <p>Verifying...</p> : <p>{status}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f6f8',
  },
  card: {
    padding: '40px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
  },
};

export default VerifyEmailPage;
