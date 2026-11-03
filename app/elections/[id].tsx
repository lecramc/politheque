import { ELECTIONS } from '@/src/programmes/data/elections';

export { default } from '@/src/programmes/screens/ElectionScreen';

export function generateStaticParams() {
  return ELECTIONS.map((election) => ({ id: election.id }));
}
