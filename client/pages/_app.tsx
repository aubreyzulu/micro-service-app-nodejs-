import 'bootstrap/dist/css/bootstrap.min.css';
import {
  dehydrate,
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import type { AppContext, AppProps } from 'next/app';
import { useState } from 'react';
import buildClient from './api/build-client';
import { CurrentUser } from '../types';
import Header from '../components/header';

type MyAppProps = AppProps & {
  user: CurrentUser;
};

const MyApp = ({ Component, pageProps, user }: MyAppProps) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Header user={user} />
        <Component {...pageProps} />
      </Hydrate>
    </QueryClientProvider>
  );
};

MyApp.getInitialProps = async (context: AppContext) => {
  const queryClient = new QueryClient();
  const client = buildClient(context.ctx);
  const { data } = await client.get('/api/users/current-user');
  // const pageProps = await App.getInitialProps(context);
  return {
    pageProps: { dehydratedState: dehydrate(queryClient) },
    user: data.user,
  };
};

export default MyApp;
