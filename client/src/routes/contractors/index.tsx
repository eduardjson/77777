import { createFileRoute } from '@tanstack/react-router';
import { ObjectList } from '../../components';

export const Route = createFileRoute('/contractors/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ObjectList />;
}
