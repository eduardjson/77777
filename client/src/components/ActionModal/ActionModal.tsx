import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { ReactNode } from "react";

interface IActionModalProps {
  title?: string;
  actionName: string;
  cancelName: string;
  content: ReactNode | string | undefined;
  open: boolean;
  onClose: () => void;
  onSubmitAction: () => void;
}
export const ActionModal = ({
  title,
  actionName,
  cancelName,
  content,
  open,
  onClose,
  onSubmitAction,
}: IActionModalProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button variant="text" color="warning" onClick={onClose}>
          {cancelName}
        </Button>
        <Button variant="contained" color="warning" onClick={onSubmitAction}>
          {actionName}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
