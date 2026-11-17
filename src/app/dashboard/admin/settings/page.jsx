'use client';

// Admin settings moved into the Profile page (admin-only section there).
// This URL just sends the admin to Profile.
import { useEffect } from 'react';
import Loader from '../../lib/Loader';

export default function SettingsPage() {
  useEffect(() => { window.location.href = '/dashboard/profile'; }, []);
  return <Loader text="Opening profile…" />;
}
