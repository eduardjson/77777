import { Box, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { PriceListTable } from "../../components/Price/PriceListTable";

export const Route = createFileRoute("/prices/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Box>
      <PriceListTable />
    </Box>
  );
}
