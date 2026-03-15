import { Add } from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import * as React from "react";

// Базовый тип для экшена без аргументов
type BaseActionType = {
  key: string;
  label: string;
  action: () => void;
};

// Тип для экшена с одним аргументом любого типа
type ActionWithArg<T = any> = {
  key: string;
  label: string;
  action: (arg: T) => void;
  arg: T;
};

// Объединенный тип для всех возможных экшенов
type ActionType<T = any> = BaseActionType | ActionWithArg<T>;

// Type guard для проверки наличия аргумента
const hasArg = <T,>(action: ActionType<T>): action is ActionWithArg<T> => {
  return "arg" in action;
};

interface IActionDropdown<T = any> {
  actions: ActionType<T>[];
}

export const ActionDropdown = <T,>({ actions }: IActionDropdown<T>) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCallAction = (actionItem: ActionType<T>) => {
    handleClose();
    if (hasArg(actionItem)) {
      actionItem.action(actionItem.arg);
    } else {
      actionItem.action();
    }
  };

  return (
    <div>
      <Button
        variant="outlined"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Add color="action" sx={{ color: "black" }} />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        {actions?.map(item => (
          <MenuItem key={item.key} onClick={() => handleCallAction(item)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
