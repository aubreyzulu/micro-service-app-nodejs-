import type { GetServerSideProps, NextPage } from 'next';

import axios from 'axios';
import buildClient from './api/build-client';

const getCurrentUser = async () => {
  const response = await axios.get('/api/users/current-user');
  return response.data;
};
type Props = {
  user: any;
};
const Home: NextPage<Props> = ({ user }) => {
  console.log(user);
  return (
    <>
      {user ? <div>You are signed in</div> : <div>You are not signed in</div>}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/current-user');
  return { props: { user: data } };
};

export default Home;
