import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Router from 'next/router';
import { useMutation } from 'react-query';
import { ErrorObject, Errors } from '../../types';

type SignUpProps = {
  email: string;
  password: string;
};

const SignUp = () => {
  const [errors, setErrors] = useState<ErrorObject[] | undefined>([]);
  const { handleSubmit, register } = useForm<SignUpProps>({ mode: 'onChange' });
  const { mutate } = useMutation(
    async (data: SignUpProps) => axios.post('/api/users/sign-up', data),
    {
      onSuccess: (response) => Router.push('/'),
      onError: (error: AxiosError<Errors>) =>
        setErrors(error.response?.data.errors),
    }
  );

  const onSubmit = (data: SignUpProps) => mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Sign Up</h1>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          {...register('email', { required: true })}
          // type="email"
          className="form-control"
          id="email"
          placeholder="Enter email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          {...register('password', { required: true })}
          type="password"
          className="form-control"
          id="password"
          placeholder="Password"
        />
      </div>
      {errors && errors?.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <h4>OOPS ....</h4>
          <ul className="my-0">
            {errors?.map((error) => (
              <li key={error.message}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
      <button type="submit" className="btn btn-primary">
        Sign
      </button>
    </form>
  );
};

export default SignUp;
