import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ReferralLanding = () => {
  const { nick_name, referral_id } = useParams();
  const navigate = useNavigate();
// 
  useEffect(() => {
    // Show countdown notification
    let counter = 5;
    const toastId = toast.info(`Redirection vers l'inscription dans ${counter} secondes...`, {
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
    });

    // Update countdown every second
    const interval = setInterval(() => {
      counter--;
      toast.update(toastId, {
        render: `Redirection vers l'inscription dans ${counter} secondes...`
      });
    }, 1000);

    // Redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate(`/register/${referral_id}`, { replace: true });
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      toast.dismiss(toastId);
    };
  }, [navigate, nick_name, referral_id]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <div className="text-center p-4">
        <h2>{nick_name} vous accueille sur TekTIME</h2>
        {/* <p>Preparing your registration experience...</p> */}
        <div className="spinner-border text-primary mt-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default ReferralLanding;