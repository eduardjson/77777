import { Button } from "@mui/material";

export const CreateButton = ({
  onClick,
  name,
}: {
  onClick: () => void;
  name: string;
}) => {
  return (
    <Button size="small" variant="contained" onClick={onClick}>
      {name}
    </Button>
  );
};
