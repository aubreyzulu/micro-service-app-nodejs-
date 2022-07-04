import axios from 'axios';
import Router from 'next/router';
import { useEffect } from 'react';
import { useMutation } from 'react-query';

const SignOut = () => {
  const { mutate } = useMutation(
    async () => axios.post('/api/users/sign-out'),
    { onSuccess: () => Router.push('/') }
  );
  useEffect(() => {
    mutate();
  }, []);

  return <h2>Signing you out ....</h2>;
};

export default SignOut;
