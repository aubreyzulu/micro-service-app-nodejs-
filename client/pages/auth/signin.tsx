import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Router from 'next/router';
import { useMutation } from 'react-query';
import { ErrorObject, Errors } from '../../types';

type SignInProps = {
  email: string;
  password: string;
};

const SignIn = () => {
  const [errors, setErrors] = useState<ErrorObject[] | undefined>([]);
  const { handleSubmit, register } = useForm<SignInProps>({ mode: 'onChange' });
  const { mutate } = useMutation(
    async (data: SignInProps) => axios.post('/api/users/sign-in', data),
    {
      onSuccess: (response) => Router.push('/'),
      onError: (error: AxiosError<Errors>) =>
        setErrors(error.response?.data.errors),
    }
  );

  const onSubmit = (data: SignInProps) => mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Sign In</h1>

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
        Sign In
      </button>
    </form>
  );
};

export default SignIn;
