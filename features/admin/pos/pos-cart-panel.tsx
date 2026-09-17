import {
  Box,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { PosCartLine } from "./types";

type Props = {
  cart: PosCartLine[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
};

export const PosCartPanel = ({ cart, onUpdateQuantity, onRemove }: Props) => {
  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1">Cart</Typography>
      {cart.length === 0 ? (
        <Typography color="text.secondary">Cart is empty.</Typography>
      ) : (
        <Stack divider={<Divider />} spacing={1}>
          {cart.map((line) => (
            <Stack
              key={line.productId}
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap fontSize="0.9rem">
                  {line.name}
                </Typography>
                <Typography color="text.secondary" fontSize="0.8rem">
                  {line.price.toLocaleString()} each
                </Typography>
              </Box>
              <TextField
                type="number"
                size="small"
                value={line.quantity}
                onChange={(event) =>
                  onUpdateQuantity(
                    line.productId,
                    Math.max(1, Number(event.target.value) || 1),
                  )
                }
                sx={{ width: 70 }}
              />
              <Typography sx={{ width: 90, textAlign: "right" }}>
                {(line.price * line.quantity).toLocaleString()}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => onRemove(line.productId)}
              >
                <FontAwesomeIcon icon={faTrash} size="xs" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6">{total.toLocaleString()}</Typography>
      </Stack>
    </Stack>
  );
};
