import { Button } from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import { ThemeToggle } from '../components/ThemeToggle';

import '../App.css';
import { Header } from '../components';

export const AppLayout = () => {
  return (
    <>
      <Button onClick={() => toast.success('Message', { autoClose: 3000 })}>Toast it!</Button>

      <Button onClick={() => toast.success('Message', { autoClose: false })}>Toast it!</Button>
      <Button
        onClick={() =>
          toast.success('Message', {
            theme: 'colored',
            className: 'custom-toast',
            progressClassName: 'custom-progress-bar',
            bodyClassName: 'custom-toast-body',
          })
        }
      >
        Toast it!
      </Button>
      <ThemeToggle />

      <div className="h-screen overflow-hidden flex flex-col">
        <header className="bg-white flex items-center justify-center">
          <Header />
        </header>
        <main className="flex h-full w-full flex-row gap-4 p-4">
          <div className="overflow-auto h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};
