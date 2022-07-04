import Link from 'next/link';
import { CurrentUser } from '../types';

type HeaderProps = {
  user: CurrentUser;
};

const Header = ({ user }: HeaderProps) => {
  const links = [
    !user && { label: 'Sign Up', href: '/auth/signup' },
    !user && { label: 'Sign In', href: '/auth/signin' },
    user && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((linkConfig) => linkConfig)
    // @ts-ignore
    .map(({ label, href }) => (
      <li className="nav-item" key={href}>
        <Link href={href}>
          <a className="nav-link">{label}</a>
        </Link>
      </li>
    ));

  return (
    <nav className="navbar  navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">Ticketing</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};

export default Header;
