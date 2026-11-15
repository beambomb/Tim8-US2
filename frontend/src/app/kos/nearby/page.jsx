import { redirect } from 'next/navigation';

export default function KosNearbyRedirectPage() {
  redirect('/kos?campus=UGM&radius=5');
}
