import { redirect } from 'next/navigation';

export default function Home() {
  // Burası /admin değil, /katalog olmalı!
  redirect('/katalog');
}