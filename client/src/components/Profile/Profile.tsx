import { Avatar, Button, Drawer, Link } from "@mui/material";
import { useGetCurrentUserQuery } from "../../services";
import { Login } from "@mui/icons-material";
import { useState } from "react";
import { MeProfile } from "../../routes/me";

export const Profile = () => {
  const [open, setOpen] = useState(false);
  const { data } = useGetCurrentUserQuery();

  return (
    <div className="flex items-center gap-2">
      {data?.username ? (
        <>
          <Link onClick={() => setOpen(true)} className="no-underline">
            <Avatar
              alt={data?.username || ""}
              src={data?.avatar}
              className="cursor-pointer scale-90 opacity-95 hover:opacity-100"
            />
          </Link>
        </>
      ) : (
        <Button color="primary" href="/auth/login">
          <Login />
        </Button>
      )}
      {open && (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          anchor="right"
          className="w-full"
        >
          <MeProfile />
        </Drawer>
      )}
    </div>
  );
};
