import { createFileRoute } from "@tanstack/react-router";

import { Chat } from "../../components";
import { useGetCurrentUserQuery } from "../../services";

export const Route = createFileRoute("/free-chat/")({
  component: Component,
});

function Component() {
  const { data } = useGetCurrentUserQuery();

  if (!data?.id || !data?.username) {
    return null;
  }
  return <Chat id={data.id} username={data.username} />;
}
